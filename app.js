// === Mock Token Data ===
const TOKENS = [
  {
    name:"Aave",symbol:"AAVE",chain:"Ethereum",chainIcon:"⟠",
    price:"$308.42",priceChange:"+12.4%",positive:true,
    mcap:"$4.69B",volume:"$8.85M",liquidity:"$153M",
    smNetflow:"+$2.1M",smTraders:45,smSignal:"accumulating",
    aiSummary:"Smart Money quỹ lớn đang tích lũy mạnh. 45 traders đã mua ròng $2.1M trong 24h. Volume mua gấp đôi bán — tín hiệu bullish.",
    signal:"STRONG BUY",signalClass:"strong-buy",confidence:85,
    age:"4.5 years",holders:"165,299",
    iconBg:"linear-gradient(135deg,#2775ca,#1a5fb4)",iconLetter:"A",
    risk:"LOW"
  },
  {
    name:"Jupiter",symbol:"JUP",chain:"Solana",chainIcon:"◎",
    price:"$1.24",priceChange:"+8.7%",positive:true,
    mcap:"$1.68B",volume:"$42M",liquidity:"$28M",
    smNetflow:"+$890K",smTraders:32,smSignal:"accumulating",
    aiSummary:"DEX king trên Solana. Smart Money Funds đang tăng vị thế. Volume giao dịch tăng 40% so với tuần trước. Ecosystem play mạnh.",
    signal:"BUY",signalClass:"buy",confidence:72,
    age:"1.5 years",holders:"89,432",
    iconBg:"linear-gradient(135deg,#9945FF,#14F195)",iconLetter:"J",
    risk:"MEDIUM"
  },
  {
    name:"Pendle",symbol:"PENDLE",chain:"Ethereum",chainIcon:"⟠",
    price:"$4.18",priceChange:"+22.1%",positive:true,
    mcap:"$680M",volume:"$18M",liquidity:"$12M",
    smNetflow:"+$1.5M",smTraders:28,smSignal:"accumulating",
    aiSummary:"Yield protocol hàng đầu DeFi. Smart Money đang mua mạnh trước mùa yields. TVL tăng 35% trong 7 ngày qua.",
    signal:"STRONG BUY",signalClass:"strong-buy",confidence:81,
    age:"2 years",holders:"42,103",
    iconBg:"linear-gradient(135deg,#627eea,#3b5998)",iconLetter:"P",
    risk:"MEDIUM"
  },
  {
    name:"Virtual Protocol",symbol:"VIRTUAL",chain:"Base",chainIcon:"🔵",
    price:"$2.87",priceChange:"-3.2%",positive:false,
    mcap:"$2.8B",volume:"$95M",liquidity:"$8.5M",
    smNetflow:"-$320K",smTraders:12,smSignal:"distributing",
    aiSummary:"AI agent token hot nhưng Smart Money đang bán ròng. Volume cao nhưng chủ yếu retail. Cẩn thận — có thể sideways ngắn hạn.",
    signal:"CAUTION",signalClass:"caution",confidence:45,
    age:"8 months",holders:"31,209",
    iconBg:"linear-gradient(135deg,#0052ff,#3380ff)",iconLetter:"V",
    risk:"HIGH"
  },
  {
    name:"Ethena",symbol:"ENA",chain:"Ethereum",chainIcon:"⟠",
    price:"$0.58",priceChange:"+5.3%",positive:true,
    mcap:"$1.7B",volume:"$32M",liquidity:"$45M",
    smNetflow:"+$640K",smTraders:18,smSignal:"accumulating",
    aiSummary:"Synthetic dollar protocol đang có traction mạnh. Funds bắt đầu vào vị thế. TVL tăng trưởng ổn định — tín hiệu tích cực.",
    signal:"BUY",signalClass:"buy",confidence:68,
    age:"1 year",holders:"67,891",
    iconBg:"linear-gradient(135deg,#1a1a2e,#6366f1)",iconLetter:"E",
    risk:"MEDIUM"
  }
];

let currentCardIndex = 0;
let startX = 0, currentX = 0, isDragging = false;

