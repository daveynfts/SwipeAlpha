import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, Save, Key, Bot, Sparkles, User, Wallet, Check } from 'lucide-react';
import { useAccount } from 'wagmi';
import './Profile.css';

const DEFAULT_AVATARS = ['Alex', 'Grace', 'Charlie', 'Luna', 'Neo', 'Max'];

export default function Profile({ navigate }) {
  const { address: walletAddress, isConnected } = useAccount();

  // Basic Profile States
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Neo');

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('user_display_name') || 'Agent Operator';
    const savedBio = localStorage.getItem('user_bio') || 'Managing autonomous trading portfolios on Mantle Network.';
    const savedSeed = localStorage.getItem('user_avatar_seed') || 'Neo';

    setDisplayName(savedName);
    setBio(savedBio);
    setAvatarSeed(savedSeed);
  }, []);

  const handleSave = () => {
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }
    setIsSaving(true);
    setError('');

    // Save profile config
    localStorage.setItem('user_display_name', displayName);
    localStorage.setItem('user_bio', bio);
    localStorage.setItem('user_avatar_seed', avatarSeed);

    // Trigger visual success notification
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800); // 800ms simulation
  };

  const [error, setError] = useState('');

  return (
    <div className="profile-page">
      {/* Background blobs */}
      <div className="profile-glow glow-top"></div>
      <div className="profile-glow glow-bottom"></div>

      {/* Floating Capsule Header */}
      <header className="profile-navbar">
        <button className="back-btn" onClick={() => navigate('/demo')}>
          <ArrowLeft size={16} /> Back to Demo
        </button>
        <div className="profile-title-header">
          <h2>Profile & AI Settings</h2>
        </div>
        <div style={{ width: 120 }}>{/* spacer */}</div>
      </header>

      <main className="profile-main-container">
        {/* Profile Card Column */}
        <section className="profile-sidebar">
          <div className="profile-card-glow"></div>
          <div className="user-avatar-showcase">
            <img 
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`} 
              alt="Avatar Preview" 
              className="user-avatar-img"
            />
            <div className="avatar-seed-badge">Seed: {avatarSeed}</div>
          </div>

          <div className="sidebar-info-block">
            <h3>{displayName || 'User Profile'}</h3>
            <p className="sidebar-bio">{bio || 'No bio written yet.'}</p>
          </div>

          <div className="wallet-connector-status">
            <div className="status-label">
              <Wallet size={14} /> Connected Wallet
            </div>
            {isConnected && walletAddress ? (
              <div className="wallet-address-box">
                {`${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 8)}`}
              </div>
            ) : (
              <div className="wallet-address-box disconnected">
                No Wallet Connected
              </div>
            )}
          </div>
        </section>

        {/* Forms Configuration Column */}
        <section className="profile-settings-form">
          {/* Section 1: Basic Information */}
          <div className="settings-section-card">
            <div className="section-title">
              <User size={18} color="#fe3c72" />
              <h3>Basic Profile Settings</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Display Name</label>
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Satoshi"
                />
              </div>

              <div className="form-group">
                <label>Avatar Seed</label>
                <div className="avatar-seed-picker">
                  <input 
                    type="text" 
                    value={avatarSeed} 
                    onChange={(e) => setAvatarSeed(e.target.value)} 
                    placeholder="Neo"
                  />
                  <div className="preset-seeds">
                    {DEFAULT_AVATARS.map((seed) => (
                      <button 
                        key={seed} 
                        type="button"
                        className={`preset-btn ${avatarSeed === seed ? 'active' : ''}`}
                        onClick={() => setAvatarSeed(seed)}
                      >
                        {seed}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group span-2">
                <label>Bio / Description</label>
                <textarea 
                  rows="3" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your trading configurations..."
                />
              </div>
            </div>
          </div>



          {error && (
            <div className="profile-error-message" style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600, textAlign: 'center' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Trigger Actions */}
          <div className="profile-action-footer">
            <button 
              className={`profile-save-btn ${showSuccess ? 'success' : ''}`} 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="loader"></div>
              ) : showSuccess ? (
                <>
                  <Check size={18} /> Configuration Saved!
                </>
              ) : (
                <>
                  <Save size={18} /> Save Settings
                </>
              )}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
