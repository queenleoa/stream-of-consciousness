// src/EventHandlers.ts
import { ERC721 } from "generated";
import { getTokenURI } from "./effects/tokenURI";
import { fetchNFTMetadata } from "./effects/metadata";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const TEST_CONTRACT = "0x4ac689D913Af521D0C37dbD52Fb8686E199968fd".toLowerCase();

ERC721.Transfer.handler(
  async ({ event, context }) => {
    const isTestContract = event.srcAddress.toLowerCase() === TEST_CONTRACT;

    // Only process mint events
    if (event.params.from !== ZERO_ADDRESS) {
      if (isTestContract) {
        context.log.info(`🎯 [TEST CONTRACT] Skipping non-mint transfer from ${event.params.from} to ${event.params.to}`);
      }
      return;
    }

    if (isTestContract) {
      context.log.info(`🎯 [TEST CONTRACT] Processing mint event for contract ${event.srcAddress} token ${event.params.tokenId}`);
    } else {
      //context.log.debug(`Processing mint event for contract ${event.srcAddress} token ${event.params.tokenId}`);
    }

    try {
      // Get tokenURI using Effect API
      const tokenURI = await context.effect(getTokenURI, {
        contractAddress: event.srcAddress,
        tokenId: event.params.tokenId,
      });

      if (isTestContract) {
        context.log.info(`🎯 [TEST CONTRACT] TokenURI result: ${tokenURI ? `FOUND - "${tokenURI}"` : 'EMPTY'}`);
      } else {
        //context.log.debug(`TokenURI result for ${event.srcAddress}: ${tokenURI ? `Found (length: ${tokenURI.length})` : 'Empty'}`);
      }

      // Only store if tokenURI exists and is not empty
      if (tokenURI && tokenURI.length > 0) {
        if (isTestContract) {
          context.log.info(`🎯 [TEST CONTRACT] STORING transfer for ${event.srcAddress} token ${event.params.tokenId}`);
        }

        // Fetch and parse metadata
        const metadata = await context.effect(fetchNFTMetadata, tokenURI);

        if (isTestContract) {
          context.log.info(`🎯 [TEST CONTRACT] Metadata fetched:`, {
            name: metadata.name,
            hasImage: !!metadata.image_url,
            attributesCount: metadata.attributes?.length || 0
          });
        }

        context.Transfer.set({
          id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
          chainId: event.chainId,
          blockNumber: BigInt(event.block.number),
          logIndex: event.logIndex,
          txHash: event.transaction.hash,
          contract: event.srcAddress,
          tokenId: event.params.tokenId,
          from: event.params.from,
          to: event.params.to,
          tokenURI: tokenURI,
          // Metadata fields
          name: metadata.name || undefined,
          description: metadata.description || undefined,
          image_url: metadata.image_url || undefined,
          animation_url: metadata.animation_url || undefined,
          external_url: metadata.external_url || undefined,
          attributes: metadata.attributes ? JSON.stringify(metadata.attributes) : undefined,
        });

        if (isTestContract) {
          context.log.info(`🎯 [TEST CONTRACT] SUCCESSFULLY stored transfer!`);
        }
      } else {
        if (isTestContract) {
          context.log.info(`🎯 [TEST CONTRACT] SKIPPING - no tokenURI found`);
        }
      }

    } catch (error) {
      //context.log.error(`Error processing transfer for ${event.srcAddress}: ${error}`);
    }
  },
  {
    wildcard: true,
    eventFilters: { from: ZERO_ADDRESS }
  }
);

