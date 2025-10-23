// src/EventHandlers.ts
import { ERC721 } from "generated";
import { getTokenURI } from "./effects/tokenURI";
import { fetchNFTMetadata } from "./effects/metadata";
import { isERC721Contract } from "./effects/contractValidation";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAX_TOKEN_ID = 10001n; // Only index tokens up to 10,001

ERC721.Transfer.handler(
  async ({ event, context }) => {
    // Only process mint events
    if (event.params.from !== ZERO_ADDRESS) {
      return;
    }

    // FILTER 1: TokenID range check (NO RPC CALL)
    if (event.params.tokenId > MAX_TOKEN_ID) {
      context.log.debug(`Skipping high tokenId: ${event.params.tokenId}`);
      return;
    }

    try {
      // FILTER 2: ERC721 Validation (only for contracts that pass tokenId filter)
      const isERC721 = await context.effect(isERC721Contract, {
        contractAddress: event.srcAddress,
        tokenId: event.params.tokenId, // Pass tokenId for context
      });

      if (!isERC721) {
        context.log.debug(`Skipping non-ERC721: ${event.srcAddress}`);
        return;
      }

      // Get tokenURI for validated ERC721 contracts only
      const tokenURI = await context.effect(getTokenURI, {
        contractAddress: event.srcAddress,
        tokenId: event.params.tokenId,
        chainId: event.chainId,
      });

      if (!tokenURI || tokenURI.length === 0) {
        return;
      }

      // FETCH METADATA with rate limiting
      const metadata = await context.effect(fetchNFTMetadata, {
        tokenURI,
        contractAddress: event.srcAddress,
        tokenId: event.params.tokenId,
      });

      // Create Art entity
      context.Art.set({
        id: `${event.chainId}_${event.srcAddress}_${event.params.tokenId}`,
        chainId: event.chainId,
        contract: event.srcAddress,
        tokenId: event.params.tokenId,
        minter: event.params.to,
        blockNumber: BigInt(event.block.number),
        txHash: event.transaction.hash,
        tokenURI: tokenURI,
        name: undefined,
        image_url: undefined,
        animation_url: undefined,
        external_url: undefined,
        creatorContextURI: undefined,
        awakeningURI: undefined,
        journeysURI: undefined,
      });

      context.log.info(`✅ Art indexed: ${event.srcAddress} #${event.params.tokenId}`);

    } catch (error) {
      context.log.error(`Error processing ${event.srcAddress}: ${error}`);
    }
  },
  {
    wildcard: true,
    eventFilters: { from: ZERO_ADDRESS }
  }
);