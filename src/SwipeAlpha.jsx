import { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { Star, ThumbsUp, ThumbsDown, Info, ArrowLeft, Check, Sparkles, MessageSquare, Flame, Heart, X, RotateCcw, Bell, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import './SwipeAlpha.css';
import archetypeMeme from './assets/archetype_meme.png';
import archetypeBalanced from './assets/archetype_balanced.png';
import archetypeBluechip from './assets/archetype_bluechip.png';
import SoundEffects from './utils/soundEffects';

// === Web3 Contract Configuration ===
const REGISTRY_CONTRACT_ADDRESS = "0x2dEE66b5638f2a92E6bBb3ceB45047e67DFfCAE7";
const REGISTRY_CONTRACT_ABI = [
  "function submitReputation(uint256 _agentId, uint8 _score, string memory _comment) public",
  "function registerAgent(string memory _name, string memory _metadataURI) public returns (uint256)",
  "function getAgent(uint256 _agentId) public view returns (string memory name, string memory metadataURI, uint256 avgRating, uint32 ratingCount, bool active)"
];

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
    signal: "HIRE AGENT",
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
    signal: "HIRE AGENT",
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
    signal: "HIRE AGENT",
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
    signal: "HIRE AGENT",
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
    signal: "HIRE AGENT",
    signalClass: "caution",
    trendPoints: [40, 45, 42, 50, 58, 52, 65]
  }
];

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

