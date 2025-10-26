import os
import json
import requests
from typing import Dict, List, Optional

# Load API keys from environment
api_key = os.getenv("SERP_API_KEY")  

class NFTSearcher:
    """Handles all search operations for NFT curation"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
    
    def search_twitter_profile(self, twitter_url: str, max_posts: int = 10) -> Dict:
        """
        Fetch tweets and bio from a Twitter profile using BrightData Twitter API
        
        Args:
            twitter_url: Full Twitter URL (e.g., "https://x.com/username")
            max_posts: Number of posts to fetch (default: 10)
        
        Returns:
            Dict containing twitter data or error message
        """
        try:
            data = json.dumps({
                "input": [{
                    "url": twitter_url,
                    "max_number_of_posts": max_posts
                }]
            })
            
            response = requests.post(
                "https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lwxmeb2u1cniijd7t4&notify=false&include_errors=true",
                headers=self.headers,
                data=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "source": twitter_url,
                    "data": result
                }
            else:
                return {
                    "success": False,
                    "source": twitter_url,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "source": twitter_url,
                "error": str(e)
            }
    
    def fetch_website_content(self, url: str) -> Dict:
        """
        Fetch website content using BrightData Web Unlocker API
        
        Args:
            url: Website URL to fetch
        
        Returns:
            Dict containing website content or error message
        """
        try:
            data = {
                "zone": "web_unlocker1",
                "url": url,
                "format": "raw"
            }
            
            response = requests.post(
                "https://api.brightdata.com/request",
                json=data,
                headers=self.headers,
                timeout=60
            )
            
            if response.status_code == 200:
                # Limit content size to prevent overwhelming response
                content = response.text[:10000] if len(response.text) > 10000 else response.text
                return {
                    "success": True,
                    "source": url,
                    "content": content,
                    "truncated": len(response.text) > 10000
                }
            else:
                return {
                    "success": False,
                    "source": url,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "source": url,
                "error": str(e)
            }
    
    def search_google(self, query: str, num_results: int = 7) -> Dict:
        """
        Perform Google search using BrightData SERP API
        
        Args:
            query: Search query string
            num_results: Number of results to return (default: 7)
        
        Returns:
            Dict containing search results or error message
        """
        try:
            data = json.dumps({
                "input": [{
                    "url": "https://www.google.com/",
                    "keyword": query,
                    "language": "",
                    "uule": "",
                    "brd_mobile": ""
                }]
            })
            
            response = requests.post(
                "https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_mfz5x93lmsjjjylob&notify=false&include_errors=true",
                headers=self.headers,
                data=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                # Limit to requested number of results
                if isinstance(result, list) and len(result) > 0:
                    # Extract organic results if available
                    organic_results = []
                    for item in result:
                        if 'organic_results' in item:
                            organic_results.extend(item['organic_results'][:num_results])
                        elif isinstance(item, dict):
                            organic_results.append(item)
                    
                    return {
                        "success": True,
                        "query": query,
                        "results": organic_results[:num_results],
                        "total_results": len(organic_results)
                    }
                else:
                    return {
                        "success": True,
                        "query": query,
                        "results": result,
                        "total_results": len(result) if isinstance(result, list) else 1
                    }
            else:
                return {
                    "success": False,
                    "query": query,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "query": query,
                "error": str(e)
            }


async def perform_all_searches(ctx, analysis_result: Dict) -> Dict:
    """
    Orchestrate all search operations based on initial analysis
    
    Args:
        ctx: uagents Context object for logging
        analysis_result: The JSON result from initial analysis
    
    Returns:
        Dict containing all search results organized by type
    """
    searcher = NFTSearcher(SERP_API_KEY)
    
    search_results = {
        "twitter_data": None,
        "website_content": [],
        "google_searches": []
    }
    
    categorized_links = analysis_result.get("categorized_links", {})
    search_queries = analysis_result.get("search_queries", {})
    
    # 1. Twitter Profile Search
    ctx.logger.info("🐦 Starting Twitter profile search...")
    artist_social = categorized_links.get("artist_social", [])
    twitter_url = None
    
    # Find Twitter/X URL
    for link in artist_social:
        if "x.com" in link or "twitter.com" in link:
            twitter_url = link
            break
    
    if twitter_url:
        ctx.logger.info(f"Found Twitter URL: {twitter_url}")
        twitter_result = searcher.search_twitter_profile(twitter_url, max_posts=10)
        search_results["twitter_data"] = twitter_result
        
        if twitter_result.get("success"):
            ctx.logger.info("✅ Twitter data fetched successfully")
        else:
            ctx.logger.warning(f"⚠️ Twitter fetch failed: {twitter_result.get('error')}")
    else:
        ctx.logger.info("No Twitter URL found in artist_social")
        search_results["twitter_data"] = {
            "success": False,
            "error": "No Twitter URL found in analysis"
        }
    
    # 2. Website Content Fetch (up to 2 websites)
    ctx.logger.info("🌐 Starting website content fetch...")
    project_websites = categorized_links.get("project_websites", [])
    
    if project_websites:
        websites_to_fetch = project_websites[:2]  # Limit to 2
        ctx.logger.info(f"Fetching {len(websites_to_fetch)} website(s)")
        
        for website_url in websites_to_fetch:
            ctx.logger.info(f"Fetching: {website_url}")
            website_result = searcher.fetch_website_content(website_url)
            search_results["website_content"].append(website_result)
            
            if website_result.get("success"):
                ctx.logger.info(f"✅ Successfully fetched {website_url}")
            else:
                ctx.logger.warning(f"⚠️ Failed to fetch {website_url}: {website_result.get('error')}")
    else:
        ctx.logger.info("No project websites found")
        search_results["website_content"] = [{
            "success": False,
            "error": "No project websites found in analysis"
        }]
    
    # 3. Google Search (first 3 web queries, 7 results each)
    # ctx.logger.info("🔍 Starting Google searches...")
    # web_queries = search_queries.get("web", [])
    
    # if web_queries:
    #     queries_to_search = web_queries[:3]  # Limit to first 3
    #     ctx.logger.info(f"Performing {len(queries_to_search)} Google search(es)")
        
    #     for query in queries_to_search:
    #         ctx.logger.info(f"Searching: {query}")
    #         google_result = searcher.search_google(query, num_results=7)
    #         search_results["google_searches"].append(google_result)
            
    #         if google_result.get("success"):
    #             ctx.logger.info(f"✅ Search completed: {google_result.get('total_results', 0)} results")
    #         else:
    #             ctx.logger.warning(f"⚠️ Search failed: {google_result.get('error')}")
    # else:
    #     ctx.logger.info("No web search queries found")
    #     search_results["google_searches"] = [{
    #         "success": False,
    #         "error": "No web search queries found in analysis"
    #     }]
    
    ctx.logger.info("✨ All searches completed")
    return search_results