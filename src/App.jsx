import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TrendingUp, AlertCircle, Cpu, Trophy, Landmark, Flame } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { TOKEN_ADDRESS, STAKING_ADDRESS, TOKEN_ABI, STAKING_ABI } from './constants';
import SwipeAlpha from './SwipeAlpha';
import LandingPage from './LandingPage';
import Profile from './Profile';
import Admin from './Admin';

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
  const [selectedArchetype, setSelectedArchetype] = useState(null);

  const isConfigured = TOKEN_ADDRESS !== "0xYOUR_TOKEN_ADDRESS_HERE" && STAKING_ADDRESS !== "0xYOUR_STAKING_CONTRACT_ADDRESS_HERE";

  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };
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

  if (currentPath === '/demo' || currentPath.endsWith('/demo') || window.location.hash === '#/demo') {
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
