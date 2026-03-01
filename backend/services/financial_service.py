import os
import httpx
from typing import Dict, Any, List

FMP_API_KEY = os.getenv("FMP_API_KEY")

async def get_financial_metrics(symbol: str) -> Dict[str, Any]:
    """Fetch metrics from Financial Modeling Prep"""
    if not FMP_API_KEY:
        return {"error": "FMP API Key missing."}
        
    base_url = "https://financialmodelingprep.com/api/v3"
    metrics = {
        "symbol": symbol
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Get Quote (Price)
            quote_res = await client.get(f"{base_url}/quote/{symbol}?apikey={FMP_API_KEY}")
            if quote_res.status_code == 200 and quote_res.json():
                metrics["price"] = quote_res.json()[0].get("price")
                
            # Get Key Metrics TTM
            km_res = await client.get(f"{base_url}/key-metrics-ttm/{symbol}?apikey={FMP_API_KEY}")
            if km_res.status_code == 200 and km_res.json():
                km_data = km_res.json()[0]
                metrics["revenue_per_share"] = km_data.get("revenuePerShareTTM")
                metrics["pe_ratio"] = km_data.get("peRatioTTM")
                
            # Growth 
            growth_res = await client.get(f"{base_url}/financial-growth/{symbol}?period=annual&apikey={FMP_API_KEY}")
            if growth_res.status_code == 200 and growth_res.json():
                 g_data = growth_res.json()[0]
                 metrics["revenue_growth"] = g_data.get("revenueGrowth")
                 metrics["eps_growth"] = g_data.get("epsgrowth")
                 metrics["gross_profit_margin"] = g_data.get("grossProfitMargin")
                 metrics["operating_cash_flow_growth"] = g_data.get("operatingCashFlowGrowth")
                 
            return metrics
            
    except Exception as e:
        print(f"FMP API Error for {symbol}: {e}")
        return {"error": str(e)}

async def get_stock_outlook(symbol: str) -> str:
    """Wrapper using FMP Analyst Estimates or LLM + Metrics"""
    metrics = await get_financial_metrics(symbol)
    if "error" in metrics:
        return ""
    
    outlook_str = f"Stock: {symbol}. Price: ${metrics.get('price')}. PE Ratio: {metrics.get('pe_ratio')}. "
    if metrics.get('revenue_growth'):
         outlook_str += f"Revenue Growth: {metrics.get('revenue_growth')*100:.2f}%. "
    if metrics.get('eps_growth'):
         outlook_str += f"EPS Growth: {metrics.get('eps_growth')*100:.2f}%. "
         
    return outlook_str
