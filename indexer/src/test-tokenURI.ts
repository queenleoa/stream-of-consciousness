// src/test-tokenURI.js
const { createPublicClient, http } = require("viem");
const { mainnet } = require("viem/chains");
require('dotenv').config();

async function testTokenURI() {
  const rpcUrl = process.env.RPC_URL || process.env.RPC_URL_1;
  
  console.log('Available environment variables:');
  console.log('RPC_URL_1:', process.env.RPC_URL_1 ? '✓ Set' : '✗ Not set');
  console.log('RPC_URL:', process.env.RPC_URL ? '✓ Set' : '✗ Not set');
  
  if (!rpcUrl) {
    console.error("❌ No RPC URL found. Please check your .env file");
    console.log("Current working directory:", process.cwd());
    console.log(".env file location should be:", process.cwd() + '/.env');
    return;
  }

  console.log(`✅ Using RPC URL: ${rpcUrl.substring(0, 50)}...`);

  const client = createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl),
  });

  const testContract = "0x4ac689D913Af521D0C37dbD52Fb8686E199968fd";
  
  try {
    console.log("🧪 Testing RPC connection...");
    const blockNumber = await client.getBlockNumber();
    console.log(`✅ RPC connected. Current block: ${blockNumber}`);
    
    console.log("🧪 Testing tokenURI for tokenId 1...");
    const tokenURI = await client.readContract({
      address: testContract,
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
      args: [1n],
    });

    console.log(`✅ tokenURI result: ${tokenURI}`);
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testTokenURI();
}