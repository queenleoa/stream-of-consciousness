// src/effects/contractValidation.ts
import { experimental_createEffect, S } from "envio";
import { createPublicClient, http, fallback } from "viem";
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

// In-memory cache for contract validation (survives preload phase)
const contractCache = new Map<string, boolean>();

// Rate limiting
let lastCallTime = 0;
const MIN_INTERVAL_MS = 50; // Even faster for validation calls

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < MIN_INTERVAL_MS) {
    await new Promise(resolve => 
      setTimeout(resolve, MIN_INTERVAL_MS - timeSinceLastCall)
    );
  }
  lastCallTime = Date.now();
};

export const isERC721Contract = experimental_createEffect(
  {
    name: "isERC721Contract",
    input: S.schema({
      contractAddress: S.string,
      tokenId: S.bigint, // For logging context
    }),
    output: S.boolean,
    cache: true,
  },
  async ({ input: { contractAddress, tokenId }, context }) => {
    // Check memory cache first (works across preload phases)
    const cacheKey = contractAddress.toLowerCase();
    if (contractCache.has(cacheKey)) {
      return contractCache.get(cacheKey)!;
    }

    try {
      await waitForRateLimit();
      
      context.log.debug(`Validating ERC721: ${contractAddress} token ${tokenId}`);
      
      const supportsInterface = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
            name: "supportsInterface",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "supportsInterface",
        args: ["0x80ac58cd"], // ERC721 interface
      });

      const result = supportsInterface as boolean;
      
      // Update memory cache
      contractCache.set(cacheKey, result);
      
      if (!result) {
        context.log.debug(`Not ERC721: ${contractAddress}`);
      }
      
      return result;
      
    } catch (error) {
      context.log.debug(`Validation failed for ${contractAddress}: ${error}`);
      contractCache.set(cacheKey, false); // Cache failures as non-ERC721
      return false;
    }
  }
);