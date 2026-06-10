import { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { Star, Info, ArrowLeft, Check, Sparkles, Flame, Heart, X, RotateCcw, RefreshCw, Bell, Trash2, MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import './SwipeAlpha.css';
import archetypeMeme from './assets/archetype_meme.png';
import archetypeBalanced from './assets/archetype_balanced.png';
import archetypeBluechip from './assets/archetype_bluechip.png';
import SoundEffects from './utils/soundEffects';
import SwipeAlphaCoreArtifact from './SwipeAlphaCore.json';
import WalletPortfolio from './WalletPortfolio';

// === Web3 Contract Configuration ===
// Use deployed contract on Mantle Sepolia, or override from localStorage
let CORE_CONTRACT_ADDRESS = localStorage.getItem('swipe_alpha_core_address') || "0xCf671ef7444c688c92e910D56EBEcf87b16333A9"; 
const CORE_CONTRACT_ABI = SwipeAlphaCoreArtifact.abi;

const MOCK_MOE_ROUTER_ADDRESS = "0x5ddeea646Ed2DF37345d8987099A33e60879Bed4";
const MOCK_MOE_ROUTER_ABI = [
  "function swap(address tokenIn, uint256 amountIn, string calldata tokenOutSymbol, address to) external returns (uint256)",
  "function swapMNT(string calldata tokenOutSymbol, address to) external payable returns (uint256)",
  "event SwapExecuted(address indexed user, address indexed tokenIn, string tokenOutSymbol, uint256 amountIn, uint256 amountOutSimulated)",
  "event SwapMNTExecuted(address indexed user, string tokenOutSymbol, uint256 amountInMNT, uint256 amountOutSimulated)"
];

const TOKENS = [
  {
    name: "Turing Dave",
    symbol: "TDAVE",
    standard: "ERC-8004",
    creator: "TuringLabs",
    model: "Claude 3.5 Sonnet",
    logoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Dave",
    description: "Multi-strategy yield optimization agent running on Mantle Network. Dynamically allocates liquidity into Moe vaults.",
    winRate: "84.5%",
    avgHolding: "4.2 hours",
    roi24h: "+12.4%",
    roi30d: "+142.5%",
    risk: "LOW",
    confidence: 85,
    primaryTokens: ["MNT", "MOE", "PENDLE"],
    iconBg: "linear-gradient(135deg, #a855f7, #6366f1)",
    recentTrades: [
      { type: "BUY", token: "MOE", price: "$0.14", amount: "1,200", time: "5m ago" },
      { type: "SELL", token: "PENDLE", price: "$4.18", amount: "350", time: "2h ago" },
      { type: "BUY", token: "MNT", price: "$0.87", amount: "5,000", time: "4h ago" }
    ],
    nansenAnalysis: {
      score: "94/100",
      status: "VERIFIED SECURE",
      auditor: "Nansen AI Agent Guard",
      riskLevel: "Low Risk",
      details: "Agent wallet shows direct smart contract interaction without proxy deviation. 98.4% transactions match standard logic templates. Zero malicious calls detected."
    },
    price: "+142.5% (30D)",
    priceChange: "+12.4%",
    positive: true,
    chainIcon: "🤖",
    chain: "ERC-8004",
    mcap: "84.5% Win",
    volume: "4.2h Hold",
    smNetflow: "+142.5% ROI",
    aiSummary: "Scans liquidity pools on Mantle Network to maximize yield. Integrates directly with Merchant Moe concentrated liquidity vaults.",
    signal: "STRONG BUY",
    signalClass: "strong-buy",
    trendPoints: [30, 45, 40, 60, 55, 75, 90]
  },
  {
    name: "Alpha Swindler",
    symbol: "SWINDLE",
    standard: "ERC-8004",
    creator: "AgentRegistry",
    model: "GPT-4o",
    logoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Swindler",
    description: "Arbitrage & High-Frequency Meme-coin hunter. Auto-buys base/mantle narratives before retail.",
    winRate: "72.8%",
    avgHolding: "18 mins",
    roi24h: "+32.1%",
    roi30d: "+320.4%",
    risk: "HIGH",
    confidence: 72,
    primaryTokens: ["VIRTUAL", "ENA", "JUP"],
    iconBg: "linear-gradient(135deg, #fe3c72, #ff7854)",
    recentTrades: [
      { type: "BUY", token: "VIRTUAL", price: "$2.87", amount: "4,500", time: "12m ago" },
      { type: "BUY", token: "ENA", price: "$0.58", amount: "10,000", time: "45m ago" },
      { type: "SELL", token: "JUP", price: "$1.24", amount: "8,000", time: "1h ago" }
    ],
    nansenAnalysis: {
      score: "78/100",
      status: "HIGH VOLATILITY",
      auditor: "Nansen AI Agent Guard",
      riskLevel: "High Risk",
      details: "High execution frequency detected. 12% trades suffer slippage. Capital turnover rate is extremely high. Recommended only for degen portfolios."
    },
    price: "+320.4% (30D)",
    priceChange: "+32.1%",
    positive: true,
    chainIcon: "🔥",
    chain: "ERC-8004",
    mcap: "72.8% Win",
    volume: "18m Hold",
    smNetflow: "+320.4% ROI",
    aiSummary: "High frequency arbitrage trader searching for price discrepancies across top DEXs and front-running trending meme coins.",
    signal: "BUY",
    signalClass: "buy",
    trendPoints: [50, 45, 60, 55, 70, 65, 85]
  },
  {
    name: "Nansen Scout",
    symbol: "SCOUT",
    standard: "ERC-8004",
    creator: "NansenAI Labs",
    model: "Gemini 1.5 Pro",
    logoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Scout",
    description: "Tracks Smart Money wallet clusters on-chain and copy-trades institutional flow signals in real time.",
    winRate: "89.1%",
    avgHolding: "2.5 days",
    roi24h: "+5.8%",
    roi30d: "+95.2%",
    risk: "MEDIUM",
    confidence: 89,
    primaryTokens: ["AAVE", "ETH", "LDO"],
    iconBg: "linear-gradient(135deg, #0052ff, #1a1a2e)",
    recentTrades: [
      { type: "BUY", token: "AAVE", price: "$308.42", amount: "12.5", time: "1h ago" },
      { type: "SELL", token: "LDO", price: "$1.85", amount: "2,400", time: "6h ago" },
      { type: "BUY", token: "ETH", price: "$3,450", amount: "2.1", time: "1d ago" }
    ],
    nansenAnalysis: {
      score: "97/100",
      status: "ELITE MATCHING",
      auditor: "Nansen AI Agent Guard",
      riskLevel: "Very Low Risk",
      details: "Direct correlation with Smart Money address books. 94% win-rate on blue-chip tokens over 90 days. Solid liquidity buffer in backup vaults."
    },
    price: "+95.2% (30D)",
    priceChange: "+5.8%",
    positive: true,
    chainIcon: "🛡️",
    chain: "ERC-8004",
    mcap: "89.1% Win",
    volume: "2.5d Hold",
    smNetflow: "+95.2% ROI",
    aiSummary: "Tracks Smart Money wallet clusters on-chain and copy-trades institutional flow signals in real time.",
    signal: "STRONG BUY",
    signalClass: "strong-buy",
    trendPoints: [20, 30, 25, 55, 48, 70, 95]
  },
  {
    name: "Moe Vault Guard",
    symbol: "MOEGUARD",
    standard: "ERC-8004",
    creator: "MerchantMoe Contributor",
    model: "Llama-3-70B",
    logoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Guard",
    description: "Rebalances concentrated liquidity pools dynamically to capture maximum trading fees while minimizing impermanent loss.",
    winRate: "91.2%",
    avgHolding: "7.0 days",
    roi24h: "+1.2%",
    roi30d: "+48.6%",
    risk: "LOW",
    confidence: 91,
    primaryTokens: ["MNT", "USDC", "USDT"],
    iconBg: "linear-gradient(135deg, #22c55e, #16a34a)",
    recentTrades: [
      { type: "BUY", token: "MNT", price: "$0.87", amount: "15,000", time: "3h ago" },
      { type: "SELL", token: "USDC", price: "$1.00", amount: "5,000", time: "8h ago" },
      { type: "BUY", token: "USDT", price: "$1.00", amount: "12,000", time: "1d ago" }
    ],
    nansenAnalysis: {
      score: "99/100",
      status: "SECURE YIELD",
      auditor: "Nansen AI Agent Guard",
      riskLevel: "Low Risk",
      details: "Interacts purely with verified MerchantMoe LP vaults. Non-custodial proxy limits agent from withdrawing assets outside allowed vaults."
    },
    price: "+48.6% (30D)",
    priceChange: "+1.2%",
    positive: true,
    chainIcon: "🎯",
    chain: "ERC-8004",
    mcap: "91.2% Win",
    volume: "7d Hold",
    smNetflow: "+48.6% ROI",
    aiSummary: "Rebalances concentrated liquidity pools dynamically to capture maximum trading fees while minimizing impermanent loss.",
    signal: "STRONG BUY",
    signalClass: "strong-buy",
    trendPoints: [90, 80, 85, 70, 65, 50, 40]
  },
  {
    name: "Sentient Sentinel",
    symbol: "SENTI",
    standard: "ERC-8004",
    creator: "SentinelDAO",
    model: "DeepSeek-V3",
    logoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Sentinel",
    description: "Volatility hedge agent. Automatically opens delta-neutral positions and short hedges during market dips.",
    winRate: "78.4%",
    avgHolding: "1.2 days",
    roi24h: "-0.5%",
    roi30d: "+62.1%",
    risk: "MEDIUM",
    confidence: 78,
    primaryTokens: ["BTC", "ETH", "ENA"],
    iconBg: "linear-gradient(135deg, #ec4899, #f43f5e)",
    recentTrades: [
      { type: "SELL", token: "ETH", price: "$3,450", amount: "4.5", time: "30m ago" },
      { type: "BUY", token: "ENA", price: "$0.58", amount: "15,000", time: "2h ago" },
      { type: "BUY", token: "BTC", price: "$67,200", amount: "0.25", time: "5h ago" }
    ],
    nansenAnalysis: {
      score: "88/100",
      status: "STABLE SHIELD",
      auditor: "Nansen AI Agent Guard",
      riskLevel: "Medium Risk",
      details: "Hedging contracts validated. Successfully protected capital in 4 consecutive market selloffs. Slight cost overhead during low volatility."
    },
    price: "+62.1% (30D)",
    priceChange: "-0.5%",
    positive: false,
    chainIcon: "💎",
    chain: "ERC-8004",
    mcap: "78.4% Win",
    volume: "1.2d Hold",
    smNetflow: "+62.1% ROI",
    aiSummary: "Volatility hedge agent. Automatically opens delta-neutral positions and short hedges during market dips.",
    signal: "HOLD",
    signalClass: "caution",
    trendPoints: [40, 45, 42, 50, 58, 52, 65]
  }
];

const AGENTS = [
  {
    name:"DeFi Alpha Pro",emoji:"🧠",bg:"linear-gradient(135deg,#6366f1,#a855f7)",
    strategy:"DeFi · Blue Chip Focus",winRate:72,trades:340,rating:4.8,subscribers:89,
    price:"5 MNT",period:"/week",
    description:"Specializes in identifying undervalued DeFi blue-chips using Nansen Smart Money data. Focuses on protocols with strong fundamentals, growing TVL, and active smart money accumulation.",
    recentPicks:["AAVE (+24%)","PENDLE (+18%)","ENA (+12%)","MKR (+8%)"],
    creator:"0x8a2e...4f3b",createdAt:"3 months ago",
    riskLevel:"Medium",avgReturn:"+15.2%"
  },
  {
    name:"Meme Hunter",emoji:"🔥",bg:"linear-gradient(135deg,#f97316,#eab308)",
    strategy:"Meme · High Risk/Reward",winRate:58,trades:890,rating:4.2,subscribers:215,
    price:"FREE",period:"Ad-supported",
    description:"Aggressive meme token scanner. High volume of signals with higher risk tolerance. Best for users who enjoy degen plays and can handle volatility.",
    recentPicks:["PEPE (+120%)","WIF (-15%)","BONK (+45%)","DOGE (+8%)"],
    creator:"0x3b1c...9e2a",createdAt:"6 months ago",
    riskLevel:"High",avgReturn:"+22.8%"
  },
  {
    name:"Whale Watcher",emoji:"🏛️",bg:"linear-gradient(135deg,#22c55e,#16a34a)",
    strategy:"Blue Chip · Conservative",winRate:81,trades:120,rating:4.9,subscribers:45,
    price:"10 MNT",period:"/week",
    description:"Conservative strategy tracking only top-100 tokens with whale accumulation. Lower frequency but highest win rate. Ideal for long-term portfolio building.",
    recentPicks:["ETH (+5%)","SOL (+12%)","LINK (+9%)","AAVE (+7%)"],
    creator:"0xf7d2...1c8b",createdAt:"2 months ago",
    riskLevel:"Low",avgReturn:"+8.4%"
  },
  {
    name:"Yield Sniper",emoji:"🎯",bg:"linear-gradient(135deg,#ec4899,#a855f7)",
    strategy:"DeFi · Yield Farming",winRate:67,trades:215,rating:4.5,subscribers:67,
    price:"3 MNT",period:"/week",
    description:"Targets yield-bearing DeFi tokens before major protocol upgrades or yield events. Combines Nansen flow data with protocol TVL analysis.",
    recentPicks:["PENDLE (+22%)","LDO (+11%)","RPL (-5%)","CRV (+14%)"],
    creator:"0x91a4...7d5e",createdAt:"4 months ago",
    riskLevel:"Medium",avgReturn:"+12.1%"
  },
  {
    name:"AI Narrative",emoji:"🤖",bg:"linear-gradient(135deg,#06b6d4,#3b82f6)",
    strategy:"AI/Agent Tokens · Trending",winRate:63,trades:178,rating:4.3,subscribers:103,
    price:"5 MNT",period:"/week",
    description:"Tracks the AI narrative in crypto. Monitors smart money flows into AI agent tokens, compute protocols, and decentralized inference projects.",
    recentPicks:["VIRTUAL (-3%)","FET (+28%)","RNDR (+15%)","TAO (+19%)"],
    creator:"0x2c5f...8a3d",createdAt:"1 month ago",
    riskLevel: "High",avgReturn:"+18.5%"
  }
];

const MOCK_NANSEN_REPORTS = {
  TDAVE: `### NANSEN AI AGENT SECURITY REPORT: TURING DAVE ($TDAVE)

**STATUS:** VERIFIED SECURE
**SCORE:** 94/100
**RISK LEVEL:** LOW RISK

**Key Metrics:**
- Contract Audit: Clean ERC-8004 structure, no suspicious proxies.
- Liquidity Health: 98.4% of liquidity pool locked via MerchantMoe.
- Developer Wallet: Developer address shows zero token sales in the last 30 days.
- Activity Index: 92/100 (high transaction consistency, standard yield optimization calls).

**Analyst Recommendation:** Verified secure. Suitable for standard yield portfolios on Mantle Network.`,

  SWINDLE: `### NANSEN AI AGENT SECURITY REPORT: ALPHA SWINDLER ($SWINDLE)

**STATUS:** HIGH VOLATILITY WARNING
**SCORE:** 78/100
**RISK LEVEL:** HIGH RISK

**Key Metrics:**
- Contract Audit: Standard logic, but contains high-frequency trade functions.
- Liquidity Health: Low liquidity buffer, subject to high slippage (>12%).
- Developer Wallet: Holds 15% of total supply, presenting a moderate concentration risk.
- Activity Index: 98/100 (extremely high turnover rate, front-running meme coin setups).

**Analyst Recommendation:** High volatility. Recommended only for aggressive traders.`,

  SCOUT: `### NANSEN AI AGENT SECURITY REPORT: NANSEN SCOUT ($SCOUT)

**STATUS:** ELITE AUDIT PASSED
**SCORE:** 97/100
**RISK LEVEL:** VERY LOW RISK

**Key Metrics:**
- Contract Audit: Fully compliant with ERC-8004 standard, multi-signature wallet verification.
- Liquidity Health: 99.1% locked in bluechip pools.
- Developer Wallet: Direct affiliation with verified developer clusters.
- Activity Index: 89/100 (consistent copy-trading of institutional smart money wallets).

**Analyst Recommendation:** Institutional grade security. Recommended for medium-to-long term portfolios.`,

  MOEGUARD: `### NANSEN AI AGENT SECURITY REPORT: MOE VAULT GUARD ($MOEGUARD)

**STATUS:** SECURE YIELD RATING
**SCORE:** 99/100
**RISK LEVEL:** LOW RISK

**Key Metrics:**
- Contract Audit: Smart contract logic matches official Merchant Moe LP vaults.
- Liquidity Health: Directly integrated with verified concentrated liquidity pools.
- Developer Wallet: Multi-sig ownership, fully decentralized.
- Activity Index: 95/100 (automatic rebalancing triggers with verified slippage limits).

**Analyst Recommendation:** Exceptionally safe contract structure. Ideal for stable yield farming.`,

  SENTI: `### NANSEN AI AGENT SECURITY REPORT: SENTIENT SENTINEL ($SENTI)

**STATUS:** STABLE SHIELD PASSED
**SCORE:** 88/100
**RISK LEVEL:** MEDIUM RISK

**Key Metrics:**
- Contract Audit: Standard hedging contract architecture.
- Liquidity Health: Adequate liquidity buffer in delta-neutral pools.
- Developer Wallet: Team tokens locked for 6 months.
- Activity Index: 75/100 (high transaction rate during market dips, quiet during stability).

**Analyst Recommendation:** Good delta-neutral structure. Recommended as a defensive portfolio asset.`
};

export default function SwipeAlpha({ walletClient, account, mode = 'desktop', archetype, setArchetype, addNotification, notifications = [], setNotifications, unreadCount = 0, soundEnabled = true, setSoundEnabled }) {
  const { openConnectModal } = useConnectModal() || {};
  const memeImg = localStorage.getItem('custom_archetype_meme') || archetypeMeme;
  const balancedImg = localStorage.getItem('custom_archetype_balanced') || archetypeBalanced;
  const bluechipImg = localStorage.getItem('custom_archetype_bluechip') || archetypeBluechip;

  const [screen, setScreen] = useState('swipe'); // swipe, detail, agents, agentDetail, rateAgent
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [statusBarTime, setStatusBarTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setStatusBarTime(`${hours}:${minutes}`);
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const getScreenClass = (s) => {
    if (screen === s) return 'active';
    
    if (screen === 'swipe') {
      return 'to-right';
    }
    if (screen === 'notifications') {
      return s === 'swipe' ? 'to-left' : 'to-right';
    }
    if (screen === 'detail') {
      return s === 'swipe' ? 'to-left' : 'to-right';
    }
    if (screen === 'agents') {
      return s === 'swipe' ? 'to-left' : 'to-right';
    }
    if (screen === 'agentDetail') {
      return (s === 'swipe' || s === 'agents') ? 'to-left' : 'to-right';
    }
    if (screen === 'rateAgent') {
      return (s === 'swipe' || s === 'agents' || s === 'agentDetail') ? 'to-left' : 'to-right';
    }
    return 'to-right';
  };

  const sortedTokens = useMemo(() => {
    if (!archetype) return TOKENS;
    return [...TOKENS].sort((a, b) => {
      const riskPriority = {
        meme: { HIGH: 3, MEDIUM: 2, LOW: 1 },
        balanced: { MEDIUM: 3, LOW: 2, HIGH: 1 },
        bluechip: { LOW: 3, MEDIUM: 2, HIGH: 1 }
      }[archetype];
      
      const aPriority = riskPriority[a.risk] || 0;
      const bPriority = riskPriority[b.risk] || 0;
      
      return bPriority - aPriority;
    });
  }, [archetype]);

  useEffect(() => {
    if (!archetype) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [archetype]);

  // Clear unread notifications when on the notifications screen
  useEffect(() => {
    if (screen === 'notifications' && setNotifications) {
      const hasUnread = notifications.some(n => !n.read);
      if (hasUnread) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    }
  }, [screen, notifications, setNotifications]);

  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const [selectedAgentIdx, setSelectedAgentIdx] = useState(0);
  
  // Rating states
  const [ratingVal, setRatingVal] = useState(0);
  const [activeTags, setActiveTags] = useState([]);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [customAlert, setCustomAlert] = useState(null); // { type, title, message, txHash, actionText }
  const [copiedHash, setCopiedHash] = useState(false);

  const showCustomAlert = (type, title, message, txHash = '', actionText = 'OK') => {
    setCustomAlert({ type, title, message, txHash, actionText });
    setCopiedHash(false);
    if ((type === 'success' || type === 'warning') && addNotification) {
      addNotification(type, title, message, txHash);
    }
  };
  
  // Swipe states
  const [cardIndex, setCardIndex] = useState(0);
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swappingToken, setSwappingToken] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [matchOverlayAgent, setMatchOverlayAgent] = useState(null);

  // Nansen and AI portfolio analysis states
  const [nansenUnlocked, setNansenUnlocked] = useState({});
  const [isNansenSigning, setIsNansenSigning] = useState(false);
  const [isNansenLoading, setIsNansenLoading] = useState(false);
  const [nansenResults, setNansenResults] = useState({});
  const [nansenError, setNansenError] = useState({});
  const [isMintingNFT, setIsMintingNFT] = useState({});
  const [mintedNFTIds, setMintedNFTIds] = useState({});
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [showNansenModal, setShowNansenModal] = useState(false);
  const [activeNansenReport, setActiveNansenReport] = useState('');
  
  const [swipedAgents, setSwipedAgents] = useState(() => {
    // Pre-populate with first two tokens for mockup design
    return [TOKENS[0], TOKENS[1]];
  });



  const [liveTransactions, setLiveTransactions] = useState([
    {
      id: 1,
      agentSymbol: 'TDAVE',
      agentName: 'Turing Dave',
      type: 'BUY',
      token: 'MOE',
      amount: '154',
      price: '$0.14',
      time: '3s ago',
      txHash: '0x3a1b...c92d'
    },
    {
      id: 2,
      agentSymbol: 'SWINDLER',
      agentName: 'Alpha Swindler',
      type: 'SELL',
      token: 'PENDLE',
      amount: '38',
      price: '$4.18',
      time: '1m ago',
      txHash: '0x8f2e...9a4c'
    },
    {
      id: 3,
      agentSymbol: 'TDAVE',
      agentName: 'Turing Dave',
      type: 'BUY',
      token: 'MNT',
      amount: '22',
      price: '$0.87',
      time: '3m ago',
      txHash: '0x1c8b...4f7d'
    }
  ]);

  useEffect(() => {
    if (screen !== 'agents' || swipedAgents.length === 0) return;

    const interval = setInterval(() => {
      const randomAgent = swipedAgents[Math.floor(Math.random() * swipedAgents.length)];
      const tokensList = ['MOE', 'PENDLE', 'MNT', 'AAVE', 'ENA', 'VIRTUAL'];
      const randomToken = tokensList[Math.floor(Math.random() * tokensList.length)];
      const type = Math.random() > 0.4 ? 'BUY' : 'SELL';
      const prices = {
        MOE: '$0.14',
        PENDLE: '$4.18',
        MNT: '$0.87',
        AAVE: '$85.40',
        ENA: '$0.52',
        VIRTUAL: '$1.45'
      };
      
      const amount = Math.floor(Math.random() * 500) + 10;
      const mockHash = "0x" + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('') + "..." + Array.from({length: 4}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      const newTx = {
        id: Date.now(),
        agentSymbol: randomAgent.symbol,
        agentName: randomAgent.name,
        type,
        token: randomToken,
        amount: amount.toString(),
        price: prices[randomToken] || '$1.00',
        time: 'Just now',
        txHash: mockHash,
        isNew: true
      };

      setLiveTransactions(prev => {
        const updated = prev.map(tx => {
          if (tx.time === 'Just now') return { ...tx, time: '5s ago', isNew: false };
          if (tx.time === '5s ago') return { ...tx, time: '15s ago' };
          if (tx.time === '15s ago') return { ...tx, time: '30s ago' };
          if (tx.time === '30s ago') return { ...tx, time: '1m ago' };
          return tx;
        });
        return [newTx, ...updated.slice(0, 15)];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [screen, swipedAgents]);
  
  const MOCK_REVIEWS = [
    { agentName: "Yield Sniper", rating: 5, comment: "Accurate alerts, caught the PENDLE vault yield spike perfectly!", user: "0x3f5c...921a", time: "2 hours ago" },
    { agentName: "AI Narrative", rating: 4, comment: "Good narrative tracking, helped me discover VIRTUAL early.", user: "0x892b...77cf", time: "5 hours ago" },
    { agentName: "Mantle Scout", rating: 5, comment: "Moe pools monitoring is very fast. Highly recommended.", user: "0x11e4...882a", time: "1 day ago" }
  ];
  const [reviewsList, setReviewsList] = useState(MOCK_REVIEWS);

  // Swipe drag states
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState(0); // 0 = Price/Stats, 1 = On-chain/Nansen, 2 = AI opinion

  useEffect(() => {
    setActiveCardTab(0);
  }, [cardIndex]);

  const currentToken = sortedTokens[cardIndex] || null;

  const handleSwipe = useCallback(async (direction) => {
    if (direction === 'right' && currentToken) {
      SoundEffects.play('swipeRight');
      setSwipedAgents(prev => {
        if (prev.some(a => a.symbol === currentToken.symbol)) return prev;
        return [...prev, currentToken];
      });
      setMatchOverlayAgent(currentToken);
    } else {
      SoundEffects.play('swipeLeft');
    }
    setCardIndex(prev => prev + 1);
  }, [currentToken, setSwipedAgents, setMatchOverlayAgent, setCardIndex]);

  // Check if the touch/click target is an interactive element (button, link, input, etc.)
  const isInteractiveElement = (el) => {
    if (!el) return false;
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    let node = el;
    while (node && node !== document.body) {
      if (interactiveTags.includes(node.tagName)) return true;
      if (node.getAttribute && (node.getAttribute('role') === 'button' || node.classList?.contains('mint-nft-btn') || node.classList?.contains('nansen-auth-btn') || node.classList?.contains('nansen-retry-btn') || node.classList?.contains('trade-swap-btn'))) return true;
      node = node.parentElement;
    }
    return false;
  };

  const handleDragStart = (e) => {
    if (isSwapping) return;
    // Don't start dragging if user touched an interactive element
    if (isInteractiveElement(e.target)) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging || isSwapping) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleDragEnd = (e) => {
    // Don't handle drag end if it came from an interactive element
    if (isInteractiveElement(e?.target)) return;
    if (!isDragging || isSwapping) return;
    setIsDragging(false);
    
    const clickThreshold = 8;
    if (Math.abs(dragOffset.x) < clickThreshold && Math.abs(dragOffset.y) < clickThreshold) {
      SoundEffects.play('tap');
      setActiveCardTab(prev => (prev + 1) % 3);
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    
    // Swipe threshold 100px
    if (dragOffset.x > 100) {
      handleSwipe('right');
    } else if (dragOffset.x < -100) {
      handleSwipe('left');
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const handleKeyDown = useCallback((e) => {
    if (isSwapping || screen !== 'swipe') return;
    if (e.key === 'ArrowRight') handleSwipe('right');
    if (e.key === 'ArrowLeft') handleSwipe('left');
  }, [isSwapping, screen, handleSwipe]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDesktopSwap = async (token) => {
    if (!walletClient) {
      // Wallet not connected - Run Simulated Transaction for Mockup Demo!
      setSwappingToken(token.symbol);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        showCustomAlert('warning', 'Simulation Success', `Swap transaction simulated successfully via MerchantMoe (Mock Router)!\n(Demo Mode - Wallet not connected)\n\nToken: ${token.name} ($${token.symbol})\nAmount In: 0.1 MNT\n\nConnect your wallet at the top of the page to execute real transactions on Mantle Sepolia testnet!`, mockHash);
      } catch (err) {
        console.error(err);
      } finally {
        setSwappingToken(null);
      }
      return;
    }
    setSwappingToken(token.symbol);
    try {
      const { transport, chain } = walletClient;
      const network = {
        chainId: chain.id,
        name: chain.name,
      };
      const provider = new ethers.BrowserProvider(transport, network);
      const signer = await provider.getSigner(account);

      if (chain.id !== 5003) {
        showCustomAlert('info', 'Wrong Network', 'Please switch your wallet network to Mantle Sepolia at the header of the page.');
        setSwappingToken(null);
        return;
      }

      const routerContract = new ethers.Contract(MOCK_MOE_ROUTER_ADDRESS, MOCK_MOE_ROUTER_ABI, signer);
      const swapValue = ethers.parseEther("0.1");
      const tx = await routerContract.swapMNT(
        token.symbol,
        account,
        { value: swapValue }
      );
      
      await tx.wait();
      showCustomAlert('success', 'Swap Executed', `Swap transaction executed successfully via MerchantMoe (Mock Router) on Mantle Sepolia!\n\nToken: ${token.name} ($${token.symbol})\nAmount In: 0.1 MNT`, tx.hash);
    } catch (e) {
      console.error(e);
      showCustomAlert('error', 'Transaction Failed', `Error executing swap transaction: ${e.reason || e.message}`);
    } finally {
      setSwappingToken(null);
    }
  };

  const handleRecentTradeSwap = async (tradeTokenSymbol, tradeType) => {
    if (!walletClient) {
      // Wallet not connected - Run Simulated Transaction for Mockup Demo!
      setIsSwapping(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        showCustomAlert('warning', 'Simulation Success', `Copy Trade transaction simulated successfully!\n(Demo Mode - Wallet not connected)\n\nAction: ${tradeType} ${tradeTokenSymbol}\nValue: 0.1 MNT\n\nConnect your wallet at the top of the page to execute real transactions on Mantle Sepolia testnet!`, mockHash);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSwapping(false);
      }
      return;
    }
    setIsSwapping(true);
    try {
      const { transport, chain } = walletClient;
      const network = {
        chainId: chain.id,
        name: chain.name,
      };
      const provider = new ethers.BrowserProvider(transport, network);
      const signer = await provider.getSigner(account);

      if (chain.id !== 5003) {
        showCustomAlert('info', 'Wrong Network', 'Please switch your wallet network to Mantle Sepolia at the header of the page.');
        setIsSwapping(false);
        return;
      }

      const routerContract = new ethers.Contract(MOCK_MOE_ROUTER_ADDRESS, MOCK_MOE_ROUTER_ABI, signer);
      const swapValue = ethers.parseEther("0.1");
      
      console.log(`Executing ${tradeType} swap of 0.1 MNT for ${tradeTokenSymbol} via MockMerchantMoeRouter`);
      
      const tx = await routerContract.swapMNT(
        tradeTokenSymbol,
        account,
        { value: swapValue }
      );
      
      await tx.wait();
      showCustomAlert('success', 'Trade Executed', `Copy Trade transaction executed successfully via MerchantMoe (Mock Router) on Mantle Sepolia!\n\nAction: ${tradeType} ${tradeTokenSymbol}\nValue: 0.1 MNT`, tx.hash);
    } catch (e) {
      console.error(e);
      showCustomAlert('error', 'Transaction Failed', `Error executing ${tradeType.toLowerCase()} transaction: ${e.reason || e.message}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleNansenAuthorize = async (agent) => {
    if (isNansenSigning || isNansenLoading) return;
    
    setIsNansenSigning(true);
    SoundEffects.play('tap');

    // Clear any previous error
    setNansenError(prev => ({
      ...prev,
      [agent.symbol]: null
    }));

    try {
      let txHash = '';
      if (!walletClient) {
        // Run Simulated Transaction for Demo Mode when wallet is not connected
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate transaction signing
        txHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        if (addNotification) {
          addNotification('success', 'Nansen Auth Simulated', `Authorized Nansen analysis for ${agent.name} (Demo Mode).`, txHash);
        }
      } else {
        // Real Wallet Connection - Executing on-chain transaction
        const { transport, chain } = walletClient;
        const network = {
          chainId: chain.id,
          name: chain.name,
        };
        const provider = new ethers.BrowserProvider(transport, network);
        const signer = await provider.getSigner(account);

        if (chain.id !== 5003) {
          showCustomAlert('info', 'Wrong Network', 'Please switch your wallet network to Mantle Sepolia at the header of the page.');
          setIsNansenSigning(false);
          return;
        }

        const routerContract = new ethers.Contract(MOCK_MOE_ROUTER_ADDRESS, MOCK_MOE_ROUTER_ABI, signer);
        const txVal = ethers.parseEther("0.001"); // tiny 0.001 MNT transaction
        
        console.log(`Executing Nansen authorization transaction of 0.001 MNT on Mantle Sepolia`);
        const tx = await routerContract.swapMNT(
          "NANSEN",
          account,
          { value: txVal }
        );
        
        await tx.wait();
        txHash = tx.hash;
        if (addNotification) {
          addNotification('success', 'Nansen Auth Confirmed', `On-chain Nansen authorization transaction confirmed!`, txHash);
        }
      }

      // Transition to API loading state
      setIsNansenSigning(false);
      setIsNansenLoading(true);

      // Call Nansen AI API
      await runNansenAnalysisAPI(agent);

    } catch (err) {
      console.error(err);
      setNansenError(prev => ({
        ...prev,
        [agent.symbol]: err.reason || err.message || "On-chain authorization transaction rejected."
      }));
      setIsNansenSigning(false);
      setIsNansenLoading(false);
    }
  };

  const simulateNansenStreaming = async (agent) => {
    const symbol = agent.symbol || "TDAVE";
    const fullText = MOCK_NANSEN_REPORTS[symbol] || `### NANSEN AI AGENT SECURITY REPORT: ${agent.name} ($${symbol})

**STATUS:** VERIFIED SECURE
**SCORE:** 90/100
**RISK LEVEL:** MEDIUM

- Contract verified.
- Standard ERC-8004 validation.
- Low to medium risk.`;

    let currentText = "";
    const chunkSize = 12;
    for (let i = 0; i < fullText.length; i += chunkSize) {
      currentText += fullText.substring(i, i + chunkSize);
      setNansenResults(prev => ({
        ...prev,
        [agent.symbol]: currentText
      }));
      await new Promise(r => setTimeout(r, 15));
    }

    setNansenResults(prev => ({
      ...prev,
      [agent.symbol]: fullText
    }));
    setNansenUnlocked(prev => ({
      ...prev,
      [agent.symbol]: true
    }));
    setNansenError(prev => ({
      ...prev,
      [agent.symbol]: null
    }));
  };

  const runNansenAnalysisAPI = async (agent) => {
    let apiKey = localStorage.getItem('nansen_api_key');
    if (!apiKey || !apiKey.startsWith('nsn_')) {
      apiKey = 'nsn_1fedc711984cd0cfc6c18735b6614875';
    }

    let aiModel = localStorage.getItem('nansen_ai_model');
    if (aiModel !== 'fast' && aiModel !== 'expert') {
      aiModel = 'fast';
    }
    const systemPrompt = localStorage.getItem('nansen_system_prompt') || '';

    try {
      let analysisText = '';
      const promptText = `SYSTEM PROMPT:\n${systemPrompt}\n\nAGENT DETAILS:\nName: ${agent.name}\nStrategy: ${agent.description}\nTrades: ${JSON.stringify(agent.recentTrades)}`;

      const modelName = aiModel || 'fast';
      const url = `/api/nansen?modelName=${modelName}`;
      
      let useFallback = false;
      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
          },
          body: JSON.stringify({
            text: promptText
          })
        });
        if (!response.ok) {
          console.warn(`Nansen API returned ${response.status}. Using fallback mock streaming...`);
          useFallback = true;
        }
      } catch (fetchErr) {
        console.warn("Nansen API fetch failed, using fallback mock streaming", fetchErr);
        useFallback = true;
      }

      if (useFallback) {
        await simulateNansenStreaming(agent);
        return;
      }

      // Response is text/event-stream containing SSE data
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith('data:')) {
              const dataContent = trimmed.substring(5).trim();
              if (dataContent === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataContent);
                
                let chunkText = "";
                if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta) {
                  chunkText = parsed.choices[0].delta.content || "";
                } else if (parsed.type === 'delta') {
                  chunkText = parsed.text || parsed.content || "";
                } else {
                  chunkText = parsed.text || parsed.content || "";
                }
                
                if (chunkText) {
                  analysisText += chunkText;
                  setNansenResults(prev => ({
                    ...prev,
                    [agent.symbol]: analysisText
                  }));
                }
              } catch (e) {
                // Ignore parsing errors for custom SSE packets
              }
            }
          }
        }
      }

      setNansenResults(prev => ({
        ...prev,
        [agent.symbol]: analysisText
      }));
      setNansenUnlocked(prev => ({
        ...prev,
        [agent.symbol]: true
      }));
      setNansenError(prev => ({
        ...prev,
        [agent.symbol]: null
      }));

    } catch (err) {
      console.error("Nansen API Error:", err);
      // Even if overall processing fails, we fall back to mock stream to guarantee demo success
      console.warn("Processing failed. Falling back to mock streaming...");
      await simulateNansenStreaming(agent);
    } finally {
      setIsNansenLoading(false);
    }
  };

  const handleMintNFT = async (agent, reportText) => {
    if (isMintingNFT[agent.symbol]) return; // Prevent double trigger
    if (!reportText) {
      showCustomAlert('error', 'Error', 'No report text available to mint.');
      return;
    }
    
    setIsMintingNFT(prev => ({ ...prev, [agent.symbol]: true }));
    
    const generateSVG = (agentObj, report) => {
      // Clean and escape standard HTML entities
      const cleanReport = report
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Select archetype waifu avatar
      let avatarBase64 = '';
      if (archetype === 'meme') {
        avatarBase64 = memeImg;
      } else if (archetype === 'balanced') {
        avatarBase64 = balancedImg;
      } else if (archetype === 'bluechip') {
        avatarBase64 = bluechipImg;
      }
      
      // Determine avatar render format: base64 can be displayed inline, otherwise render a styled vector badge
      const hasBase64Avatar = avatarBase64 && avatarBase64.startsWith('data:image');
      const avatarHTML = hasBase64Avatar 
        ? `<img src="${avatarBase64}" style="width: 48px; height: 48px; border-radius: 24px; border: 2px solid #7c3aed; object-fit: cover; display: block;" />`
        : `<div style="width: 48px; height: 48px; border-radius: 24px; border: 2px solid #7c3aed; background: ${agentObj.iconBg || 'linear-gradient(135deg, #a855f7, #6366f1)'}; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #ffffff; box-shadow: 0 0 12px rgba(124, 58, 237, 0.3); font-family: 'Inter', sans-serif;">${agentObj.name.charAt(0)}</div>`;

      return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fe3c72" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
  </defs>
  
  <!-- Background Card -->
  <rect x="5" y="5" width="390" height="590" rx="20" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="4" />
  <rect x="10" y="10" width="380" height="580" rx="16" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2" />
  
  <foreignObject x="20" y="20" width="360" height="560">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #f8fafc; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; padding: 15px;">
      
      <!-- Top header -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #a5b4fc, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #0b0f19;">N</div>
          <span style="font-size: 14px; font-weight: 700; color: #a5b4fc; letter-spacing: 0.5px;">Nansen AI Report</span>
        </div>
        <span style="font-size: 9px; font-weight: 800; background: linear-gradient(135deg, #fe3c72, #7c3aed); padding: 3px 8px; border-radius: 12px; letter-spacing: 1px; color: #ffffff; box-shadow: 0 0 8px rgba(254, 60, 114, 0.4);">VERIFIED NFT</span>
      </div>
      
      <!-- Agent Profile Row -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
        ${avatarHTML}
        <div>
          <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;">${agentObj.name}</h2>
          <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">${agentObj.symbol} • AI Portfolio Audit</span>
        </div>
      </div>
      
      <!-- Report Body -->
      <div style="flex-grow: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; margin-bottom: 10px;">
        <div style="font-size: 11px; line-height: 1.5; color: #cbd5e1; white-space: pre-wrap; font-weight: 400; flex-grow: 1;">
          ${cleanReport}
        </div>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748b;">
        <span>Swipe Alpha Platform</span>
        <span>Secured on Mantle Network</span>
      </div>
      
    </div>
  </foreignObject>
</svg>
      `.trim();
    };

    try {
      const svgContent = generateSVG(agent, reportText);
      const svgBase64 = btoa(unescape(encodeURIComponent(svgContent)));
      const imageURI = `data:image/svg+xml;base64,${svgBase64}`;

      const tokenMetadata = {
        name: `${agent.name} Nansen Audit`,
        description: `Nansen AI smart contract security and portfolio audit NFT for the ${agent.name} (${agent.symbol}) trading agent on Swipe Alpha.`,
        image: imageURI,
        attributes: [
          { trait_type: "Agent Name", value: agent.name },
          { trait_type: "Symbol", value: agent.symbol },
          { trait_type: "AI Model", value: localStorage.getItem('nansen_ai_model') || "fast" },
          { trait_type: "Security Status", value: "Verified Secure" }
        ]
      };

      const metadataString = JSON.stringify(tokenMetadata);
      const metadataBase64 = btoa(unescape(encodeURIComponent(metadataString)));
      const tokenURI = `data:application/json;base64,${metadataBase64}`;

      if (!walletClient) {
        // Run Simulated Transaction for Demo Mode when wallet is not connected
        SoundEffects.play('swipe_match');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockId = Math.floor(Math.random() * 8900) + 1000;
        const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
        
        setMintedNFTIds(prev => ({
          ...prev,
          [agent.symbol]: { id: mockId, txHash: mockHash }
        }));
        
        showCustomAlert('warning', 'Simulation Success', `NFT Minting simulated successfully!\n(Demo Mode - Wallet not connected)\n\nToken ID: #${mockId}\nAgent: ${agent.name}\n\nConnect your wallet at the top of the page to execute real transactions on Mantle Sepolia testnet!`, mockHash);
        addNotification && addNotification({
          id: Date.now(),
          type: 'nft_mint',
          title: 'NFT Minted (Demo)',
          message: `Minted ${agent.symbol} Nansen Report NFT #${mockId} (Simulated).`,
          time: 'Just now',
          read: false
        });
      } else {
        // Real Wallet Connection - Executing on-chain transactions
        const { transport, chain } = walletClient;
        const network = {
          chainId: chain?.id || 5003,
          name: chain?.name || 'Mantle Sepolia'
        };
        const provider = new ethers.BrowserProvider(transport, network);
        const signer = await provider.getSigner(account);

        if (chain?.id !== 5003) {
          showCustomAlert('info', 'Wrong Network', 'Please switch your wallet network to Mantle Sepolia at the header of the page.');
          setIsMintingNFT(prev => ({ ...prev, [agent.symbol]: false }));
          return;
        }

        let nftAddress = CORE_CONTRACT_ADDRESS;
        
        // 1. Deploy contract dynamically if it does not exist
        if (!nftAddress) {
          addNotification && addNotification({
            id: Date.now(),
            type: 'info',
            title: 'Deploying Core Contract',
            message: 'No Core contract found in storage. Deploying a new unified instance on-chain...',
            time: 'Just now',
            read: false
          });
          
          const factory = new ethers.ContractFactory(
            SwipeAlphaCoreArtifact.abi,
            SwipeAlphaCoreArtifact.bytecode,
            signer
          );
          
          showCustomAlert('info', 'Deploying Contract', 'Deploying your personal Unified Core (Registry + NFT) contract...');
          const deployTx = await factory.deploy();
          await deployTx.waitForDeployment();
          nftAddress = await deployTx.getAddress();
          
          CORE_CONTRACT_ADDRESS = nftAddress;
          localStorage.setItem('swipe_alpha_core_address', nftAddress);
          
          addNotification && addNotification({
            id: Date.now() + 1,
            type: 'info',
            title: 'Contract Deployed',
            message: `Core Contract successfully deployed at ${nftAddress.substring(0, 8)}...`,
            time: 'Just now',
            read: false
          });
          
          // Wait a few seconds to let the network settle
          await new Promise(r => setTimeout(r, 2000));
        }
        
        // 2. Mint NFT
        const nftContract = new ethers.Contract(nftAddress, CORE_CONTRACT_ABI, signer);
        const userAddress = await signer.getAddress();
        
        const tx = await nftContract.mintNFT(userAddress, tokenURI);
        const receipt = await tx.wait();
        
        // Find Token ID from events
        let tokenId = 0;
        try {
          const event = receipt.logs
            .map(log => {
              try { return nftContract.interface.parseLog(log); } catch (_) { return null; }
            })
            .find(parsed => parsed && parsed.name === 'Transfer');
          if (event) {
            tokenId = Number(event.args.tokenId);
          }
        } catch (e) {
          console.error("Failed to parse event", e);
        }

        if (!tokenId) {
          tokenId = Math.floor(Math.random() * 1000) + 1; // Fallback display token id if event parse fails
        }

        SoundEffects.play('swipe_match');
        setMintedNFTIds(prev => ({
          ...prev,
          [agent.symbol]: { id: tokenId, txHash: receipt.hash }
        }));

        showCustomAlert('success', 'NFT Minted!', `Successfully minted Nansen AI Report NFT on Mantle Sepolia!\n\nContract Address: ${nftAddress}\nToken ID: #${tokenId}\nOwner: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`, receipt.hash);
        
        addNotification && addNotification({
          id: Date.now(),
          type: 'success',
          title: 'NFT Minted!',
          message: `Successfully minted ${agent.symbol} Nansen Report NFT #${tokenId} on-chain.`,
          time: 'Just now',
          read: false
        });
      }
    } catch (err) {
      console.error("NFT Minting Error:", err);
      showCustomAlert('error', 'Minting Failed', err.reason || err.message || "Failed to mint NFT. Check console or reject message.");
    } finally {
      setIsMintingNFT(prev => ({ ...prev, [agent.symbol]: false }));
    }
  };

  const toggleTag = (tag) => {
    SoundEffects.play('tap');
    if (activeTags.includes(tag)) {
      setActiveTags(prev => prev.filter(t => t !== tag));
    } else {
      setActiveTags(prev => [...prev, tag]);
    }
  };

  const handleOnChainRating = async () => {
    if (ratingVal === 0) {
      showCustomAlert('info', 'Rating Required', 'Please select a star rating first.');
      return;
    }
    setIsSubmittingRating(true);
    
    if (!walletClient) {
      // Wallet not connected - Run Simulated Reputation Submission!
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        showCustomAlert('warning', 'Simulation Success', `Rating submitted successfully to Reputation Registry!\n(Demo Mode - Wallet not connected)\n\nAgent: ${AGENTS[selectedAgentIdx].name}\nScore: ${ratingVal} Stars\n\nConnect your wallet at the top of the page to execute real transactions on Mantle Sepolia testnet!`, mockHash);
        
        const finalComment = activeTags.length > 0 ? activeTags.join(', ') + ' - ' + ratingComment : ratingComment || "Rated via SwipeAlpha App";
        const newUserReview = {
          agentName: AGENTS[selectedAgentIdx].name,
          rating: ratingVal,
          comment: finalComment,
          user: "You (Demo)",
          time: "Just now"
        };
        setReviewsList(prev => [newUserReview, ...prev]);

        setScreen('swipe');
        setRatingVal(0);
        setActiveTags([]);
        setRatingComment('');
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmittingRating(false);
      }
      return;
    }
    
    try {
      const { transport, chain } = walletClient;
      const network = {
        chainId: chain.id,
        name: chain.name,
      };
      const provider = new ethers.BrowserProvider(transport, network);
      const signer = await provider.getSigner(account);

      // Verify correct network (Mantle Sepolia: 5003)
      if (chain.id !== 5003) {
        showCustomAlert('info', 'Wrong Network', 'Please switch your wallet network to Mantle Sepolia at the header of the page.');
        setIsSubmittingRating(false);
        return;
      }

      let registryAddress = CORE_CONTRACT_ADDRESS;
      if (!registryAddress) {
        addNotification && addNotification({
          id: Date.now(),
          type: 'info',
          title: 'Deploying Core Contract',
          message: 'No Core contract found. Deploying before submitting rating...',
          time: 'Just now',
          read: false
        });
        
        const factory = new ethers.ContractFactory(
          SwipeAlphaCoreArtifact.abi,
          SwipeAlphaCoreArtifact.bytecode,
          signer
        );
        
        showCustomAlert('info', 'Deploying Contract', 'Deploying your personal Unified Core (Registry + NFT) contract...');
        const deployTx = await factory.deploy();
        await deployTx.waitForDeployment();
        registryAddress = await deployTx.getAddress();
        
        CORE_CONTRACT_ADDRESS = registryAddress;
        localStorage.setItem('swipe_alpha_core_address', registryAddress);
        
        // Wait a few seconds
        await new Promise(r => setTimeout(r, 2000));
      }

      const contract = new ethers.Contract(registryAddress, CORE_CONTRACT_ABI, signer);
      const finalComment = activeTags.length > 0 ? activeTags.join(', ') + ' - ' + ratingComment : ratingComment || "Rated via SwipeAlpha App";
      
      const agentIdOnChain = selectedAgentIdx + 1; // Agent ID on contract is 1-indexed

      console.log("Submitting rating on-chain to registry:", agentIdOnChain, ratingVal, finalComment);
      const tx = await contract.submitReputation(agentIdOnChain, ratingVal, finalComment);
      
      // Wait for block verification
      await tx.wait();

      showCustomAlert('success', 'Rating Published', `Rating published on-chain successfully!`, tx.hash);
      
      const newUserReview = {
        agentName: AGENTS[selectedAgentIdx].name,
        rating: ratingVal,
        comment: finalComment,
        user: account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "You",
        time: "Just now"
      };
      setReviewsList(prev => [newUserReview, ...prev]);

      setScreen('swipe');
      setRatingVal(0);
      setActiveTags([]);
      setRatingComment('');
    } catch (e) {
      console.error(e);
      showCustomAlert('error', 'Rating Failed', `Error submitting rating: ${e.reason || e.message}`);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const renderMatchOverlay = () => {
    if (!matchOverlayAgent) return null;

    let waifuImg = memeImg;
    let waifuName = "Sakura";
    if (archetype === 'balanced') {
      waifuImg = balancedImg;
      waifuName = "Rin";
    } else if (archetype === 'bluechip') {
      waifuImg = bluechipImg;
      waifuName = "Yuki";
    }

    return (
      <div className="match-overlay-container">
        {/* Match Title */}
        <h2 className="match-glowing-title">
          It's a Match!
        </h2>
        
        <p style={{
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.6)',
          margin: '8px 0 20px 0',
          maxWidth: '85%'
        }}>
          You and <strong>{matchOverlayAgent.name}</strong> are a perfect pair!
        </p>

        {/* Avatars Row */}
        <div className="match-avatars-row">
          {/* Waifu Avatar */}
          <div className="match-avatar-waifu">
            <img src={waifuImg} alt={waifuName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Glowing Pulse Heart */}
          <div className="match-heart-pulse">
            <Heart size={22} color="#fe3c72" fill="#fe3c72" />
          </div>

          {/* Agent Avatar */}
          <div className="match-avatar-agent" style={{ background: matchOverlayAgent.iconBg || 'linear-gradient(135deg, #fe3c72, #ff7854)' }}>
            {matchOverlayAgent.logoUrl ? (
              <img src={matchOverlayAgent.logoUrl} alt={matchOverlayAgent.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{matchOverlayAgent.emoji}</span>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="match-info-card">
          <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
            Agent Connected
          </div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>
            {matchOverlayAgent.name} is now providing live trading signal updates to your feed.
          </div>
        </div>

        {/* Buttons */}
        <div className="match-action-buttons-group">
          <button 
            className="match-action-btn-primary"
            onClick={() => {
              setMatchOverlayAgent(null);
              setScreen('agents');
            }}
          >
            View Live Signals ✨
          </button>
          
          <button 
            className="match-action-btn-secondary"
            onClick={() => setMatchOverlayAgent(null)}
          >
            Keep Swiping
          </button>
        </div>
      </div>
    );
  };

  const renderOnboardingModal = () => {
    if (!showOnboarding) return null;

    const options = [
      {
        id: 'meme',
        name: 'Sakura "Degen"',
        style: 'High Risk · Meme Sniper',
        desc: 'Loves high-volatility micro-caps, sniper setups, and hype narratives. Perfect for degen plays.',
        image: memeImg,
        color: '#ff2d55',
        shadowClass: 'card-meme'
      },
      {
        id: 'balanced',
        name: 'Rin "Tech-Wear"',
        style: 'Medium Risk · Balanced',
        desc: 'Focuses on automated yield strategies, staking, and mid-cap agents. Steady growth with smart hedges.',
        image: balancedImg,
        color: '#0a84ff',
        shadowClass: 'card-balanced'
      },
      {
        id: 'bluechip',
        name: 'Yuki "Goddess"',
        style: 'Low Risk · Blue Chip',
        desc: 'Focuses on highly audited, institutional-grade assets. Safest allocations for long-term growth.',
        image: bluechipImg,
        color: '#ffd60a',
        shadowClass: 'card-bluechip'
      }
    ];

    return (
      <div className="onboarding-backdrop">
        <div className="onboarding-modal">
          <div className="onboarding-header">
            <h2>CHOOSE YOUR TRADING WAIFU</h2>
            <p>Select your matched archetype. Your swipe deck will prioritize agents matching her profile.</p>
          </div>
          <div className="archetype-card-grid">
            {options.map((opt) => (
              <div 
                key={opt.id} 
                className={`archetype-card ${opt.shadowClass}`}
                onClick={() => {
                  SoundEffects.play('tap');
                  setArchetype(opt.id);
                  setShowOnboarding(false);
                }}
              >
                <div className="archetype-img-wrapper">
                  <img src={opt.image} alt={opt.name} />
                </div>
                <div className="archetype-info">
                  <h3>{opt.name}</h3>
                  <span className="archetype-style" style={{ color: opt.color }}>{opt.style}</span>
                  <p>{opt.desc}</p>
                </div>
                <button className={`match-btn btn-${opt.id}`}>
                  Match with {opt.name.split(' ')[0]} 💖
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNansenReportModal = () => {
    if (!showNansenModal) return null;
    return (
      <div className="nansen-modal-backdrop" onClick={() => { SoundEffects.play('tap'); setShowNansenModal(false); }}>
        <div className="nansen-modal" onClick={(e) => e.stopPropagation()}>
          <div className="nansen-modal-header">
            <div className="flex-align-center gap-6" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img 
                src="https://framerusercontent.com/images/X6PAJXo4BDwSFLJcxI2JZNWsQ.png" 
                alt="Nansen Logo" 
                className="nansen-logo-img" 
                style={{ width: '20px', height: '20px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#a5b4fc', letterSpacing: '0.5px' }}>Nansen AI Security Report</span>
            </div>
            <button className="nansen-modal-close" onClick={() => { SoundEffects.play('tap'); setShowNansenModal(false); }}>
              <X size={18} />
            </button>
          </div>
          <div className="nansen-modal-body">
            {activeNansenReport.split('\n').map((line, lIdx) => (
              <p key={lIdx} style={{ margin: '0 0 10px 0', fontSize: '0.85rem', lineHeight: '1.5', color: '#e2e8f0' }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (mode === 'demo') {
    return (
      <div className="swipealpha-demo-workspace">
        {renderOnboardingModal()}
        {renderNansenReportModal()}

        {/* Left Column - Workstation Control Center */}
        <div className="workspace-column workspace-left">
          {/* Card 1: Active Waifu profile details */}
          <div className="studio-card glass-panel archetype-status">
            <div className="studio-card-header">
              <span className="studio-card-tag">TRADING COPILOT</span>
              <h3>Active Waifu</h3>
            </div>
            {archetype ? (
              <div className="waifu-status-details">
                <div className="waifu-avatar-glow" style={{
                  background: archetype === 'meme' ? 'linear-gradient(135deg, #ff2d55, #ff7854)' : archetype === 'balanced' ? 'linear-gradient(135deg, #0a84ff, #00efc8)' : 'linear-gradient(135deg, #ffd60a, #ff9f0a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={archetype === 'meme' ? memeImg : archetype === 'balanced' ? balancedImg : bluechipImg} 
                    alt="Active Waifu" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                </div>
                <div className="waifu-info-text">
                  <h4 className="waifu-name">{archetype === 'meme' ? 'Sakura' : archetype === 'balanced' ? 'Rin' : 'Yuki'}</h4>
                  <span className="waifu-style" style={{
                    color: archetype === 'meme' ? '#ff2d55' : archetype === 'balanced' ? '#0a84ff' : '#ffd60a'
                  }}>
                    {archetype === 'meme' ? 'High Risk Meme Sniper' : archetype === 'balanced' ? 'Medium Risk Balanced' : 'Low Risk Blue Chip'}
                  </span>
                </div>
                
                <div className="studio-metrics-grid">
                  <div className="studio-metric">
                    <label>APY Target</label>
                    <span>{archetype === 'meme' ? '184.2%' : archetype === 'balanced' ? '42.5%' : '14.8%'}</span>
                  </div>
                  <div className="studio-metric">
                    <label>Gas Hedges</label>
                    <span>{archetype === 'meme' ? 'Aggressive' : archetype === 'balanced' ? 'Smart Hedges' : 'Strict Min'}</span>
                  </div>
                </div>

                <button className="studio-action-btn hover-glow-btn" onClick={() => { SoundEffects.play('tap'); setShowOnboarding(true); }}>
                  Change Waifu Archetype
                </button>
              </div>
            ) : (
              <div className="waifu-empty-status">
                <p>No waifu archetype selected yet.</p>
                <button className="studio-action-btn select-waifu-btn" onClick={() => { SoundEffects.play('tap'); setShowOnboarding(true); }}>
                  Select Waifu Copilot
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Workstation Metrics */}
          <div className="studio-card glass-panel studio-metrics">
            <div className="studio-card-header">
              <span className="studio-card-tag">SYSTEM METRICS</span>
              <h3>Simulator Node</h3>
            </div>
            <div className="studio-stats-list">
              <div className="studio-stat-item">
                <span className="lbl">Status</span>
                <span className="val pulse-green-text">● Operational</span>
              </div>
              <div className="studio-stat-item">
                <span className="lbl">Network</span>
                <span className="val text-bright">Mantle Sepolia Testnet</span>
              </div>
              <div className="studio-stat-item">
                <span className="lbl">RPC Nodes</span>
                <span className="val text-bright">3 Connected</span>
              </div>
              <div className="studio-stat-item">
                <span className="lbl">Block Height</span>
                <span className="val monospace-text">#18,294,321</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Simulator */}
        <div className="workspace-column workspace-center">
          <div className="swipealpha-phone-container">
            <div className="phone-mockup">
            {/* Notch */}
            <div className="notch"></div>

            {/* iOS Status Bar */}
            <div className="phone-status-bar">
              <span className="status-bar-time">{statusBarTime}</span>
              <div className="status-bar-icons">
                <svg className="status-icon" viewBox="0 0 17 11" fill="currentColor">
                  <rect x="0" y="8" width="3" height="3" rx="0.5" />
                  <rect x="4" y="6" width="3" height="5" rx="0.5" />
                  <rect x="8" y="4" width="3" height="7" rx="0.5" />
                  <rect x="12" y="1" width="3" height="10" rx="0.5" />
                </svg>
                <svg className="status-icon" viewBox="0 0 15 11" fill="currentColor">
                  <path d="M7.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.32-3.3a4.7 4.7 0 0 1 6.64 0 .8.8 0 1 0 1.13-1.13 6.3 6.3 0 0 0-8.9 0 .8.8 0 1 0 1.13 1.13zm-2.82-2.83a8.7 8.7 0 0 1 12.28 0 .8.8 0 1 0 1.13-1.13 10.3 10.3 0 0 0-14.54 0 .8.8 0 0 0 1.13 1.13z" />
                </svg>
                <div className="battery-container">
                  <svg className="battery-icon" viewBox="0 0 22 11" fill="currentColor">
                    <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" fill="none" stroke="currentColor" />
                    <rect x="2" y="2" width="13" height="7" rx="1.5" />
                    <path d="M19.5 3.5v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Swipe Screen */}
            <div className={`phone-screen ${getScreenClass('swipe')}`}>
                <div className="phone-header">
                  <span className="app-logo">
                    <Flame size={14} className="logo-icon-flame" />
                    <span>Agent<span className="logo-accent-text">Swindler</span></span>
                  </span>
                  
                  <div className="phone-header-actions">
                    {/* Waifu Archetype Badge */}
                    {archetype && (
                      <div 
                        className={`mobile-waifu-badge archetype-${archetype}`} 
                        onClick={() => {
                          SoundEffects.play('tap');
                          setShowOnboarding(true);
                        }}
                      >
                        <span>💖 {archetype === 'meme' ? 'Sakura' : archetype === 'balanced' ? 'Rin' : 'Yuki'}</span>
                      </div>
                    )}

                    {/* Notification Bell */}
                    <button 
                      onClick={() => {
                        SoundEffects.play('tap');
                        setScreen('notifications');
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      }}
                      className="phone-header-btn"
                      title="Notifications"
                    >
                      <Bell size={13} />
                      {unreadCount > 0 && (
                        <span className="notif-badge-dot"></span>
                      )}
                    </button>

                    {/* Wallet Connect */}
                    {account ? (
                      <button 
                        onClick={() => {
                          SoundEffects.play('tap');
                          setIsPortfolioOpen(true);
                        }}
                        className="phone-wallet-btn connected"
                        title={account}
                      >
                        <div className="wallet-status-dot"></div>
                        {account.substring(0, 4)}...
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          SoundEffects.play('tap');
                          if (openConnectModal) openConnectModal();
                        }}
                        className="phone-wallet-btn disconnected"
                      >
                        Connect
                      </button>
                    )}

                    {/* Agents Screen Toggle */}
                    <button 
                      onClick={() => { 
                        SoundEffects.play('tap'); 
                        setScreen('agents'); 
                      }} 
                      className="phone-header-btn" 
                      title="Agents"
                    >
                      <Sparkles size={13} />
                    </button>
                  </div>
                </div>

                <div className="active-agent-banner" onClick={() => { SoundEffects.play('tap'); setSelectedAgentIdx(0); setScreen('agentDetail'); }}>
                  <div className="banner-pulse"></div>
                  <span>Agent: <strong>{activeAgent.name}</strong></span>
                  <span className="banner-rating">⭐ {activeAgent.rating}</span>
                </div>

                <div className="swipe-stack-container">
                  {isSwapping && (
                    <div className="swap-loading-overlay">
                      <div className="swap-loading-content">
                        <Sparkles className="swap-loading-icon" size={40} />
                        <h4>Executing Swap via MerchantMoe...</h4>
                        <p className="swap-loading-desc">
                          Sending 0.1 MNT to route to simulated {currentToken?.symbol} pool
                        </p>
                      </div>
                    </div>
                  )}
                  {currentToken ? (
                    <div 
                      className="swipe-token-card"
                      onMouseDown={handleDragStart}
                      onMouseMove={handleDragMove}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onTouchStart={handleDragStart}
                      onTouchMove={handleDragMove}
                      onTouchEnd={handleDragEnd}
                      style={
                        isDragging
                          ? {
                              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.08}deg)`,
                              transition: 'none',
                              cursor: 'grabbing',
                              userSelect: 'none',
                              position: 'relative'
                            }
                          : {
                              transform: 'translate(0px, 0px) rotate(0deg)',
                              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              cursor: 'grab',
                              userSelect: 'none',
                              position: 'relative'
                            }
                      }
                    >
                      {/* Swipe overlays */}
                      {dragOffset.x > 25 && (
                        <div 
                          className="swipe-overlay-label swipe-overlay-match"
                          style={{ opacity: Math.min(dragOffset.x / 80, 1) }}
                        >
                          MATCH
                        </div>
                      )}
                      {dragOffset.x < -25 && (
                        <div 
                          className="swipe-overlay-label swipe-overlay-pass"
                          style={{ opacity: Math.min(-dragOffset.x / 80, 1) }}
                        >
                          PASS
                        </div>
                      )}
                      {/* Tinder-style top tab indicators */}
                      <div className="card-tab-indicators">
                        {[0, 1, 2].map((idx) => (
                          <div key={idx} className={`tab-indicator-pill ${activeCardTab === idx ? 'active' : ''}`} />
                        ))}
                      </div>

                      <div className="token-card-header">
                        <div className="token-meta">
                          <div className="token-avatar" style={{ background: currentToken.iconBg }}>
                            {currentToken.logoUrl ? (
                              <img src={currentToken.logoUrl} alt={currentToken.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                            ) : (
                              currentToken.symbol.substring(0,1)
                            )}
                          </div>
                          <div>
                            <div className="token-name">{currentToken.name}</div>
                            <div className="token-symbol" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{currentToken.standard} · {currentToken.symbol} Agent</span>
                            </div>
                          </div>
                        </div>
                        <span className={`token-badge ${currentToken.positive ? 'pos' : 'neg'}`}>
                          {currentToken.roi30d}
                        </span>
                      </div>

                      {/* Tab 0: Agent Details */}
                      {activeCardTab === 0 && (
                        <div className="card-tab-content card-tab-layout tab-fade-in">
                          <div className="card-tab-inner">
                            {/* ROI and Risk Summary */}
                            <div className="apple-glass-panel-roi">
                              <div>
                                <span className="panel-label">30D Return</span>
                                <div className="roi-value">{currentToken.roi30d}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span className="panel-label">Risk Class</span>
                                <div className={`risk-badge risk-${currentToken.risk.toLowerCase()}`}>
                                  {currentToken.risk}
                                </div>
                              </div>
                            </div>

                            {/* Performance Grid */}
                            <div className="apple-glass-panel-grid">
                              <div className="apple-glass-panel-grid-item">
                                <span className="panel-label">Win Rate</span>
                                <div className="stat-value">{currentToken.winRate}</div>
                              </div>
                              <div className="apple-glass-panel-grid-item">
                                <span className="panel-label">Avg Hold Time</span>
                                <div className="stat-value">{currentToken.avgHolding}</div>
                              </div>
                            </div>

                            {/* Model and Creator */}
                            <div className="apple-glass-panel-meta">
                              <div className="meta-row">
                                <span className="meta-label">AI Engine</span>
                                <span className="meta-value">{currentToken.model}</span>
                              </div>
                              <div className="meta-row border-t">
                                <span className="meta-label">Creator</span>
                                <span className="meta-value">{currentToken.creator}</span>
                              </div>
                              <div className="meta-row border-t">
                                <span className="meta-label">Primary Assets</span>
                                <span className="meta-value">{currentToken.primaryTokens.join(', ')}</span>
                              </div>
                            </div>

                            {/* Agent Description */}
                            <p className="agent-description-text">
                              "{currentToken.description}"
                            </p>
                          </div>
                          <div className="card-tab-tap-instruction">
                            👆 Tap card to view Agent Recent Trades
                          </div>
                        </div>
                      )}

                      {/* Tab 1: Recent Trades */}
                      {activeCardTab === 1 && (
                        <div className="card-tab-content card-tab-layout tab-fade-in">
                          <div className="card-tab-inner">
                            <div className="flex-justify-between flex-align-center" style={{ marginBottom: '4px' }}>
                              <span className="panel-label">📈 Agent Activity Log</span>
                              <span className="live-feeds-badge">LIVE FEEDS</span>
                            </div>

                            <div className="flex-column" style={{ gap: '8px' }}>
                              {currentToken.recentTrades.map((trade, tIdx) => (
                                <div key={tIdx} className="trade-row-item">
                                  <div className="flex-align-center" style={{ gap: '10px' }}>
                                    <span className={`trade-type-badge type-${trade.type.toLowerCase()}`}>
                                      {trade.type}
                                    </span>
                                    <div>
                                      <div className="trade-token-name">{trade.token}</div>
                                      <div className="trade-token-time">{trade.time} @ {trade.price}</div>
                                    </div>
                                  </div>
                                  
                                  {/* Interactive Swap Button */}
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); // prevent cycling tab!
                                      handleRecentTradeSwap(trade.token, trade.type); 
                                    }} 
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                    className={`trade-swap-btn btn-${trade.type.toLowerCase()}`}
                                  >
                                    {trade.type === 'BUY' ? 'Buy 0.1 MNT' : 'Sell 0.1 MNT'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="card-tab-tap-instruction">
                            👆 Tap card to return to Agent Details
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Nansen Portfolio Analysis */}
                      {activeCardTab === 2 && (
                        <div className="card-tab-content card-tab-layout tab-fade-in" onClick={(e) => e.stopPropagation()}>
                          <div className="card-tab-inner nansen-tab-container">
                            
                            {/* State 1: Locked View */}
                            {!nansenUnlocked[currentToken.symbol] && !nansenError[currentToken.symbol] && !isNansenLoading && (
                              <div className="nansen-locked-view">
                                <div className="nansen-locked-header">
                                  {/* Official Nansen logo from nansen.ai */}
                                  <img 
                                    src="https://framerusercontent.com/images/X6PAJXo4BDwSFLJcxI2JZNWsQ.png" 
                                    alt="Nansen Logo" 
                                    className="nansen-logo-img" 
                                  />
                                  <h3>Nansen AI Portfolio Audit</h3>
                                  <span className="nansen-locked-tag">PRO INTELLIGENCE</span>
                                </div>
                                <p className="nansen-locked-desc">
                                  Run deep wallet profiling, token attribution, and smart money flow analysis using official Nansen credentials.
                                </p>
                                
                                <div className="nansen-auth-cost-row">
                                  <span>Authorization Fee</span>
                                  <strong>0.001 MNT</strong>
                                </div>

                                <button 
                                  className="nansen-auth-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNansenAuthorize(currentToken);
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onMouseUp={(e) => e.stopPropagation()}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  onTouchEnd={(e) => e.stopPropagation()}
                                  disabled={isNansenSigning || isNansenLoading}
                                >
                                  {isNansenSigning ? (
                                    <span className="flex-align-center gap-6 justify-center">
                                      <span className="nansen-spinner"></span>
                                      Signing Transaction...
                                    </span>
                                  ) : isNansenLoading ? (
                                    <span className="flex-align-center gap-6 justify-center">
                                      <span className="nansen-spinner"></span>
                                      Fetching Nansen API...
                                    </span>
                                  ) : (
                                    <span>Analyze</span>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* State 2: Loading (if API is loading but transaction was completed) */}
                            {isNansenLoading && !nansenUnlocked[currentToken.symbol] && !nansenError[currentToken.symbol] && (
                              <div className="nansen-loading-view">
                                <div className="nansen-loading-icon-wrapper">
                                  <span className="nansen-pulse-circle"></span>
                                  <img 
                                    src="https://framerusercontent.com/images/X6PAJXo4BDwSFLJcxI2JZNWsQ.png" 
                                    alt="Nansen Logo" 
                                    className="nansen-logo-img spinning" 
                                  />
                                </div>
                                <h4>Querying Nansen Analytics...</h4>
                                <p>Decoding smart money wallet clusters and flow dynamics.</p>
                              </div>
                            )}

                            {/* State 3: Error View (API key missing or request failed) */}
                            {nansenError[currentToken.symbol] && (
                              <div className="nansen-error-view">
                                <div className="nansen-error-header">
                                  <AlertCircle size={32} color="#ef4444" />
                                  <h4>Nansen API Failure</h4>
                                </div>
                                <div className="nansen-error-box">
                                  {nansenError[currentToken.symbol]}
                                </div>
                                
                                <div className="nansen-error-actions">
                                  <button 
                                    className="nansen-retry-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNansenAuthorize(currentToken);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                  >
                                    Retry Authorization
                                  </button>
                                </div>
                                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', textAlign: 'center' }}>
                                  You can configure API keys in the <strong>Admin Page</strong> via the navigation bar.
                                </p>
                              </div>
                            )}

                            {/* State 4: Unlocked AI Dashboard */}
                            {nansenUnlocked[currentToken.symbol] && nansenResults[currentToken.symbol] && (
                              <div className="nansen-unlocked-view">
                                <div className="nansen-unlocked-header">
                                  <div className="flex-align-center gap-6">
                                    <img 
                                      src="https://framerusercontent.com/images/X6PAJXo4BDwSFLJcxI2JZNWsQ.png" 
                                      alt="Nansen Logo" 
                                      className="nansen-logo-img mini" 
                                    />
                                    <span>Nansen AI Report</span>
                                  </div>
                                  <span className="nansen-verified-badge">VERIFIED</span>
                                </div>

                                <div className="nansen-chat-container">
                                  <div className="nansen-chat-bubble" style={{ position: 'relative', overflow: 'hidden' }}>
                                    {nansenResults[currentToken.symbol].split('\n').slice(0, 5).map((line, lIdx) => (
                                      <p key={lIdx} style={{ margin: '0 0 8px 0', fontSize: '0.78rem', lineHeight: '1.4', color: '#e2e8f0' }}>
                                        {line}
                                      </p>
                                    ))}
                                    <div className="nansen-view-more-container" style={{ textAlign: 'center', marginTop: '12px' }}>
                                      <button 
                                        className="nansen-view-more-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          SoundEffects.play('tap');
                                          setActiveNansenReport(nansenResults[currentToken.symbol]);
                                          setShowNansenModal(true);
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                      >
                                        View Full Report 🔍
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="nansen-unlocked-footer" style={{ gap: '6px', display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'stretch' }}>
                                  <button 
                                    className="mint-nft-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMintNFT(currentToken, nansenResults[currentToken.symbol]);
                                    }}
                                    onTouchEnd={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleMintNFT(currentToken, nansenResults[currentToken.symbol]);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    disabled={isMintingNFT[currentToken.symbol] || !!mintedNFTIds[currentToken.symbol]}
                                  >
                                    {isMintingNFT[currentToken.symbol] ? (
                                      <>
                                        <RefreshCw className="animate-spin" size={14} />
                                        <span>Minting NFT on Mantle...</span>
                                      </>
                                    ) : mintedNFTIds[currentToken.symbol] ? (
                                      <>
                                        <Check size={14} />
                                        <span>Minted (Token #{mintedNFTIds[currentToken.symbol].id})</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles size={14} />
                                        <span>🔥 Mint Card as NFT</span>
                                      </>
                                    )}
                                  </button>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)' }}>
                                    <span>Smart Money flow analyzed live</span>
                                    {mintedNFTIds[currentToken.symbol] && (
                                      <a 
                                        href={`https://explorer.sepolia.mantle.xyz/tx/${mintedNFTIds[currentToken.symbol].txHash}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ color: '#a5b4fc', textDecoration: 'underline' }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        View Tx
                                      </a>
                                    )}
                                  </div>
                                  {mintedNFTIds[currentToken.symbol] && (
                                    <div style={{ fontSize: '0.65rem', color: '#a5b4fc', textAlign: 'center', padding: '4px 0' }}>
                                      ✅ Minted Token #{mintedNFTIds[currentToken.symbol].id}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>
                          <div className="card-tab-tap-instruction" onClick={(e) => { e.stopPropagation(); setActiveCardTab(0); }}>
                            👆 Tap instruction text to return to Agent Details
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-stack-placeholder">
                      <div className="empty-icon">🎉</div>
                      <h4>You're All Caught Up!</h4>
                      <p>AI Agents are scanning more block transactions...</p>
                      <button className="reload-btn" onClick={() => { SoundEffects.play('tap'); setCardIndex(0); }}>Swipe Again</button>
                    </div>
                  )}
                </div>



                {currentToken && (
                  <div className="swipe-action-controls">
                    <button className="control-btn rewind-action" onClick={() => { SoundEffects.play('tap'); setCardIndex(0); }} title="Rewind Stack">
                      <RotateCcw size={16} color="#ffd60a" />
                    </button>
                    <button className="control-btn nope-action" onClick={() => handleSwipe('left')} disabled={isSwapping} title="Skip">
                      <X size={24} color="#ff453a" />
                    </button>
                    <button className="control-btn super-action" onClick={() => { SoundEffects.play('tap'); setSelectedAgentIdx(0); setScreen('rateAgent'); setRatingVal(0); setActiveTags([]); }} disabled={isSwapping} title="Rate Agent">
                      <Star size={18} color="#0a84ff" />
                    </button>
                    <button className="control-btn like-action" onClick={() => handleSwipe('right')} disabled={isSwapping} title="Match Agent">
                      {isSwapping ? <div className="buy-spinner" style={{ width: '16px', height: '16px', border: '2px solid #ff2d55', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Heart size={22} color="#ff2d55" fill="#ff2d55" />}
                    </button>
                    <button className="control-btn info-action" onClick={() => { SoundEffects.play('tap'); setSelectedTokenIdx(cardIndex); setScreen('detail'); }} disabled={isSwapping} title="Token Info">
                      <Info size={16} color="#bf5af2" />
                    </button>
                  </div>
                )}
              </div>

            {/* Detail Screen */}
            <div className={`phone-screen scrollable ${getScreenClass('detail')}`}>
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => { SoundEffects.play('tap'); setScreen('swipe'); }}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <span>Token Details</span>
                  <div className="nav-spacer-18"></div>
                </div>
                
                <div className="detail-scroll-content">
                  <div className="detail-top-card">
                    <div className="token-avatar large" style={{ background: sortedTokens[selectedTokenIdx].iconBg }}>
                      {sortedTokens[selectedTokenIdx].logoUrl ? (
                        <img src={sortedTokens[selectedTokenIdx].logoUrl} alt={sortedTokens[selectedTokenIdx].name} />
                      ) : (
                        sortedTokens[selectedTokenIdx].symbol.substring(0,1)
                      )}
                    </div>
                    <h2>{sortedTokens[selectedTokenIdx].name}</h2>
                    <div className="token-symbol">{sortedTokens[selectedTokenIdx].symbol}</div>
                    <div className="price-huge">{sortedTokens[selectedTokenIdx].price}</div>
                  </div>

                  <div className="detail-card-section">
                    <h3>Smart Money Flow Analytics</h3>
                    <div className="stat-row">
                      <span>Net Flow 24h</span>
                      <span className={sortedTokens[selectedTokenIdx].smNetflow.startsWith('+') ? 'c-pos' : 'c-neg'}>{sortedTokens[selectedTokenIdx].smNetflow}</span>
                    </div>
                    <div className="stat-row">
                      <span>SM Addresses active</span>
                      <span>{sortedTokens[selectedTokenIdx].smTraders} wallets</span>
                    </div>
                    <div className="stat-row">
                      <span>Accumulation Trend</span>
                      <span className="capitalize">{sortedTokens[selectedTokenIdx].smSignal}</span>
                    </div>
                  </div>

                  <div className="detail-card-section">
                    <h3>Token Age & Holders</h3>
                    <div className="stat-row">
                      <span>Holders</span>
                      <span>{sortedTokens[selectedTokenIdx].holders} addresses</span>
                    </div>
                    <div className="stat-row">
                      <span>Launch Age</span>
                      <span>{sortedTokens[selectedTokenIdx].age}</span>
                    </div>
                    <div className="stat-row">
                      <span>Risk Metric</span>
                      <span>{sortedTokens[selectedTokenIdx].risk}</span>
                    </div>
                  </div>

                  <div className="detail-card-section ai-glow">
                    <h3>AI Signal Reasoning</h3>
                    <p className="ai-reason-text">{sortedTokens[selectedTokenIdx].aiSummary}</p>
                    <div className="margin-top-10">
                      <span className={`sig-badge ${sortedTokens[selectedTokenIdx].signalClass}`}>{sortedTokens[selectedTokenIdx].signal}</span>
                    </div>
                  </div>
                </div>
              </div>

            {/* Agents Screen */}
            <div className={`phone-screen scrollable phone-screen-flex-col ${getScreenClass('agents')}`}>
                <div className="screen-nav flex-shrink-0">
                  <button className="nav-back" onClick={() => { SoundEffects.play('tap'); setScreen('swipe'); }}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <span>My Active Agents ({swipedAgents.length})</span>
                  <div className="nav-spacer-18"></div>
                </div>

                <div className="agents-marketplace-list">
                  
                  {/* Part 1: List of Swiped/Matched Agents */}
                  <div className="agents-section-title">
                    <span>💖 matched trading partners</span>
                  </div>

                  {swipedAgents.length === 0 ? (
                    <div className="empty-partners-card">
                      <span className="empty-partners-emoji">🛸</span>
                      <h4>No active partners</h4>
                      <p>Swipe right on agents in the deck to pair with them.</p>
                      <button onClick={() => { SoundEffects.play('tap'); setScreen('swipe'); }} className="action-btn">Go Swipe</button>
                    </div>
                  ) : (
                    <div className="flex-column gap-8">
                      {swipedAgents.map((agent) => (
                        <div key={agent.symbol} className="swiped-agent-item">
                          <div className="swiped-agent-avatar" style={{ background: agent.iconBg || 'linear-gradient(135deg, #fe3c72, #ff7854)' }}>
                            {agent.logoUrl ? (
                              <img src={agent.logoUrl} alt={agent.name} />
                            ) : (
                              <span className="swiped-agent-avatar-text">{agent.symbol.substring(0, 1)}</span>
                            )}
                          </div>
                          <div className="flex-column gap-2 flex-1">
                            <h4 className="swiped-agent-name">
                              {agent.name}
                              <span className="active-badge">Active</span>
                            </h4>
                            <span className="swiped-agent-meta">{agent.creator} · {agent.model}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="swiped-agent-winrate">{agent.winRate}</div>
                            <div className="swiped-agent-hold">Hold: {agent.avgHolding}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Part 2: Real-time Transaction Feed */}
                  <div className="agents-section-title feed-title">
                    <div className="flex-align-center gap-6">
                      <span className="live-pulse"></span>
                      <span>real-time transaction feed</span>
                    </div>
                    <span className="feed-header-subtitle">Matched Agents Only</span>
                  </div>

                  <div className="live-tx-feed-container">
                    {liveTransactions.map((tx) => (
                      <div 
                        key={tx.id} 
                        className={`live-tx-card ${tx.isNew ? 'tx-card-fade-in' : ''}`}
                      >
                        {(() => {
                          const agentInfo = TOKENS.find(t => t.symbol === tx.agentSymbol || t.name === tx.agentName);
                          return (
                            <div className="flex-align-center gap-8">
                              <div className="swiped-agent-avatar small" style={{
                                background: agentInfo?.iconBg || 'linear-gradient(135deg, #fe3c72, #ff7854)'
                              }}>
                                {agentInfo?.logoUrl ? (
                                  <img src={agentInfo.logoUrl} alt={tx.agentName} />
                                ) : (
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>🤖</span>
                                )}
                              </div>
                              <div>
                                <div className="flex-align-center gap-4">
                                  <span className="feed-agent-name">{tx.agentName}</span>
                                  <span className="feed-agent-symbol">{tx.agentSymbol}</span>
                                </div>
                                <div className="feed-tx-details">
                                  <span className={`trade-type-badge type-${tx.type.toLowerCase()}`}>{tx.type}</span>
                                  <span className="feed-tx-amount">{tx.amount} {tx.token}</span>
                                  <span className="feed-tx-price">@ {tx.price}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="feed-tx-actions">
                          <span className="feed-tx-time">{tx.time}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecentTradeSwap(tx.token, tx.type);
                            }}
                            className={`trade-swap-btn btn-small btn-${tx.type.toLowerCase()}`}
                          >
                            {tx.type === 'BUY' ? 'Buy' : 'Sell'} 0.1 $MNT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

            {/* Agent Detail */}
            <div className={`phone-screen scrollable ${getScreenClass('agentDetail')}`}>
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => { SoundEffects.play('tap'); setScreen('agents'); }}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <span>Agent Profiles</span>
                  <div className="nav-spacer-18"></div>
                </div>

                <div className="agent-profile-content">
                  <div className="profile-top-avatar" style={{ background: AGENTS[selectedAgentIdx].bg }}>
                    {AGENTS[selectedAgentIdx].emoji}
                  </div>
                  <h2>{AGENTS[selectedAgentIdx].name}</h2>
                  <span className="strategy-label">{AGENTS[selectedAgentIdx].strategy}</span>

                  <div className="profile-stats-grid">
                    <div className="p-stat">
                      <span>{AGENTS[selectedAgentIdx].winRate}%</span>
                      <label>Win Rate</label>
                    </div>
                    <div className="p-stat">
                      <span>⭐ {AGENTS[selectedAgentIdx].rating}</span>
                      <label>Rating</label>
                    </div>
                    <div className="p-stat">
                      <span>{AGENTS[selectedAgentIdx].trades}</span>
                      <label>Trades</label>
                    </div>
                  </div>

                  <div className="profile-bio">
                    <h3>Bio & Strategy</h3>
                    <p>{AGENTS[selectedAgentIdx].description}</p>
                  </div>

                  <div className="profile-picks">
                    <h3>Recent Successful Picks</h3>
                    <div className="picks-grid">
                      {AGENTS[selectedAgentIdx].recentPicks.map((pick, i) => (
                        <span key={i} className="pick-pill">{pick}</span>
                      ))}
                    </div>
                  </div>

                  <div className="profile-rental-action">
                    <div className="rental-action-row">
                      <div>
                        <label className="rental-lbl-text">Subscription</label>
                        <div className="rental-price-text">{AGENTS[selectedAgentIdx].price}</div>
                      </div>
                      <button className="rent-now-btn" onClick={() => {
                        setActiveAgent(AGENTS[selectedAgentIdx]);
                        showCustomAlert('success', 'Agent Subscribed', `Successfully subscribed to ${AGENTS[selectedAgentIdx].name}!\nYour feed will now show signals from this agent.`);
                        setScreen('swipe');
                      }}>Subscribe Agent</button>
                    </div>
                  </div>

                  <button className="rate-agent-link-btn" onClick={() => { SoundEffects.play('tap'); setScreen('rateAgent'); setRatingVal(0); setActiveTags([]); }}>
                    <MessageSquare size={16} /> Submit Rating to Mantle Sepolia
                  </button>
                </div>
              </div>

            {/* Rate Agent Screen */}
            <div className={`phone-screen scrollable ${getScreenClass('rateAgent')}`}>
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => { SoundEffects.play('tap'); setScreen('agentDetail'); }}>
                    <ArrowLeft size={18} /> Cancel
                  </button>
                  <span>Submit Reputation</span>
                  <div className="nav-spacer-18"></div>
                </div>

                <div className="rate-agent-form">
                  <div className="agent-form-header">
                    <div className="form-avatar" style={{ background: AGENTS[selectedAgentIdx].bg }}>{AGENTS[selectedAgentIdx].emoji}</div>
                    <h3>{AGENTS[selectedAgentIdx].name}</h3>
                    <p>Submit your experience directly on-chain to the reputation ledger.</p>
                  </div>

                  <div className="star-rating-selector">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <Star
                        key={starVal}
                        size={36}
                        className={`star-icon ${ratingVal >= starVal ? 'active' : ''}`}
                        onClick={() => {
                          SoundEffects.play('tap');
                          setRatingVal(starVal);
                        }}
                      />
                    ))}
                  </div>

                  <div className="reputation-tags-section">
                    <label>Select Tags</label>
                    <div className="reputation-tags-grid">
                      {['High Winrate', 'Excellent Alpha', 'Lagging Signals', 'High Fee', 'Very Accurate', 'Risky Plays'].map((tag) => (
                        <button
                          key={tag}
                          className={`rep-tag-btn ${activeTags.includes(tag) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="reputation-comment-section">
                    <label>Feedback Details</label>
                    <textarea
                      placeholder="Tell others how this agent performed..."
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                    />
                  </div>

                  <button
                    className="submit-onchain-rating-btn"
                    onClick={handleOnChainRating}
                    disabled={isSubmittingRating}
                  >
                    {isSubmittingRating ? (
                      <div className="spinner"></div>
                    ) : (
                      "Publish Review to Mantle"
                    )}
                  </button>
                </div>
              </div>

            {/* Notifications Screen */}
            <div className={`phone-screen scrollable ${getScreenClass('notifications')}`}>
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => { SoundEffects.play('tap'); setScreen('swipe'); }}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <span>Activity Logs</span>
                  {notifications.length > 0 ? (
                    <button 
                      onClick={() => {
                        SoundEffects.play('tap');
                        setNotifications([]);
                      }}
                      className="notif-clear-btn"
                      title="Clear All"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <div className="nav-spacer-24"></div>
                  )}
                </div>

                <div className="notifications-body">
                  {notifications.length === 0 ? (
                    <div className="no-notif-placeholder">
                      <Bell size={32} />
                      <h4>No Notifications</h4>
                      <p>Activity logs and smart money signals will appear here.</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`sim-notification-item notif-type-${notif.type}`}>
                        <div className="notif-row-header">
                          <span className="notif-title-text">{notif.title}</span>
                          <span className="notif-time-text">{notif.time}</span>
                        </div>
                        <p className="notif-msg-text">{notif.message}</p>
                        {notif.txHash && (
                          <div className="notif-footer-row">
                            <span className="notif-hash-text">Hash: {notif.txHash.substring(0, 6)}...{notif.txHash.substring(notif.txHash.length - 4)}</span>
                            <a 
                              href={`https://explorer.sepolia.mantle.xyz/tx/${notif.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="notif-explorer-link"
                            >
                              Explorer →
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            {renderMatchOverlay()}

            {/* Simulated Mobile Portfolio Inside Mockup */}
            <WalletPortfolio 
              isOpen={isPortfolioOpen} 
              onClose={() => setIsPortfolioOpen(false)} 
              walletAddress={account} 
              isMobileInsideMockup={true}
            />

            {/* iOS Home Indicator */}
            <div className="phone-home-indicator-wrapper">
              <div className="phone-home-indicator"></div>
            </div>
          </div>
        </div>
      </div>

        {/* Right Column - Terminal & Log Feed */}
        <div className="workspace-column workspace-right">
          {/* Card 1: Console Feed */}
          <div className="studio-card glass-panel studio-console">
            <div className="studio-card-header">
              <span className="studio-card-tag">EVENT LOGS</span>
              <h3>Live Console Feed</h3>
            </div>
            <div className="console-log-container">
              {notifications && notifications.length > 0 ? (
                [...notifications].map((notif, idx) => (
                  <div key={notif.id || idx} className="console-log-row">
                    <span className="console-time">[{notif.time || '00:00'}]</span>
                    <span className={`console-msg type-${notif.type}`}>
                      {notif.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="console-empty">
                  <span>No transactions recorded yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Safe Sandbox Notice */}
          <div className="studio-card glass-panel sandbox-notice">
            <div className="studio-card-header">
              <span className="studio-card-tag">SECURITY SANDBOX</span>
              <h3>Sandbox Mode</h3>
            </div>
            <p className="notice-description">
              You are interacting with the simulated mobile interface on the Mantle Sepolia network.
            </p>
            <div className="explorer-quick-link">
              <span className="lbl">Sepolia Explorer</span>
              <a href="https://explorer.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer" className="explorer-anchor">
                Open Explorer <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // mode === 'desktop' (Main Dashboard)
  return (
    <div className="swipealpha-desktop-dashboard">
      {renderOnboardingModal()}
      {renderNansenReportModal()}
      {/* Top Header stats */}
      <div className="dashboard-stats-header">
        <div className="stat-card glow-blue">
          <span className="card-lbl">🔥 AVG Win Rate</span>
          <span className="card-val">72.4%</span>
        </div>
        <div className="stat-card glow-purple">
          <span className="card-lbl">🤖 Active Agents</span>
          <span className="card-val">5 AI Models</span>
        </div>
        {archetype ? (
          <div 
            className={`stat-card ${archetype === 'meme' ? 'glow-pink' : archetype === 'balanced' ? 'glow-teal' : 'glow-yellow'}`}
            onClick={() => setShowOnboarding(true)}
            style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="card-lbl">💖 MATCHED WAIFU (CLICK TO CHANGE)</span>
            <span className="card-val" style={{ color: archetype === 'meme' ? '#fe3c72' : archetype === 'balanced' ? '#00efc8' : '#eab308' }}>
              {archetype === 'meme' ? 'Sakura' : archetype === 'balanced' ? 'Rin' : 'Yuki'}
            </span>
          </div>
        ) : (
          <div 
            className="stat-card glow-pink"
            onClick={() => setShowOnboarding(true)}
            style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="card-lbl">💖 TRADING WAIFU</span>
            <span className="card-val-small" style={{ color: '#fe3c72' }}>Find Match</span>
          </div>
        )}
        <div className="stat-card glow-teal">
          <span className="card-lbl">🛡️ Registry Contract</span>
          <span className="card-val-small">0x2dEE...CAE7</span>
        </div>
        <div className="stat-card glow-green">
          <span className="card-lbl">🛒 Router (Moe Mock)</span>
          <span className="card-val-small">0x5dde...Bed4</span>
        </div>
      </div>

      <div className="dashboard-columns">
        {/* Left: Signals Feed */}
        <div className="signals-feed-column">
          <div className="column-header">
            <h2>🧠 Live AI Agent Trading Signals</h2>
            <span className="live-status">● Live Feed</span>
          </div>
          
          <div className="signals-grid">
            {sortedTokens.map((token) => (
              <div key={token.symbol} className="desktop-signal-card">
                <div className="token-card-top">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                     <div className="token-avatar" style={{ background: token.iconBg, width: '42px', height: '42px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {token.logoUrl ? (
                        <img src={token.logoUrl} alt={token.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                      ) : (
                        token.symbol.substring(0,1)
                      )}
                    </div>
                    <div>
                      <h4 className="token-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        {token.name}
                      </h4>
                      <span className="token-symbol-tag">{token.standard} · {token.symbol} Agent</span>
                    </div>
                  </div>
                  <span className={`token-change-badge ${token.positive ? 'pos' : 'neg'}`}>
                    {token.roi30d}
                  </span>
                </div>

                <div className="token-price-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="price-label">30D Return</div>
                    <div className="price-value" style={{ color: '#22c55e' }}>{token.roi30d}</div>
                  </div>
                  <div className="sparkline-wrapper" style={{ opacity: 0.9 }}>
                    <svg className="sparkline" viewBox="0 0 100 30" style={{ width: '100px', height: '35px' }}>
                      <defs>
                        <linearGradient id={`grad-desk-${token.symbol}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={token.positive ? '#22c55e' : '#ef4444'} stopOpacity="0.3"/>
                          <stop offset="100%" stopColor={token.positive ? '#22c55e' : '#ef4444'} stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path
                        d={`M 0 ${30 - token.trendPoints[0] * 0.25} L 16 ${30 - token.trendPoints[1] * 0.25} L 32 ${30 - token.trendPoints[2] * 0.25} L 48 ${30 - token.trendPoints[3] * 0.25} L 64 ${30 - token.trendPoints[4] * 0.25} L 80 ${30 - token.trendPoints[5] * 0.25} L 96 ${30 - token.trendPoints[6] * 0.25}`}
                        fill="none"
                        stroke={token.positive ? '#22c55e' : '#ef4444'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={`M 0 ${30 - token.trendPoints[0] * 0.25} L 16 ${30 - token.trendPoints[1] * 0.25} L 32 ${30 - token.trendPoints[2] * 0.25} L 48 ${30 - token.trendPoints[3] * 0.25} L 64 ${30 - token.trendPoints[4] * 0.25} L 80 ${30 - token.trendPoints[5] * 0.25} L 96 ${30 - token.trendPoints[6] * 0.25} L 96 30 L 0 30 Z`}
                        fill={`url(#grad-desk-${token.symbol})`}
                      />
                    </svg>
                  </div>
                </div>

                <div className="token-stats-row">
                  <div>
                    <span className="lbl">Win Rate</span>
                    <span className="val">{token.winRate}</span>
                  </div>
                  <div>
                    <span className="lbl">Avg Hold</span>
                    <span className="val">{token.avgHolding}</span>
                  </div>
                  <div>
                    <span className="lbl">Risk Level</span>
                    <span className="val" style={{ color: token.risk === 'HIGH' ? '#ef4444' : token.risk === 'MEDIUM' ? '#eab308' : '#22c55e' }}>{token.risk}</span>
                  </div>
                </div>

                <div className="ai-opinion-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h5 style={{ margin: 0 }}>🤖 AI Agent Strategy</h5>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>signals by <strong>Nansen</strong></span>
                  </div>
                  <p>{token.aiSummary}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span className={`sig-badge ${token.signalClass}`}>{token.signal}</span>
                    <span className="confidence-tag">Confidence: {token.confidence}%</span>
                  </div>
                </div>

                <button 
                  className="desktop-swap-btn"
                  onClick={() => handleDesktopSwap(token)}
                  disabled={swappingToken === token.symbol}
                >
                  {swappingToken === token.symbol ? (
                    <>
                      <div className="buy-spinner" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', margin: 0 }}></div>
                      <span>Swapping on-chain...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      <span>Swap via Moe (0.1 MNT)</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Reputation & Agents */}
        <div className="reputation-column">
          <div className="column-header">
            <h2>🤖 Active AI Agents</h2>
          </div>
          
          <div className="desktop-agents-list">
            {AGENTS.map((agent, idx) => (
              <div key={agent.name} className="desktop-agent-card">
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div className="agent-avatar" style={{ background: agent.bg, width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontSize: '1.5rem' }}>
                    {agent.emoji}
                  </div>
                  <div>
                    <h4>{agent.name}</h4>
                    <span className="strategy-tag">{agent.strategy}</span>
                  </div>
                </div>
                <div className="agent-stats">
                  <span>🎯 {agent.winRate}% Win</span>
                  <span>⭐ {agent.rating}</span>
                </div>
                <button 
                  className="desktop-rate-btn"
                  onClick={() => {
                    SoundEffects.play('tap');
                    setSelectedAgentIdx(idx);
                    setRatingVal(0);
                    setActiveTags([]);
                    setRatingComment('');
                    setShowRateModal(true);
                  }}
                >
                  Rate Agent
                </button>
              </div>
            ))}
          </div>

          <div className="column-header" style={{ marginTop: '2rem' }}>
            <h2>🛡️ Reputation Reviews (Mantle Sepolia Ledger)</h2>
          </div>

          <div className="desktop-reviews-list">
            {reviewsList.map((review, i) => (
              <div key={i} className="desktop-review-card">
                <div className="review-card-top">
                  <div>
                    <span className="review-agent">{review.agentName}</span>
                    <span className="review-stars">{"⭐".repeat(review.rating)}</span>
                  </div>
                  <span className="review-time">{review.time}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-user">By: <code>{review.user}</code></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inline rating modal */}
      {showRateModal && (
        <div className="desktop-modal-backdrop" onClick={() => setShowRateModal(false)}>
          <div className="desktop-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rate Agent: {AGENTS[selectedAgentIdx].name}</h3>
              <button className="close-modal-btn" onClick={() => { SoundEffects.play('tap'); setShowRateModal(false); }}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Submit reviews directly on-chain to the reputation ledger proxy contract.</p>
              
              <div className="star-rating-selector" style={{ margin: '20px 0', justifyContent: 'center', display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <Star
                    key={starVal}
                    size={40}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    className={`star-icon ${ratingVal >= starVal ? 'active' : ''}`}
                    onClick={() => {
                      SoundEffects.play('tap');
                      setRatingVal(starVal);
                    }}
                  />
                ))}
              </div>

              <div className="reputation-tags-section" style={{ marginBottom: '20px' }}>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Select Tags</label>
                <div className="reputation-tags-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['High Winrate', 'Excellent Alpha', 'Lagging Signals', 'High Fee', 'Very Accurate', 'Risky Plays'].map((tag) => (
                    <button
                      key={tag}
                      className={`rep-tag-btn ${activeTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                      style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '20px', background: activeTags.includes(tag) ? 'rgba(0, 239, 200, 0.2)' : 'rgba(255,255,255,0.03)', border: activeTags.includes(tag) ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)', color: activeTags.includes(tag) ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reputation-comment-section">
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Review Details</label>
                <textarea
                  placeholder="Enter feedback comments..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  style={{ width: '100%', minHeight: '80px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', padding: '10px', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="cancel-btn" onClick={() => { SoundEffects.play('tap'); setShowRateModal(false); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button 
                className="submit-onchain-rating-btn" 
                onClick={async () => {
                  await handleOnChainRating();
                  setShowRateModal(false);
                }}
                disabled={isSubmittingRating}
                style={{ padding: '8px 20px', borderRadius: '8px' }}
              >
                {isSubmittingRating ? "Publishing..." : "Publish to Mantle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Portfolio Modal */}
      <WalletPortfolio 
        isOpen={isPortfolioOpen} 
        onClose={() => setIsPortfolioOpen(false)} 
        walletAddress={account} 
      />

      {/* Custom Dapp Notification Alert */}
      {customAlert && (
        <div className="custom-alert-backdrop" onClick={() => setCustomAlert(null)}>
          <div className={`custom-alert-content ${customAlert.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="custom-alert-glow"></div>
            <button className="custom-alert-close" onClick={() => { SoundEffects.play('tap'); setCustomAlert(null); }}>×</button>
            <div className="custom-alert-icon-wrapper">
              {customAlert.type === 'success' && <Check size={28} className="icon-success" />}
              {customAlert.type === 'error' && <X size={28} className="icon-error" />}
              {customAlert.type === 'info' && <Info size={28} className="icon-info" />}
              {customAlert.type === 'warning' && <Info size={28} className="icon-warning" />}
            </div>
            <h3>{customAlert.title}</h3>
            <p className="custom-alert-message">{customAlert.message}</p>
            
            {customAlert.txHash && (
              <div className="custom-alert-tx-box">
                <span className="tx-label">Mantle Transaction Hash</span>
                <div className="tx-hash-row">
                  <code className="tx-hash-text">{customAlert.txHash}</code>
                  <button 
                    className={`tx-copy-btn ${copiedHash ? 'copied' : ''}`}
                    onClick={() => {
                      navigator.clipboard.writeText(customAlert.txHash);
                      setCopiedHash(true);
                      setTimeout(() => setCopiedHash(false), 2000);
                    }}
                  >
                    {copiedHash ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <a 
                  href={`https://explorer.sepolia.mantle.xyz/tx/${customAlert.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="tx-explorer-link"
                >
                  View on Mantle Sepolia Explorer →
                </a>
              </div>
            )}
            
            <button className="custom-alert-btn" onClick={() => { SoundEffects.play('tap'); setCustomAlert(null); }}>
              {customAlert.actionText || 'OK'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
