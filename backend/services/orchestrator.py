import uuid
import json
import asyncio
import logging
from typing import Dict, Any, List
from datetime import datetime

from . import llm_service
from . import search_service
from . import credibility
from . import financial_service
from . import firebase_logger

logger = logging.getLogger("insight-ai.orchestrator")


async def run_research_pipeline(query: str) -> dict:
    """
    10-Layer Research Engine — optimised for Gemini free-tier (20 req/day).
    Total LLM calls per query: 3-4 (down from 30-50+).
    """

    # =====================================================================
    # LAYER 1: Query Intake
    # =====================================================================
    query_id = str(uuid.uuid4())
    logger.info(f"[{query_id}] Starting Layer 1: Query Intake")
    try:
        firebase_logger.save_query(query_id, query)
    except Exception as e:
        logger.warning(f"Firebase save_query failed (non-fatal): {e}")

    # =====================================================================
    # LAYER 2 + 3 COMBINED: Query Intelligence + Sub-Query Generation
    # >>> LLM CALL 1 of 3-4 <<<
    # =====================================================================
    logger.info(f"[{query_id}] Starting Layer 2+3: Intelligence + Sub-Queries")

    system_prompt_combined = """You are an elite research strategist at McKinsey & Company.
Your job is to (1) analyze a research query, and (2) generate targeted search queries — all in a SINGLE response.

Output STRICT JSON with this EXACT structure:
{
  "topic": "Main subject (concise, 3-8 words)",
  "industry": "Industry classification",
  "intent": "What the user wants (be specific)",
  "tone": "Executive | Analytical | Explanatory",
  "depth": "Deep-dive",
  "headers": [
    {
      "title": "Section Header Title",
      "content_type": "text | table | chart | mixed",
      "search_query": "One highly targeted Google search query for this section"
    }
  ],
  "metadata_config": {}
}

HEADER RULES:
1. Generate EXACTLY 6 headers. No more, no fewer.
2. FIRST header MUST be "Introduction & Market Overview" (content_type: "text").
3. LAST header MUST be "Conclusion & Strategic Recommendations" (content_type: "text").
4. Middle 4 headers: hyper-specific to the query. Think like a domain expert.
5. content_type assignment:
   - "table" → comparisons, rankings, company lists, structured data (use for at least 1 header)
   - "chart" → trends over time, market size growth, share distribution (use for at least 1 header)
   - "mixed" → narrative + data visual combined
   - "text" → narrative-heavy analysis
6. At least 2 of the 6 headers must be "table", "chart", or "mixed".
7. Each search_query MUST be specific and target recent data (include years like 2024, 2025). Include terms like "report", "statistics", "market size" to find credible sources. Each search query should be DIFFERENT — target different angles.
"""

    combined_data = await llm_service.generate_json(query, system_prompt_combined)

    # Parse headers
    raw_headers = combined_data.get("headers", [])
    intelligence_headers = []
    header_content_types = {}
    header_search_queries = {}

    if raw_headers and isinstance(raw_headers[0], dict):
        for h in raw_headers:
            title = h.get("title", "")
            intelligence_headers.append(title)
            header_content_types[title] = h.get("content_type", "text")
            header_search_queries[title] = h.get("search_query", "")
    
    # Fallback if LLM output was bad
    if len(intelligence_headers) < 4:
        intelligence_headers = [
            "Introduction & Market Overview",
            "Market Size, Growth Trajectory & Forecasts",
            "Competitive Landscape & Key Players",
            "Consumer Segments & Demand Drivers",
            "Supply Chain, Distribution & Operations",
            "Conclusion & Strategic Recommendations"
        ]
        header_content_types = {
            intelligence_headers[0]: "text",
            intelligence_headers[1]: "chart",
            intelligence_headers[2]: "table",
            intelligence_headers[3]: "mixed",
            intelligence_headers[4]: "text",
            intelligence_headers[5]: "text",
        }
        for h in intelligence_headers:
            header_search_queries[h] = f"{query} {h} 2024 2025 report statistics"

    try:
        firebase_logger.update_query_status(query_id, "layer_3_complete")
    except Exception as e:
        logger.warning(f"Firebase update failed (non-fatal): {e}")

    # =====================================================================
    # LAYER 4: Web Research — NO LLM calls, just scraping
    # =====================================================================
    logger.info(f"[{query_id}] Starting Layer 4: Web Research (scraping only)")

    all_scraped_content = {}  # header -> list of {url, text, snippet}

    async def scrape_for_header(header: str):
        sq = header_search_queries.get(header, f"{query} {header} 2024 report")
        results = await search_service.perform_search(sq, num_results=3)
        scraped = []
        for res in results:
            url = res.get("url", "")
            if "youtube" in url or "reddit" in url:
                continue
            cleaned = await search_service.fetch_and_clean_html(url)
            if len(cleaned) < 200:
                continue
            # Truncate to save tokens when passed to synthesis
            scraped.append({
                "url": url,
                "text": cleaned[:4000],
                "snippet": res.get("snippet", "")
            })
        return header, scraped

    # Scrape concurrently (no LLM calls, so no rate limit concern)
    scrape_tasks = [scrape_for_header(h) for h in intelligence_headers]
    scrape_results = await asyncio.gather(*scrape_tasks)
    
    unique_urls = set()
    all_sources = []
    for header, scraped_list in scrape_results:
        all_scraped_content[header] = scraped_list
        for s in scraped_list:
            if s["url"] not in unique_urls:
                unique_urls.add(s["url"])
                # Compute credibility from URL domain (no LLM needed)
                cred_score = credibility.calculate_credibility_score(
                    {"author_expertise_score": 0.7, "recency_score": 0.8,
                     "citation_count_score": 0.5, "content_quality": 0.7, "bias_score": 0.1},
                    s["url"]
                )
                all_sources.append({
                    "url": s["url"],
                    "extracted_evidence": [s["snippet"]] if s["snippet"] else [],
                    "source_confidence": 0.8,
                    "credibility_score": cred_score,
                    "snippet": s["snippet"]
                })

    try:
        firebase_logger.save_sources(query_id, all_sources)
        firebase_logger.update_query_status(query_id, "layer_5_complete")
    except Exception as e:
        logger.warning(f"Firebase save failed (non-fatal): {e}")

    # =====================================================================
    # LAYER 6: Section Synthesis — BATCHED into 2 LLM calls
    # >>> LLM CALLS 2-3 of 3-4 <<<
    # =====================================================================
    logger.info(f"[{query_id}] Starting Layer 6: Batched Section Synthesis")

    # Split headers into 2 batches
    mid = len(intelligence_headers) // 2
    batch_1 = intelligence_headers[:mid]
    batch_2 = intelligence_headers[mid:]

    sections = []
    for batch in [batch_1, batch_2]:
        batch_sections = await _synthesize_batch(
            query, combined_data, batch, header_content_types, all_scraped_content
        )
        sections.extend(batch_sections)

    try:
        firebase_logger.update_query_status(query_id, "layer_6_complete")
    except Exception as e:
        logger.warning(f"Firebase update failed (non-fatal): {e}")

    # =====================================================================
    # LAYER 7: Financial Intelligence (conditional — 0 or 1 LLM call)
    # >>> LLM CALL 4 (only if finance-relevant) <<<
    # =====================================================================
    logger.info(f"[{query_id}] Starting Layer 7: Financial Intelligence")
    fin_intelligence = None
    industry = combined_data.get("industry", "").lower()
    query_lower = query.lower()

    finance_keywords = ["stock", "revenue", "invest", "valuation", "ipo", "profit"]
    finance_industries = ["finance", "banking", "insurance"]

    if industry in finance_industries or any(kw in query_lower for kw in finance_keywords):
        ticker_prompt = f"""Based on this query: '{query}'
Identify 1-2 relevant US stock ticker symbols. If none relevant, return empty list.
Output STRICT JSON: {{"symbols": ["AAPL"]}}"""

        ticker_res = await llm_service.generate_json(
            ticker_prompt, "You are a financial analyst."
        )
        symbols = ticker_res.get("symbols", [])

        fin_metrics = []
        for sym in symbols[:2]:
            met = await financial_service.get_financial_metrics(sym)
            if met and "error" not in met:
                fin_metrics.append(met)

        if fin_metrics:
            fin_intelligence = {
                "gics_sector": combined_data.get("industry", "N/A"),
                "representative_companies": symbols[:2],
                "metrics": fin_metrics,
                "market_summary": "Auto-generated financial data."
            }

    try:
        firebase_logger.update_query_status(query_id, "layer_7_complete")
    except Exception as e:
        logger.warning(f"Firebase update failed (non-fatal): {e}")

    # =====================================================================
    # LAYER 8-9: Final Assembly
    # =====================================================================
    logger.info(f"[{query_id}] Assembling final report")

    final_report_dict = {
        "query_id": query_id,
        "original_query": query,
        "intelligence": combined_data,
        "sections": sections,
        "financial_data": fin_intelligence,
        "sources": all_sources,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        firebase_logger.save_report(query_id, final_report_dict)
        firebase_logger.update_query_status(query_id, "completed")
    except Exception as e:
        logger.warning(f"Firebase final save failed (non-fatal): {e}")

    logger.info(f"[{query_id}] Pipeline Complete — {len(sections)} sections generated")
    return final_report_dict


# =========================================================================
# Helper: Batch-synthesize multiple sections in a single LLM call
# =========================================================================

async def _synthesize_batch(
    query: str,
    intelligence: dict,
    headers: list,
    content_types: dict,
    scraped_content: dict,
) -> list:
    """
    Synthesize multiple report sections in ONE LLM call.
    Returns a list of section dicts.
    """

    # Build per-header evidence blocks
    sections_input = []
    for h in headers:
        ct = content_types.get(h, "text")
        evidence_texts = []
        source_urls = []
        for item in scraped_content.get(h, []):
            evidence_texts.append(f"[Source: {item['url']}]\n{item['text'][:3000]}")
            source_urls.append(item["url"])

        format_guide = _get_format_guide(ct)

        sections_input.append({
            "header": h,
            "content_type": ct,
            "format_guide": format_guide,
            "evidence": "\n---\n".join(evidence_texts) if evidence_texts else "No specific evidence found. Use your knowledge to provide a substantive overview.",
            "source_urls": source_urls,
        })

    # Build the mega-prompt
    sections_spec = ""
    for i, si in enumerate(sections_input, 1):
        sections_spec += f"""
--- SECTION {i} ---
Header: {si['header']}
Content Type: {si['content_type']}
{si['format_guide']}
Source URLs for citations: {json.dumps(si['source_urls'])}
Evidence:
{si['evidence']}
"""

    system_prompt = f"""You are a McKinsey senior partner writing an institutional-grade research report.

REPORT CONTEXT:
- Research query: "{query}"
- Industry: {intelligence.get("industry", "N/A")}

You will be given {len(headers)} sections to write. For EACH section, produce a complete, data-rich section.

QUALITY STANDARDS:
1. Write at McKinsey/BCG/Bain quality — authoritative, precise, data-driven.
2. Use inline citations [1], [2] etc. mapping to the source URLs provided for each section.
3. NEVER write filler or generic content. Every sentence must convey specific insight.
4. Include specific numbers, percentages, and data points from the evidence.
5. For "Introduction" sections: set context, frame key themes the report covers.
6. For "Conclusion" sections: synthesize findings, give strategic recommendations.

OUTPUT FORMAT:
You MUST output a JSON object with a "sections" array. Each element must follow this structure:
{{
  "sections": [
    {{
      "header": "Exact Header Title",
      "format": "text|table|chart|mixed",
      "content_blocks": [ ... ],
      "source_mapping": {{"[1]": "https://url1.com"}},
      "citation_metadata": {{}},
      "confidence_score": 0.85
    }}
  ]
}}

CONTENT BLOCK TYPES:
- Paragraph: {{"type": "paragraph", "content": "Text with [1] citations."}}
- List: {{"type": "list", "content": "Point 1\\nPoint 2\\nPoint 3"}}
- Table: {{"type": "table", "title": "Table Title", "headers": ["Col1", "Col2"], "rows": [["val1", "val2"]]}}
  → Use for sections with content_type "table". Include 4-8 rows of REAL data.
- Chart: {{"type": "chart", "chart_type": "bar|line|pie", "title": "Chart Title", "labels": ["L1","L2"], "datasets": [{{"label": "Name", "data": [10,20], "color": "#4DA6FF"}}]}}
  → Use for sections with content_type "chart". Include 4-8 data points. Data must be REAL numbers from evidence.

For "mixed" sections, combine paragraphs with a table OR chart.
For "text" sections, use 2-4 substantial paragraphs with citations.
"""

    user_prompt = f"Generate all {len(headers)} sections for the report.\n{sections_spec}"

    result = await llm_service.generate_json(user_prompt, system_prompt)

    # Parse result
    parsed_sections = result.get("sections", [])

    # Ensure we have output for every header, fill gaps if needed
    output = []
    parsed_map = {s.get("header", ""): s for s in parsed_sections}

    for h in headers:
        if h in parsed_map and "content_blocks" in parsed_map[h]:
            section = parsed_map[h]
        else:
            # Find by partial match
            matched = None
            for ps in parsed_sections:
                if ps.get("header", "").lower().strip() in h.lower().strip() or h.lower().strip() in ps.get("header", "").lower().strip():
                    matched = ps
                    break
            if matched and "content_blocks" in matched:
                section = matched
                section["header"] = h
            else:
                section = {
                    "header": h,
                    "format": content_types.get(h, "text"),
                    "content_blocks": [{"type": "paragraph", "content": "Content could not be generated for this section due to limited evidence."}],
                    "source_mapping": {},
                    "confidence_score": 0.5,
                    "citation_metadata": {},
                }

        # Ensure all required fields
        section.setdefault("header", h)
        section.setdefault("format", content_types.get(h, "text"))
        section.setdefault("source_mapping", {})
        section.setdefault("confidence_score", 0.8)
        section.setdefault("citation_metadata", {})
        output.append(section)

    return output


def _get_format_guide(content_type: str) -> str:
    """Short format reminder per content type."""
    if content_type == "table":
        return 'Format: Include at least one "table" content block with headers + rows (4-8 rows of real data). You may add paragraphs for context.'
    elif content_type == "chart":
        return 'Format: Include at least one "chart" content block (bar/line/pie) with labels + datasets of real numbers. You may add paragraphs for analysis.'
    elif content_type == "mixed":
        return 'Format: Combine paragraphs with at least one table OR chart block containing real data.'
    else:
        return 'Format: Use 2-4 substantial paragraphs with inline [1] [2] citations.'
