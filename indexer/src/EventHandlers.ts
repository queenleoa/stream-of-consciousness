// src/EventHandlers.ts
import { ERC721 } from "generated";
import { getTokenURI } from "./effects/tokenURI";
import { fetchNFTMetadata } from "./effects/metadata";
import { ArtMetadataUpdater } from "generated"; //this is for uri updates

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAX_TOKEN_ID = 101n; // Only index tokens up to 10,001

const globalStateId = "global-state";

ERC721.Transfer.handler(
  async ({ event, context }) => {

    // FILTER: TokenID range check (NO RPC CALL)
    if (event.params.tokenId > MAX_TOKEN_ID) {
      context.log.debug(`Skipping high tokenId: ${event.params.tokenId}`);
      return;
    }

    let globalState = await context.GlobalState.get(globalStateId);
    
    if (!globalState) {
      // Initialize global state on first run
      globalState = { id: globalStateId, count: 0 };
      context.log.info("Initializing global state with count: 0");
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

      const incrementedTokenId = globalState.count + 1;

      context.GlobalState.set({
        ...globalState,
        count: incrementedTokenId,
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


// code section to bypass off chain data update restrictions 

ArtMetadataUpdater.CreatorContextUpdated.handler(async ({ event, context }) => {
  const { artId, creatorContextURI } = event.params;
  
});

ArtMetadataUpdater.AwakeningURIUpdated.handler(async ({ event, context }) => {
        context.log.debug(`checkpoint1`);

    const artId = event.params.artId;
    const awakeningURI = event.params.awakeningURI;

    // Create Art entity
      context.Art.set({
        id: '123',
        chainId: 1,
        contract: '111',
        tokenId: BigInt(1),
        minter: artId,
        blockNumber: BigInt(1),
        txHash: '123',
        tokenURI: '12',
        name: undefined,
        image_url: undefined,
        animation_url: undefined,
        external_url: undefined,
        creatorContextURI: undefined,
        awakeningURI: awakeningURI,
        journeysURI: undefined,
      });

      context.log.debug(`checkpoint2 ${artId} and uri ${awakeningURI}`);
});

ArtMetadataUpdater.JourneysURIUpdated.handler(async ({ event, context }) => {
  const { artId, journeysURI } = event.params;
  
});







