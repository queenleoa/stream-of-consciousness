import { ERC721 } from "generated";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

ERC721.Transfer.handler(
  async ( { event, context } ) => {
    context.Transfer.set({
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      chainId: event.chainId,
      blockNumber: BigInt(event.block.number),
      logIndex: event.logIndex,
      txId: event.transaction.hash,   
      contract: event.srcAddress,   // <- use srcAddress, not address

      tokenId: event.params.tokenId,
      from: event.params.from,
      to: event.params.to,
    });
  },
  { wildcard: true, eventFilters: { from: ZERO_ADDRESS } }
);
