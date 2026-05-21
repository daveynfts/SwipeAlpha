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

  // LLM API States
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  
  // Active Model State
  const [activeModel, setActiveModel] = useState('claude-3-5-sonnet-latest');

  // UI States
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
    deepseek: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('user_display_name') || 'Agent Operator';
    const savedBio = localStorage.getItem('user_bio') || 'Managing autonomous trading portfolios on Mantle Network.';
    const savedSeed = localStorage.getItem('user_avatar_seed') || 'Neo';

    const savedOpenai = localStorage.getItem('api_key_openai') || '';
    const savedAnthropic = localStorage.getItem('api_key_anthropic') || '';
    const savedGemini = localStorage.getItem('api_key_gemini') || '';
    const savedDeepseek = localStorage.getItem('api_key_deepseek') || '';
    const savedModel = localStorage.getItem('api_active_model') || 'claude-3-5-sonnet-latest';

    setDisplayName(savedName);
    setBio(savedBio);
    setAvatarSeed(savedSeed);
    
    setOpenaiKey(savedOpenai);
    setAnthropicKey(savedAnthropic);
    setGeminiKey(savedGemini);
    setDeepseekKey(savedDeepseek);
    setActiveModel(savedModel);
  }, []);

  const handleToggleKeyVisibility = (provider) => {
    setShowKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setError('');

    // Save profile config
    localStorage.setItem('user_display_name', displayName);
    localStorage.setItem('user_bio', bio);
    localStorage.setItem('user_avatar_seed', avatarSeed);

    // Save API key config
    localStorage.setItem('api_key_openai', openaiKey);
    localStorage.setItem('api_key_anthropic', anthropicKey);
    localStorage.setItem('api_key_gemini', geminiKey);
    localStorage.setItem('api_key_deepseek', deepseekKey);
    localStorage.setItem('api_active_model', activeModel);

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

          {/* Section 2: LLM API Credentials */}
          <div className="settings-section-card">
            <div className="section-title">
              <Key size={18} color="#ff7854" />
              <h3>LLM API Integrations</h3>
            </div>
            <p className="card-disclaimer">
              Your API keys are stored exclusively in your local browser sandbox (`localStorage`). They are never uploaded or shared with any external servers.
            </p>

            <div className="api-keys-grid">
              {/* OpenAI */}
              <div className="api-key-row">
                <div className="key-brand-info">
                  <strong>OpenAI API Key</strong>
                  <span>For models like gpt-4o, gpt-4-turbo</span>
                </div>
                <div className="key-input-wrapper">
                  <input 
                    type={showKeys.openai ? "text" : "password"} 
                    value={openaiKey} 
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                  <button 
                    type="button" 
                    className="visibility-toggle"
                    onClick={() => handleToggleKeyVisibility('openai')}
                  >
                    {showKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Anthropic */}
              <div className="api-key-row">
                <div className="key-brand-info">
                  <strong>Anthropic Claude Key</strong>
                  <span>For models like claude-3-5-sonnet</span>
                </div>
                <div className="key-input-wrapper">
                  <input 
                    type={showKeys.anthropic ? "text" : "password"} 
                    value={anthropicKey} 
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                  <button 
                    type="button" 
                    className="visibility-toggle"
                    onClick={() => handleToggleKeyVisibility('anthropic')}
                  >
                    {showKeys.anthropic ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Gemini */}
              <div className="api-key-row">
                <div className="key-brand-info">
                  <strong>Google Gemini Key</strong>
                  <span>For models like gemini-1.5-pro</span>
                </div>
                <div className="key-input-wrapper">
                  <input 
                    type={showKeys.gemini ? "text" : "password"} 
                    value={geminiKey} 
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                  />
                  <button 
                    type="button" 
                    className="visibility-toggle"
                    onClick={() => handleToggleKeyVisibility('gemini')}
                  >
                    {showKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* DeepSeek */}
              <div className="api-key-row">
                <div className="key-brand-info">
                  <strong>DeepSeek Key</strong>
                  <span>For models like deepseek-chat</span>
                </div>
                <div className="key-input-wrapper">
                  <input 
                    type={showKeys.deepseek ? "text" : "password"} 
                    value={deepseekKey} 
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    placeholder="sk-ds-..."
                  />
                  <button 
                    type="button" 
                    className="visibility-toggle"
                    onClick={() => handleToggleKeyVisibility('deepseek')}
                  >
                    {showKeys.deepseek ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Model Execution Config */}
          <div className="settings-section-card">
            <div className="section-title">
              <Bot size={18} color="#a855f7" />
              <h3>Default Active Model</h3>
            </div>
            
            <div className="model-selector-grid">
              {/* OpenAI Option */}
              <div 
                className={`model-option-card ${activeModel === 'gpt-4o' ? 'active' : ''} ${!openaiKey ? 'disabled' : ''}`}
                onClick={() => openaiKey && setActiveModel('gpt-4o')}
              >
                <div className="model-header">
                  <strong>gpt-4o</strong>
                  <span className="provider-tag openai">OpenAI</span>
                </div>
                <p>High intelligence, quick reasoning, optimized for standard strategies.</p>
                {!openaiKey && <span className="warning-overlay">Needs OpenAI Key</span>}
              </div>

              {/* Anthropic Option */}
              <div 
                className={`model-option-card ${activeModel === 'claude-3-5-sonnet-latest' ? 'active' : ''} ${!anthropicKey ? 'disabled' : ''}`}
                onClick={() => anthropicKey && setActiveModel('claude-3-5-sonnet-latest')}
              >
                <div className="model-header">
                  <strong>claude-3.5-sonnet</strong>
                  <span className="provider-tag anthropic">Anthropic</span>
                </div>
                <p>State-of-the-art coding, trading strategy synthesis, and execution logic.</p>
                {!anthropicKey && <span className="warning-overlay">Needs Anthropic Key</span>}
              </div>

              {/* Gemini Option */}
              <div 
                className={`model-option-card ${activeModel === 'gemini-1.5-pro' ? 'active' : ''} ${!geminiKey ? 'disabled' : ''}`}
                onClick={() => geminiKey && setActiveModel('gemini-1.5-pro')}
              >
                <div className="model-header">
                  <strong>gemini-1.5-pro</strong>
                  <span className="provider-tag gemini">Google</span>
                </div>
                <p>Extra large context size, optimal for scanning multi-page auditor reports.</p>
                {!geminiKey && <span className="warning-overlay">Needs Gemini Key</span>}
              </div>

              {/* DeepSeek Option */}
              <div 
                className={`model-option-card ${activeModel === 'deepseek-chat' ? 'active' : ''} ${!deepseekKey ? 'disabled' : ''}`}
                onClick={() => deepseekKey && setActiveModel('deepseek-chat')}
              >
                <div className="model-header">
                  <strong>deepseek-chat</strong>
                  <span className="provider-tag deepseek">DeepSeek</span>
                </div>
                <p>Fast inference, cheap operational costs, excellent raw mathematical logic.</p>
                {!deepseekKey && <span className="warning-overlay">Needs DeepSeek Key</span>}
              </div>
            </div>
          </div>

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