// === Web3 Contract Configuration ===
const REGISTRY_CONTRACT_ADDRESS = "0x2dEE66b5638f2a92E6bBb3ceB45047e67DFfCAE7";
const REGISTRY_CONTRACT_ABI = [
  "function submitReputation(uint256 _agentId, uint8 _score, string memory _comment) public",
  "function registerAgent(string memory _name, string memory _metadataURI) public returns (uint256)",
  "function getAgent(uint256 _agentId) public view returns (string memory name, string memory metadataURI, uint256 avgRating, uint32 ratingCount, bool active)"
];
let userAddress = null;
let currentRatingAgentIndex = 0;

async function getRegistryContractSigner() {
  if (!window.ethereum) {
    throw new Error("No crypto wallet found. Please install MetaMask.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (network.chainId !== 5003n) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x138b" }] // 5003 in hex is 0x138b
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x138b",
            chainName: "Mantle Sepolia Testnet",
            nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
            rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
            blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz"]
          }]
        });
      } else {
        throw switchError;
      }
    }
  }
  const signer = await provider.getSigner();
  return new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, REGISTRY_CONTRACT_ABI, signer);
}

// === Screen Navigation ===
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// === Time ===
function updateTime() {
  const now = new Date();
  document.getElementById('statusTime').textContent =
    now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
}
updateTime(); setInterval(updateTime, 30000);

