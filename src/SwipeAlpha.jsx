import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Star, ThumbsUp, ThumbsDown, Info, ArrowLeft, Check, Sparkles, MessageSquare } from 'lucide-react';
import './SwipeAlpha.css';

// === Web3 Contract Configuration ===
const REGISTRY_CONTRACT_ADDRESS = "0x2dEE66b5638f2a92E6bBb3ceB45047e67DFfCAE7";
const REGISTRY_CONTRACT_ABI = [
  "function submitReputation(uint256 _agentId, uint8 _score, string memory _comment) public",
  "function registerAgent(string memory _name, string memory _metadataURI) public returns (uint256)",
  "function getAgent(uint256 _agentId) public view returns (string memory name, string memory metadataURI, uint256 avgRating, uint32 ratingCount, bool active)"
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

export default function SwipeAlpha({ walletClient, account }) {
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

  const currentToken = TOKENS[cardIndex] || null;

  const handleSwipe = (direction) => {
    if (direction === 'right' && currentToken) {
      alert(`🛒 executing Swapping / Purchasing!\nToken: ${currentToken.name} ($${currentToken.symbol})\nAmount: $10 (Simulated via router)`);
    }
    setCardIndex(prev => prev + 1);
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

      // Convert RainbowKit/Wagmi walletClient to ethers Signer
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

  return (
    <div className="swipealpha-landing">
      <div className="landing-info-column">
        <div className="glow-badge">🧠 SwipeAlpha AI Platform</div>
        <h1 className="landing-title">The Tinder for <span>Tokens</span></h1>
        <p className="landing-subtitle">Swipe left to skip, swipe right to execute simulated swaps. Rent AI Agents to curate your feed, and publish on-chain reviews to the Mantle reputation ledger.</p>
        
        <div className="landing-stats">
          <div className="l-stat">
            <span className="l-val" style={{ color: 'var(--primary)', textShadow: '0 0 10px rgba(0, 239, 200, 0.2)' }}>72%</span>
            <span className="l-lbl">Avg Win Rate</span>
          </div>
          <div className="l-stat">
            <span className="l-val" style={{ color: '#a855f7', textShadow: '0 0 10px rgba(168, 85, 247, 0.2)' }}>5</span>
            <span className="l-lbl">Active Agents</span>
          </div>
          <div className="l-stat">
            <span className="l-val" style={{ color: '#ffd700', textShadow: '0 0 10px rgba(255, 215, 0, 0.2)' }}>100%</span>
            <span className="l-lbl">Verified On-Chain</span>
          </div>
        </div>

        <div className="landing-features-list">
          <div className="l-feat">
            <span className="feat-icon">🔥</span>
            <div>
              <h4>Curated AI Signals</h4>
              <p>Specialized agents scan and filter Nansen Smart Money flows for you.</p>
            </div>
          </div>
          <div className="l-feat">
            <span className="feat-icon">🛡️</span>
            <div>
              <h4>Immutable On-chain Reviews</h4>
              <p>Ratings are recorded on Mantle Sepolia Testnet using standard Transparent Proxy.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="swipealpha-phone-container">
        <div className="phone-mockup">
        {/* Notch */}
        <div className="notch"></div>

        {/* Swipe Screen */}
        {screen === 'swipe' && (
          <div className="phone-screen active">
            {/* Top Bar inside app */}
            <div className="phone-header">
              <span className="app-logo">Swipe<span className="logo-accent">Alpha</span></span>
              <button className="agents-btn" onClick={() => setScreen('agents')}>
                <Sparkles size={16} /> Agents
              </button>
            </div>

            {/* Active Agent Sub-Header */}
            <div className="active-agent-banner" onClick={() => { setSelectedAgentIdx(0); setScreen('agentDetail'); }}>
              <div className="banner-pulse"></div>
              <span>Agent: <strong>{activeAgent.name}</strong></span>
              <span className="banner-rating">⭐ {activeAgent.rating}</span>
            </div>

            {/* Token cards stack */}
            <div className="swipe-stack-container">
              {currentToken ? (
                <div className="swipe-token-card">
                  <div className="token-card-header">
                    <div className="token-meta">
                      <div className="token-avatar" style={{ background: currentToken.iconBg }}>{currentToken.iconLetter}</div>
                      <div>
                        <div className="token-name">{currentToken.name}</div>
                        <div className="token-symbol">{currentToken.chainIcon} {currentToken.chain} · ${currentToken.symbol}</div>
                      </div>
                    </div>
                    <span className={`token-badge ${currentToken.positive ? 'pos' : 'neg'}`}>
                      {currentToken.priceChange}
                    </span>
                  </div>

                  <div className="token-price-info">
                    <div className="price-big">{currentToken.price}</div>
                    <div className="price-lbl">Current Price</div>
                  </div>

                  <div className="token-grid-stats">
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

                  <div className="card-analyst-box smart-money">
                    <div className="box-title">🔍 Smart Money Net Flow</div>
                    <div className="box-desc">
                      <span>Flow 24h:</span>
                      <strong className={currentToken.smNetflow.startsWith('+') ? 'c-pos' : 'c-neg'}>
                        {currentToken.smNetflow}
                      </strong>
                    </div>
                  </div>

                  <div className="card-analyst-box ai-summary-box">
                    <div className="box-title">🤖 AI Agent Opinion</div>
                    <p className="ai-summary-txt">{currentToken.aiSummary}</p>
                    <div className="ai-row-footer">
                      <span className={`sig-badge ${currentToken.signalClass}`}>{currentToken.signal}</span>
                      <span className="conf-perc">Confidence: {currentToken.confidence}%</span>
                    </div>
                  </div>
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

            {/* Action Bar */}
            {currentToken && (
              <div className="swipe-action-controls">
                <button className="control-btn skip-action" onClick={() => handleSwipe('left')}>
                  <ThumbsDown size={20} />
                </button>
                <button className="control-btn info-action" onClick={() => { setSelectedTokenIdx(cardIndex); setScreen('detail'); }}>
                  <Info size={18} />
                </button>
                <button className="control-btn buy-action" onClick={() => handleSwipe('right')}>
                  <ThumbsUp size={20} />
                  <span className="buy-amount-label">$10</span>
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
                <div className="stat-row" style={{ marginTop: '10px' }}>
                  <span>Final Recommendation</span>
                  <span className={`sig-badge ${TOKENS[selectedTokenIdx].signalClass}`}>{TOKENS[selectedTokenIdx].signal}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agents Marketplace */}
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
