// Card content data separated from presentation
import { dummyNFTData } from "./dummyNFTData";

// Helpers
const formatAddress = (addr) => {
  if (!addr || addr === "null_address") return "Unknown";
  if (addr.includes(".eth")) return addr;
  return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
};
const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso || "Unknown";
  }
};

// Short refs
const c1 = dummyNFTData.card_1_onchain;
const c2 = dummyNFTData.card_2_art_visuals;
const c3 = dummyNFTData.card_3_transfer_history;
const c4 = dummyNFTData.card_4_about_artist;
const c5 = dummyNFTData.card_5_irl_exhibits;
const c6 = dummyNFTData.card_6_social_discourse;
const c7 = dummyNFTData.card_7_subversion_culture;
const c8 = dummyNFTData.card_8_curation_notes;
const md = dummyNFTData.metadata;

// ---------------- LEFT BANK ----------------
export const leftBankCards = [
  // 1) On-Chain Data
  {
    id: "left-1",
    title: `On-Chain Data (${c1.extended.chain_name})`,
    type: "onchain",
    color: "#4dd0e1",
    position: [-5, 1, 4],
    preview: `Minted by: ${formatAddress(c1.preview.minted_by)} • Awakened by: ${formatAddress(c1.preview.awakened_by)}`,
    fullContent: {
      // include ALL preview fields
      previewDetails: {
        minted_by: c1.preview.minted_by,
        contract: c1.preview.contract,
        chain_id: c1.preview.chain_id,
        token_id: c1.preview.token_id,
        awakened_by: c1.preview.awakened_by
      },
      // include relevant metadata so nothing is hidden in compact view
      meta: {
        application: md.application,
        version: md.version,
        chain_id: md.chain_id,
        nft_contract: md.nft_contract,
        token_id: md.token_id,
        generated_at: md.generated_at,
        awakening_contract: md.awakening_contract
      },
      summary: `Token ID ${c1.preview.token_id} on ${c1.extended.chain_name} (Chain ID ${c1.preview.chain_id}).`,
      details: [
        `Minted by: ${formatAddress(c1.preview.minted_by)}`,
        `Contract: ${formatAddress(c1.preview.contract)}`,
        `Awakening Contract: ${formatAddress(c1.extended.awakening_contract)}`,
        `Block Number: ${c1.extended.block_number}`,
        `Mint Date: ${formatDate(c1.extended.mint_date)}`
      ],
      links: {
        "Etherscan: Minter": c1.extended.links.etherscan_minter,
        "Etherscan: Tx": c1.extended.links.etherscan_tx,
        "Etherscan: Contract": c1.extended.links.etherscan_contract,
        "Etherscan: Token": c1.extended.links.etherscan_token
      }
    }
  },

  // 2) Trades & Transfers
  {
    id: "left-2",
    title: "Trades & Transfers",
    type: "summary",
    color: "#00bcd4",
    position: [-7, 1, -6],
    preview: `Current owner: ${c3.preview.current_owner}. ${c3.preview.summary}`,
    fullContent: {
      // ALL preview fields included
      previewDetails: {
        current_owner: c3.preview.current_owner,
        summary: c3.preview.summary
      },
      summary: c3.extended.market_classification,
      details: [
        c3.extended.detailed_analysis,
        `Marketplace assessment: ${c3.extended.marketplace_assessment}`
      ],
      appendix: c3.extended.latest_transfer_events.map(e => ({
        date: e.date,
        from: e.from,
        to: e.to,
        price_eth: e.price_eth,
        source: e.source
      }))
    }
  },

  // 3) IRL Exhibits
  {
    id: "left-3",
    title: "IRL Exhibits",
    type: "appendix",
    color: "#536dfe",
    position: [-7, 2, -14],
    preview: c5.preview.summary,
    fullContent: {
      previewDetails: {
        summary: c5.preview.summary
      },
      summary: c5.extended.exhibition_history,
      details: [c5.extended.gallery_suitability, c5.extended.recommendation],
      appendix: c5.extended.sources.map(s => ({
        type: s.type,
        title: s.title,
        url: s.url,
        date: s.date
      }))
    }
  },

  // 4) Curation Notes
  {
    id: "left-4",
    title: "Curation Notes",
    type: "list",
    color: "#448aff",
    position: [-7, 2, -22],
    preview: `Trust: ${c8.trust_hierarchy}. Voice: ${c8.curatorial_voice}.`,
    fullContent: {
      previewDetails: {
        sources_used: c8.sources_used, // preserve full object
        curatorial_voice: c8.curatorial_voice,
        trust_hierarchy: c8.trust_hierarchy,
        analysis_depth: c8.analysis_depth
      },
      summary: `Analysis depth: ${c8.analysis_depth}`,
      details: [
        `Trust hierarchy: ${c8.trust_hierarchy}`,
        `Curatorial voice: ${c8.curatorial_voice}`
      ],
      notes: [
        { label: "High-trust sources", items: c8.sources_used.high_trust },
        { label: "Medium-trust sources", items: c8.sources_used.medium_trust }
      ]
    }
  }
];