// === Connect Wallet ===
async function connectWallet(type) {
  if (type === 'phantom') {
    // Solana/Phantom simulation for compatibility
    showScreen('loadingScreen');
    simulateLoading();
    return;
  }
  
  if (window.ethereum) {
    try {
      showScreen('loadingScreen');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      
      // Update UI elements showing wallet address
      const addrs = document.querySelectorAll('.wallet-addr');
      addrs.forEach(el => {
        el.textContent = `${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
      });
      
      simulateLoading();
    } catch (e) {
      console.error(e);
      showScreen('connectScreen');
      alert("Failed to connect wallet: " + e.message);
    }
  } else {
    alert("MetaMask (or compatible EVM wallet) not found. Running SwipeAlpha in simulation mode.");
    showScreen('loadingScreen');
    simulateLoading();
  }
}

function simulateLoading() {
  const steps = ['step1','step2','step3'];
  const texts = ['Fetching token signals from Nansen...','Analyzing Smart Money flows...','AI generating insights...'];
  let i = 0;
  
  const interval = setInterval(() => {
    if (i > 0) document.getElementById(steps[i-1]).classList.replace('active','done');
    if (i < steps.length) {
      document.getElementById(steps[i]).classList.add('active');
      document.getElementById('loadingText').textContent = texts[i];
    }
    i++;
    if (i > steps.length) {
      clearInterval(interval);
      setTimeout(() => {
        showScreen('swipeScreen');
        renderCards();
      }, 500);
    }
  }, 900);
}

// === Render Cards ===
function renderCards() {
  const stack = document.getElementById('cardStack');
  stack.innerHTML = '';
  
  const remaining = TOKENS.slice(currentCardIndex);
  const toRender = remaining.slice(0, 3).reverse();
  
  toRender.forEach((token, i) => {
    const realIndex = toRender.length - 1 - i;
    const card = document.createElement('div');
    card.className = 'token-card';
    card.style.zIndex = realIndex + 1;
    card.style.transform = `scale(${1 - realIndex * 0.03}) translateY(${realIndex * 8}px)`;
    
    const confColor = token.confidence > 70 ? '#22c55e' : token.confidence > 50 ? '#eab308' : '#ef4444';
    
    card.innerHTML = `
      <div class="card-overlay skip-overlay">SKIP</div>
      <div class="card-overlay buy-overlay">BUY</div>
      <div class="card-top">
        <div class="card-token">
          <div class="card-token-icon" style="background:${token.iconBg}">${token.iconLetter}</div>
          <div>
            <div class="card-token-name">${token.name}</div>
            <div class="card-token-chain">${token.chainIcon} ${token.chain} · $${token.symbol}</div>
          </div>
        </div>
        <div class="card-price-change ${token.positive?'positive':'negative'}">${token.priceChange}</div>
      </div>
      <div class="card-price">
        <div class="card-price-value">${token.price}</div>
        <div class="card-price-label">Current Price</div>
      </div>
      <div class="card-metrics">
        <div class="metric"><div class="metric-value">${token.mcap}</div><div class="metric-label">MCap</div></div>
        <div class="metric"><div class="metric-value">${token.volume}</div><div class="metric-label">Vol 24h</div></div>
        <div class="metric"><div class="metric-value">${token.liquidity}</div><div class="metric-label">Liquidity</div></div>
      </div>
      <div class="card-smart-money">
        <div class="sm-header"><span class="sm-tag">🔍 Smart Money Signal</span></div>
        <div class="sm-row">
          <span class="sm-label">Net Flow 24h</span>
          <span class="sm-value ${token.smNetflow.startsWith('+')?'positive':'negative'}">${token.smNetflow}</span>
        </div>
        <div class="sm-row" style="margin-top:6px">
          <span class="sm-label">SM Traders Active</span>
          <span class="sm-value">${token.smTraders} wallets</span>
        </div>
      </div>
      <div class="card-ai">
        <div class="ai-header"><span class="ai-tag">🤖 AI Analysis</span></div>
        <div class="ai-summary">${token.aiSummary}</div>
        <div class="ai-signal">
          <span class="signal-badge ${token.signalClass}">${token.signal}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;color:rgba(255,255,255,0.3)">${token.confidence}%</span>
            <div class="confidence-bar"><div class="confidence-fill" style="width:${token.confidence}%;background:${confColor}"></div></div>
          </div>
        </div>
      </div>
      <div class="card-bottom">
        <span class="card-age">🕐 ${token.age}</span>
        <span class="card-holders">👥 ${token.holders} holders</span>
      </div>
    `;
    
    if (realIndex === 0) setupDrag(card);
    stack.appendChild(card);
  });
  
  if (remaining.length === 0) {
    stack.innerHTML = `<div style="text-align:center;color:rgba(255,255,255,0.4)">
      <div style="font-size:48px;margin-bottom:16px">🎉</div>
      <div style="font-size:18px;font-weight:600;margin-bottom:8px">All caught up!</div>
      <div style="font-size:13px">New tokens will appear as Smart Money moves</div>
    </div>`;
  }
}

// === Drag / Swipe ===
function setupDrag(card) {
  const onStart = (e) => {
    isDragging = true;
    startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    card.style.transition = 'none';
  };
  
  const onMove = (e) => {
    if (!isDragging) return;
    currentX = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - startX;
    const rotation = currentX * 0.08;
    card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
    
    const skipOverlay = card.querySelector('.skip-overlay');
    const buyOverlay = card.querySelector('.buy-overlay');
    skipOverlay.style.opacity = currentX < -40 ? Math.min(1, (-currentX - 40) / 60) : 0;
    buyOverlay.style.opacity = currentX > 40 ? Math.min(1, (currentX - 40) / 60) : 0;
  };
  
  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    card.style.transition = 'transform 0.3s ease';
    
    if (currentX > 100) { swipeCard('right'); }
    else if (currentX < -100) { swipeCard('left'); }
    else {
      card.style.transform = 'translateX(0) rotate(0)';
      card.querySelector('.skip-overlay').style.opacity = 0;
      card.querySelector('.buy-overlay').style.opacity = 0;
    }
    currentX = 0;
  };
  
  card.addEventListener('mousedown', onStart);
  card.addEventListener('touchstart', onStart, {passive:true});
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, {passive:true});
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}

// === Swipe Actions ===
function swipeCard(direction) {
  const stack = document.getElementById('cardStack');
  const topCard = stack.querySelector('.token-card:last-child');
  if (!topCard) return;
  
  topCard.classList.add(direction === 'right' ? 'swipe-right' : 'swipe-left');
  
  if (direction === 'right') {
    const token = TOKENS[currentCardIndex];
    setTimeout(() => {
      document.getElementById('buyTokenName').textContent = `Buying $${token.symbol}`;
      document.getElementById('buyEstReceived').textContent = `~${(10 / parseFloat(token.price.replace('$',''))).toFixed(2)} ${token.symbol}`;
      showScreen('buyScreen');
    }, 300);
  }
  
  setTimeout(() => {
    currentCardIndex++;
    if (direction === 'left') renderCards();
  }, 400);
}

// === Token Detail ===
function showTokenDetail() {
  if (currentCardIndex >= TOKENS.length) return;
  const t = TOKENS[currentCardIndex];
  document.getElementById('detailTokenSymbol').textContent = `$${t.symbol}`;
  document.getElementById('detailBody').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
      <div class="card-token-icon" style="background:${t.iconBg};width:56px;height:56px;border-radius:16px;font-size:24px;display:flex;align-items:center;justify-content:center;font-weight:700">${t.iconLetter}</div>
      <div>
        <div style="font-size:22px;font-weight:700">${t.name}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.4)">${t.chainIcon} ${t.chain}</div>
      </div>
      <div style="margin-left:auto" class="card-price-change ${t.positive?'positive':'negative'}">${t.priceChange}</div>
    </div>
    <div style="padding:16px 0;text-align:center;border-bottom:1px solid rgba(255,255,255,0.04)">
      <div style="font-size:36px;font-weight:700;font-family:'JetBrains Mono',monospace">${t.price}</div>
    </div>
    <div class="detail-section" style="margin-top:20px">
      <div class="detail-section-title">Market Data</div>
      <div class="detail-stat-grid">
        <div class="detail-stat"><div class="detail-stat-label">Market Cap</div><div class="detail-stat-value">${t.mcap}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Volume 24h</div><div class="detail-stat-value">${t.volume}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Liquidity</div><div class="detail-stat-value">${t.liquidity}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Holders</div><div class="detail-stat-value">${t.holders}</div></div>
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">Smart Money</div>
      <div class="detail-stat-grid">
        <div class="detail-stat"><div class="detail-stat-label">Net Flow 24h</div><div class="detail-stat-value" style="color:${t.smNetflow.startsWith('+')?'#22c55e':'#ef4444'}">${t.smNetflow}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">SM Traders</div><div class="detail-stat-value">${t.smTraders} wallets</div></div>
        <div class="detail-stat"><div class="detail-stat-label">SM Trend</div><div class="detail-stat-value" style="text-transform:capitalize">${t.smSignal}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Risk Level</div><div class="detail-stat-value">${t.risk}</div></div>
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">AI Analysis</div>
      <div style="background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.1);border-radius:14px;padding:16px">
        <div style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);margin-bottom:12px">${t.aiSummary}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="signal-badge ${t.signalClass}">${t.signal}</span>
          <span style="font-size:13px;color:rgba(255,255,255,0.4)">Confidence: ${t.confidence}%</span>
        </div>
      </div>
    </div>
    <button class="btn-primary" style="margin-top:8px" onclick="showScreen('swipeScreen')">Back to Swiping</button>
  `;
  showScreen('detailScreen');
}

// === Filter Chips ===
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

// === Toggle ===
document.querySelectorAll('.toggle').forEach(t => {
  t.addEventListener('click', () => t.classList.toggle('active'));
});

// === Amount Options ===
document.querySelectorAll('.amount-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.amount-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    document.querySelector('.buy-amount').textContent = opt.textContent;
  });
});

// === Agent Data ===
const AGENTS = [
  {
    name:"DeFi Alpha Pro",emoji:"🧠",bg:"linear-gradient(135deg,#6366f1,#a855f7)",
    strategy:"DeFi · Blue Chip Focus",winRate:72,trades:340,rating:4.8,renters:89,
    price:"5 MNT",period:"/week",
    description:"Specializes in identifying undervalued DeFi blue-chips using Nansen Smart Money data. Focuses on protocols with strong fundamentals, growing TVL, and active smart money accumulation.",
    recentPicks:["AAVE (+24%)","PENDLE (+18%)","ENA (+12%)","MKR (+8%)"],
    creator:"0x8a2e...4f3b",createdAt:"3 months ago",
    riskLevel:"Medium",avgReturn:"+15.2%"
  },
  {
    name:"Meme Hunter",emoji:"🔥",bg:"linear-gradient(135deg,#f97316,#eab308)",
    strategy:"Meme · High Risk/Reward",winRate:58,trades:890,rating:4.2,renters:215,
    price:"FREE",period:"Ad-supported",
    description:"Aggressive meme token scanner. High volume of signals with higher risk tolerance. Best for users who enjoy degen plays and can handle volatility.",
    recentPicks:["PEPE (+120%)","WIF (-15%)","BONK (+45%)","DOGE (+8%)"],
    creator:"0x3b1c...9e2a",createdAt:"6 months ago",
    riskLevel:"High",avgReturn:"+22.8%"
  },
  {
    name:"Whale Watcher",emoji:"🏛️",bg:"linear-gradient(135deg,#22c55e,#16a34a)",
    strategy:"Blue Chip · Conservative",winRate:81,trades:120,rating:4.9,renters:45,
    price:"10 MNT",period:"/week",
    description:"Conservative strategy tracking only top-100 tokens with whale accumulation. Lower frequency but highest win rate. Ideal for long-term portfolio building.",
    recentPicks:["ETH (+5%)","SOL (+12%)","LINK (+9%)","AAVE (+7%)"],
    creator:"0xf7d2...1c8b",createdAt:"2 months ago",
    riskLevel:"Low",avgReturn:"+8.4%"
  },
  {
    name:"Yield Sniper",emoji:"🎯",bg:"linear-gradient(135deg,#ec4899,#a855f7)",
    strategy:"DeFi · Yield Farming",winRate:67,trades:215,rating:4.5,renters:67,
    price:"3 MNT",period:"/week",
    description:"Targets yield-bearing DeFi tokens before major protocol upgrades or yield events. Combines Nansen flow data with protocol TVL analysis.",
    recentPicks:["PENDLE (+22%)","LDO (+11%)","RPL (-5%)","CRV (+14%)"],
    creator:"0x91a4...7d5e",createdAt:"4 months ago",
    riskLevel:"Medium",avgReturn:"+12.1%"
  },
  {
    name:"AI Narrative",emoji:"🤖",bg:"linear-gradient(135deg,#06b6d4,#3b82f6)",
    strategy:"AI/Agent Tokens · Trending",winRate:63,trades:178,rating:4.3,renters:103,
    price:"5 MNT",period:"/week",
    description:"Tracks the AI narrative in crypto. Monitors smart money flows into AI agent tokens, compute protocols, and decentralized inference projects.",
    recentPicks:["VIRTUAL (-3%)","FET (+28%)","RNDR (+15%)","TAO (+19%)"],
    creator:"0x2c5f...8a3d",createdAt:"1 month ago",
    riskLevel:"High",avgReturn:"+18.5%"
  }
];

// === Agent Detail ===
function showAgentDetail(idx) {
  currentRatingAgentIndex = idx;
  const a = AGENTS[idx];
  document.getElementById('agentDetailTitle').textContent = a.name;
  const picks = a.recentPicks.map(p => {
    const isPos = p.includes('+');
    return `<span style="padding:4px 10px;border-radius:8px;font-size:12px;background:${isPos?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)'};color:${isPos?'#22c55e':'#ef4444'}">${p}</span>`;
  }).join('');
  
  document.getElementById('agentDetailBody').innerHTML = `
    <div style="text-align:center;padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
      <div class="agent-avatar" style="background:${a.bg};width:64px;height:64px;font-size:32px;margin:0 auto 12px;border-radius:18px">${a.emoji}</div>
      <div style="font-size:22px;font-weight:700">${a.name}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:4px">${a.strategy}</div>
      <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.25)">by ${a.creator} · ${a.createdAt}</div>
    </div>
    <div class="detail-section" style="margin-top:20px">
      <div class="detail-section-title">Performance</div>
      <div class="detail-stat-grid">
        <div class="detail-stat"><div class="detail-stat-label">Win Rate</div><div class="detail-stat-value" style="color:#22c55e">${a.winRate}%</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Total Trades</div><div class="detail-stat-value">${a.trades}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Avg Return</div><div class="detail-stat-value" style="color:#22c55e">${a.avgReturn}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Rating</div><div class="detail-stat-value">⭐ ${a.rating}/5</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Active Renters</div><div class="detail-stat-value">${a.renters}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Risk Level</div><div class="detail-stat-value">${a.riskLevel}</div></div>
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">About</div>
      <div style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:14px">${a.description}</div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">Recent Picks</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${picks}</div>
    </div>
    <div style="background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.1);border-radius:14px;padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:13px;color:rgba(255,255,255,0.5)">Rental Price</span>
        <span style="font-size:20px;font-weight:800;font-family:'JetBrains Mono',monospace;color:#a78bfa">${a.price}<span style="font-size:12px;font-weight:400;color:rgba(255,255,255,0.3)"> ${a.period}</span></span>
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-bottom:12px">⛓️ Payment via ERC-8004 Agent Marketplace on Mantle</div>
      <button class="btn-primary" onclick="rentAgent(${idx})">
        Rent This Agent
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
      </button>
    </div>
    <button class="btn-ghost" onclick="showScreen('rateAgentScreen')">Rate This Agent</button>
  `;
  showScreen('agentDetailScreen');
}

function rentAgent(idx) {
  const a = AGENTS[idx];
  document.getElementById('activeAgentName').textContent = a.name;
  alert(`✅ Agent "${a.name}" rented for ${a.price}${a.period}!\n\nYour swipe feed will now be curated by this agent.`);
  showScreen('swipeScreen');
  renderCards();
}

// === Rating ===
let currentRating = 0;
const ratingLabels = ['','Poor','Fair','Good','Great','Excellent'];

function setRating(v) {
  currentRating = v;
  document.querySelectorAll('.star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.v) <= v);
  });
  document.getElementById('rateLabel').textContent = ratingLabels[v];
}

