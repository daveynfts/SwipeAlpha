import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const mantleSepoliaTestnet = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://explorer.sepolia.mantle.xyz' },
  },
};

const config = getDefaultConfig({
  appName: 'Mantle Turing Staking',
  projectId: '07b068da6c3e9a0fccda15a317e008ba', // Public test project ID
  chains: [mantleSepoliaTestnet],
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#65b3ae',
          accentColorForeground: 'white',
          borderRadius: 'large',
          fontStack: 'system',
        })}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
