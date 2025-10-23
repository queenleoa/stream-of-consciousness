// src/effects/tokenURI.ts
import { experimental_createEffect, S } from "envio";
import { createPublicClient, fallback, http } from "viem";
import { mainnet } from "viem/chains";

const rpcUrls = [
  process.env.ENVIO_RPC_URL_0,
  process.env.ENVIO_RPC_URL_1,
  process.env.ENVIO_RPC_URL_2,
  process.env.ENVIO_RPC_URL_3,
  process.env.ENVIO_RPC_URL_4,
].filter(Boolean);

const client = createPublicClient({
  chain: mainnet,
  transport: fallback(rpcUrls.map(url => http(url, {
    batch: { wait: 50 }, // Smaller batch window
    timeout: 10000,
  })))
});

/// Share the same rate limiting with contract validation
let lastTokenURICallTime = 0;
const MIN_TOKENURI_INTERVAL_MS = 100; // 100ms between tokenURI calls

const waitForTokenURIRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastTokenURICallTime;

  if (timeSinceLastCall < MIN_TOKENURI_INTERVAL_MS) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_TOKENURI_INTERVAL_MS - timeSinceLastCall)
    );
  }
  lastTokenURICallTime = Date.now();
};

export const getTokenURI = experimental_createEffect(
  {
    name: "getTokenURI",
    input: S.schema({
      contractAddress: S.string,
      tokenId: S.bigint,
      chainId: S.number,
    }),
    output: S.string,
    cache: true,
  },
  async ({ input: { contractAddress, tokenId, chainId }, context }) => {
    try {
      await waitForTokenURIRateLimit();

      context.log.debug(`Fetching tokenURI for ${contractAddress} token ${tokenId}`);

      const tokenURI = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
            name: "tokenURI",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "tokenURI",
        args: [tokenId],
      });

      const result = tokenURI as string;
      return result;

    } catch (error) {
      context.log.warn(`tokenURI failed for ${contractAddress}: ${error}`);
      return "";
    }
  }
);