async function submitRating() {
  if (currentRating === 0) { alert('Please select a rating'); return; }
  
  const submitBtn = document.querySelector('button[onclick="submitRating()"]');
  const originalText = submitBtn.innerHTML;
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Submitting Transaction... <span class="spinner" style="display:inline-block;animation:spin 1s linear infinite">⏳</span>`;
    
    // Fallback if MetaMask not available
    if (!window.ethereum) {
      alert(`⛓️ (Simulation) Rating submitted on-chain!\n\nAgent: ${AGENTS[currentRatingAgentIndex].name}\nRating: ${'⭐'.repeat(currentRating)} (${currentRating}/5)\n\nRecorded via ERC-8004 Reputation Registry on Mantle.`);
      showScreen('swipeScreen');
      return;
    }
    
    const contract = await getRegistryContractSigner();
    
    // Get tags selected as comments
    const tags = Array.from(document.querySelectorAll('.rate-tag.active')).map(t => t.textContent);
    const comment = tags.length > 0 ? tags.join(', ') : "Rated via SwipeAlpha App";
    
    const agentId = currentRatingAgentIndex + 1; // 1-indexed on-chain
    
    console.log("Submitting rating for Agent ID:", agentId, "Rating:", currentRating, "Comment:", comment);
    
    const tx = await contract.submitReputation(agentId, currentRating, comment);
    
    submitBtn.innerHTML = `Confirming Block... ⛓️`;
    await tx.wait();
    
    alert(`🎉 Success!\n\nRating submitted on-chain to Mantle Sepolia!\nTx Hash: ${tx.hash}`);
    showScreen('swipeScreen');
  } catch (error) {
    console.error("On-chain submit failed:", error);
    alert(`❌ Failed to submit on-chain: ${error.reason || error.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// === Tab Navigation ===
const mainScreens = ['swipeScreen','agentsScreen','portfolioScreen','settingsScreen'];
let tabBarVisible = false;

function switchTab(btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const screen = btn.dataset.screen;
  showScreen(screen);
  if (screen === 'swipeScreen') renderCards();
}

// Override showScreen to manage tab bar
const _origShowScreen = showScreen;
showScreen = function(id) {
  _origShowScreen(id);
  const tabBar = document.getElementById('tabBar');
  if (mainScreens.includes(id)) {
    tabBar.classList.add('visible');
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.dataset.screen === id);
    });
  }
  // Show tab bar for sub-screens too
  if (['detailScreen','agentDetailScreen','rateAgentScreen','buyScreen'].includes(id)) {
    tabBar.classList.add('visible');
  }
  // Hide on splash/connect/loading
  if (['splashScreen','connectScreen','loadingScreen'].includes(id)) {
    tabBar.classList.remove('visible');
  }
  // Auto-render card stack when switching back to Swipe Screen to ensure sync
  if (id === 'swipeScreen') {
    renderCards();
  }
};

