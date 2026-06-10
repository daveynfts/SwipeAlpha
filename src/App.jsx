import { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import { TrendingUp, AlertCircle, Cpu, Trophy, Landmark, Flame, Bell, Trash2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { TOKEN_ADDRESS, STAKING_ADDRESS, TOKEN_ABI, STAKING_ABI } from './constants';
import SwipeAlpha from './SwipeAlpha';
import LandingPage from './LandingPage';
import Profile from './Profile';
import Admin from './Admin';
import SoundEffects from './utils/soundEffects';
import WalletPortfolio from './WalletPortfolio';
import logoPng from './assets/logo.png';

function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.BrowserProvider(transport, network);
  return new ethers.JsonRpcSigner(provider, account.address);
}

function App() {
  const { address: account, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('soundEffectsEnabled');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('swindler_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasVietnamese = parsed.some(n => /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i.test(n.message || ''));
        if (!hasVietnamese) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 1,
        type: 'info',
        title: 'Smart Money Signal',
        message: 'Smart Money Signal: $AAVE is accumulating heavily by 45 large wallets.',
        time: new Date(Date.now() - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        timestamp: Date.now() - 120000
      },
      {
        id: 2,
        type: 'warning',
        title: 'Bounty Opportunity',
        message: 'Bounty Campaign: Subscribe to DeFi Alpha Pro to boost your yields.',
        time: new Date(Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        timestamp: Date.now() - 600000
      },
      {
        id: 3,
        type: 'info',
        title: 'Smart Money Signal',
        message: 'Smart Money Signal: $JUP trading volume has surged by 40%.',
        time: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        timestamp: Date.now() - 3600000
      }
    ];
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    SoundEffects.enabled = soundEnabled;
    localStorage.setItem('soundEffectsEnabled', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('swindler_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addNotification = useCallback((type, title, message, txHash = '') => {
    const newNotif = {
      id: Date.now(),
      type,
      title,
      message: message.replace(/\n/g, ' '),
      txHash,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    if (type === 'success' || type === 'warning') {
      SoundEffects.play('success');
    } else {
      SoundEffects.play('notification');
    }
  }, []);

  const prevConnectedRef = useRef(isConnected);
  useEffect(() => {
    if (isConnected && !prevConnectedRef.current) {
      SoundEffects.play('connect');
      addNotification('success', 'Wallet Connected', `EVM wallet connected: ${account?.substring(0, 6)}...${account?.substring(account.length - 4)}`);
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, account, addNotification]);

  useEffect(() => {
    const mockSignals = [
      { title: "Smart Money Signal", text: "Smart Money Signal: Whale withdrew 10,000 $AAVE from Binance." },
      { title: "Smart Money Signal", text: "Smart Money Signal: DeFi Alpha Pro reports $ENA accumulation rate reached 90%." },
      { title: "Smart Money Signal", text: "Smart Money Signal: Net buying volume of $JUP reached new highs from 3 major funds." },
      { title: "Smart Money Signal", text: "Smart Money Signal: Base ecosystem sees new capital inflows into $VIRTUAL." }
    ];

    const interval = setInterval(() => {
      const signal = mockSignals[Math.floor(Math.random() * mockSignals.length)];
      addNotification('info', signal.title, signal.text);
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, [addNotification]);
  
  const [selectedArchetype, setSelectedArchetype] = useState(null);

  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    const checkRoute = () => {
      let path = window.location.pathname;
      if (path.startsWith('/agentswindler')) {
        path = path.slice('/agentswindler'.length) || '/';
      }
      setCurrentPath(path);
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const navigate = (path) => {
    const hasPrefix = window.location.pathname.startsWith('/agentswindler');
    const basePath = hasPrefix ? '/agentswindler' : '';
    window.history.pushState({}, '', basePath + path);
    setCurrentPath(path);
  };
  if (currentPath === '/demo' || currentPath === '/demo/' || window.location.hash === '#/demo') {
    return (
      <div className="demo-mode-page">
        <header className="demo-header-capsule" style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 2rem)',
          maxWidth: '1120px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.6rem 1.2rem',
          borderRadius: '9999px',
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={logoPng} alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              <span style={{ background: 'linear-gradient(135deg, #fe3c72, #ff7854)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Agent Swindler 📱</span>
            </div>
            <a href="/" className="liquid-glass-btn" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }} onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}>
              🏠 Home
            </a>
            <a href="/profile" className="liquid-glass-btn" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }} onClick={(e) => {
              e.preventDefault();
              navigate('/profile');
            }}>
              👤 Profile & APIs
            </a>
          </div>

          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              const unreadCount = notifications.filter(n => !n.read).length;
              return (
                <div {...(!mounted && { style: { opacity: 0 } })} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }} ref={notificationRef}>
                  {/* Notification Bell Icon & Dropdown */}
                  {mounted && (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <button 
                        onClick={() => {
                          setShowNotifications(!showNotifications);
                          if (!showNotifications) {
                            // Mark all as read when opening
                            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          }
                        }} 
                        className="liquid-glass-btn" 
                        style={{ 
                          padding: '0.4rem 0.6rem', 
                          fontSize: '0.8rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          position: 'relative',
                          background: showNotifications ? 'rgba(254, 60, 114, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                          borderColor: showNotifications ? 'rgba(254, 60, 114, 0.4)' : 'rgba(255, 255, 255, 0.08)'
                        }}
                        title="Notifications"
                      >
                        <Bell size={16} color={unreadCount > 0 ? '#fe3c72' : '#ffffff'} style={{ filter: unreadCount > 0 ? 'drop-shadow(0 0 5px rgba(254, 60, 114, 0.5))' : 'none' }} />
                      </button>
                      {unreadCount > 0 && (
                        <span className="notification-badge" style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#ef4444',
                          color: 'white',
                          borderRadius: '12px',
                          padding: '0 5px',
                          fontSize: '0.6rem',
                          fontWeight: 'bold',
                          border: '1px solid #000',
                          minWidth: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          pointerEvents: 'none',
                          zIndex: 10
                        }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                      )}
                      
                      {showNotifications && (
                        <div className="notifications-dropdown">
                          <div className="notifications-header">
                            <h4>Activity Logs</h4>
                            {notifications.length > 0 && (
                              <button 
                                className="notifications-clear-btn" 
                                onClick={() => {
                                  setNotifications([]);
                                  setShowNotifications(false);
                                }}
                              >
                                <Trash2 size={12} /> Clear All
                              </button>
                            )}
                          </div>
                          <div className="notifications-list">
                            {notifications.length === 0 ? (
                              <div className="notifications-empty-state">
                                <Bell size={24} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                                <span>No activity recorded yet</span>
                              </div>
                            ) : (
                              notifications.map((notif) => (
                                <div key={notif.id} className={`notification-item ${notif.read ? '' : 'unread'}`}>
                                  <div className="notification-icon-container">
                                    <CheckCircle2 size={16} color="#10b981" />
                                  </div>
                                  <div className="notification-content">
                                    <div className="notification-title-row">
                                      <span className="notification-item-title">{notif.title}</span>
                                      <span className="notification-item-time">{notif.time}</span>
                                    </div>
                                    <span className="notification-item-message">{notif.message}</span>
                                    {notif.txHash && (
                                      <div className="notification-tx-hash-row">
                                        <span className="notification-tx-hash-text" title={notif.txHash}>
                                          Hash: {notif.txHash.substring(0, 6)}...{notif.txHash.substring(notif.txHash.length - 4)}
                                        </span>
                                        <a 
                                          href={`https://explorer.sepolia.mantle.xyz/tx/${notif.txHash}`} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="notification-explorer-link"
                                        >
                                          View <ExternalLink size={10} />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(() => {
                    if (!connected) {
                      return (
                        <button onClick={openConnectModal} className="liquid-glass-btn" style={{ padding: '0.45rem 1.2rem', fontSize: '0.8rem' }}>
                          Connect Wallet
                        </button>
                      );
                    }
                    if (chain.unsupported || chain.id !== 5003) {
                      return (
                        <button onClick={openChainModal} className="liquid-glass-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ff6b6b', padding: '0.45rem 1.2rem', fontSize: '0.8rem' }}>
                          Switch to Mantle
                        </button>
                      );
                    }
                    return (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={openChainModal} className="liquid-glass-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></div>
                          {chain.name.replace('Mantle ', '')}
                        </button>
                        <button onClick={() => setIsPortfolioOpen(true)} className="liquid-glass-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </header>
        <div className="demo-workspace-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6.5rem 1rem 2rem 1rem', minHeight: '100vh' }}>
          <SwipeAlpha 
            walletClient={walletClient} 
            account={account} 
            mode="demo" 
            archetype={selectedArchetype} 
            setArchetype={(val) => {
              setSelectedArchetype(val);
              if (val) localStorage.setItem('swindler_archetype', val);
              else localStorage.removeItem('swindler_archetype');
            }} 
            addNotification={addNotification}
            notifications={notifications}
            setNotifications={setNotifications}
            unreadCount={notifications.filter(n => !n.read).length}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
          />
          <WalletPortfolio 
            isOpen={isPortfolioOpen} 
            onClose={() => setIsPortfolioOpen(false)} 
            walletAddress={account} 
          />
        </div>
      </div>
    );
  }

  if (currentPath === '/profile' || currentPath.endsWith('/profile') || window.location.hash === '#/profile') {
    return <Profile navigate={navigate} />;
  }

  if (currentPath === '/admin' || currentPath.endsWith('/admin') || window.location.hash === '#/admin') {
    return <Admin navigate={navigate} />;
  }

  // Fallback to Apple-style Landing Page
  return <LandingPage navigate={navigate} />;
}

export default App;
