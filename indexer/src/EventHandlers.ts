// src/EventHandlers.ts
import { ERC721 } from "generated";
import { getTokenURI } from "./effects/tokenURI";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

ERC721.Transfer.handler(
  async ({ event, context }) => {
    // Only process mint events
    if (event.params.from !== ZERO_ADDRESS) {
      context.log.debug(`Skipping non-mint transfer from ${event.params.from} to ${event.params.to}`);
      return;
    }

    context.log.info(`Processing mint event for contract ${event.srcAddress} token ${event.params.tokenId}`);

    try {
      // Get tokenURI using Effect API
      const tokenURI = await context.effect(getTokenURI, {
        contractAddress: event.srcAddress,
        tokenId: event.params.tokenId,
      });

      context.log.info(`TokenURI result for ${event.srcAddress}: ${tokenURI ? `Found (length: ${tokenURI.length})` : 'Empty'}`);

      // Only store if tokenURI exists and is not empty
      if (tokenURI && tokenURI.length > 0) {
        context.log.info(`Storing transfer for ${event.srcAddress} token ${event.params.tokenId}`);
        
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
        });
        
        context.log.info(`Successfully stored transfer for ${event.srcAddress}`);
      } else {
        context.log.info(`Skipping ${event.srcAddress} - no tokenURI found`);
      }
      
    } catch (error) {
      context.log.error(`Error processing transfer for ${event.srcAddress}: ${error}`);
    }
  },
  { 
    wildcard: true, 
    eventFilters: { from: ZERO_ADDRESS } 
  }
);