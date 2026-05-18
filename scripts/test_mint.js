/**
 * Test script: Deploy SwipeAlphaCore and mint 1 NFT on Mantle Sepolia
 * Usage: $env:PRIVATE_KEY="your_key"; node scripts/test_mint.js
 */
import { ethers } from 'ethers';
import fs from 'fs';

const RPC_URL = 'https://rpc.sepolia.mantle.xyz';

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ Please set PRIVATE_KEY env variable.");
    console.error('PowerShell: $env:PRIVATE_KEY="0xYourKey"; node scripts/test_mint.js');
    process.exit(1);
  }

  // Load artifact
  const artifact = JSON.parse(fs.readFileSync('./src/SwipeAlphaCore.json', 'utf8'));
  console.log("✅ Loaded SwipeAlphaCore artifact");
  console.log(`   ABI has ${artifact.abi.length} entries`);
  console.log(`   Bytecode length: ${artifact.bytecode.length} chars`);

  // Connect
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  const address = await wallet.getAddress();
  const balance = await provider.getBalance(address);
  console.log(`\n✅ Connected as: ${address}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} MNT`);
  
  if (balance === 0n) {
    console.error("❌ No MNT balance! Get testnet MNT from https://faucet.sepolia.mantle.xyz");
    process.exit(1);
  }

  // Deploy
  console.log("\n📦 Deploying SwipeAlphaCore...");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const contractAddr = await contract.getAddress();
  console.log(`✅ Contract deployed at: ${contractAddr}`);
  console.log(`   Explorer: https://explorer.sepolia.mantle.xyz/address/${contractAddr}`);

  // Wait for network to settle
  console.log("\n⏳ Waiting 3 seconds for network to settle...");
  await new Promise(r => setTimeout(r, 3000));

  // Prepare token URI (simplified metadata)
  const metadata = {
    name: "Test Nansen Audit NFT",
    description: "Test mint from CLI script",
    image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzBiMGYxOSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYTViNGZjIiBmb250LXNpemU9IjI0Ij5OYW5zZW4gQXVkaXQgTkZUPC90ZXh0Pjwvc3ZnPg==",
    attributes: [
      { trait_type: "Agent Name", value: "Test Agent" },
      { trait_type: "Symbol", value: "TEST" },
      { trait_type: "Security Status", value: "Verified Secure" }
    ]
  };
  
  const metadataBase64 = Buffer.from(JSON.stringify(metadata)).toString('base64');
  const tokenURI = `data:application/json;base64,${metadataBase64}`;
  console.log(`\n📝 Token URI prepared (${tokenURI.length} chars)`);

  // Mint NFT
  console.log("\n🎨 Minting NFT...");
  try {
    const mintTx = await contract.mintNFT(address, tokenURI);
    console.log(`   TX Hash: ${mintTx.hash}`);
    console.log(`   Explorer: https://explorer.sepolia.mantle.xyz/tx/${mintTx.hash}`);
    
    const receipt = await mintTx.wait();
    console.log(`   ✅ TX confirmed in block ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

    // Parse events
    const transferEvent = receipt.logs
      .map(log => { try { return contract.interface.parseLog(log); } catch (_) { return null; } })
      .find(parsed => parsed && parsed.name === 'Transfer');

    if (transferEvent) {
      console.log(`\n🎉 NFT MINTED SUCCESSFULLY!`);
      console.log(`   Token ID: ${transferEvent.args.tokenId}`);
      console.log(`   Owner: ${transferEvent.args.to}`);
    }

    const nftEvent = receipt.logs
      .map(log => { try { return contract.interface.parseLog(log); } catch (_) { return null; } })
      .find(parsed => parsed && parsed.name === 'NFTMinted');

    if (nftEvent) {
      console.log(`   NFTMinted event confirmed!`);
    }

    // Verify ownership
    const owner = await contract.ownerOf(1);
    console.log(`\n🔍 Verification: Token #1 owner = ${owner}`);
    console.log(`   Match: ${owner.toLowerCase() === address.toLowerCase() ? '✅ YES' : '❌ NO'}`);

    // Save contract address
    console.log(`\n📋 SAVE THIS CONTRACT ADDRESS:`);
    console.log(`   ${contractAddr}`);
    console.log(`\n   To use in the frontend, run in browser console:`);
    console.log(`   localStorage.setItem('swipe_alpha_core_address', '${contractAddr}')`);
    
  } catch (err) {
    console.error("\n❌ MINT FAILED:", err.message);
    if (err.reason) console.error("   Reason:", err.reason);
    if (err.data) console.error("   Data:", err.data);
  }
}

main().catch(console.error);
