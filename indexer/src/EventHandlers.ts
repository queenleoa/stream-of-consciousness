// src/EventHandlers.ts
import { ERC721 } from "generated";
import { getTokenURI } from "./effects/tokenURI";
import { fetchNFTMetadata } from "./effects/metadata";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAX_TOKEN_ID = 10001n; // Only index tokens up to 10,001

ERC721.Transfer.handler(
  async ({ event, context }) => {    

    // FILTER: TokenID range check (NO RPC CALL)
    if (event.params.tokenId > MAX_TOKEN_ID) {
      context.log.debug(`Skipping high tokenId: ${event.params.tokenId}`);
      return;
    }

    try {

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
        name: metadata.name,
        image_url: metadata.image_url,
        animation_url: metadata.animation_url,
        external_url: metadata.external_url,
        creatorContextURI: undefined,
        awakeningURI: undefined,
        journeysURI: undefined,
      });

      context.log.info(`✅ Art indexed: ${event.srcAddress} #${event.params.tokenId}`);

    } catch (error) {
      context.log.error(`Could not process ${event.srcAddress}: ${error}`);
    }
  },
  {
    wildcard: true,
    eventFilters: { from: ZERO_ADDRESS }
    // Only process mint events
  }
);

