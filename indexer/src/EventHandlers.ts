import { ERC721 } from "generated";

const ZERO = "0x0000000000000000000000000000000000000000";

// ERC-165 / ERC-721
const IFACE_ERC721 = "80ac58cd";  // bytes4, no 0x
const FN_SUPPORTS  = "01ffc9a7";  // supportsInterface(bytes4)
const FN_TOKEN_URI = "c87b56dd";  // tokenURI(uint256)

// Env toggles (no code edits needed to switch behavior)
const GATE_ON   = (process.env.ERC721_GATE ?? "on").toLowerCase() !== "off";
const FAIL_OPEN = (process.env.ERC721_FAIL_OPEN ?? "off").toLowerCase() === "on";
const DEBUG     = (process.env.ERC721_DEBUG ?? "off").toLowerCase() === "on";

// ---------- tiny utils ----------
function encodeBytes4RightPadded(b4No0x: string): string {
  const clean = b4No0x.toLowerCase();
  if (clean.length !== 8) throw new Error("bytes4 must be 8 hex chars");
  return clean + "0".repeat(64 - 8); // right-pad
}
function encodeUint256LeftPadded(n: bigint): string {
  return n.toString(16).padStart(64, "0");
}
function truthyWord(retHex: string): boolean {
  const clean = retHex.replace(/^0x/, "");
  if (clean.length < 64) return false;
  const word = clean.slice(-64);
  return BigInt("0x" + word) !== 0n;
}
async function ethCallLatest(context: any, to: string, dataNo0x: string): Promise<string> {
  if (!context?.Effect?.request) throw new Error("Effect.request unavailable");
  const res = await context.Effect.request({
    method: "eth_call",
    params: [{ to, data: "0x" + dataNo0x }, "latest"], // <-- use latest to avoid historical-state issues
  });
  return String(res ?? "0x");
}

// ---------- classification cache ----------
const seen: Record<string, boolean> = {};

async function classifyErc721(event: any, context: any): Promise<boolean> {
  const addr = event.srcAddress.toLowerCase();
  const key  = `${event.chainId}_${addr}`;

  if (key in seen) return seen[key];

  const existing = await context.Contract.get(key);
  if (existing) {
    seen[key] = !!existing.isErc721;
    return seen[key];
  }

  let is721 = false;

  // Probe A: ERC-165 supportsInterface(0x80ac58cd)
  try {
    const arg = encodeBytes4RightPadded(IFACE_ERC721);
    const data = FN_SUPPORTS + arg;
    const ret  = await ethCallLatest(context, addr, data);
    is721 = truthyWord(ret);
    if (DEBUG) context.log(`supportsInterface ${addr} -> ${is721} ret=${ret}`);
  } catch (e) {
    if (DEBUG) context.log(`supportsInterface error @ ${addr}: ${(e as Error).message}`);
    if (FAIL_OPEN) is721 = true;
  }

  // Probe B: tokenURI(tokenId) (fallback)
  if (!is721) {
    try {
      const tid  = BigInt(event.params.tokenId.toString());
      const arg  = encodeUint256LeftPadded(tid);
      const data = FN_TOKEN_URI + arg;
      await ethCallLatest(context, addr, data); // if it doesn't revert, treat as 721
      is721 = true;
      if (DEBUG) context.log(`tokenURI OK @ ${addr} tokenId=${tid}`);
    } catch (e) {
      if (DEBUG) context.log(`tokenURI fail @ ${addr}: ${(e as Error).message}`);
      if (FAIL_OPEN && !is721) is721 = true;
    }
  }

  context.Contract.set({
    id: key,
    chainId: event.chainId,
    address: addr,
    isErc721: is721,
    checkedAtBlock: BigInt(event.block.number),
  });
  seen[key] = is721;

  return is721;
}

// ---------- main handler ----------
ERC721.Transfer.handler(
  async ({ event, context }) => {
    // Only mints (cheap re-check)
    if (event.params.from.toLowerCase() !== ZERO) return;

    // Gate (can be bypassed with ERC721_GATE=off)
    if (GATE_ON) {
      const pass = await classifyErc721(event, context);
      if (!pass) return;
    }

    context.Transfer.set({
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      chainId: event.chainId,
      blockNumber: BigInt(event.block.number),
      logIndex: event.logIndex,
      txHash: event.transaction.hash,              // requires field_selection.transaction_fields: [hash]
      contract: event.srcAddress.toLowerCase(),
      tokenId: event.params.tokenId,
      from: event.params.from.toLowerCase(),
      to: event.params.to.toLowerCase(),
    });
  },
  { wildcard: true, eventFilters: { from: ZERO } }
);
