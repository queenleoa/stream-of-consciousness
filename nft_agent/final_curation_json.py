FINAL_JSON_SAMPLE = """{
  "card_1_onchain": {
    "preview": {
      "minted_by": "0xabcd...1234 - Extract from analysis",
      "contract": "0x1234...abcd - Extract from analysis",
      "chain_id": 1,
      "token_id": "123 - Extract from analysis",
      "awakened_by": "Use provided awakened_by value or Unknown"
    },
    "extended": {
      "awakening_contract": "0xFAA5869c1d027E48a2618440a06E90656F16Bb3F - literal value",
      "chain_name": "Ethereum - from analysis",
      "block_number": "18234567 or null",
      "mint_date": "2024-03-15T14:30:00Z or null",
      "links": {
        "etherscan_minter": "https://etherscan.io/address/0x...",
        "etherscan_tx": "https://etherscan.io/tx/0x... or null",
        "etherscan_contract": "https://etherscan.io/address/0x...",
        "etherscan_token": "https://etherscan.io/token/0x...?a=123"
      }
    }
  },
  "card_2_art_visuals": {
    "preview": {
      "name": "NFT name from analysis",
      "summary": "100-150 words: What makes this especially interesting visually"
    },
    "extended": {
      "style_analysis": "150 words: Dominant style, inspirations, art movements",
      "interesting_detail": "ONE specific genius detail viewers miss",
      "visual_elements": {
        "color_palette": "1 sentence on color significance",
        "composition": "1 sentence on compositional choices",
        "technique": "1 sentence on artistic technique"
      }
    }
  },
  "card_3_transfer_history": {
    "preview": {
      "current_owner": "0xdef...5678 or ENS - from analysis",
      "summary": "2 sentences on transfer pattern even if inactive"
    },
    "extended": {
      "detailed_analysis": "100-150 words: Transfer history, collector behavior, famous owners from analysis",
      "marketplace_assessment": "50 words: Gallery vs open market vibe",
      "market_classification": "Speculative or timeless - be subtle",
      "latest_transfer_events": [
        {
          "date": "2024-03-15",
          "from": "0x...",
          "to": "0x...",
          "price_eth": "1.5",
          "source": "From analysis"
        }
      ]
    }
  },
  "card_4_about_artist": {
    "preview": {
      "artist_name": "From analysis or Unknown",
      "minter_address": "0x... from analysis",
      "collection_note": "Collection vs individual mint",
      "key_highlights": "150 words: Artist background and significance"
    },
    "extended": {
      "worldview_analysis": "200 words: Philosophy and themes from analysis + search_results",
      "current_work": "150 words: Other projects from analysis + search_results",
      "social_links": {
        "twitter": "From analysis.categorized_links",
        "website": "From analysis.categorized_links",
        "instagram": "From analysis.categorized_links",
        "other_relevant_links": ["From analysis.categorized_links"]
      },
      "notable_achievements": "Only if confirmed in sources"
    }
  },
  "card_5_irl_exhibits": {
    "preview": {
      "summary": "2-3 sentences: Exhibitions found OR suitable galleries - be geographically diverse"
    },
    "extended": {
      "exhibition_history": "150 words: Physical exhibits if found in search_results",
      "gallery_suitability": "150 words: Which venues match this work based on style from analysis",
      "sources": [
        {
          "type": "exhibition_record",
          "title": "Only if found in search_results",
          "url": "From search_results",
          "date": "2024-06"
        }
      ],
      "recommendation": "Would physical exhibition benefit this piece?"
    }
  },
  "card_6_social_discourse": {
    "preview": {
      "featured_quote": {
        "text": "Best quote from search_results.twitter_data or null",
        "author": "@username or null",
        "date": "2024-03-15 or null",
        "url": "https://twitter.com/.../status/... or null"
      }
    },
    "extended": {
      "additional_quotes": [
        {
          "text": "From search_results.twitter_data",
          "author": "@username",
          "date": "2024-03-14",
          "url": "https://twitter.com/.../status/...",
          "context": "Why relevant"
        }
      ],
      "discourse_themes": ["Themes from twitter or null"],
      "sentiment_analysis": "Community sentiment or Limited social discourse found"
    }
  },
  "card_7_subversion_culture": {
    "preview": {
      "summary": "2-3 sentences: What makes this subversive or groundbreaking"
    },
    "extended": {
      "comprehensive_analysis": "300-400 words: Synthesize ALL data - artist + imagery + context. What makes it culturally significant. Details others miss.",
      "deeper_insights": "Hidden layers, metaphors, symbols, conceptual frameworks",
      "curator_perspective": "Significance in contemporary discourse. Rare/unique or building on traditions?",
      "important_citations": ["2-3 most relevant URLs from search_results"]
    }
  },
  "card_8_curation_notes": {
    "sources_used": {
      "high_trust": ["analysis.extracted_info", "analysis.image_analysis", "analysis.categorized_links"],
      "medium_trust": ["search_results.twitter_data", "search_results.google_searches", "search_results.website_content"]
    },
    "curatorial_voice": "meticulous, authentic, and poetic",
    "trust_hierarchy": "analysis > web_searches > twitter",
    "analysis_depth": "high art curator with attention to missed details"
  },
  "metadata": {
    "version": "1.0",
    "application": "stream-of-consciousness",
    "awakening_contract": "0xFAA5869c1d027E48a2618440a06E90656F16Bb3F",
    "generated_at": "Use current timestamp",
    "nft_contract": "From analysis.extracted_info.contract",
    "token_id": "From analysis.extracted_info.token_id",
    "chain_id": "From analysis.extracted_info.chain"
  }
}"""