import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';

// Helper to resolve OpenZeppelin imports
function findImports(importPath) {
  if (importPath.startsWith('@openzeppelin/')) {
    const filePath = path.resolve('./node_modules', importPath);
    if (fs.existsSync(filePath)) {
      return { contents: fs.readFileSync(filePath, 'utf8') };
    }
  }
  return { error: 'File not found' };
}

async function main() {
  console.log("Compiling SwipeAlphaCore.sol...");
  const contractPath = './contracts/SwipeAlphaCore.sol';
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'SwipeAlphaCore.sol': {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    let hasErrors = false;
    output.errors.forEach(err => {
      console.error(err.formattedMessage);
      if (err.severity === 'error') hasErrors = true;
    });
    if (hasErrors) {
      process.exit(1);
    }
  }

  const contractObj = output.contracts['SwipeAlphaCore.sol']['SwipeAlphaCore'];
  const abi = contractObj.abi;
  const bytecode = contractObj.evm.bytecode.object;

  console.log("✅ Compiled successfully!");

  // Save Artifacts to src
  const artifactPath = './src/SwipeAlphaCore.json';
  fs.writeFileSync(artifactPath, JSON.stringify({ abi, bytecode }, null, 2));
  console.log(`✅ Saved artifact to ${artifactPath}`);

  // Use the standard Sepolia RPC if no provider is set.
  // Warning: in production, one should use private keys from env variables.
  // We'll prompt the user if they don't have a private key in the environment.
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ ERROR: Please set PRIVATE_KEY environment variable to deploy.");
    console.error("Example: $env:PRIVATE_KEY=\"your_wallet_private_key\"; node scripts/deploy_core.js");
    process.exit(1);
  }

  console.log("Connecting to Mantle Sepolia...");
  const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`Deploying from account: ${wallet.address}`);
  
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log("Sending deployment transaction...");
  const contract = await factory.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log(`\n🎉 SwipeAlphaCore Deployed!`);
  console.log(`Contract Address: ${address}`);
  console.log(`Transaction Hash: ${contract.deploymentTransaction().hash}\n`);

  console.log("Registering initial AI Agents...");
  const tx1 = await contract.registerAgent("DeFi Alpha Pro", "ipfs://QmdPro");
  await tx1.wait();
  console.log("✅ Registered Agent 1: DeFi Alpha Pro");

  const tx2 = await contract.registerAgent("Meme Master", "ipfs://QmMeme");
  await tx2.wait();
  console.log("✅ Registered Agent 2: Meme Master");

  const tx3 = await contract.registerAgent("Stable Yield Optimizer", "ipfs://QmYield");
  await tx3.wait();
  console.log("✅ Registered Agent 3: Stable Yield Optimizer");

  // Auto update SwipeAlpha.jsx
  const frontendPath = './src/SwipeAlpha.jsx';
  if (fs.existsSync(frontendPath)) {
    let content = fs.readFileSync(frontendPath, 'utf8');
    // Replace old registry address
    content = content.replace(/const REGISTRY_CONTRACT_ADDRESS = "0x[a-fA-F0-9]{40}";/, `const REGISTRY_CONTRACT_ADDRESS = "${address}";`);
    fs.writeFileSync(frontendPath, content);
    console.log(`✅ Auto-updated REGISTRY_CONTRACT_ADDRESS in src/SwipeAlpha.jsx`);
  }

  console.log("Done!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