export default function SwipeAlpha({ walletClient, account, mode = 'desktop', archetype, setArchetype, addNotification, notifications = [], setNotifications, unreadCount = 0, soundEnabled = true, setSoundEnabled }) {
  const { openConnectModal } = useConnectModal ? useConnectModal() : {};
  const memeImg = localStorage.getItem('custom_archetype_meme') || archetypeMeme;
  const balancedImg = localStorage.getItem('custom_archetype_balanced') || archetypeBalanced;
  const bluechipImg = localStorage.getItem('custom_archetype_bluechip') || archetypeBluechip;

  const [screen, setScreen] = useState('swipe'); // swipe, detail, agents, agentDetail, rateAgent
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  const handleDragStart = (e) => {
    if (isSwapping) return;
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

  const handleDragEnd = () => {
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

  const handleKeyDown = (e) => {
    if (isSwapping || screen !== 'swipe') return;
    if (e.key === 'ArrowRight') handleSwipe('right');
    if (e.key === 'ArrowLeft') handleSwipe('left');
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardIndex, isSwapping, mode, screen]);

  const currentToken = sortedTokens[cardIndex] || null;

  const handleSwipe = async (direction) => {
    if (direction === 'right' && currentToken) {
      SoundEffects.play('swipeRight');
      // Add to matched agents list
      setSwipedAgents(prev => {
        if (prev.some(a => a.symbol === currentToken.symbol)) return prev;
        return [...prev, currentToken];
      });

      // Set matched agent to trigger custom overlay inside phone mockup
      setMatchOverlayAgent(currentToken);
    } else {
      SoundEffects.play('swipeLeft');
    }
    setCardIndex(prev => prev + 1);
  };

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

      const contract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, REGISTRY_CONTRACT_ABI, signer);
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
        color: '#fe3c72',
        shadowClass: 'card-meme'
      },
      {
        id: 'balanced',
        name: 'Rin "Tech-Wear"',
        style: 'Medium Risk · Balanced',
        desc: 'Focuses on automated yield strategies, staking, and mid-cap agents. Steady growth with smart hedges.',
        image: balancedImg,
        color: '#06b6d4',
        shadowClass: 'card-balanced'
      },
      {
        id: 'bluechip',
        name: 'Yuki "Goddess"',
        style: 'Low Risk · Blue Chip',
        desc: 'Focuses on highly audited, institutional-grade assets. Safest allocations for long-term growth.',
        image: bluechipImg,
        color: '#eab308',
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
                <button className="match-btn" style={{ background: `linear-gradient(135deg, ${opt.color}, #ff7854)` }}>
                  Match with {opt.name.split(' ')[0]} 💖
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (mode === 'demo') {
    return (
      <div className="swipealpha-demo-view">
        {renderOnboardingModal()}
        <div className="swipealpha-phone-container">
          <div className="phone-mockup">
            {/* Notch */}
            <div className="notch"></div>

            {/* Swipe Screen */}
            {screen === 'swipe' && (
              <div className="phone-screen active">
                <div className="phone-header" style={{ gap: '6px', paddingBottom: '12px' }}>
                  <span className="app-logo" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.95rem', fontWeight: '800', flexShrink: 0 }}>
                    <Flame size={16} color="#fe3c72" fill="#fe3c72" style={{ filter: 'drop-shadow(0 0 4px rgba(254, 60, 114, 0.5))' }} />
                    <span>Agent<span style={{ color: '#ff7854' }}>Swindler</span></span>
                  </span>
                  
                  {archetype && (
                    <div 
                      className="mobile-waifu-badge" 
                      onClick={() => {
                        SoundEffects.play('tap');
                        setShowOnboarding(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        background: archetype === 'meme' ? 'rgba(254, 60, 114, 0.15)' : archetype === 'balanced' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        border: archetype === 'meme' ? '1px solid rgba(254, 60, 114, 0.25)' : archetype === 'balanced' ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid rgba(234, 179, 8, 0.25)',
                        color: archetype === 'meme' ? '#fe3c72' : archetype === 'balanced' ? '#06b6d4' : '#eab308',
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        fontSize: '0.58rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: `0 0 8px ${archetype === 'meme' ? 'rgba(254, 60, 114, 0.1)' : archetype === 'balanced' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(234, 179, 8, 0.1)'}`,
                        transition: 'all 0.2s',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>💖 {archetype === 'meme' ? 'Sakura' : archetype === 'balanced' ? 'Rin' : 'Yuki'}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', flexShrink: 0 }}>
                    {/* Volume Mute Toggle */}
                    <button 
                      onClick={() => {
                        const newSoundState = !soundEnabled;
                        setSoundEnabled(newSoundState);
                        if (newSoundState) {
                          SoundEffects.enabled = true;
                          SoundEffects.play('tap');
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        borderRadius: '50%',
                        transition: 'all 0.2s'
                      }}
                      title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
                    >
                      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} color="rgba(255,255,255,0.3)" />}
                    </button>

                    {/* Notification Bell */}
                    <button 
                      onClick={() => {
                        SoundEffects.play('tap');
                        setScreen('notifications');
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        borderRadius: '50%',
                        position: 'relative',
                        transition: 'all 0.2s'
                      }}
                      title="Notifications"
                    >
                      <Bell size={16} />
                      {unreadCount > 0 && (
                        <span className="notif-badge-count" style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          background: '#ef4444',
                          color: '#fff',
                          borderRadius: '8px',
                          minWidth: '12px',
                          height: '12px',
                          padding: '0 3px',
                          fontSize: '0.45rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 6px #ef4444'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Wallet Connect */}
                    {account ? (
                      <button 
                        onClick={() => {
                          SoundEffects.play('tap');
                        }}
                        style={{
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.25)',
                          borderRadius: '8px',
                          color: '#22c55e',
                          padding: '3px 6px',
                          fontSize: '0.58rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title={account}
                      >
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }}></div>
                        {account.substring(0, 4)}...
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          SoundEffects.play('tap');
                          if (openConnectModal) openConnectModal();
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #fe3c72, #ff7854)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          padding: '3px 6px',
                          fontSize: '0.58rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(254, 60, 114, 0.3)'
                        }}
                      >
                        Connect
                      </button>
                    )}

                    <button className="agents-btn" onClick={() => { SoundEffects.play('tap'); setScreen('agents'); }} style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                      <Sparkles size={12} /> Agents
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
                        <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '8px' }}>
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
                        <div style={{
                          position: 'absolute',
                          top: '24px',
                          left: '24px',
                          border: '3px solid #22c55e',
                          color: '#22c55e',
                          textTransform: 'uppercase',
                          fontSize: '1.4rem',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          transform: 'rotate(-12deg)',
                          zIndex: 100,
                          opacity: Math.min(dragOffset.x / 80, 1),
                          pointerEvents: 'none',
                          background: 'rgba(0,0,0,0.6)'
                        }}>
                          MATCH
                        </div>
                      )}
                      {dragOffset.x < -25 && (
                        <div style={{
                          position: 'absolute',
                          top: '24px',
                          right: '24px',
                          border: '3px solid #ef4444',
                          color: '#ef4444',
                          textTransform: 'uppercase',
                          fontSize: '1.4rem',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          transform: 'rotate(12deg)',
                          zIndex: 100,
                          opacity: Math.min(-dragOffset.x / 80, 1),
                          pointerEvents: 'none',
                          background: 'rgba(0,0,0,0.6)'
                        }}>
                          PASS
                        </div>
                      )}
                      {/* Tinder-style top tab indicators */}
                      <div className="card-tab-indicators" style={{ display: 'flex', gap: '5px', padding: '10px 16px 2px 16px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                        {[0, 1, 2].map((idx) => (
                          <div key={idx} style={{ 
                            flex: 1, 
                            height: '4px', 
                            borderRadius: '2px', 
                            background: activeCardTab === idx ? 'linear-gradient(135deg, #fe3c72, #ff7854)' : 'rgba(255,255,255,0.15)',
                            boxShadow: activeCardTab === idx ? '0 0 8px rgba(254, 60, 114, 0.5)' : 'none',
                            transition: 'all 0.2s'
                          }} />
                        ))}
                      </div>

                      <div className="token-card-header">
                        <div className="token-meta">
                          <div className="token-avatar" style={{ background: currentToken.iconBg, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                              <span style={{ fontSize: '0.58rem', background: 'rgba(254, 60, 114, 0.15)', color: '#fe3c72', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(254, 60, 114, 0.25)' }}>⚡ Nansen</span>
                            </div>
                          </div>
                        </div>
                        <span className={`token-badge ${currentToken.positive ? 'pos' : 'neg'}`}>
                          {currentToken.roi30d}
                        </span>
                      </div>

                      {/* Tab 0: Agent Details */}
                      {activeCardTab === 0 && (
                        <div className="card-tab-content tab-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', padding: '10px 0 0 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* ROI and Risk Summary */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div>
                                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>30D Return</span>
                                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#22c55e', fontFamily: 'monospace' }}>{currentToken.roi30d}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Risk Class</span>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: '800', 
                                  color: currentToken.risk === 'HIGH' ? '#ef4444' : currentToken.risk === 'MEDIUM' ? '#eab308' : '#22c55e',
                                  background: currentToken.risk === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : currentToken.risk === 'MEDIUM' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  marginTop: '2px',
                                  display: 'inline-block'
                                }}>
                                  {currentToken.risk}
                                </div>
                              </div>
                            </div>

                            {/* Performance Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px 12px' }}>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Win Rate</span>
                                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', marginTop: '2px', fontFamily: 'monospace' }}>{currentToken.winRate}</div>
                              </div>
                              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px 12px' }}>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Avg Hold Time</span>
                                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', marginTop: '2px', fontFamily: 'monospace' }}>{currentToken.avgHolding}</div>
                              </div>
                            </div>

                            {/* Model and Creator */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.01)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.72rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>AI Engine</span>
                                <span style={{ color: 'white', fontWeight: 600 }}>{currentToken.model}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Creator</span>
                                <span style={{ color: 'white', fontWeight: 600 }}>{currentToken.creator}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Primary Assets</span>
                                <span style={{ color: 'white', fontWeight: 600 }}>{currentToken.primaryTokens.join(', ')}</span>
                              </div>
                            </div>

                            {/* Agent Description */}
                            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45, margin: '2px 0 0 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              "{currentToken.description}"
                            </p>
                          </div>
                          <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', padding: '10px 0 2px 0', borderTop: '1px solid rgba(255,255,255,0.03)', marginTop: '10px' }}>
                            👆 Tap card to view Agent Recent Trades
                          </div>
                        </div>
                      )}

                      {/* Tab 1: Recent Trades */}
                      {activeCardTab === 1 && (
                        <div className="card-tab-content tab-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', padding: '10px 0 0 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📈 Agent Activity Log</span>
                              <span style={{ fontSize: '0.58rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>LIVE FEEDS</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {currentToken.recentTrades.map((trade, tIdx) => (
                                <div key={tIdx} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  background: 'rgba(255,255,255,0.02)', 
                                  padding: '8px 12px', 
                                  borderRadius: '12px',
                                  border: '1px solid rgba(255,255,255,0.04)'
                                }}>
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ 
                                      fontSize: '0.62rem', 
                                      fontWeight: '800', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px',
                                      background: trade.type === 'BUY' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                      color: trade.type === 'BUY' ? '#22c55e' : '#ef4444'
                                    }}>
                                      {trade.type}
                                    </span>
                                    <div>
                                      <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#fff' }}>{trade.token}</div>
                                      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)' }}>{trade.time} @ {trade.price}</div>
                                    </div>
                                  </div>
                                  
                                  {/* Interactive Swap Button */}
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); // prevent cycling tab!
                                      handleRecentTradeSwap(trade.token, trade.type); 
                                    }} 
                                    style={{ 
                                      fontSize: '0.68rem', 
                                      fontWeight: '700', 
                                      padding: '6px 12px', 
                                      borderRadius: '6px',
                                      border: 'none',
                                      background: trade.type === 'BUY' ? 'linear-gradient(135deg, #22c55e, #10b981)' : 'linear-gradient(135deg, #ef4444, #f43f5e)',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      boxShadow: trade.type === 'BUY' ? '0 0 6px rgba(34,197,94,0.2)' : '0 0 6px rgba(239,68,68,0.2)'
                                    }}
                                  >
                                    {trade.type === 'BUY' ? 'Buy 0.1 MNT' : 'Sell 0.1 MNT'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', padding: '10px 0 2px 0', borderTop: '1px solid rgba(255,255,255,0.03)', marginTop: '10px' }}>
                            👆 Tap card to view Nansen AI Audit
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Nansen AI Audit */}
                      {activeCardTab === 2 && (
                        <div className="card-tab-content tab-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', padding: '10px 0 0 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="card-analyst-box smart-money" style={{ 
                              margin: '0', 
                              background: 'linear-gradient(135deg, rgba(254, 60, 114, 0.04), rgba(255, 120, 84, 0.04))', 
                              border: '1px solid rgba(254, 60, 114, 0.15)', 
                              borderRadius: '16px', 
                              padding: '14px' 
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>🛡️ NANSEN AI AGENT AUDIT</span>
                                <span style={{ fontSize: '0.58rem', background: 'rgba(254, 60, 114, 0.15)', color: '#fe3c72', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>SECURE COOP</span>
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                <div>
                                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{currentToken.nansenAnalysis.status}</div>
                                  <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Audited by {currentToken.nansenAnalysis.auditor}</div>
                                </div>
                                <div style={{ 
                                  width: '54px', 
                                  height: '54px', 
                                  borderRadius: '50%', 
                                  border: '3px solid #fe3c72', 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  boxShadow: '0 0 10px rgba(254,60,114,0.3)',
                                  background: 'rgba(0,0,0,0.2)'
                                }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '800', fontFamily: 'monospace', color: '#fff' }}>{currentToken.nansenAnalysis.score.split('/')[0]}</span>
                                  <span style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>score</span>
                                </div>
                              </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '12px 14px' }}>
                              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                                {currentToken.nansenAnalysis.details}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                                <span>Security Rank</span>
                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{currentToken.nansenAnalysis.riskLevel}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', padding: '10px 0 2px 0', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                            👆 Tap card to return to Agent Details
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
                  <div className="swipe-action-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <button className="control-btn rewind-action" onClick={() => { SoundEffects.play('tap'); setCardIndex(0); }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(234, 179, 8, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} title="Rewind Stack">
                      <RotateCcw size={16} color="#eab308" />
                    </button>
                    <button className="control-btn nope-action" onClick={() => handleSwipe('left')} disabled={isSwapping} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239, 68, 68, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} title="Skip">
                      <X size={24} color="#ef4444" />
                    </button>
                    <button className="control-btn super-action" onClick={() => { SoundEffects.play('tap'); setSelectedAgentIdx(0); setScreen('rateAgent'); setRatingVal(0); setActiveTags([]); }} disabled={isSwapping} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59, 130, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} title="Rate Agent">
                      <Star size={18} color="#3b82f6" />
                    </button>
                    <button className="control-btn like-action" onClick={() => handleSwipe('right')} disabled={isSwapping} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(254, 60, 114, 0.1)', border: '2px solid #fe3c72', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }} title="Match Agent">
                      {isSwapping ? <div className="buy-spinner" style={{ width: '16px', height: '16px', border: '2px solid #fe3c72', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Heart size={22} color="#fe3c72" fill="#fe3c72" />}
                    </button>
                    <button className="control-btn info-action" onClick={() => { SoundEffects.play('tap'); setSelectedTokenIdx(cardIndex); setScreen('detail'); }} disabled={isSwapping} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} title="Token Info">
                      <Info size={16} color="#a855f7" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Detail Screen */}
            {screen === 'detail' && (
              <div className="phone-screen active scrollable">
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => { SoundEffects.play('tap'); setScreen('swipe'); }}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <span>Token Details</span>
                  <div style={{ width: 18 }}></div>
                </div>
                
                <div className="detail-scroll-content">
                  <div className="detail-top-card">
                    <div className="token-avatar large" style={{ background: sortedTokens[selectedTokenIdx].iconBg, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {sortedTokens[selectedTokenIdx].logoUrl ? (
                        <img src={sortedTokens[selectedTokenIdx].logoUrl} alt={sortedTokens[selectedTokenIdx].name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
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
                      <span style={{ textTransform: 'capitalize' }}>{sortedTokens[selectedTokenIdx].smSignal}</span>
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
                    <div style={{ marginTop: '10px' }}>
                      <span className={`sig-badge ${sortedTokens[selectedTokenIdx].signalClass}`}>{sortedTokens[selectedTokenIdx].signal}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agents Screen */}
            {screen === 'agents' && (
              <div className="phone-screen active scrollable" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="screen-nav" style={{ flexShrink: 0 }}>
                  <button className="nav-back" onClick={() => { SoundEffects.play('tap'); setScreen('swipe'); }}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <span>My Active Agents ({swipedAgents.length})</span>
                  <div style={{ width: 18 }}></div>
                </div>

                <div className="agents-marketplace-list" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
                  
                  {/* Part 1: List of Swiped/Matched Agents */}
                  <div className="agents-section-title" style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💖 matched trading partners</span>
                  </div>

                  {swipedAgents.length === 0 ? (
                    <div style={{ padding: '20px 10px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>🛸</span>
                      <h4 style={{ fontSize: '0.82rem', color: '#fff', margin: '8px 0 4px 0' }}>No active partners</h4>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Swipe right on agents in the deck to pair with them.</p>
                      <button onClick={() => { SoundEffects.play('tap'); setScreen('swipe'); }} style={{ marginTop: '10px', background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 'bold', cursor: 'pointer' }}>Go Swipe</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {swipedAgents.map((agent) => (
                        <div key={agent.symbol} className="swiped-agent-item" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                          padding: '10px 12px',
                          borderRadius: '14px',
                          border: '1px solid rgba(255,255,255,0.04)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div className="swiped-agent-avatar" style={{
                            background: agent.iconBg || 'linear-gradient(135deg, #fe3c72, #ff7854)',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            flexShrink: 0
                          }}>
                            {agent.logoUrl ? (
                              <img src={agent.logoUrl} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{agent.symbol.substring(0, 1)}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                            <h4 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {agent.name}
                              <span style={{ fontSize: '0.55rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(34,197,94,0.15)' }}>Active</span>
                            </h4>
                            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>{agent.creator} · {agent.model}</span>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#22c55e' }}>{agent.winRate}</div>
                            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)' }}>Hold: {agent.avgHolding}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Part 2: Real-time Transaction Feed */}
                  <div className="agents-section-title" style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="live-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 6px #22c55e' }}></span>
                      <span>real-time transaction feed</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'none', fontWeight: 'normal' }}>Matched Agents Only</span>
                  </div>

                  <div className="live-tx-feed-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    paddingRight: '2px'
                  }}>
                    {liveTransactions.map((tx) => (
                      <div 
                        key={tx.id} 
                        className={`live-tx-card ${tx.isNew ? 'tab-fade-in' : ''}`}
                        style={{
                          background: 'rgba(255,255,255,0.015)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: '12px',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {(() => {
                          const agentInfo = TOKENS.find(t => t.symbol === tx.agentSymbol || t.name === tx.agentName);
                          return (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div className="swiped-agent-avatar" style={{
                                background: agentInfo?.iconBg || 'linear-gradient(135deg, #fe3c72, #ff7854)',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)',
                                flexShrink: 0
                              }}>
                                {agentInfo?.logoUrl ? (
                                  <img src={agentInfo.logoUrl} alt={tx.agentName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>🤖</span>
                                )}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#fff' }}>{tx.agentName}</span>
                                  <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '3px' }}>{tx.agentSymbol}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <span style={{ 
                                    fontSize: '0.58rem', 
                                    fontWeight: '800', 
                                    padding: '1px 4px', 
                                    borderRadius: '3px', 
                                    color: tx.type === 'BUY' ? '#22c55e' : '#ef4444', 
                                    background: tx.type === 'BUY' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' 
                                  }}>{tx.type}</span>
                                  <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: '600' }}>{tx.amount} {tx.token}</span>
                                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)' }}>@ {tx.price}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '4px' }}>
                          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>{tx.time}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecentTradeSwap(tx.token, tx.type);
                            }}
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 'bold',
                              padding: '3.5px 8px',
                              borderRadius: '5px',
                              background: tx.type === 'BUY' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              border: tx.type === 'BUY' ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                              color: tx.type === 'BUY' ? '#22c55e' : '#ef4444',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {tx.type === 'BUY' ? 'Buy' : 'Sell'} 0.1 $MNT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

            {/* Agent Detail */}
            {screen === 'agentDetail' && (
              <div className="phone-screen active scrollable">
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => { SoundEffects.play('tap'); setScreen('agents'); }}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <span>Agent Profiles</span>
                  <div style={{ width: 18 }}></div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Rental Fee</label>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>{AGENTS[selectedAgentIdx].price}</div>
                      </div>
                      <button className="rent-now-btn" onClick={() => {
                        setActiveAgent(AGENTS[selectedAgentIdx]);
                        showCustomAlert('success', 'Agent Subscribed', `Successfully rented ${AGENTS[selectedAgentIdx].name}!\nYour feed will now show signals from this agent.`);
                        setScreen('swipe');
                      }}>Rent Agent</button>
                    </div>
                  </div>

                  <button className="rate-agent-link-btn" onClick={() => { SoundEffects.play('tap'); setScreen('rateAgent'); setRatingVal(0); setActiveTags([]); }}>
                    <MessageSquare size={16} /> Submit Rating to Mantle Sepolia
                  </button>
                </div>
              </div>
            )}

            {/* Rate Agent Screen */}
            {screen === 'rateAgent' && (
              <div className="phone-screen active scrollable">
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => { SoundEffects.play('tap'); setScreen('agentDetail'); }}>
                    <ArrowLeft size={18} /> Cancel
                  </button>
                  <span>Submit Reputation</span>
                  <div style={{ width: 18 }}></div>
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
                      <div className="spinner" style={{ border: '2px solid rgba(255,255,255,0.2)', borderLeftColor: 'white', borderRadius: '50%', width: 18, height: 18, animation: 'spin 1s linear infinite' }}></div>
                    ) : (
                      "Publish Review to Mantle"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Screen */}
            {screen === 'notifications' && (
              <div className="phone-screen active scrollable">
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
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px'
                      }}
                      title="Clear All"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <div style={{ width: 24 }}></div>
                  )}
                </div>

                <div className="notifications-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ 
                      padding: '40px 10px', 
                      textAlign: 'center', 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px dashed rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Bell size={32} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
                      <h4 style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#fff' }}>No Notifications</h4>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Activity logs and smart money signals will appear here.</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`notification-item ${notif.type}`} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderLeft: `3px solid ${notif.type === 'success' ? '#22c55e' : notif.type === 'warning' ? '#f59e0b' : notif.type === 'error' ? '#ef4444' : '#3b82f6'}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                        gap: '4px',
                        borderTop: '1px solid rgba(255,255,255,0.03)',
                        borderRight: '1px solid rgba(255,255,255,0.03)',
                        borderBottom: '1px solid rgba(255,255,255,0.03)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{notif.title}</span>
                          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>{notif.time}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4' }}>{notif.message}</p>
                        {notif.txHash && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '4px', marginTop: '2px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Hash: {notif.txHash.substring(0, 6)}...{notif.txHash.substring(notif.txHash.length - 4)}</span>
                            <a 
                              href={`https://explorer.sepolia.mantle.xyz/tx/${notif.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}
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
            )}
            {renderMatchOverlay()}
          </div>
        </div>
      </div>
    );
  }

  // mode === 'desktop' (Main Dashboard)
  return (
    <div className="swipealpha-desktop-dashboard">
      {renderOnboardingModal()}
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
                        <span style={{ fontSize: '0.58rem', background: 'rgba(254, 60, 114, 0.15)', color: '#fe3c72', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(254, 60, 114, 0.25)' }}>⚡ Nansen</span>
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
                      <span>Hiring on-chain...</span>
                    </>
                  ) : (
                    <>
                      <Heart size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} fill="currentColor" />
                      <span>Hire Agent via Moe (0.1 MNT)</span>
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
