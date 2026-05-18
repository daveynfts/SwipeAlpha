import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TrendingUp, AlertCircle, Cpu, Trophy } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { TOKEN_ADDRESS, STAKING_ADDRESS, TOKEN_ABI, STAKING_ABI } from './constants';

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
  
  const [balance, setBalance] = useState('0');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [pendingRewards, setPendingRewards] = useState('0');
  const [realtimeRewards, setRealtimeRewards] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');
  const [leaderboard, setLeaderboard] = useState([]);
  
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfigured = TOKEN_ADDRESS !== "0xYOUR_TOKEN_ADDRESS_HERE" && STAKING_ADDRESS !== "0xYOUR_STAKING_CONTRACT_ADDRESS_HERE";

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
      setTotalStaked(ethers.formatEther(total));
      
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

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <Cpu color="#00efc8" size={28} />
          MANTLE <span>STAKE</span>
        </div>
        <ConnectButton />
      </header>

      {!isConfigured && (
        <div style={{ background: 'rgba(255, 74, 74, 0.1)', border: '1px solid var(--error)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', width: '100%', maxWidth: '500px', display: 'flex', gap: '0.5rem' }}>
          <AlertCircle color="var(--error)" />
          <div>
            <strong>Setup Required:</strong> Please deploy your MockERC20 and Staking contracts to Mantle Sepolia, then update the addresses in <code>src/constants.js</code>.
          </div>
        </div>
      )}

      <main className="main-card">
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Total Staked</div>
            <div className="stat-value">{Number(totalStaked).toLocaleString(undefined, {maximumFractionDigits: 2})} $DAVEY</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Current APY</div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <TrendingUp size={20} /> 5%
            </div>
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
            <span style={{ fontWeight: 600, color: 'var(--primary)', paddingRight: '0.5rem' }}>$DAVEY</span>
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
          <div className="rewards-info">
            <span className="stat-label">Pending Rewards</span>
            <span className="stat-value" style={{ fontSize: '1.25rem' }}>
              {Number(realtimeRewards).toLocaleString(undefined, {minimumFractionDigits: 8, maximumFractionDigits: 8})}
            </span>
          </div>
          <button 
            className="claim-btn"
            onClick={claimRewards}
            disabled={isLoading || Number(pendingRewards) <= 0 || !isConfigured || !isConnected}
          >
            Claim Rewards
          </button>
        </div>
      </main>

      {leaderboard.length > 0 && (
        <div className="leaderboard-card">
          <div className="leaderboard-header">
            <Trophy color="var(--primary)" size={24} />
            <h3>Top Stakers</h3>
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
                  {staker.staked.toLocaleString(undefined, {maximumFractionDigits: 2})} $DAVEY
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
