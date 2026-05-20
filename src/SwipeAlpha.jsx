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
    name:"Aave",symbol:"AAVE",chain:"Ethereum",chainIcon:"⟠",
    price:"$308.42",priceChange:"+12.4%",positive:true,
    mcap:"$4.69B",volume:"$8.85M",liquidity:"$153M",
    smNetflow:"+$2.1M",smTraders:45,smSignal:"accumulating",
    aiSummary:"Smart Money quỹ lớn đang tích lũy mạnh. 45 traders đã mua ròng $2.1M trong 24h. Volume mua gấp đôi bán — tín hiệu bullish.",
    signal:"STRONG BUY",signalClass:"strong-buy",confidence:85,
    age:"4.5 years",holders:"165,299",
    iconBg:"linear-gradient(135deg,#2775ca,#1a5fb4)",iconLetter:"A",
    risk:"LOW",
    trendPoints: [30, 45, 40, 60, 55, 75, 90]
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
    risk:"MEDIUM",
    trendPoints: [50, 45, 60, 55, 70, 65, 85]
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
    risk:"MEDIUM",
    trendPoints: [20, 30, 25, 55, 48, 70, 95]
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
    risk:"HIGH",
    trendPoints: [90, 80, 85, 70, 65, 50, 40]
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
    risk:"MEDIUM",
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
                          <div className="token-avatar" style={{ background: currentToken.iconBg }}>{currentToken.iconLetter}</div>
                          <div>
                            <div className="token-name">{currentToken.name}</div>
                            <div className="token-symbol" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{currentToken.chainIcon} {currentToken.chain} · ${currentToken.symbol}</span>
                              <span style={{ fontSize: '0.58rem', background: 'rgba(254, 60, 114, 0.15)', color: '#fe3c72', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(254, 60, 114, 0.25)' }}>⚡ Nansen</span>
                            </div>
                          </div>
                        </div>
                        <span className={`token-badge ${currentToken.positive ? 'pos' : 'neg'}`}>
                          {currentToken.priceChange}
                        </span>
                      </div>

                      {/* Tab 0: Price and Stats Overview */}
                      {activeCardTab === 0 && (
                        <div className="card-tab-content tab-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                          <div>
                            <div className="token-price-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
                              <div>
                                <div className="price-big">{currentToken.price}</div>
                                <div className="price-lbl">Current Price</div>
                              </div>
                              <div className="sparkline-wrapper" style={{ opacity: 0.9 }}>
                                <svg className="sparkline" viewBox="0 0 100 30" style={{ width: '100px', height: '35px' }}>
                                  <defs>
                                    <linearGradient id={`grad-swipe-${currentToken.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={currentToken.positive ? '#22c55e' : '#ef4444'} stopOpacity="0.3"/>
                                      <stop offset="100%" stopColor={currentToken.positive ? '#22c55e' : '#ef4444'} stopOpacity="0"/>
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d={`M 0 ${30 - currentToken.trendPoints[0] * 0.25} L 16 ${30 - currentToken.trendPoints[1] * 0.25} L 32 ${30 - currentToken.trendPoints[2] * 0.25} L 48 ${30 - currentToken.trendPoints[3] * 0.25} L 64 ${30 - currentToken.trendPoints[4] * 0.25} L 80 ${30 - currentToken.trendPoints[5] * 0.25} L 96 ${30 - currentToken.trendPoints[6] * 0.25}`}
                                    fill="none"
                                    stroke={currentToken.positive ? '#22c55e' : '#ef4444'}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d={`M 0 ${30 - currentToken.trendPoints[0] * 0.25} L 16 ${30 - currentToken.trendPoints[1] * 0.25} L 32 ${30 - currentToken.trendPoints[2] * 0.25} L 48 ${30 - currentToken.trendPoints[3] * 0.25} L 64 ${30 - currentToken.trendPoints[4] * 0.25} L 80 ${30 - currentToken.trendPoints[5] * 0.25} L 96 ${30 - currentToken.trendPoints[6] * 0.25} L 96 30 L 0 30 Z`}
                                    fill={`url(#grad-swipe-${currentToken.symbol})`}
                                  />
                                </svg>
                              </div>
                            </div>

                            <div className="token-grid-stats" style={{ marginTop: '15px' }}>
                              <div className="grid-item">
                                <span className="grid-val">{currentToken.mcap}</span>
                                <span className="grid-lbl">MCap</span>
                              </div>
                              <div className="grid-item">
                                <span className="grid-val">{currentToken.volume}</span>
                                <span className="grid-lbl">Vol 24h</span>
                              </div>
                              <div className="grid-item">
                                <span className="grid-val">{currentToken.liquidity}</span>
                                <span className="grid-lbl">Liquidity</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', padding: '12px 0 2px 0', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                            👆 Tap card to view On-Chain & Smart Money
                          </div>
                        </div>
                      )}

                      {/* Tab 1: On-Chain & Smart Money (Nansen) */}
                      {activeCardTab === 1 && (
                        <div className="card-tab-content tab-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', height: '100%' }}>
                          <div>
                            <div className="card-analyst-box smart-money" style={{ margin: '10px 0 0 0' }}>
                              <div className="box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>🔍 Smart Money Net Flow</span>
                                <span style={{ fontSize: '0.58rem', color: 'rgba(254,60,114,0.7)', textTransform: 'none', fontWeight: 'bold' }}>powered by Nansen</span>
                              </div>
                              <div className="box-desc" style={{ marginTop: '8px' }}>
                                <span>Net Flow (24h):</span>
                                <strong className={currentToken.smNetflow.startsWith('+') ? 'c-pos' : 'c-neg'} style={{ fontSize: '1.05rem' }}>
                                  {currentToken.smNetflow}
                                </strong>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>SM Active Traders</span>
                                <span style={{ color: 'white', fontWeight: 600 }}>{currentToken.smTraders} wallets</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Accumulation Trend</span>
                                <span className={currentToken.smSignal.toLowerCase().includes('buy') || currentToken.smSignal.toLowerCase().includes('accum') ? 'c-pos' : 'c-neg'} style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                  {currentToken.smSignal}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Total Token Holders</span>
                                <span style={{ color: 'white', fontWeight: 600 }}>{currentToken.holders} addresses</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', padding: '12px 0 2px 0', borderTop: '1px solid rgba(255,255,255,0.03)', marginTop: '20px' }}>
                            👆 Tap card to view AI Agent Analysis
                          </div>
                        </div>
                      )}

                      {/* Tab 2: AI Agent Opinion */}
                      {activeCardTab === 2 && (
                        <div className="card-tab-content tab-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                          <div>
                            <div className="card-analyst-box ai-summary-box" style={{ margin: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div className="box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>🤖 AI Agent Opinion</span>
                                <span style={{ fontSize: '0.55rem', background: 'rgba(254, 60, 114, 0.15)', color: '#fe3c72', padding: '1px 5px', borderRadius: '3px' }}>Agent Rented</span>
                              </div>
                              <p className="ai-summary-txt" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.45, margin: '4px 0' }}>
                                {currentToken.aiSummary}
                              </p>
                              <div className="ai-row-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className={`sig-badge ${currentToken.signalClass}`}>{currentToken.signal}</span>
                                <span className="conf-perc" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Confidence: <strong>{currentToken.confidence}%</strong></span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', padding: '12px 0 2px 0', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                            👆 Tap card to return to Price & Sparkline
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
                    <div className="token-avatar large" style={{ background: TOKENS[selectedTokenIdx].iconBg }}>
                      {TOKENS[selectedTokenIdx].iconLetter}
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
                    <div className="token-avatar" style={{ background: token.iconBg, width: '42px', height: '42px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>
                      {token.iconLetter}
                    </div>
                    <div>
                      <h4 className="token-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        {token.name}
                        <span style={{ fontSize: '0.58rem', background: 'rgba(254, 60, 114, 0.15)', color: '#fe3c72', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(254, 60, 114, 0.25)' }}>⚡ Nansen</span>
                      </h4>
                      <span className="token-symbol-tag">{token.chainIcon} {token.chain} · {token.symbol}</span>
                    </div>
                  </div>
                  <span className={`token-change-badge ${token.positive ? 'pos' : 'neg'}`}>
                    {token.priceChange}
                  </span>
                </div>

                <div className="token-price-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="price-label">Current Value</div>
                    <div className="price-value">{token.price}</div>
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
                    <span className="lbl">MCap</span>
                    <span className="val">{token.mcap}</span>
                  </div>
                  <div>
                    <span className="lbl">24h Vol</span>
                    <span className="val">{token.volume}</span>
                  </div>
                  <div>
                    <span className="lbl">Netflow 24h</span>
                    <span className={`val ${token.smNetflow.startsWith('+') ? 'c-pos' : 'c-neg'}`}>{token.smNetflow}</span>
                  </div>
                </div>

                <div className="ai-opinion-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h5 style={{ margin: 0 }}>🤖 AI Agent Analysis</h5>
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
                      <Heart size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} fill="currentColor" />
                      <span>Swap via MerchantMoe (0.1 MNT)</span>
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
