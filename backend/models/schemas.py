from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any, Union

# Layer 1: Query Intake
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    query_id: str
    status: str

# Layer 2: Query Intelligence (LLM-1)
class QueryIntelligence(BaseModel):
    topic: str
    industry: str
    intent: str
    tone: str
    depth: str
    headers: List[str]
    metadata_config: Dict[str, Any]

# Layer 3: Sub-Query Generator (LLM-2)
class SubQueries(BaseModel):
    header: str
    sub_queries: List[str]

class SubQueryGeneratorResponse(BaseModel):
    results: List[SubQueries]

# Layer 4: Web Research
class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str

class CleanedContent(BaseModel):
    url: str
    content: str

# Layer 5: Evidence Extraction (LLM-3)
class ExtractedEvidence(BaseModel):
    url: str
    extracted_evidence: List[str]
    source_confidence: float
    credibility_score: Optional[float] = None
    credibility_breakdown: Optional[Dict[str, float]] = None

# Layer 6: Section Synthesis (LLM-4)
class SectionContentBlock(BaseModel):
    type: str # text, list, metric
    content: str
    
class SectionSynthesis(BaseModel):
    header: str
    format: str # table, graph_data, paragraph, mixed
    content_blocks: List[SectionContentBlock]
    source_mapping: Dict[str, str] # e.g., "[1]": "url"
    citation_metadata: Dict[str, Any]
    confidence_score: float

# Layer 7: Financial Intelligence
class FinancialMetrics(BaseModel):
    symbol: str
    price: Optional[float] = None
    revenue_cagr: Optional[float] = None
    eps_growth: Optional[float] = None
    margin_trends: Optional[str] = None
    volatility: Optional[float] = None
    outlook_summary: Optional[str] = None

class FinancialIntelligence(BaseModel):
    gics_sector: str
    representative_companies: List[str]
    metrics: List[FinancialMetrics]
    market_summary: str

# Layer 8: Global Consistency (LLM-5) & Final Report
class FinalReport(BaseModel):
    query_id: str
    original_query: str
    intelligence: QueryIntelligence
    sections: List[SectionSynthesis]
    financial_data: Optional[FinancialIntelligence] = None
    sources: List[ExtractedEvidence]
    created_at: str
