// src/effects/tokenURI.ts
import { experimental_createEffect, S } from "envio";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

// Use environment variable with fallback
const rpcUrl = process.env.RPC_URL_1 || process.env.RPC_URL;

if (!rpcUrl) {
  throw new Error("RPC_URL_1 or RPC_URL environment variable is required");
}

const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl, { 
    batch: true,
    timeout: 10000 // 10 second timeout
  }),
});

// Known test contract
const TEST_CONTRACT = "0x4ac689D913Af521D0C37dbD52Fb8686E199968fd".toLowerCase();

export const getTokenURI = experimental_createEffect(
  {
    name: "getTokenURI",
    input: S.schema({
      contractAddress: S.string,
      tokenId: S.bigint,
    }),
    output: S.string,
    cache: true,
  },
  async ({ input: { contractAddress, tokenId }, context }) => {
    const isTestContract = contractAddress.toLowerCase() === TEST_CONTRACT;
    
    try {
      if (isTestContract) {
        context.log.info(`🎯 [TEST CONTRACT] Fetching tokenURI for ${contractAddress} token ${tokenId}`);
      } else {
        context.log.debug(`Fetching tokenURI for ${contractAddress} token ${tokenId}`);
      }
      
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
      
      if (isTestContract) {
        context.log.info(`🎯 [TEST CONTRACT] SUCCESS - tokenURI: ${result}`);
      } else {
        context.log.debug(`Successfully got tokenURI: ${result.substring(0, 50)}...`);
      }
      return result;
      
    } catch (error) {
      if (isTestContract) {
        context.log.error(`🎯 [TEST CONTRACT] FAILED for ${contractAddress} token ${tokenId}: ${error}`);
      } else {
        context.log.warn(`Failed to get tokenURI for ${contractAddress} token ${tokenId}: ${error}`);
      }
      return "";
    }
  }
);