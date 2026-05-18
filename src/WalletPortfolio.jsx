import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Wallet,
  Coins,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import './WalletPortfolio.css';

// ── Constants ────────────────────────────────────────────────────────────────
const MANTLE_SEPOLIA_RPC = 'https://rpc.sepolia.mantle.xyz';
const NFT_CONTRACT = localStorage.getItem('swipe_alpha_core_address') || '0xCf671ef7444c688c92e910D56EBEcf87b16333A9';
const MAX_TOKEN_ID_SCAN = 20;
const EXPLORER_BASE = 'https://sepolia.mantlescan.xyz';

const NFT_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function tokenURI(uint256) view returns (string)',
  'function name() view returns (string)',
];

const MOCK_HOLDINGS = [
  { symbol: 'MNT', name: 'Mantle', amount: '---', value: '$---', pnl: '+12.4%', pnlPositive: true, icon: 'https://coin-images.coingecko.com/coins/images/30980/large/Mantle-Logo-mark.png' },
  { symbol: 'BTC', name: 'Bitcoin', amount: '0.0055', value: '$379.50', pnl: '+14.2%', pnlPositive: true, icon: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png' },
  { symbol: 'ETH', name: 'Ethereum', amount: '0.1240', value: '$434.00', pnl: '+5.4%', pnlPositive: true, icon: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png' },
  { symbol: 'USDC', name: 'USD Coin', amount: '500.00', value: '$500.00', pnl: '0.0%', pnlPositive: true, icon: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png' },
  { symbol: 'MOE', name: 'Merchant Moe', amount: '2,450', value: '$343.00', pnl: '-5.3%', pnlPositive: false, icon: 'https://coin-images.coingecko.com/markets/images/1400/large/MOE.png' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function parseDataUri(uri) {
  try {
    if (uri.startsWith('data:application/json;base64,')) {
      const base64 = uri.split(',')[1];
      const decoded = decodeURIComponent(escape(atob(base64)));
      return JSON.parse(decoded);
    }
    if (uri.startsWith('data:application/json,')) {
      return JSON.parse(decodeURIComponent(uri.split(',')[1]));
    }
    return null;
  } catch {
    try {
      if (uri.startsWith('data:application/json;base64,')) {
        const json = atob(uri.split(',')[1]);
        return JSON.parse(json);
      }
    } catch {
      return null;
    }
    return null;
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function WalletPortfolio({ isOpen, onClose, walletAddress, isMobileInsideMockup = false }) {
  const [copied, setCopied] = useState(false);
  const [mntBalance, setMntBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [nftsError, setNftsError] = useState(null);
  const [collectionName, setCollectionName] = useState('');

  // ── Fetch MNT balance ────────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    if (!walletAddress) return;
    setBalanceLoading(true);
    setBalanceError(null);
    try {
      const provider = new ethers.JsonRpcProvider(MANTLE_SEPOLIA_RPC);
      const raw = await provider.getBalance(walletAddress);
      setMntBalance(ethers.formatEther(raw));
    } catch (err) {
      console.error('Balance fetch error:', err);
      setBalanceError('Failed to fetch balance');
    } finally {
      setBalanceLoading(false);
    }
  }, [walletAddress]);

  // ── Fetch NFTs ───────────────────────────────────────────────────────────
  const fetchNfts = useCallback(async () => {
    if (!walletAddress) return;
    setNftsLoading(true);
    setNftsError(null);
    try {
      const provider = new ethers.JsonRpcProvider(MANTLE_SEPOLIA_RPC);
      const contract = new ethers.Contract(NFT_CONTRACT, NFT_ABI, provider);

      // Grab collection name (best-effort)
      try {
        const name = await contract.name();
        setCollectionName(name);
      } catch {
        setCollectionName('NFT Collection');
      }

      const owned = [];

      // Scan tokenIds 1..MAX_TOKEN_ID_SCAN
      const checks = Array.from({ length: MAX_TOKEN_ID_SCAN }, (_, i) => i + 1);
      const results = await Promise.allSettled(
        checks.map(async (id) => {
          const owner = await contract.ownerOf(id);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            let metadata = { name: `#${id}`, image: '' };
            try {
              const uri = await contract.tokenURI(id);
              const parsed = parseDataUri(uri);
              if (parsed) {
                metadata = {
                  name: parsed.name || `#${id}`,
                  image: parsed.image || '',
                };
              }
            } catch { /* tokenURI may not exist */ }
            return { tokenId: id, ...metadata };
          }
          return null;
        }),
      );

      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) owned.push(r.value);
      });

      owned.sort((a, b) => a.tokenId - b.tokenId);
      setNfts(owned);
    } catch (err) {
      console.error('NFT fetch error:', err);
      setNftsError('Failed to load NFTs');
    } finally {
      setNftsLoading(false);
    }
  }, [walletAddress]);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchBalance();
      fetchNfts();
    }
  }, [isOpen, walletAddress, fetchBalance, fetchNfts]);

  // ── Copy address ─────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may not be available */
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const holdings = MOCK_HOLDINGS.map((h) => {
    if (h.symbol === 'MNT' && mntBalance !== null) {
      const bal = parseFloat(mntBalance);
      const formatted = bal < 0.0001 ? bal.toExponential(2) : bal.toFixed(4);
      const usdEst = (bal * 0.595).toFixed(2); // rough illustrative rate
      return { ...h, amount: formatted, value: `$${usdEst}` };
    }
    return h;
  });

  const totalUsd = holdings.reduce((sum, h) => {
    const num = parseFloat(h.value.replace(/[$,]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`wp-overlay${isOpen ? ' wp-open' : ''}${isMobileInsideMockup ? ' wp-in-mockup' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`wp-modal${isMobileInsideMockup ? ' wp-modal-in-mockup' : ''}`} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="wp-header">
          <span className="wp-title">
            <Wallet size={20} className="wp-title-icon" />
            Portfolio
            <span className="wp-network-badge">Mantle Sepolia</span>
          </span>
          <button className="wp-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Address */}
        <div className="wp-address-row">
          <span className="wp-address-text">{truncateAddress(walletAddress)}</span>
          <button className="wp-copy-btn" onClick={handleCopy} aria-label="Copy address">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <a
            className="wp-explorer-link"
            href={`${EXPLORER_BASE}/address/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on explorer"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Balance error */}
        {balanceError && <div className="wp-error">{balanceError}</div>}

        {/* Summary */}
        <div className="wp-summary">
          <div className="wp-summary-label">Total Portfolio Value</div>
          <div className="wp-summary-value">
            {balanceLoading ? '...' : `$${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
        </div>

        {/* Token Holdings */}
        <div className="wp-section-title">
          <Coins size={16} className="wp-section-icon" />
          Token Holdings
        </div>

        <div className="wp-tokens">
          {holdings.map((t) => (
            <div className="wp-token-row" key={t.symbol}>
              <span className="wp-token-icon">
                {t.icon.startsWith('http') ? (
                  <img src={t.icon} alt={t.symbol} className="wp-token-img" />
                ) : (
                  t.icon
                )}
              </span>
              <div className="wp-token-info">
                <div className="wp-token-symbol">{t.symbol}</div>
                <div className="wp-token-name">{t.name}</div>
              </div>
              <div className="wp-token-right">
                <div className="wp-token-amount">
                  {t.symbol === 'MNT' && balanceLoading ? (
                    <span className="wp-spinner" style={{ width: 14, height: 14, borderWidth: 2, display: 'inline-block', verticalAlign: 'middle' }} />
                  ) : (
                    t.amount
                  )}
                </div>
                <div className="wp-token-value">{t.value}</div>
              </div>
              <span className={`wp-token-pnl ${t.pnlPositive ? 'wp-pnl-positive' : 'wp-pnl-negative'}`}>
                {t.pnlPositive ? <TrendingUp size={12} style={{ marginRight: 3, verticalAlign: -1 }} /> : <TrendingDown size={12} style={{ marginRight: 3, verticalAlign: -1 }} />}
                {t.pnl}
              </span>
            </div>
          ))}
        </div>

        {/* NFTs */}
        <div className="wp-section-title">
          <ImageIcon size={16} className="wp-section-icon" />
          NFTs {collectionName && `· ${collectionName}`}
        </div>

        {nftsError && <div className="wp-error">{nftsError}</div>}

        {nftsLoading ? (
          <div className="wp-loading">
            <div className="wp-spinner" />
            Scanning NFTs…
          </div>
        ) : nfts.length === 0 ? (
          <div className="wp-empty">No NFTs found for this wallet</div>
        ) : (
          <div className="wp-nfts-scroll">
            {nfts.map((nft) => (
              <div className="wp-nft-card" key={nft.tokenId}>
                <div className="wp-nft-image-wrap">
                  {nft.image ? (
                    nft.image.startsWith('data:image/svg') || nft.image.endsWith('.svg') ? (
                      <img src={nft.image} alt={nft.name} />
                    ) : (
                      <img src={nft.image} alt={nft.name} />
                    )
                  ) : (
                    <ImageIcon size={32} color="#334155" />
                  )}
                </div>
                <div className="wp-nft-meta">
                  <div className="wp-nft-name" title={nft.name}>{nft.name}</div>
                  <div className="wp-nft-id">#{nft.tokenId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Bottom Spacer to prevent overflow glitches */}
        <div className="wp-bottom-spacer" />
      </div>
    </div>
  );
}
