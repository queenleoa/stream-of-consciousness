import { ERC721 } from "generated";

const ZERO = "0x0000000000000000000000000000000000000000";
const GATE = process.env.ERC721_GATE !== "off"; // flip to "off" to bypass

// stub: always returns true until we wire a working Effect call
async function isErc721Contract(): Promise<boolean> {
  return true;
}

ERC721.Transfer.handler(
  async ({ event, context }) => {
    if (event.params.from.toLowerCase() !== ZERO) return;

    const pass = GATE ? await isErc721Contract() : true;
    if (!pass) return;

    context.Transfer.set({
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      chainId: event.chainId,
      blockNumber: BigInt(event.block.number),
      logIndex: event.logIndex,
      txHash: event.transaction.hash,      // keep since you added field_selection
      contract: event.srcAddress.toLowerCase(),
      tokenId: event.params.tokenId,
      from: event.params.from.toLowerCase(),
      to: event.params.to.toLowerCase(),
    });
  },
  { wildcard: true, eventFilters: { from: ZERO } }
);
