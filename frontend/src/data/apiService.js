/**
 * API Service for fetching NFT data
 * 
 * Usage:
 * import { fetchNFTData } from './services/apiService';
 * 
 * const data = await fetchNFTData(contractAddress, tokenId);
 */

import parseNFTData from '../data/nftDataParser';

// Configuration
const API_CONFIG = {
  // Replace with your actual API endpoint
  baseURL: process.env.REACT_APP_API_URL || 'https://your-api-endpoint.com',
  timeout: 10000,
};

/**
 * Fetch NFT data from your API
 * @param {string} contractAddress - The NFT contract address
 * @param {string} tokenId - The token ID
 * @returns {Promise<{leftBankCards: Array, rightBankCards: Array}>}
 */
export async function fetchNFTData(contractAddress, tokenId) {
  try {
    const response = await fetch(
      `${API_CONFIG.baseURL}/nft/${contractAddress}/${tokenId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(API_CONFIG.timeout),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the API response into card format
    const parsedCards = parseNFTData(data);
    
    return parsedCards;
  } catch (error) {
    console.error('Error fetching NFT data:', error);
    
    // Return empty cards on error
    return {
      leftBankCards: [],
      rightBankCards: [],
    };
  }
}

/**
 * Fetch NFT data by awakening contract
 * @param {string} awakeningContract - The awakening contract address
 * @returns {Promise<{leftBankCards: Array, rightBankCards: Array}>}
 */
export async function fetchByAwakeningContract(awakeningContract) {
  try {
    const response = await fetch(
      `${API_CONFIG.baseURL}/awakening/${awakeningContract}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(API_CONFIG.timeout),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const parsedCards = parseNFTData(data);
    
    return parsedCards;
  } catch (error) {
    console.error('Error fetching by awakening contract:', error);
    return {
      leftBankCards: [],
      rightBankCards: [],
    };
  }
}

/**
 * Mock function for development - uses dummy data
 * @returns {Promise<{leftBankCards: Array, rightBankCards: Array}>}
 */
export async function fetchMockData() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Import dummy data
  const dummyData = await import('./dummyNFTData');
  return parseNFTData(dummyData.default);
}

/**
 * Validate API response structure
 * @param {object} data - The API response
 * @returns {boolean}
 */
export function validateAPIResponse(data) {
  const requiredCards = [
    'card_1_onchain',
    'card_2_art_visuals',
    'card_3_transfer_history',
    'card_4_about_artist',
    'card_5_irl_exhibits',
    'card_6_social_discourse',
    'card_7_subversion_culture',
  ];

  // Check if all required cards exist
  const hasAllCards = requiredCards.every(cardKey => cardKey in data);
  
  if (!hasAllCards) {
    console.warn('API response missing required cards:', 
      requiredCards.filter(key => !(key in data))
    );
  }

  return hasAllCards;
}

export default {
  fetchNFTData,
  fetchByAwakeningContract,
  fetchMockData,
  validateAPIResponse,
};