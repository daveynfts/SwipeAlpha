import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Trash2, RefreshCw, Sparkles, AlertTriangle, Image as ImageIcon, Check } from 'lucide-react';
import './Admin.css';

// Import default assets to show as previews or fallbacks
import archetypeMemeDefault from './assets/archetype_meme.png';
import archetypeBalancedDefault from './assets/archetype_balanced.png';
import archetypeBluechipDefault from './assets/archetype_bluechip.png';

export default function Admin({ navigate }) {
  const [memeImg, setMemeImg] = useState('');
  const [balancedImg, setBalancedImg] = useState('');
  const [bluechipImg, setBluechipImg] = useState('');

  const [memeUrlInput, setMemeUrlInput] = useState('');
  const [balancedUrlInput, setBalancedUrlInput] = useState('');
  const [bluechipUrlInput, setBluechipUrlInput] = useState('');

  const [notif, setNotif] = useState(null);

  // AI settings states
  const [apiKey, setApiKey] = useState('nsn_1fedc711984cd0cfc6c18735b6614875');
  const [aiModel, setAiModel] = useState('fast');
  const [systemPrompt, setSystemPrompt] = useState('');

  // Load current config
  useEffect(() => {
    setMemeImg(localStorage.getItem('custom_archetype_meme') || '');
    setBalancedImg(localStorage.getItem('custom_archetype_balanced') || '');
    setBluechipImg(localStorage.getItem('custom_archetype_bluechip') || '');

    // Load AI config
    let savedKey = localStorage.getItem('nansen_api_key');
    if (!savedKey || !savedKey.startsWith('nsn_')) {
      savedKey = 'nsn_1fedc711984cd0cfc6c18735b6614875';
    }
    setApiKey(savedKey);

    let savedModel = localStorage.getItem('nansen_ai_model');
    if (savedModel !== 'fast' && savedModel !== 'expert') {
      savedModel = 'fast';
    }
    setAiModel(savedModel);
    setSystemPrompt(localStorage.getItem('nansen_system_prompt') || '');
  }, []);

  const triggerNotification = (message, type = 'success') => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const handleSaveApiSettings = () => {
    localStorage.setItem('nansen_api_key', apiKey.trim());
    localStorage.setItem('nansen_ai_model', aiModel.trim());
    localStorage.setItem('nansen_system_prompt', systemPrompt);
    triggerNotification('AI API configurations saved successfully!', 'success');
  };

  const handleResetApiSettings = () => {
    localStorage.removeItem('nansen_api_key');
    localStorage.removeItem('nansen_ai_model');
    localStorage.removeItem('nansen_system_prompt');
    setApiKey('nsn_1fedc711984cd0cfc6c18735b6614875');
    setAiModel('fast');
    setSystemPrompt('');
    triggerNotification('AI API configurations reset to default!', 'success');
  };

  const handleFileUpload = (e, key, setter) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerNotification('File size is over 2MB. Please choose a smaller image under 2MB to avoid storage errors.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Str = uploadEvent.target.result;
      try {
        localStorage.setItem(key, base64Str);
        setter(base64Str);
        triggerNotification('Image uploaded and saved successfully!', 'success');
      } catch (err) {
        console.error("Storage error:", err);
        triggerNotification('Failed to save to localStorage. The file might be too large.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (key, url, setter) => {
    if (!url.trim()) return;
    try {
      localStorage.setItem(key, url.trim());
      setter(url.trim());
      triggerNotification('Image URL saved successfully!', 'success');
    } catch (err) {
      console.error("Storage error:", err);
      triggerNotification('Failed to save URL to storage.', 'error');
    }
  };

  const handleClear = (key, setter) => {
    localStorage.removeItem(key);
    setter('');
    triggerNotification('Reverted to default asset.', 'success');
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all 3 archetypes back to their default images?')) {
      localStorage.removeItem('custom_archetype_meme');
      localStorage.removeItem('custom_archetype_balanced');
      localStorage.removeItem('custom_archetype_bluechip');
      setMemeImg('');
      setBalancedImg('');
      setBluechipImg('');
      setMemeUrlInput('');
      setBalancedUrlInput('');
      setBluechipUrlInput('');
      triggerNotification('All archetypes reset to default assets.', 'success');
    }
  };

  return (
    <div className="admin-container">
      {/* Toast Notification */}
      {notif && (
        <div className={`admin-toast ${notif.type}`}>
          {notif.type === 'success' && <Check size={16} />}
          {notif.type === 'warning' && <AlertTriangle size={16} />}
          {notif.type === 'error' && <AlertTriangle size={16} />}
          <span>{notif.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button className="admin-back-btn" onClick={() => navigate('/demo')}>
            <ArrowLeft size={18} />
            <span>Go to Demo</span>
          </button>
        </div>
        <div className="admin-header-center">
          <Sparkles className="sparkle-glow" size={20} color="#fe3c72" />
          <h1 className="admin-title">AI Character Setup</h1>
        </div>
        <div className="admin-header-right">
          <button className="admin-reset-all-btn" onClick={handleResetAll}>
            <RefreshCw size={16} />
            <span>Reset All Defaults</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-intro-card">
          <AlertTriangle size={20} color="#eab308" style={{ flexShrink: 0 }} />
          <div>
            <h3>Secret Admin Dashboard</h3>
            <p>
              Configure custom AI models and avatar appearances for the 3 trade-matching archetypes. 
              Upload local image files (which are stored locally as base64 data URLs) or input direct remote links. 
              <strong> Keep uploads under 1.5MB</strong> to prevent browser storage limits.
            </p>
          </div>
        </div>

        {/* Nansen & AI Analyst Settings */}
        <div className="api-config-card">
          <div className="api-config-header">
            <h2>Nansen & AI Analyst Settings</h2>
            <span className="badge-api">On-chain Intelligence Provider</span>
          </div>
          <p className="api-config-desc">
            Configure external AI analysis for the 3rd card tab. When a user authorizes on-chain, the app fetches direct intelligence using the selected LLM provider and API key.
          </p>

          <div className="api-config-form">
            <div className="admin-form-row">
              <div className="admin-form-group full-width">
                <label>API Secret Key:</label>
                <input 
                  type="password" 
                  placeholder="Enter API key (stored locally in browser)" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="api-key-input"
                />
              </div>
            </div>

            <div className="admin-form-group full-width">
              <label>AI Model ID (fast or expert):</label>
              <input 
                type="text" 
                placeholder="e.g. fast, expert" 
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="api-model-input"
              />
            </div>

            <div className="admin-form-group full-width">
              <label>System Prompt (English):</label>
              <textarea 
                placeholder="System instructions for trading analysis..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="api-prompt-textarea"
                rows={6}
              />
            </div>

            <div className="api-config-actions">
              <button className="save-api-btn" onClick={handleSaveApiSettings}>
                Save AI Configuration
              </button>
              <button className="reset-api-btn" onClick={handleResetApiSettings}>
                Reset AI Settings
              </button>
            </div>
          </div>
        </div>

        <div className="archetype-grid">
          {/* Card 1: Sakura (Meme) */}
          <div className="archetype-admin-card card-meme-glow">
            <div className="archetype-admin-header meme">
              <h2>Sakura</h2>
              <span className="badge-meme">Degen / Meme Archetype</span>
            </div>
            
            <div className="preview-container">
              <div className="preview-label">Active Image Preview:</div>
              <div className="img-preview-box">
                <img src={memeImg || archetypeMemeDefault} alt="Sakura preview" />
                {!memeImg && <span className="fallback-badge">Using Default Asset</span>}
              </div>
            </div>

            <div className="admin-form-group">
              <label>Upload Custom Image:</label>
              <div className="file-upload-wrapper">
                <Upload size={18} />
                <span>Choose Image file...</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'custom_archetype_meme', setMemeImg)} 
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Or Paste Image URL:</label>
              <div className="url-input-wrapper">
                <input 
                  type="text" 
                  placeholder="https://example.com/waifu.png" 
                  value={memeUrlInput}
                  onChange={(e) => setMemeUrlInput(e.target.value)}
                />
                <button 
                  onClick={() => handleUrlSubmit('custom_archetype_meme', memeUrlInput, setMemeImg)}
                  disabled={!memeUrlInput.trim()}
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="clear-btn" 
                onClick={() => { handleClear('custom_archetype_meme', setMemeImg); setMemeUrlInput(''); }} 
                disabled={!memeImg}
              >
                <Trash2 size={14} /> Revert to Default
              </button>
            </div>
          </div>

          {/* Card 2: Rin (Balanced) */}
          <div className="archetype-admin-card card-balanced-glow">
            <div className="archetype-admin-header balanced">
              <h2>Rin</h2>
              <span className="badge-balanced">Tech-Wear / Balanced Archetype</span>
            </div>

            <div className="preview-container">
              <div className="preview-label">Active Image Preview:</div>
              <div className="img-preview-box">
                <img src={balancedImg || archetypeBalancedDefault} alt="Rin preview" />
                {!balancedImg && <span className="fallback-badge">Using Default Asset</span>}
              </div>
            </div>

            <div className="admin-form-group">
              <label>Upload Custom Image:</label>
              <div className="file-upload-wrapper">
                <Upload size={18} />
                <span>Choose Image file...</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'custom_archetype_balanced', setBalancedImg)} 
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Or Paste Image URL:</label>
              <div className="url-input-wrapper">
                <input 
                  type="text" 
                  placeholder="https://example.com/waifu.png" 
                  value={balancedUrlInput}
                  onChange={(e) => setBalancedUrlInput(e.target.value)}
                />
                <button 
                  onClick={() => handleUrlSubmit('custom_archetype_balanced', balancedUrlInput, setBalancedImg)}
                  disabled={!balancedUrlInput.trim()}
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="clear-btn" 
                onClick={() => { handleClear('custom_archetype_balanced', setBalancedImg); setBalancedUrlInput(''); }} 
                disabled={!balancedImg}
              >
                <Trash2 size={14} /> Revert to Default
              </button>
            </div>
          </div>

          {/* Card 3: Yuki (Bluechip) */}
          <div className="archetype-admin-card card-bluechip-glow">
            <div className="archetype-admin-header bluechip">
              <h2>Yuki</h2>
              <span className="badge-bluechip">Goddess / Bluechip Archetype</span>
            </div>

            <div className="preview-container">
              <div className="preview-label">Active Image Preview:</div>
              <div className="img-preview-box">
                <img src={bluechipImg || archetypeBluechipDefault} alt="Yuki preview" />
                {!bluechipImg && <span className="fallback-badge">Using Default Asset</span>}
              </div>
            </div>

            <div className="admin-form-group">
              <label>Upload Custom Image:</label>
              <div className="file-upload-wrapper">
                <Upload size={18} />
                <span>Choose Image file...</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'custom_archetype_bluechip', setBluechipImg)} 
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Or Paste Image URL:</label>
              <div className="url-input-wrapper">
                <input 
                  type="text" 
                  placeholder="https://example.com/waifu.png" 
                  value={bluechipUrlInput}
                  onChange={(e) => setBluechipUrlInput(e.target.value)}
                />
                <button 
                  onClick={() => handleUrlSubmit('custom_archetype_bluechip', bluechipUrlInput, setBluechipImg)}
                  disabled={!bluechipUrlInput.trim()}
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="clear-btn" 
                onClick={() => { handleClear('custom_archetype_bluechip', setBluechipImg); setBluechipUrlInput(''); }} 
                disabled={!bluechipImg}
              >
                <Trash2 size={14} /> Revert to Default
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
