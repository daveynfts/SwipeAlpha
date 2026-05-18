# AgentSwindler 🔥

**AgentSwindler** is a Web3 discovery platform for AI Agent tokens on **Mantle Network**. Browse, evaluate, and invest in autonomous AI trading agents using an intuitive swipe-based interface.

*   **Live App:** [https://daveynfts.com/agentswindler](https://daveynfts.com/agentswindler)

---

## Features

- **Swipe Discovery** — Browse AI agent tokens with a card-based UI. Swipe right to add to portfolio, left to skip.
- **Agent Profiles** — View win rate, ROI, risk level, recent trades, and AI model details for each agent.
- **On-chain Swaps** — Execute token swaps via MerchantMoe Router on Mantle Sepolia testnet.
- **Nansen AI Audit** — Authorize on-chain to get real-time AI security analysis of agent portfolios.
- **NFT Minting** — Mint Nansen audit reports as verifiable on-chain NFTs.
- **Archetype System** — Choose your risk profile (Sakura / Rin / Yuki) to personalize agent recommendations.
- **Copy Trading** — Follow agent trades with one-click copy-trade execution.

---

## Deployed Contracts (Mantle Sepolia)

| Contract | Address |
|---|---|
| SwipeAlphaCore | [`0xCf671ef7444c688c92e910D56EBEcf87b16333A9`](https://explorer.sepolia.mantle.xyz/address/0xCf671ef7444c688c92e910D56EBEcf87b16333A9) |
| MockMerchantMoeRouter | [`0x5ddeea646Ed2DF37345d8987099A33e60879Bed4`](https://explorer.sepolia.mantle.xyz/address/0x5ddeea646Ed2DF37345d8987099A33e60879Bed4) |

---

## Tech Stack

- **Frontend:** React, Vite, ethers.js
- **Wallet:** RainbowKit, Wagmi
- **Network:** Mantle Sepolia (Chain ID: 5003)
- **Smart Contracts:** Solidity (ERC-8004)
- **AI:** Nansen API (SSE streaming)

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Routes
- `/` — Landing page
- `/demo` — Mobile simulator
- `/profile` — Profile & API settings
- `/admin` — Admin panel

---

## Architecture

```
src/
├── App.jsx            # Routing and wallet state
├── SwipeAlpha.jsx     # Core swipe engine and agent cards
├── LandingPage.jsx    # Marketing landing page
├── WalletPortfolio.jsx # Portfolio viewer
├── Profile.jsx        # User profile
├── Admin.jsx          # Admin configuration
└── constants.js       # Contract ABIs and addresses
```

---

## License

MIT
