import re
from typing import Dict, Any, List

def calculate_credibility_score(extracted_data: Dict[str, Any], url: str) -> float:
    """
    Implements the Credibility Scoring Engine (MANDATORY formula)
    
    Parameters:
    Domain Authority (estimated from URL parsing)
    Author Expertise (LLM extracted)
    Recency (LLM extracted)
    Citation Count (Extracted)
    Cross-Source Agreement (Calculated later, placeholder 0.8)
    Content Quality (LLM Extracted)
    Publication Reputation (Estimated from Domain)
    Bias Detection (Multiplier)
    Structured Data Presence (Extracted)
    """
    
    # 1. Base estimates for domains (Mock logic since we can't do full Moz API lookups instantly)
    domain = url.split("//")[-1].split("/")[0].replace("www.", "")
    
    high_tier_domains = ["wsj.com", "bloomberg.com", "reuters.com", "ft.com", "mckinsey.com", "hbr.org", "nature.com"]
    mid_tier_domains = ["forbes.com", "cnbc.com", "yahoo.com/finance", "techcrunch.com"]
    
    domain_authority = 0.5 # default
    publication_reputation = 0.5
    if domain in high_tier_domains:
        domain_authority = 0.95
        publication_reputation = 0.95
    elif domain in mid_tier_domains:
        domain_authority = 0.8
        publication_reputation = 0.8
    elif ".edu" in domain or ".gov" in domain:
        domain_authority = 0.9
        publication_reputation = 0.9
        
    # 2. Extract values from LLM's assessment in extracted_data
    # We expect extracted_data to have some subjective ratings
    author_expertise = extracted_data.get("author_expertise_score", 0.6)
    recency = extracted_data.get("recency_score", 0.8)
    citation_count_score = extracted_data.get("citation_count_score", 0.5)
    content_quality = extracted_data.get("content_quality", 0.7)
    
    # Needs to be fed in from Globaal consistency layer later, default high
    cross_source_agreement = 0.8 
    
    # Calculate Base formula
    # credibility_score = 0.25 * domain_authority + 0.15 * author_expertise + 0.15 * recency + 0.15 * citation_count + 0.15 * cross_source_agreement + 0.15 * content_quality
    
    raw_score = (
        0.25 * domain_authority +
        0.15 * author_expertise +
        0.15 * recency +
        0.15 * citation_count_score +
        0.15 * cross_source_agreement +
        0.15 * content_quality
    )
    
    # Bias acts as penalty multiplier 
    bias_score = extracted_data.get("bias_score", 0.1) # 0 is unbiased, 1 is extremely biased
    bias_penalty = 1.0 - (bias_score * 0.5) # Max penalty is 50%
    
    final_score = raw_score * bias_penalty
    
    return min(max(final_score, 0.0), 1.0) # Clamp 0-1

def get_empty_credibility_breakdown() -> Dict[str, float]:
    return {
         "domain_authority": 0.5,
         "author_expertise": 0.5,
         "recency": 0.5,
         "citation_count": 0.5,
         "cross_source_agreement": 0.5,
         "content_quality": 0.5,
         "bias_penalty": 1.0,
         "final_score": 0.5
    }
