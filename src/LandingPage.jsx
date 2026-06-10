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
import logoPng from './assets/logo.png';

export default function LandingPage({ navigate }) {
  // Retrieve custom uploaded waifus from localStorage or use fallback images
  const memeImg = localStorage.getItem('custom_archetype_meme') || archetypeMeme;
  const balancedImg = localStorage.getItem('custom_archetype_balanced') || archetypeBalanced;
  const bluechipImg = localStorage.getItem('custom_archetype_bluechip') || archetypeBluechip;

  // Profile cards data for phone mockups background
  const profiles = [
    { name: "Sakura", age: 21, image: memeImg, category: "Degen AI" },
    { name: "Rin", age: 22, image: balancedImg, category: "Balanced AI" },
    { name: "Yuki", age: 23, image: bluechipImg, category: "Bluechip AI" },
    { name: "Mika", age: 21, image: waifu1, category: "AI Scalper" },
    { name: "Ami", age: 22, image: waifu2, category: "Yield Sniper" },
    { name: "Luna", age: 22, image: waifu3, category: "Arbitrage Bot" },
    { name: "Airi", age: 23, image: waifu4, category: "Sentiment Bot" },
    { name: "Hana", age: 20, image: waifu1, category: "Meme Sniper" },
    { name: "Yumi", age: 21, image: waifu2, category: "Hedge Bot" },
    { name: "Sora", age: 21, image: waifu3, category: "Volume Bot" },
    { name: "Kira", age: 22, image: waifu4, category: "LP Rebalancer" },
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
                    <img src={logoPng} alt="Logo" className="hero-phone-flame-logo" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
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
                    <img src={logoPng} alt="Logo" className="hero-phone-flame-logo" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
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
          <img src={logoPng} alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(254, 60, 114, 0.45))' }} />
          <span>AGENT <span>SWINDLER</span></span>
        </div>
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
    </div>
  );
}
