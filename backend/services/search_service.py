import os
import httpx
from bs4 import BeautifulSoup
from readability import Document
from typing import List, Dict, Any

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

async def perform_search(query: str, num_results: int = 5) -> List[Dict[str, str]]:
    """Calls SerpApi to fetch Google search results"""
    if not SERPAPI_API_KEY:
         print("WARNING: SerpAPI Key missing.")
         return []

    url = "https://serpapi.com/search"
    params = {
        "engine": "google",
        "q": query,
        "api_key": SERPAPI_API_KEY,
        "num": num_results
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            organic_results = data.get("organic_results", [])
            extracted = []
            
            # Extract basic info
            for res in organic_results:
                extracted.append({
                    "title": res.get("title", ""),
                    "url": res.get("link", ""),
                    "snippet": res.get("snippet", "")
                })
                
            return extracted
    except Exception as e:
        print(f"Search API Error: {e}")
        return []

async def fetch_and_clean_html(url: str) -> str:
    """Fetches a URL and uses readability to extract the main article."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            
            doc = Document(response.text)
            summary_html = doc.summary()
            
            # Further clean the extracted HTML with BeautifulSoup to just get text
            soup = BeautifulSoup(summary_html, "html.parser")
            return soup.get_text(separator="\n", strip=True)
            
    except (httpx.ConnectError, httpx.ReadTimeout, httpx.ConnectTimeout) as e:
         print(f"Connection error fetching {url}: {e}")
         return ""
    except Exception as e:
         print(f"Error fetching/cleaning {url}: {e}")
         return ""
