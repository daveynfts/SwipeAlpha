import React from 'react';
import { Flame, Shield, Cpu, Sparkles, ArrowRight, Zap, Database, Lock, Settings, RotateCcw, X, Star, Heart } from 'lucide-react';
import './LandingPage.css';
import archetypeMeme from './assets/archetype_meme.png';
import archetypeBalanced from './assets/archetype_balanced.png';
import archetypeBluechip from './assets/archetype_bluechip.png';
import waifu1 from './assets/waifu_1.png';
import waifu2 from './assets/waifu_2.png';
import waifu3 from './assets/waifu_3.png';
import waifu4 from './assets/waifu_4.png';

export default function LandingPage({ navigate }) {
  // Retrieve custom uploaded waifus from localStorage or use fallback images
  const memeImg = localStorage.getItem('custom_archetype_meme') || archetypeMeme;
  const balancedImg = localStorage.getItem('custom_archetype_balanced') || archetypeBalanced;
  const bluechipImg = localStorage.getItem('custom_archetype_bluechip') || archetypeBluechip;

  // Profile cards data for Tinder phone mockups background
  const profiles = [
    { name: "Sakura", age: 21, image: memeImg, category: "Degen AI" },
    { name: "Rin", age: 22, image: balancedImg, category: "Balanced AI" },
    { name: "Yuki", age: 23, image: bluechipImg, category: "Bluechip AI" },
    { name: "Lan", age: 21, image: waifu1, category: "AI Scalper" },
    { name: "Ami", age: 22, image: waifu2, category: "Yield Sniper" },
    { name: "Ngọc", age: 22, image: waifu3, category: "Arbitrage Bot" },
    { name: "Thanh", age: 23, image: waifu4, category: "Sentiment Bot" },
    { name: "Phượng", age: 20, image: waifu1, category: "Meme Sniper" },
    { name: "Yumi", age: 21, image: waifu2, category: "Hedge Bot" },
    { name: "Linh", age: 21, image: waifu3, category: "Volume Bot" },
    { name: "Mai", age: 22, image: waifu4, category: "LP Rebalancer" },
  ];

  // Distribute profiles into 5 columns
  // Distribute profiles into 5 columns (6 profiles per column to ensure it is taller than the viewport)
  const col1 = [profiles[0], profiles[3], profiles[6], profiles[9], profiles[1], profiles[4]];
  const col2 = [profiles[1], profiles[4], profiles[7], profiles[10], profiles[2], profiles[5]];
  const col3 = [profiles[2], profiles[5], profiles[8], profiles[0], profiles[3], profiles[6]];
  const col4 = [profiles[3], profiles[6], profiles[9], profiles[1], profiles[4], profiles[7]];
  const col5 = [profiles[4], profiles[7], profiles[10], profiles[2], profiles[5], profiles[8]];

  const renderColumn = (colData, colIndex, isScrollUp) => {
    return (
      <div className={`marquee-column ${isScrollUp ? 'scroll-up' : 'scroll-down'}`}>
        <div className="marquee-track">
          <div className="marquee-group">
            {colData.map((p, idx) => (
              <div key={`col-${colIndex}-${idx}`} className="hero-phone-card">
                <div className="hero-phone-screen">
                  <div className="hero-phone-header">
                    <Flame size={14} color="#fe3c72" fill="#fe3c72" className="hero-phone-flame-logo" />
                  </div>
                  <img src={p.image} alt={p.name} className="hero-phone-photo" />
                  <div className="hero-phone-overlay"></div>
                  <div className="hero-phone-info">
                    <div className="hero-phone-info-left">
                      <span className="hero-phone-name">{p.name} <span className="hero-phone-age">{p.age}</span></span>
                      <span className="hero-phone-verified-badge">✓</span>
                    </div>
                    <span className="hero-phone-category-tag">{p.category}</span>
                  </div>
                  <div className="hero-phone-actions">
                    <div className="hero-phone-btn btn-rewind"><RotateCcw size={12} color="#f5d06b" /></div>
                    <div className="hero-phone-btn btn-dislike"><X size={12} color="#fe3c72" /></div>
                    <div className="hero-phone-btn btn-superlike"><Star size={12} color="#2563eb" fill="#2563eb" /></div>
                    <div className="hero-phone-btn btn-like"><Heart size={12} color="#16a34a" fill="#16a34a" /></div>
                    <div className="hero-phone-btn btn-boost"><Zap size={12} color="#7c3aed" fill="#7c3aed" /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Duplicate group for seamless looping */}
          <div className="marquee-group" aria-hidden="true">
            {colData.map((p, idx) => (
              <div key={`col-${colIndex}-dup-${idx}`} className="hero-phone-card">
                <div className="hero-phone-screen">
                  <div className="hero-phone-header">
                    <Flame size={14} color="#fe3c72" fill="#fe3c72" className="hero-phone-flame-logo" />
                  </div>
                  <img src={p.image} alt={p.name} className="hero-phone-photo" />
                  <div className="hero-phone-overlay"></div>
                  <div className="hero-phone-info">
                    <div className="hero-phone-info-left">
                      <span className="hero-phone-name">{p.name} <span className="hero-phone-age">{p.age}</span></span>
                      <span className="hero-phone-verified-badge">✓</span>
                    </div>
                    <span className="hero-phone-category-tag">{p.category}</span>
                  </div>
                  <div className="hero-phone-actions">
                    <div className="hero-phone-btn btn-rewind"><RotateCcw size={12} color="#f5d06b" /></div>
                    <div className="hero-phone-btn btn-dislike"><X size={12} color="#fe3c72" /></div>
                    <div className="hero-phone-btn btn-superlike"><Star size={12} color="#2563eb" fill="#2563eb" /></div>
                    <div className="hero-phone-btn btn-like"><Heart size={12} color="#16a34a" fill="#16a34a" /></div>
                    <div className="hero-phone-btn btn-boost"><Zap size={12} color="#7c3aed" fill="#7c3aed" /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="landing-page">
      {/* Background glow effects */}
      <div className="landing-glow glow-1"></div>
      <div className="landing-glow glow-2"></div>
      <div className="landing-glow glow-3"></div>

      {/* Navigation Header */}
      <header className="landing-navbar">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <Flame color="#fe3c72" size={24} style={{ filter: 'drop-shadow(0 0 6px rgba(254, 60, 114, 0.45))' }} />
          <span>AGENT <span>SWINDLER</span></span>
        </div>
        <nav className="navbar-links">
          <a href="#features">Features</a>
          <a href="#standard">ERC-8004</a>
          <a href="#architecture">Architecture</a>
        </nav>
        <div className="navbar-actions">
          <button className="nav-btn-secondary" onClick={() => navigate('/profile')}>
            <Settings size={14} /> Profile & APIs
          </button>
          <button className="nav-btn-primary" onClick={() => navigate('/demo')}>
            Launch Demo <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section with Tilted Phone Grid */}
      <section className="landing-hero-container">
        <div className="hero-bg-grid-wrapper">
          <div className="hero-bg-grid">
            {renderColumn(col1, 1, false)}
            {renderColumn(col2, 2, true)}
            {renderColumn(col3, 3, false)}
            {renderColumn(col4, 4, true)}
            {renderColumn(col5, 5, false)}
          </div>
        </div>

        {/* Dark radial overlay for readability */}
        <div className="hero-vignette"></div>

        {/* Shimmering overlays for glamorous look */}
        <div className="hero-grid-glow glow-pink"></div>
        <div className="hero-grid-glow glow-blue"></div>

        {/* Content Overlay */}
        <div className="hero-overlay-content">
          <h1 className="hero-main-title">
            Swipe Right AI<span className="title-tm">™</span>
          </h1>
          <button className="hero-cta-btn" onClick={() => navigate('/demo')}>
            Connect Wallet
          </button>
        </div>

        {/* Legal/Attribution Text */}
        <div className="hero-mockup-caption">
          All photos are of models and used for illustrative purposes only
        </div>
      </section>

      {/* Features Apple-Grid */}
      <section id="features" className="landing-features">
        <div className="section-header">
          <h2>Intelligent Trading, Curated.</h2>
          <p>Agent Swindler blends gamified UX with cutting edge agentic execution.</p>
        </div>

        <div className="bento-grid">
          <div className="bento-card bento-large card-swipe">
            <div className="card-icon"><Sparkles size={28} /></div>
            <div className="card-content">
              <h3>Swipe-to-Match Gestures</h3>
              <p>Review agents, check their simulated win rates, hold periods, and average ROI. Swipe right to match the agent to your active trading list, starting 0.1 $MNT transactions instantly.</p>
            </div>
            <div className="card-bg-gradient gradient-pink"></div>
          </div>

          <div className="bento-card card-llm">
            <div className="card-icon"><Cpu size={24} /></div>
            <div className="card-content">
              <h3>Custom LLM Brains</h3>
              <p>Configure your own API keys for OpenAI, Claude, Gemini, or DeepSeek in your profile. Let the agents think using the model of your choice.</p>
            </div>
            <div className="card-bg-gradient gradient-purple"></div>
          </div>

          <div className="bento-card card-gas">
            <div className="card-icon"><Zap size={24} /></div>
            <div className="card-content">
              <h3>High Performance</h3>
              <p>Built on the Mantle Sepolia network. Experience gas-efficient trading cycles, lightning-fast execution, and seamless smart-contract interactions.</p>
            </div>
            <div className="card-bg-gradient gradient-orange"></div>
          </div>

          <div className="bento-card card-secure">
            <div className="card-icon"><Lock size={24} /></div>
            <div className="card-content">
              <h3>ERC-8004 Registry</h3>
              <p>Leveraging standard agent registry contracts on Mantle. Non-custodial operations, community reputational ratings, and verified telemetry.</p>
            </div>
            <div className="card-bg-gradient gradient-green"></div>
          </div>

          <div className="bento-card bento-large card-feed">
            <div className="card-icon"><Database size={28} /></div>
            <div className="card-content">
              <h3>Real-time Telemetry</h3>
              <p>Watch matched agents execute mock trades live in a real-time terminal feed. Check simulated smart contract logs, transaction hashes, and gas telemetry dynamically.</p>
            </div>
            <div className="card-bg-gradient gradient-cyan"></div>
          </div>
        </div>
      </section>

      {/* ERC-8004 Standard Explainer */}
      <section id="standard" className="landing-standard">
        <div className="standard-container">
          <div className="standard-text">
            <div className="tag">ERC-8004 Standard</div>
            <h2>Decentralized Custody for Autonomous Agents</h2>
            <p>
              Traditional trading bots require custody of your private keys, creating substantial security risks.
              Agent Swindler conforms to the experimental ERC-8004 standard, registering agents onto an on-chain reputation ledger.
            </p>
            <ul className="standard-list">
              <li>
                <Shield size={16} color="#fe3c72" />
                <span><strong>Registry Authenticated:</strong> Verify agent contract bytecode directly on Mantle.</span>
              </li>
              <li>
                <Shield size={16} color="#fe3c72" />
                <span><strong>No Custody Risk:</strong> Agent operations are governed by localized proxy permissions.</span>
              </li>
              <li>
                <Shield size={16} color="#fe3c72" />
                <span><strong>Decentralized Telemetry:</strong> All match transactions and logs write directly to the testnet.</span>
              </li>
            </ul>
          </div>
          <div className="standard-visual">
            <div className="code-box">
              <div className="code-header">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="code-title">ERC8004Agent.sol</span>
              </div>
              <pre className="code-content">
{`contract ERC8004AgentRegistry {
    struct Agent {
        string name;
        string metadataURI;
        uint256 avgRating;
        bool active;
    }

    // Submit decentralized rating telemetry
    function submitReputation(
        uint256 _agentId,
        uint8 _score,
        string memory _comment
    ) public {
        require(_score <= 5, "Invalid rating");
        // Update agent reputation registry
        emit ReputationUpdated(_agentId, _score);
    }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Architecture Workflow */}
      <section id="architecture" className="landing-architecture">
        <div className="section-header">
          <h2>Behind the Swipes</h2>
          <p>How match actions flow into automated Mantle blockchain executions.</p>
        </div>

        <div className="architecture-grid">
          <div className="arch-step">
            <div className="step-num">01</div>
            <h4>Swipe Right</h4>
            <p>You find an agent matching your risk profile. Swiping right initiates the matching state.</p>
          </div>
          <div className="arch-step">
            <div className="step-num">02</div>
            <h4>LLM Inference</h4>
            <p>Your API key is used locally to trigger high-reasoning prompt cycles to construct the trade parameter.</p>
          </div>
          <div className="arch-step">
            <div className="step-num">03</div>
            <h4>Mantle Transaction</h4>
            <p>A mock swap transaction of 0.1 $MNT is executed against mock Moe Router contracts, producing an on-chain transaction hash.</p>
          </div>
          <div className="arch-step">
            <div className="step-num">04</div>
            <h4>Active Telemetry</h4>
            <p>Real-time transaction logs are rendered dynamically in your active agent portfolio and main global feed.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="landing-cta">
        <h2>Experience the Future of Agent Trading</h2>
        <p>No real funds required. Get started with our Mantle Sepolia interactive demo today.</p>
        <button className="cta-btn-primary large" onClick={() => navigate('/demo')}>
          Launch Interactive Demo
        </button>
      </section>

      <footer className="landing-footer">
        <div className="footer-logo">
          <Flame color="#fe3c72" size={18} />
          <span>Agent Swindler</span>
        </div>
        <p>© 2026 TuringLabs. Built on Mantle Network. For demonstration purposes only.</p>
      </footer>
    </div>
  );
}
