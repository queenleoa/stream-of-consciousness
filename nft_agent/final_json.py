FINAL_JSON_SAMPLE = """{
  "card_1_onchain": {
    "preview": {
      "minted_by": "0xabcd...1234",
      "contract": "0x1234...abcd",
      "chain_id": 1,
      "token_id": "123",
      "awakened by": "0xabcd...6578 or Unknown"
    },
    "extended": {
      "chain_name": "Ethereum",
      "block_number": "18234567",
      "mint_date": "2024-03-15T14:30:00Z",
      "links": {
        "etherscan_minter": "https://etherscan.io/address/0x...",
        "etherscan_tx": "https://etherscan.io/tx/0x...",
        "etherscan_contract": "https://etherscan.io/address/0x...",
        "etherscan_token": "https://etherscan.io/token/0x...?a=123"
      }
    }
  },
  "card_2_art_visuals": {
    "preview": {
      "name": "Ethereal Dreams #42",
      "summary": "A 2-3 sentence summary of what makes this painting interesting. This captures the essence in 100-150 words highlighting the most striking visual elements and why they matter."
    },
    "extended": {
      "style_analysis": "Detailed 2-3 sentence analysis (150 words) about the dominant style, inspirations, and what other artworks or movements it feels reminiscent of. Discusses artistic movements, techniques, and visual language.",
      "interesting_detail": "Deep dive into one specific detail that viewers might miss but reveals poetic or genius aspects of the work. The hidden meaning or brilliant execution that elevates the piece.",
      "visual_elements": {
        "color_palette": "Description of dominant colors and their significance",
        "composition": "Analysis of compositional choices",
        "technique": "Observable artistic techniques"
      }
    }
  },
  "card_3_transfer_history": {
    "preview": {
      "current_owner": "0xdef...5678 or ENS name",
      "summary": "2 sentence summary analyzing the transfer pattern and what it reveals about the NFT's journey and collector interest even if it is inactive."
    },
    "extended": {
      "detailed_analysis": "Comprehensive analysis of transfer history based on OpenSea API data - listings, events, sales patterns. Discusses collector behavior and market dynamics. Do any famous people own this? (200-250 words).",
      "marketplace_assessment": "Artistic take on which marketplace suits the vibe - independent galleries, high art exhibits, or open markets. Analysis of whether it's a pfp collection or high art (100 words).",
      "market_classification": "Subtle judgment on whether it's speculative or timeless art.",
      "latest_transfer_events": [
        {
          "date": "2024-03-15",
          "from": "0x...",
          "to": "0x...",
          "price_eth": "1.5",
          "source": "OpenSea"
        }
      ]
    }
  },
  "card_4_about_artist": {
    "preview": {
      "artist_name": "Artist Name or 'Unknown'",
      "minter_address": "0x...",
      "collection_note": "Note if this appears to be from a large collection vs. direct artist mint",
      "key_highlights": "2-3 most interesting lines about the artist in 150 words - their background, significance, or unique approach."
    },
    "extended": {
      "worldview_analysis": "What is interesting about the artist's worldview based on creator context, tweets, and website. Their philosophy, themes, and artistic vision (200 words).",
      "current_work": "What else they're working on - other projects, exhibitions, collections based on creator context, tweets and website (150 words).",
      "social_links": {
        "twitter": "https://twitter.com/...",
        "website": "https://...",
        "instagram": "https://instagram.com/...",
        "other_relevant_links": [
          "https://...",
          "https://..."
        ]
      },
      "notable_achievements": "Any exhibitions, awards, or recognition mentioned in sources"
    }
  },
  "card_5_irl_exhibits": {
    "preview": {
      "summary": "2-3 sentence summary of whether the art has been exhibited anywhere or if there are famous galleries that suit the style. Be geographically diverse in your recommendation."
    },
    "extended": {
      "exhibition_history": "Detailed explanation of any live exhibits, physical installations, or real-world presentations. Includes dates and venues if available (150 words).",
      "gallery_suitability": "Analysis of which popular galleries or exhibition spaces would suit this work's style and conceptual framework. Discusses why certain venues align with the artistic vision (150 words).",
      "sources": [
        {
          "type": "exhibition_record",
          "title": "...",
          "url": "...",
          "date": "2024-06"
        }
      ],
      "recommendation": "Whether this piece would benefit from physical exhibition and in what context"
    }
  },
  "card_6_social_discourse": {
    "preview": {
      "featured_quote": {
        "text": "This is the most relevant and insightful quote from Twitter about the art",
        "author": "@username",
        "date": "2024-03-15",
        "url": "https://twitter.com/.../status/..."
      }
    },
    "extended": {
      "additional_quotes": [
        {
          "text": "Quote from twitter discussion",
          "author": "@username",
          "date": "2024-03-14",
          "url": "https://twitter.com/.../status/...",
          "context": "Why this quote is relevant"
        },
        {
          "text": "Another relevant quote",
          "author": "@username2",
          "date": "2024-03-13",
          "url": "https://twitter.com/.../status/...",
          "context": "Additional context"
        }
      ],
      "discourse_themes": [
        "Key theme 1 from community discussions",
        "Key theme 2 from social media",
        "Key theme 3 from collector conversations"
      ],
      "sentiment_analysis": "Overall community sentiment and reception of the work"
    }
  },
  "card_7_subversion_culture": {
    "preview": {
      "summary": "2-3 sentence summary of what makes this artwork possibly subversive, culturally relevant, or groundbreaking."
    },
    "extended": {
      "comprehensive_analysis": "Detailed 300-400 word analysis synthesizing the artist's background, imagery, on-chain data, off-chain context, social discourse, and cultural positioning. Explains what makes this groundbreaking or culturally subversive/relevant. Includes details average viewers would miss and sees the art in all its depth comprehensively.",
      "deeper_insights": "Observations that reveal layers most people would miss - symbols, techniques, conceptual frameworks that elevate the work",
      "curator_perspective": "High art curator's take on the work's significance and place in contemporary art discourse. Is the thought process rare and unique or is it building on well established artistic traditions",
      "important_citations": [
        "https://...",
        "https://..."
      ]
    }
  },
  "card_8_curation_notes": {
    "curatorial_voice": "meticulous, authentic, and poetic",
    "trust_hierarchy": "creator_context > opensea/indexer > web_searches > twitter",
    "analysis_depth": "high art curator perspective with attention to missed details"
  },
  "metadata": {
    "version": "1.0",
    "application": "stream-of-consciousness",
    "awakening contract": "0x..ourappcontract",
    "generated_at": "2025-01-15T10:30:00Z",
    "nft_contract": "0x...",
    "token_id": "123",
    "chain_id": 1
  },
  "sources": {
    "high_trust": [
      {
        "type": "opensea_api",
        "description": "OpenSea NFT metadata and transfer data",
        "accessed": "2025-01-15"
      },
      {
        "type": "indexer",
        "description": "On-chain indexer data",
        "accessed": "2025-01-15"
      },
      {
        "type": "creator_context",
        "description": "Provided creator context and links",
        "accessed": "2025-01-15"
      }
    ],
    "medium_trust": [
      {
        "type": "twitter_search",
        "query": "...",
        "url": "...",
        "accessed": "2025-01-15"
      },
      {
        "type": "web_search",
        "query": "...",
        "url": "...",
        "accessed": "2025-01-15"
      }
    ]
  }
}""" 