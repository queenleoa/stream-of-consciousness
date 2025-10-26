// Utility to parse NFT JSON data into card format

// Helper to format addresses
const formatAddress = (address) => {
  if (!address || address === 'null_address') return 'Unknown';
  if (address.includes('.eth')) return address;
  if (address.length > 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
};

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

// Helper to check if value exists
const hasValue = (value) => {
  return value !== null && value !== undefined && value !== '' && value !== 'null';
};

// Parse Card 1: On-Chain Data
const parseOnChainCard = (data) => {
  const preview = data?.preview || {};
  const extended = data?.extended || {};
  
  return {
    id: 'card-1-onchain',
    title: 'On-Chain Identity',
    type: 'appendix',
    color: '#4dd0e1',
    position: [-5, 1, 4],
    preview: `Minted by ${formatAddress(preview.minted_by)} on ${extended.chain_name || 'Ethereum'}`,
    fullContent: {
      appendix: [
        {
          label: 'Minted By',
          value: formatAddress(preview.minted_by),
          link: extended.links?.etherscan_minter
        },
        {
          label: 'Contract Address',
          value: formatAddress(preview.contract),
          link: extended.links?.etherscan_contract
        },
        {
          label: 'Token ID',
          value: preview.token_id || 'Unknown'
        },
        {
          label: 'Chain',
          value: extended.chain_name || 'Ethereum',
          detail: `Chain ID: ${preview.chain_id || 1}`
        },
        hasValue(preview.awakened_by) && {
          label: 'Awakened By',
          value: formatAddress(preview.awakened_by)
        },
        hasValue(extended.block_number) && {
          label: 'Block Number',
          value: extended.block_number
        },
        hasValue(extended.mint_date) && {
          label: 'Mint Date',
          value: formatDate(extended.mint_date)
        },
        hasValue(extended.links?.etherscan_tx) && {
          label: 'Mint Transaction',
          link: extended.links.etherscan_tx
        },
        {
          label: 'View on Etherscan',
          link: extended.links?.etherscan_token
        }
      ].filter(Boolean)
    }
  };
};

// Parse Card 2: Art & Visuals
const parseArtVisualsCard = (data) => {
  const preview = data?.preview || {};
  const extended = data?.extended || {};
  
  return {
    id: 'card-2-art',
    title: preview.name || 'Artwork Analysis',
    type: 'summary',
    color: '#7c4dff',
    position: [-7, 2, -3],
    preview: preview.summary?.substring(0, 150) + '...' || 'Visual analysis of this artwork...',
    fullContent: {
      summary: preview.summary || 'No description available',
      details: [
        extended.style_analysis && `Style: ${extended.style_analysis}`,
        extended.interesting_detail && `Hidden Detail: ${extended.interesting_detail}`,
        extended.visual_elements?.color_palette && `Colors: ${extended.visual_elements.color_palette}`,
        extended.visual_elements?.composition && `Composition: ${extended.visual_elements.composition}`,
        extended.visual_elements?.technique && `Technique: ${extended.visual_elements.technique}`
      ].filter(Boolean)
    }
  };
};

// Parse Card 3: Transfer History
const parseTransferHistoryCard = (data) => {
  const preview = data?.preview || {};
  const extended = data?.extended || {};
  
  return {
    id: 'card-3-transfers',
    title: 'Ownership Journey',
    type: 'appendix',
    color: '#00bcd4',
    position: [-7, 1, -10],
    preview: `Current owner: ${formatAddress(preview.current_owner)}. ${preview.summary || ''}`,
    fullContent: {
      appendix: [
        {
          label: 'Current Owner',
          value: formatAddress(preview.current_owner)
        },
        {
          label: 'Collection Status',
          value: extended.market_classification || 'Unknown'
        },
        extended.marketplace_assessment && {
          label: 'Market Analysis',
          value: extended.marketplace_assessment
        },
        ...(extended.latest_transfer_events || []).map((event, idx) => ({
          label: `Transfer ${extended.latest_transfer_events.length - idx}`,
          from: formatAddress(event.from),
          to: formatAddress(event.to),
          price: event.price_eth ? `${event.price_eth} ETH` : 'Transfer',
          date: formatDate(event.date),
          source: event.source
        }))
      ].filter(Boolean)
    }
  };
};

// Parse Card 4: About Artist
const parseAboutArtistCard = (data) => {
  const preview = data?.preview || {};
  const extended = data?.extended || {};
  
  return {
    id: 'card-4-artist',
    title: `About ${preview.artist_name || 'the Artist'}`,
    type: 'summary',
    color: '#ff6e40',
    position: [6, 1, 3],
    preview: preview.key_highlights?.substring(0, 150) + '...' || 'Learn about the artist...',
    fullContent: {
      summary: preview.key_highlights || 'Artist information not available',
      details: [
        preview.minter_address && `Address: ${formatAddress(preview.minter_address)}`,
        preview.collection_note,
        extended.worldview_analysis && `Philosophy: ${extended.worldview_analysis.substring(0, 200)}...`,
        extended.current_work && `Current Work: ${extended.current_work.substring(0, 150)}...`,
        extended.notable_achievements && `Achievements: ${extended.notable_achievements}`,
        extended.social_links?.twitter && `Twitter: ${extended.social_links.twitter}`,
        extended.social_links?.website && `Website: ${extended.social_links.website}`
      ].filter(Boolean)
    }
  };
};

// Parse Card 5: IRL Exhibitions
const parseIRLExhibitsCard = (data) => {
  const preview = data?.preview || {};
  const extended = data?.extended || {};
  
  return {
    id: 'card-5-exhibits',
    title: 'Physical Exhibitions',
    type: 'appendix',
    color: '#ff5252',
    position: [7, 2, -4],
    preview: preview.summary || 'Exhibition history and gallery recommendations...',
    fullContent: {
      appendix: [
        extended.exhibition_history && {
          label: 'Exhibition History',
          value: extended.exhibition_history
        },
        extended.gallery_suitability && {
          label: 'Gallery Suitability',
          value: extended.gallery_suitability
        },
        extended.recommendation && {
          label: 'Curator Recommendation',
          value: extended.recommendation
        },
        ...(extended.sources || []).map(source => ({
          label: source.type || 'Source',
          title: source.title,
          link: source.url,
          date: formatDate(source.date)
        }))
      ].filter(Boolean)
    }
  };
};

// Parse Card 6: Social Discourse
const parseSocialDiscourseCard = (data) => {
  const preview = data?.preview || {};
  const extended = data?.extended || {};
  
  const posts = [];
  
  // Add featured quote if exists
  if (hasValue(preview.featured_quote?.text)) {
    posts.push({
      platform: 'Twitter',
      author: preview.featured_quote.author || 'Anonymous',
      text: preview.featured_quote.text,
      date: formatDate(preview.featured_quote.date),
      likes: '—',
      url: preview.featured_quote.url
    });
  }
  
  // Add additional quotes
  if (extended.additional_quotes) {
    posts.push(...extended.additional_quotes.map(quote => ({
      platform: 'Twitter',
      author: quote.author || 'Anonymous',
      text: quote.text,
      date: formatDate(quote.date),
      likes: '—',
      url: quote.url,
      context: quote.context
    })));
  }
  
  return {
    id: 'card-6-social',
    title: 'Community Voice',
    type: 'social',
    color: '#ff4081',
    position: [7, 1, -11],
    preview: preview.featured_quote?.text?.substring(0, 120) + '...' || 'Social media discourse...',
    fullContent: {
      posts,
      sentiment: extended.sentiment_analysis,
      themes: extended.discourse_themes
    }
  };
};

// Parse Card 7: Cultural Significance
const parseCulturalCard = (data) => {
  const preview = data?.preview || {};
  const extended = data?.extended || {};
  
  return {
    id: 'card-7-culture',
    title: 'Cultural Context',
    type: 'summary',
    color: '#e91e63',
    position: [7, 2, -18],
    preview: preview.summary || 'Cultural and artistic significance...',
    fullContent: {
      summary: extended.comprehensive_analysis || preview.summary || 'No cultural analysis available',
      details: [
        extended.deeper_insights && `Deeper Insights: ${extended.deeper_insights}`,
        extended.curator_perspective && `Curator's View: ${extended.curator_perspective}`,
        extended.important_citations && extended.important_citations.length > 0 && 
          `Key Sources: ${extended.important_citations.slice(0, 2).join(', ')}`
      ].filter(Boolean)
    }
  };
};

// Main parser function
export const parseNFTData = (jsonData) => {
  if (!jsonData) return { leftBankCards: [], rightBankCards: [] };
  
  try {
    const leftBankCards = [
      parseOnChainCard(jsonData.card_1_onchain),
      parseArtVisualsCard(jsonData.card_2_art_visuals),
      parseTransferHistoryCard(jsonData.card_3_transfer_history)
    ].filter(Boolean);
    
    const rightBankCards = [
      parseAboutArtistCard(jsonData.card_4_about_artist),
      parseIRLExhibitsCard(jsonData.card_5_irl_exhibits),
      parseSocialDiscourseCard(jsonData.card_6_social_discourse),
      parseCulturalCard(jsonData.card_7_subversion_culture)
    ].filter(Boolean);
    
    return { leftBankCards, rightBankCards };
  } catch (error) {
    console.error('Error parsing NFT data:', error);
    return { leftBankCards: [], rightBankCards: [] };
  }
};

export default parseNFTData;