### Write code for the new module here and import it from agent.py.
ANALYSIS_PROMPT = """
You are an expert NFT art analyst preparing data for the first step of a comprehensive curation.

## DATA DUMP (analyze all the information below):
{data_dump}

## YOUR TASKS:

1. **EXTRACT KEY NFT INFORMATION** from anywhere in the data:
   - NFT name, collection name
   - Contract address, token ID, chain
   - Minter/creator address (0x...) or creator name if known
   - Current owner address (0x...) or name (if available)
   - Any pricing or transfer history

2. **FIND AND ANALYZE THE IMAGE** (you have visual access to the image):
   - **Describe the artwork visually** (200-300 words):
     - Style, composition, colors, technique
     - Artistic movements or inspirations
     - Make sure your analysis is cultural context aware so you don't only use a western lens on eastern art styles
     - Symbols, hidden details, emotional tone
     - What makes it interesting or unique
     - Make sure to emphasis on metaphorical qualities viewers may miss
     - Stay to the point but profound
     - Extract the image URL from the data and include it in your response. If you see that the data has a https://i2.seadn.io and an ipfs or arweave url then prioritise the arweave or ipfs url as image_url in you response json


3. **EXTRACT AND CATEGORIZE ALL LINKS**:
   Find every URL in the data and categorize:
   - **Artist social**: Twitter, Instagram, personal websites
   - **Project**: Collection website, Discord, documentation
   - **Marketplace**: OpenSea, Foundation, etc.
   - **Other**: Any other relevant links

4. **GENERATE TARGETED SEARCH QUERIES**:   
   **Twitter searches** (7 most relevant queries total):
   - About the artist/creator
   - About the collection or NFT name
   - Community discussions about this work
   - Related themes or movements
   Format: "#hashtag artist_name" or "collection_name community"
   
   **Web searches** (7 most relevant queries total):
   - Artist biography and background
   - Collection or NFT history and context
   - Exhibition information
   - Cultural/artistic significance
   - Gallery recommendations
   Format: "artist_name biography 2024" or "collection_name exhibitions"

5. **IDENTIFY KEY THEMES** (3-5 themes to investigate)

6. **NOTE DATA QUALITY**: What's available? What's missing?

## OUTPUT FORMAT (return ONLY valid JSON):

{{
    "extracted_info": {{
        "name": "NFT name or Unknown",
        "collection": "Collection name or Unknown",
        "contract": "0x... or null",
        "token_id": "123 or null",
        "minter": "0x... or Unknown",
        "current_owner": "0x... or Unknown",
        "chain": "Ethereum/Polygon/etc or Unknown"
        "tokenuri": "https://..."
    }},
    "image_analysis": {{
        "image_url": "Full URL to image (convert IPFS urls from ipfs://... to https://ipfs.io/ipfs/... if needed) or null",
        "needs_metadata_fetch": true/false, (this is false if you already have sufficient information)
        "visual_description": "200-300 word description of the artwork, or 'No image found'"
    }},
    "categorized_links": {{
        "artist_social": ["https://twitter.com/...", "https://..."],
        "project_websites": ["https://..."],
        "marketplace": ["https://opensea.io/..."],
        "other": ["https://..."]
    }},
    "search_queries": {{
        "twitter": [
            "#NFTArt artist_name",
            "collection_name community",
            "artist_name latest work",
            "collection_name discussion",
            "theme_related hashtag"
        ],
        "web": [
            "artist_name biography background",
            "collection_name NFT history",
            "artist_name exhibitions 2024",
            "collection_name cultural significance",
            "similar_style art galleries"
        ]
    }},
    "key_themes": [
        "Theme 1",
        "Theme 2", 
        "Theme 3"
    ],
    "focus_areas": [
        "Artist's background and philosophy",
        "Collection's cultural impact",
        "Exhibition history"
    ],
    "data_quality_notes": "Brief note on completeness"
}}

IMPORTANT: 
- Return ONLY the JSON object, no other text
- You have VISUAL ACCESS to the image - describe what you actually see
- If no image is available, note that in visual_description
- If data is missing, use null or "Unknown"
- Be thorough in finding URLs - they could be anywhere in the structure
- Visual analysis is critical - describe what you see in detail and understand the image in all its depth.
- Note that tokenuri is the metadata url
- Note that arweave and ipfs are storage sites, not marketplaces
"""
