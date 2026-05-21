import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TrendingUp, AlertCircle, Cpu, Trophy, Landmark, Flame } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { TOKEN_ADDRESS, STAKING_ADDRESS, TOKEN_ABI, STAKING_ABI } from './constants';
import SwipeAlpha from './SwipeAlpha';

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
  
  const [tokenContract, setTokenContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  
  const [currentView, setCurrentView] = useState('swipealpha'); // 'swipealpha' or 'staking'
  
  const [balance, setBalance] = useState('0');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [pendingRewards, setPendingRewards] = useState('0');
  const [realtimeRewards, setRealtimeRewards] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');
  const [poolBalance, setPoolBalance] = useState('0');
  const [depletionTime, setDepletionTime] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRain, setShowRain] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState(() => {
    return localStorage.getItem('swindler_archetype') || null;
  });

  const isConfigured = TOKEN_ADDRESS !== "0xYOUR_TOKEN_ADDRESS_HERE" && STAKING_ADDRESS !== "0xYOUR_STAKING_CONTRACT_ADDRESS_HERE";

  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      setIsDemo(path === '/demo' || path.endsWith('/demo') || window.location.hash === '#/demo');
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);
  useEffect(() => {
    if (walletClient && isConfigured) {
      const signer = clientToSigner(walletClient);
      setTokenContract(new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer));
      setStakingContract(new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer));
    } else {
      setTokenContract(null);
      setStakingContract(null);
    }
  }, [walletClient, isConfigured]);

  useEffect(() => {
    if (account && isConfigured && tokenContract && stakingContract) {
      fetchData();
      const interval = setInterval(fetchData, 15000); // Poll every 15s
      return () => clearInterval(interval);
    }
  }, [account, tokenContract, stakingContract, isConfigured]);

  useEffect(() => {
    if (Number(stakedBalance) <= 0) {
      setRealtimeRewards(pendingRewards);
      return;
    }
    
    const stakedNumber = Number(stakedBalance);
    const rewardPerSecond = (stakedNumber * 5) / (100 * 31536000);
    const rewardPerMs = rewardPerSecond / 1000;
    
    let currentReward = Number(pendingRewards);
    let lastTime = Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - lastTime;
      currentReward += elapsedMs * rewardPerMs;
      lastTime = now;
      
      setRealtimeRewards(currentReward.toString());
    }, 50);
    
    return () => clearInterval(interval);
  }, [pendingRewards, stakedBalance]);

  const fetchData = async () => {
    if (!tokenContract || !stakingContract || !account) return;
    try {
      const bal = await tokenContract.balanceOf(account);
      setBalance(ethers.formatEther(bal));

      const stakerInfo = await stakingContract.stakers(account);
      setStakedBalance(ethers.formatEther(stakerInfo.stakedAmount));
      
      const rewards = await stakingContract.calculateReward(account);
      const formattedRewards = ethers.formatEther(rewards);
      setPendingRewards(formattedRewards);
      setRealtimeRewards(formattedRewards);

      const total = await stakingContract.totalStaked();
      const totalFormatted = ethers.formatEther(total);
      setTotalStaked(totalFormatted);
      
      const contractBal = await tokenContract.balanceOf(STAKING_ADDRESS);
      const rewardReserve = contractBal - total;
      const reserveFormatted = ethers.formatEther(rewardReserve);
      setPoolBalance(reserveFormatted);
      
      const totalNum = Number(totalFormatted);
      const reserveNum = Number(reserveFormatted);
      
      if (totalNum > 0) {
        const rewardPerYear = totalNum * 0.05;
        const rewardPerDay = rewardPerYear / 365;
        const daysLeft = reserveNum / rewardPerDay;
        
        if (daysLeft > 365) {
          setDepletionTime('> 1 Year');
        } else if (daysLeft > 30) {
          setDepletionTime(`~${Math.floor(daysLeft / 30)} Months`);
        } else {
          setDepletionTime(`~${Math.floor(daysLeft)} Days`);
        }
      } else {
        setDepletionTime('∞ (No stakers)');
      }
      
      fetchLeaderboard();
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchLeaderboard = async () => {
    if (!tokenContract || !stakingContract) return;
    try {
      const filter = tokenContract.filters.Transfer(null, STAKING_ADDRESS);
      
      const currentBlock = await tokenContract.runner.provider.getBlockNumber();
      const fromBlock = currentBlock > 5000 ? currentBlock - 5000 : 0;
      
      const events = await tokenContract.queryFilter(filter, fromBlock, currentBlock);
      
      const uniqueAddresses = [...new Set(events.map(e => e.args[0]))];
      
      const stakersData = await Promise.all(
        uniqueAddresses.map(async (addr) => {
          const info = await stakingContract.stakers(addr);
          return {
            address: addr,
            staked: Number(ethers.formatEther(info.stakedAmount))
          };
        })
      );
      
      const sorted = stakersData.filter(s => s.staked > 0).sort((a, b) => b.staked - a.staked);
      setLeaderboard(sorted);
    } catch (err) {
      console.error("Leaderboard error:", err);
    }
  };

  const triggerRain = () => {
    setShowRain(true);
    setTimeout(() => setShowRain(false), 5000); // Rains for 5 seconds
  };

  const renderRain = () => {
    if (!showRain) return null;
    const drops = Array.from({ length: 60 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 1.5;
      const duration = 2 + Math.random() * 2;
      const size = 1.5 + Math.random() * 1.5;
      return (
        <div 
          key={i} 
          className="token-drop" 
          style={{ 
            left: `${left}%`, 
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            fontSize: `${size}rem`
          }}
        >
          🪙
        </div>
      );
    });
    return <div className="token-rain-container">{drops}</div>;
  };

  const handleAction = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const amountWei = ethers.parseEther(amount);

      if (activeTab === 'stake') {
        const allowance = await tokenContract.allowance(account, STAKING_ADDRESS);
        if (allowance < amountWei) {
          const approveTx = await tokenContract.approve(STAKING_ADDRESS, amountWei);
          await approveTx.wait();
        }
        
        const tx = await stakingContract.stake(amountWei);
        await tx.wait();
        triggerRain(); // Make it rain when they stake!
      } else {
        const tx = await stakingContract.unstake(amountWei);
        await tx.wait();
      }
      
      setAmount('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.reason || err.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const claimRewards = async () => {
    setError('');
    setIsLoading(true);
    try {
      const tx = await stakingContract.claimReward();
      await tx.wait();
      fetchData();
      triggerRain(); // Make it rain when they claim rewards!
    } catch (err) {
      console.error(err);
      setError(err.reason || err.message || "Failed to claim rewards");
    } finally {
      setIsLoading(false);
    }
  };

  const setMaxAmount = () => {
    if (activeTab === 'stake') setAmount(balance);
    else setAmount(stakedBalance);
  };

  if (isDemo) {
    return (
      <div className="demo-mode-page">
        {renderRain()}
        <header className="demo-header-capsule" style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '1100px',
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
              <Flame size={18} color="#fe3c72" style={{ filter: 'drop-shadow(0 0 5px rgba(254, 60, 114, 0.4))' }} />
              <span style={{ background: 'linear-gradient(135deg, #fe3c72, #ff7854)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Agent Swindler 📱</span>
            </div>
            <a href="/" className="liquid-glass-btn" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }} onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/');
              setIsDemo(false);
            }}>
              💻 Go to DApp
            </a>
          </div>

          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <div {...(!mounted && { style: { opacity: 0 } })}>
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
                        <button onClick={openAccountModal} className="liquid-glass-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6.5rem 1rem 2rem 1rem', minHeight: '100vh' }}>
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
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {renderRain()}
      <header className="header">
        <div className="logo">
          <Flame color="#fe3c72" size={28} style={{ filter: 'drop-shadow(0 0 8px rgba(254, 60, 114, 0.45))' }} />
          AGENT <span>SWINDLER</span>
        </div>

        {/* View Switcher: Staking vs SwipeAlpha vs Mobile Demo */}
        <div className="view-selector" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.25rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            className={`view-btn ${currentView === 'staking' ? 'active' : ''}`}
            onClick={() => setCurrentView('staking')}
            style={{
              background: currentView === 'staking' ? 'rgba(254, 60, 114, 0.18)' : 'transparent',
              border: 'none',
              color: currentView === 'staking' ? 'var(--primary)' : 'var(--text-muted)',
              padding: '0.4rem 1.2rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🏛️ Swindler Vault
          </button>
          <button 
            className={`view-btn ${currentView === 'swipealpha' ? 'active' : ''}`}
            onClick={() => setCurrentView('swipealpha')}
            style={{
              background: currentView === 'swipealpha' ? 'rgba(254, 60, 114, 0.18)' : 'transparent',
              border: 'none',
              color: currentView === 'swipealpha' ? 'var(--primary)' : 'var(--text-muted)',
              padding: '0.4rem 1.2rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🧠 Swindler Swipe
          </button>
          <a 
            href="/demo"
            className="view-btn"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/demo');
              setIsDemo(true);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '0.4rem 1.2rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.3s'
            }}
          >
            📱 Mobile Demo
          </a>
        </div>

        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const connected = mounted && account && chain;
            return (
              <div {...(!mounted && { style: { opacity: 0 } })}>
                {(() => {
                  if (!connected) {
                    return (
                      <button onClick={openConnectModal} className="liquid-glass-btn" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                        Connect Wallet
                      </button>
                    );
                  }
                  if (chain.unsupported || chain.id !== 5003) {
                    return (
                      <button onClick={openChainModal} className="liquid-glass-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ff6b6b', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                        <AlertCircle size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }}/>
                        Switch to Mantle Testnet
                      </button>
                    );
                  }
                  return (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={openChainModal} className="liquid-glass-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                        {chain.name}
                      </button>
                      <button onClick={openAccountModal} className="liquid-glass-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
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

      {currentView === 'staking' ? (
        <>
          {!isConfigured && (
            <div style={{ background: 'rgba(255, 74, 74, 0.1)', border: '1px solid var(--error)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', width: '100%', maxWidth: '500px', display: 'flex', gap: '0.5rem' }}>
              <AlertCircle color="var(--error)" />
              <div>
                <strong>Setup Required:</strong> Please deploy your MockERC20 and Staking contracts to Mantle Sepolia, then update the addresses in <code>src/constants.js</code>.
              </div>
            </div>
          )}

          <div className="hero-section">
            <div className="vault-icon-container" style={{ background: 'rgba(254, 60, 114, 0.1)', border: '1px solid rgba(254, 60, 114, 0.3)', boxShadow: '0 0 30px rgba(254, 60, 114, 0.15)' }}>
              <Flame className="vault-icon" size={48} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 8px rgba(254, 60, 114, 0.4))' }} />
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay"></div>
            </div>
            <h2 className="hero-title">Agent Swindler Vault</h2>
            <p className="hero-subtitle">Watch your wealth grow in real-time.</p>
            <div className="live-yield-display">
              <span className="live-dot"></span>
              <span className="live-text">LIVE YIELD:</span>
              <span className="live-amount">+{Number(realtimeRewards).toLocaleString(undefined, {minimumFractionDigits: 6, maximumFractionDigits: 6})}</span>
              <span className="live-currency">$SWINDLER</span>
            </div>
          </div>

          <main className="main-card">
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">My Staked</div>
                <div className="stat-value">{Number(stakedBalance).toLocaleString(undefined, {maximumFractionDigits: 2})} $SWINDLER</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Current APY</div>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <TrendingUp size={20} /> 5%
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Reward Pool</div>
                <div className="stat-value">{Number(poolBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} $SWINDLER</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Time to Deplete</div>
                <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>{depletionTime || '-'}</div>
              </div>
            </div>

            <div className="action-tabs">
              <button 
                className={`tab-btn ${activeTab === 'stake' ? 'active' : ''}`}
                onClick={() => { setActiveTab('stake'); setAmount(''); setError(''); }}
              >
                Stake
              </button>
              <button 
                className={`tab-btn ${activeTab === 'unstake' ? 'active' : ''}`}
                onClick={() => { setActiveTab('unstake'); setAmount(''); setError(''); }}
              >
                Unstake
              </button>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input 
                  type="number" 
                  className="token-input"
                  placeholder="0.0" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading || !isConfigured || !isConnected}
                />
                <button className="max-btn" onClick={setMaxAmount} disabled={isLoading || !isConfigured || !isConnected}>MAX</button>
                <span style={{ fontWeight: 600, color: 'var(--primary)', paddingRight: '0.5rem' }}>$SWINDLER</span>
              </div>
              <div className="balance-text">
                Available: {activeTab === 'stake' ? Number(balance).toLocaleString(undefined, {maximumFractionDigits: 4}) : Number(stakedBalance).toLocaleString(undefined, {maximumFractionDigits: 4})}
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button 
              className="submit-btn" 
              onClick={handleAction}
              disabled={isLoading || !isConnected || !amount || !isConfigured}
            >
              {isLoading ? <div className="loader"></div> : (activeTab === 'stake' ? 'Stake Tokens' : 'Unstake Tokens')}
            </button>

            <div className="rewards-section">
              <button 
                className="claim-btn liquid-glass-btn"
                onClick={claimRewards}
                disabled={isLoading || Number(pendingRewards) <= 0 || !isConfigured || !isConnected}
              >
                Claim Rewards
              </button>
            </div>
          </main>

          {leaderboard.length > 0 && (
            <div className="leaderboard-card">
              <div className="leaderboard-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Trophy color="var(--primary)" size={24} />
                  <h3>Top Stakers</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Global Total Staked</div>
                  <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', textShadow: '0 0 10px rgba(254, 60, 114, 0.2)' }}>
                    {Number(totalStaked).toLocaleString(undefined, {maximumFractionDigits: 2})} $SWINDLER
                  </div>
                </div>
              </div>
              <div className="leaderboard-list">
                {leaderboard.map((staker, index) => (
                  <div key={staker.address} className="leaderboard-item">
                    <div className="staker-rank">#{index + 1}</div>
                    <div className="staker-address">
                      {staker.address === account ? (
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>You</span>
                      ) : (
                        `${staker.address.substring(0, 6)}...${staker.address.substring(staker.address.length - 4)}`
                      )}
                    </div>
                    <div className="staker-amount">
                      {staker.staked.toLocaleString(undefined, {maximumFractionDigits: 2})} $SWINDLER
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <SwipeAlpha 
          walletClient={walletClient} 
          account={account} 
          mode="desktop" 
          archetype={selectedArchetype} 
          setArchetype={(val) => {
            setSelectedArchetype(val);
            if (val) localStorage.setItem('swindler_archetype', val);
            else localStorage.removeItem('swindler_archetype');
          }} 
        />
      )}
    </div>
  );
}

export default App;