// ---------------- RIGHT BANK ----------------
export const rightBankCards = [
  // 5) Visual Study
  {
    id: "right-1",
    title: "Visual Study",
    type: "summary",
    color: "#ff6e40",
    position: [6, 1, 3],
    preview: `${c2.preview.name}: ${c2.preview.summary}`,
    fullContent: {
      previewDetails: {
        name: c2.preview.name,
        summary: c2.preview.summary
      },
      summary: c2.extended.style_analysis,
      details: [
        c2.extended.interesting_detail,
        `Color palette: ${c2.extended.visual_elements.color_palette}`,
        `Composition: ${c2.extended.visual_elements.composition}`,
        `Technique: ${c2.extended.visual_elements.technique}`
      ]
    }
  },

  // 6) Artist Profile
  {
    id: "right-2",
    title: "Artist Profile",
    type: "summary",
    color: "#ff5252",
    position: [7, 2, -4],
    preview: `${c4.preview.artist_name}: ${c4.preview.collection_note}`,
    fullContent: {
      previewDetails: {
        artist_name: c4.preview.artist_name,
        minter_address: c4.preview.minter_address,
        collection_note: c4.preview.collection_note,
        key_highlights: c4.preview.key_highlights
      },
      summary: c4.preview.key_highlights,
      details: [c4.extended.worldview_analysis, c4.extended.current_work],
      appendix: [
        { platform: "Website", link: c4.extended.social_links.website },
        { platform: "Twitter", link: c4.extended.social_links.twitter },
        { platform: "Instagram", link: c4.extended.social_links.instagram },
        ...c4.extended.social_links.other_relevant_links.map(u => ({ platform: "Link", link: u }))
      ],
      notes: [`Notable achievements: ${c4.extended.notable_achievements}`]
    }
  },

  // 7) Social Discourse
  {
    id: "right-3",
    title: "Social Discourse",
    type: "summary",
    color: "#ff6f00",
    position: [7, 1, -12],
    preview: `Featured: "${c6.preview.featured_quote.text}" — ${c6.preview.featured_quote.author}`,
    fullContent: {
      previewDetails: {
        featured_quote: c6.preview.featured_quote // keep full object (text, author, date, url)
      },
      summary: c6.extended.sentiment_analysis,
      details: c6.extended.discourse_themes.map(t => `Theme: ${t}`),
      posts: [
        {
          platform: "Twitter",
          author: c6.preview.featured_quote.author,
          text: c6.preview.featured_quote.text,
          date: c6.preview.featured_quote.date,
          url: c6.preview.featured_quote.url
        },
        ...c6.extended.additional_quotes.map(q => ({
          platform: "Twitter",
          author: q.author,
          text: q.text,
          date: q.date,
          url: q.url,
          context: q.context
        }))
      ]
    }
  },

  // 8) Subversion & Culture
  {
    id: "right-4",
    title: "Subversion & Culture",
    type: "summary",
    color: "#e91e63",
    position: [7, 2, -20],
    preview: c7.preview.summary,
    fullContent: {
      previewDetails: {
        summary: c7.preview.summary
      },
      summary: c7.extended.comprehensive_analysis,
      details: [c7.extended.deeper_insights, c7.extended.curator_perspective],
      appendix: c7.extended.important_citations.map(u => ({ title: "Source", link: u }))
    }
  }
];
