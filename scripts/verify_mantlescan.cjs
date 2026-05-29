// Verify contracts on Mantlescan via Etherscan V2 unified API
// Usage: set ETHERSCAN_API_KEY=<your-key> && node scripts/verify_mantlescan.cjs
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ETHERSCAN_API_KEY;
if (!API_KEY) {
  console.error('ERROR: Set ETHERSCAN_API_KEY environment variable first.');
  console.error('  Get a free key at: https://etherscan.io/myapikey');
  console.error('  Then run: set ETHERSCAN_API_KEY=<key> && node scripts/verify_mantlescan.cjs');
  process.exit(1);
}

const API_URL = 'https://api.etherscan.io/v2/api';
const CHAIN_ID = '5003';

const contracts = [
  {
    address: '0xCf671ef7444c688c92e910D56EBEcf87b16333A9',
    name: 'SwipeAlphaCore',
    contractFile: 'contracts/SwipeAlphaCore.sol',
  },
  {
    address: '0x5ddeea646Ed2DF37345d8987099A33e60879Bed4',
    name: 'MockMerchantMoeRouter',
    contractFile: 'contracts/MockMerchantMoeRouter.sol',
  }
];

function collectSources(filePath, sources = {}) {
  const absPath = path.resolve(filePath);
  const normalized = absPath.replace(/\\/g, '/');
  
  // Determine the source key: use @openzeppelin/... for OZ files
  let key;
  const ozIndex = normalized.indexOf('node_modules/@openzeppelin/');
  if (ozIndex !== -1) {
    key = normalized.substring(ozIndex + 'node_modules/'.length);
  } else {
    key = filePath.replace(/\\/g, '/');
  }
  
  if (sources[key]) return sources;
  const content = fs.readFileSync(absPath, 'utf8');
  sources[key] = { content };
  
  const importRegex = /import\s+(?:.*\s+from\s+)?["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    let resolvedPath;
    if (importPath.startsWith('@')) {
      resolvedPath = path.join('node_modules', importPath);
    } else {
      resolvedPath = path.join(path.dirname(filePath), importPath);
    }
    collectSources(resolvedPath, sources);
  }
  return sources;
}

function post(params) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams(params).toString();
    const url = new URL(`${API_URL}?chainid=${CHAIN_ID}&apikey=${API_KEY}`);
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({ raw: body }); } });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({ raw: body }); } });
    }).on('error', reject);
  });
}

async function verify(c) {
  console.log(`\n=== Verifying: ${c.name} (${c.address}) ===`);
  const sources = collectSources(c.contractFile);
  console.log(`  Collected ${Object.keys(sources).length} source files`);

  const stdInput = JSON.stringify({
    language: 'Solidity',
    sources,
    settings: { evmVersion: 'cancun', optimizer: { enabled: true, runs: 200 }, outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
  });

  const contractPath = c.contractFile.replace(/\\/g, '/');
  const result = await post({
    chainid: CHAIN_ID,
    apikey: API_KEY,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: c.address,
    sourceCode: stdInput,
    codeformat: 'solidity-standard-json-input',
    contractname: `${contractPath}:${c.name}`,
    compilerversion: 'v0.8.35+commit.47b9dedd',
    optimizationUsed: '1',
    runs: '200',
    constructorArguements: '',
    licenseType: '3'
  });

  console.log('  Submit:', JSON.stringify(result));

  if (result.status === '1' && result.result) {
    const guid = result.result;
    console.log(`  GUID: ${guid} — checking in 15s...`);
    await new Promise(r => setTimeout(r, 15000));
    const check = await get(`${API_URL}?chainid=${CHAIN_ID}&apikey=${API_KEY}&module=contract&action=checkverifystatus&guid=${guid}`);
    console.log('  Verify status:', JSON.stringify(check));
    if (check.status === '1') {
      console.log(`  ✅ ${c.name} VERIFIED!`);
    } else {
      console.log(`  ⚠️ ${c.name} verification pending or failed`);
    }
  } else {
    console.log(`  ❌ Submit failed: ${result.result || result.message}`);
  }
}

(async () => {
  console.log(`Using Etherscan V2 API | Chain: Mantle Sepolia (${CHAIN_ID})`);
  for (const c of contracts) {
    try { await verify(c); } catch (e) { console.error(`  Error: ${e.message}`); }
  }
  console.log('\nDone! Check verification at:');
  contracts.forEach(c => console.log(`  https://sepolia.mantlescan.xyz/address/${c.address}#code`));
})();
