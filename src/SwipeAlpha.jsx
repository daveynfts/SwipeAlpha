import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Star, ThumbsUp, ThumbsDown, Info, ArrowLeft, Check, Sparkles, MessageSquare, Flame, Heart, X, RotateCcw } from 'lucide-react';
import './SwipeAlpha.css';

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
    logoUrl: "https://assets.coingecko.com/coins/images/42490/large/virtual_protocol.png",
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
    logoUrl: "https://assets.coingecko.com/coins/images/32822/large/virtual.png",
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
    logoUrl: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png",
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
    logoUrl: "https://assets.coingecko.com/coins/images/16185/large/pendle.png",
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
    logoUrl: "https://assets.coingecko.com/coins/images/36399/large/ENA.png",
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

export default function SwipeAlpha({ walletClient, account, mode = 'desktop' }) {
  const [screen, setScreen] = useState('swipe'); // swipe, detail, agents, agentDetail, rateAgent
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const [selectedAgentIdx, setSelectedAgentIdx] = useState(0);
  
  // Rating states
  const [ratingVal, setRatingVal] = useState(0);
  const [activeTags, setActiveTags] = useState([]);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  // Swipe states
  const [cardIndex, setCardIndex] = useState(0);
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [isSwapping, setIsSwapping] = useState(false);

  // Desktop states
  const [swappingToken, setSwappingToken] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  
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
    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragEnd = () => {
    if (!isDragging || isSwapping) return;
    setIsDragging(false);
    
    const clickThreshold = 8;
    if (Math.abs(dragOffset.x) < clickThreshold && Math.abs(dragOffset.y) < clickThreshold) {
      setActiveCardTab(prev => (prev + 1) % 3);
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    
    const threshold = 120;
    if (dragOffset.x > threshold) {
      handleSwipe('right');
    } else if (dragOffset.x < -threshold) {
      handleSwipe('left');
    }
    setDragOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== 'demo' || screen !== 'swipe' || isSwapping) return;
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardIndex, isSwapping, mode, screen]);

  const currentToken = TOKENS[cardIndex] || null;

  const handleSwipe = async (direction) => {
    if (direction === 'right' && currentToken) {
      if (!walletClient) {
        alert("Please connect your wallet first at the top of the page!");
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
        const signer = new ethers.JsonRpcSigner(provider, account);

        // Verify correct network (Mantle Sepolia: 5003)
        if (chain.id !== 5003) {
          alert("Please switch network to Mantle Sepolia at the header.");
          setIsSwapping(false);
          return;
        }

        const routerContract = new ethers.Contract(MOCK_MOE_ROUTER_ADDRESS, MOCK_MOE_ROUTER_ABI, signer);
        
        console.log(`Executing real on-chain mock swap via MockMerchantMoeRouter for ${currentToken.symbol}`);
        
        // Swap 0.1 MNT
        const swapValue = ethers.parseEther("0.1");
        const tx = await routerContract.swapMNT(
          currentToken.symbol,
          account,
          { value: swapValue }
        );
        
        await tx.wait();
        alert(`🛒 Swap transaction executed successfully via MerchantMoe (Mock Router) on Mantle Sepolia!\nToken: ${currentToken.name} ($${currentToken.symbol})\nAmount In: 0.1 MNT\nTx Hash: ${tx.hash}`);
      } catch (e) {
        console.error(e);
        alert(`❌ Error executing swap transaction: ${e.reason || e.message}`);
        setIsSwapping(false);
        return; // Don't advance card if failed
      } finally {
        setIsSwapping(false);
      }
    }
    setCardIndex(prev => prev + 1);
  };

  const handleDesktopSwap = async (token) => {
    if (!walletClient) {
      alert("Please connect your wallet first at the top of the page!");
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
      const signer = new ethers.JsonRpcSigner(provider, account);

      if (chain.id !== 5003) {
        alert("Please switch network to Mantle Sepolia at the header.");
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
      alert(`🛒 Swap transaction executed successfully via MerchantMoe (Mock Router) on Mantle Sepolia!\nToken: ${token.name} ($${token.symbol})\nAmount In: 0.1 MNT\nTx Hash: ${tx.hash}`);
    } catch (e) {
      console.error(e);
      alert(`❌ Error executing swap transaction: ${e.reason || e.message}`);
    } finally {
      setSwappingToken(null);
    }
  };

  const handleRecentTradeSwap = async (tradeTokenSymbol, tradeType) => {
    if (!walletClient) {
      alert("Please connect your wallet first at the top of the page!");
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
      const signer = new ethers.JsonRpcSigner(provider, account);

      if (chain.id !== 5003) {
        alert("Please switch network to Mantle Sepolia at the header.");
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
      alert(`🛒 Copy Trade transaction executed successfully via MerchantMoe (Mock Router) on Mantle Sepolia!\nAction: ${tradeType} ${tradeTokenSymbol}\nValue: 0.1 MNT\nTx Hash: ${tx.hash}`);
    } catch (e) {
      console.error(e);
      alert(`❌ Error executing ${tradeType.toLowerCase()} transaction: ${e.reason || e.message}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const toggleTag = (tag) => {
    if (activeTags.includes(tag)) {
      setActiveTags(prev => prev.filter(t => t !== tag));
    } else {
      setActiveTags(prev => [...prev, tag]);
    }
  };

  const handleOnChainRating = async () => {
    if (ratingVal === 0) {
      alert('Please select stars to rate');
      return;
    }
    setIsSubmittingRating(true);
    try {
      if (!walletClient) {
        throw new Error("Wallet not connected. Please connect wallet at top of the page.");
      }

      const { transport, chain } = walletClient;
      const network = {
        chainId: chain.id,
        name: chain.name,
      };
      const provider = new ethers.BrowserProvider(transport, network);
      const signer = new ethers.JsonRpcSigner(provider, account);

      // Verify correct network (Mantle Sepolia: 5003)
      if (chain.id !== 5003) {
        alert("Please switch network to Mantle Sepolia at the header.");
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

      alert(`🎉 Rating published on-chain successfully!\nTx Hash: ${tx.hash}`);
      
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
      alert(`❌ Error submitting rating: ${e.reason || e.message}`);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (mode === 'demo') {
    return (
      <div className="swipealpha-demo-view">
        <div className="swipealpha-phone-container">
          <div className="phone-mockup">
            {/* Notch */}
            <div className="notch"></div>

            {/* Swipe Screen */}
            {screen === 'swipe' && (
              <div className="phone-screen active">
                <div className="phone-header">
                  <span className="app-logo" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1.05rem', fontWeight: '800' }}>
                    <Flame size={18} color="#fe3c72" fill="#fe3c72" style={{ filter: 'drop-shadow(0 0 4px rgba(254, 60, 114, 0.5))' }} />
                    <span>Agent<span style={{ color: '#ff7854' }}>Swindler</span></span>
                  </span>
                  <button className="agents-btn" onClick={() => setScreen('agents')}>
                    <Sparkles size={16} /> Agents
                  </button>
                </div>

                <div className="active-agent-banner" onClick={() => { setSelectedAgentIdx(0); setScreen('agentDetail'); }}>
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
                          BUY
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
                          SKIP
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
                      <button className="reload-btn" onClick={() => setCardIndex(0)}>Swipe Again</button>
                    </div>
                  )}
                </div>

                {currentToken && (
                  <div className="swipe-action-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <button className="control-btn rewind-action" onClick={() => setCardIndex(0)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(234, 179, 8, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} title="Rewind Stack">
                      <RotateCcw size={16} color="#eab308" />
                    </button>
                    <button className="control-btn nope-action" onClick={() => handleSwipe('left')} disabled={isSwapping} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239, 68, 68, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} title="Skip">
                      <X size={24} color="#ef4444" />
                    </button>
                    <button className="control-btn super-action" onClick={() => { setSelectedAgentIdx(0); setScreen('rateAgent'); }} disabled={isSwapping} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59, 130, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} title="Rate Agent">
                      <Star size={18} color="#3b82f6" />
                    </button>
                    <button className="control-btn like-action" onClick={() => handleSwipe('right')} disabled={isSwapping} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(254, 60, 114, 0.1)', border: '2px solid #22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }} title="Buy 0.1 MNT">
                      {isSwapping ? <div className="buy-spinner" style={{ width: '16px', height: '16px', border: '2px solid #22c55e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Heart size={22} color="#22c55e" fill="#22c55e" />}
                      {!isSwapping && <span style={{ fontSize: '0.5rem', color: '#22c55e', fontWeight: 'bold', marginTop: '0px' }}>0.1 MNT</span>}
                    </button>
                    <button className="control-btn info-action" onClick={() => { setSelectedTokenIdx(cardIndex); setScreen('detail'); }} disabled={isSwapping} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} title="Token Info">
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
                  <button className="nav-back" onClick={() => setScreen('swipe')}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <span>Token Details</span>
                  <div style={{ width: 18 }}></div>
                </div>
                
                <div className="detail-scroll-content">
                  <div className="detail-top-card">
                    <div className="token-avatar large" style={{ background: TOKENS[selectedTokenIdx].iconBg, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {TOKENS[selectedTokenIdx].logoUrl ? (
                        <img src={TOKENS[selectedTokenIdx].logoUrl} alt={TOKENS[selectedTokenIdx].name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                      ) : (
                        TOKENS[selectedTokenIdx].iconLetter
                      )}
                    </div>
                    <h2>{TOKENS[selectedTokenIdx].name}</h2>
                    <div className="token-symbol">{TOKENS[selectedTokenIdx].symbol}</div>
                    <div className="price-huge">{TOKENS[selectedTokenIdx].price}</div>
                  </div>

                  <div className="detail-card-section">
                    <h3>Smart Money Flow Analytics</h3>
                    <div className="stat-row">
                      <span>Net Flow 24h</span>
                      <span className={TOKENS[selectedTokenIdx].smNetflow.startsWith('+') ? 'c-pos' : 'c-neg'}>{TOKENS[selectedTokenIdx].smNetflow}</span>
                    </div>
                    <div className="stat-row">
                      <span>SM Addresses active</span>
                      <span>{TOKENS[selectedTokenIdx].smTraders} wallets</span>
                    </div>
                    <div className="stat-row">
                      <span>Accumulation Trend</span>
                      <span style={{ textTransform: 'capitalize' }}>{TOKENS[selectedTokenIdx].smSignal}</span>
                    </div>
                  </div>

                  <div className="detail-card-section">
                    <h3>Token Age & Holders</h3>
                    <div className="stat-row">
                      <span>Holders</span>
                      <span>{TOKENS[selectedTokenIdx].holders} addresses</span>
                    </div>
                    <div className="stat-row">
                      <span>Launch Age</span>
                      <span>{TOKENS[selectedTokenIdx].age}</span>
                    </div>
                    <div className="stat-row">
                      <span>Risk Metric</span>
                      <span>{TOKENS[selectedTokenIdx].risk}</span>
                    </div>
                  </div>

                  <div className="detail-card-section ai-glow">
                    <h3>AI Signal Reasoning</h3>
                    <p className="ai-reason-text">{TOKENS[selectedTokenIdx].aiSummary}</p>
                    <div style={{ marginTop: '10px' }}>
                      <span className={`sig-badge ${TOKENS[selectedTokenIdx].signalClass}`}>{TOKENS[selectedTokenIdx].signal}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agents Screen */}
            {screen === 'agents' && (
              <div className="phone-screen active scrollable">
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => setScreen('swipe')}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <span>AI Agents</span>
                  <div style={{ width: 18 }}></div>
                </div>

                <div className="agents-marketplace-list">
                  {AGENTS.map((agent, idx) => (
                    <div key={agent.name} className="marketplace-agent-card" onClick={() => { setSelectedAgentIdx(idx); setScreen('agentDetail'); }}>
                      <div className="avatar-side" style={{ background: agent.bg }}>
                        {agent.emoji}
                      </div>
                      <div className="agent-text-side">
                        <h4>{agent.name}</h4>
                        <span className="strategy-tag">{agent.strategy}</span>
                        <div className="agent-min-stats">
                          <span>🎯 {agent.winRate}% Win</span>
                          <span>⭐ {agent.rating}</span>
                        </div>
                      </div>
                      <div className="price-side">
                        <span className="price-num">{agent.price}</span>
                        <span className="price-lbl">{agent.period}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Detail */}
            {screen === 'agentDetail' && (
              <div className="phone-screen active scrollable">
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => setScreen('agents')}>
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
                        alert(`✅ Successfully rented ${AGENTS[selectedAgentIdx].name}!\nYour feed will now show signals from this agent.`);
                        setScreen('swipe');
                      }}>Rent Agent</button>
                    </div>
                  </div>

                  <button className="rate-agent-link-btn" onClick={() => { setScreen('rateAgent'); setRatingVal(0); setActiveTags([]); }}>
                    <MessageSquare size={16} /> Submit Rating to Mantle Sepolia
                  </button>
                </div>
              </div>
            )}

            {/* Rate Agent Screen */}
            {screen === 'rateAgent' && (
              <div className="phone-screen active scrollable">
                <div className="screen-nav">
                  <button className="nav-back" onClick={() => setScreen('agentDetail')}>
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
                        onClick={() => setRatingVal(starVal)}
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
          </div>
        </div>
      </div>
    );
  }

  // mode === 'desktop' (Main Dashboard)
  return (
    <div className="swipealpha-desktop-dashboard">
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
            {TOKENS.map((token) => (
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
              <button className="close-modal-btn" onClick={() => setShowRateModal(false)}>×</button>
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
                    onClick={() => setRatingVal(starVal)}
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
              <button className="cancel-btn" onClick={() => setShowRateModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
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
    </div>
  );
}
