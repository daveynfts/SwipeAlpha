import fs from 'fs';
import path from 'path';
import solc from 'solc';

function findImports(importPath) {
  if (importPath.startsWith('@openzeppelin/')) {
    const filePath = path.resolve('./node_modules', importPath);
    if (fs.existsSync(filePath)) {
      return { contents: fs.readFileSync(filePath, 'utf8') };
    }
  }
  return { error: 'File not found' };
}

const contractPath = './contracts/SwipeAlphaNFT.sol';
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'SwipeAlphaNFT.sol': {
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

console.log("Compiling SwipeAlphaNFT.sol...");
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

const contractObj = output.contracts['SwipeAlphaNFT.sol']['SwipeAlphaNFT'];
const artifact = {
  abi: contractObj.abi,
  bytecode: contractObj.evm.bytecode.object
};

const artifactPath = './src/SwipeAlphaNFT.json';
fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
console.log(`✅ Compiled successfully! Saved artifact to ${artifactPath}`);
