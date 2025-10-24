// scripts/test-update.ts
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const CONTRACT_ADDRESS = "0xFAA5869c1d027E48a2618440a06E90656F16Bb3F"; // Replace with your actual contract address
const SEPOLIA_RPC = process.env.SEP_RPC;
const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY; // Use a test wallet private key

const contractABI = [
  "function updateAwakeningURI(string artId, string awakeningURI) external",
  "function updateCreatorContextURI(string artId, string creatorContextURI) external", 
  "function updateJourneysURI(string artId, string journeysURI) external"
];

async function testUpdate() {
  console.log("🚀 Testing ArtMetadataUpdater contract...\n");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

  // Test data
  const artId = "1_0x4ac689D913Af521D0C37dbD52Fb8686E199968fd_1";
  const testURI = "https://journeytest.com/test-metadata.json";

  try {
    console.log(`📝 Testing update for Art: ${artId}`);
    console.log(`📡 Using contract: ${CONTRACT_ADDRESS}`);
    console.log(`👤 From address: ${wallet.address}`);
    console.log(`🌐 Network: Sepolia\n`);

    // Test awakeningURI update
    console.log("1. Testing updateAwakeningURI...");
    const tx = await contract.updateJourneysURI(artId, testURI);
    console.log(`   ✅ Transaction sent: ${tx.hash}`);
    
    console.log("   ⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`   ✅ Confirmed in block: ${receipt.blockNumber}`);
    console.log(`   🔗 Explorer: https://sepolia.etherscan.io/tx/${tx.hash}\n`);

    // Wait a moment for indexer to process
    console.log("2. Waiting for indexer to process event...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("🎉 Test completed! Check your indexer logs for:");
    console.log(`   - Art ID: ${artId}`);
    console.log(`   - Field: awakeningURI`);
    console.log(`   - Value: ${testURI}`);

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testUpdate();