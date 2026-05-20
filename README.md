# SwipeAlpha 🧠🔥 (Tinder for Tokens)

**SwipeAlpha** is a Web3 application designed for the **Mantle Turing Test Hackathon**. It features a modern desktop dashboard with live trading signals from autonomous AI agents, alongside a mobile-first simulated demo route (`/demo`) enabling users to browse curated token recommendations and execute trade actions (Buy/Skip) using a swiping gesture.

The app integrates an on-chain **ERC-8004 Trustless Agent Reputation Registry** and executes testnet token trades directly via a custom **MockMerchantMoeRouter**.

*   **Production Vercel DApp:** [https://app.turingdappdavey.vercel.app](https://app.turingdappdavey.vercel.app)
*   **Mobile Simulator Demo:** [https://app.turingdappdavey.vercel.app/demo](https://app.turingdappdavey.vercel.app/demo)

---

## 🚀 Deployed Smart Contracts (Mantle Sepolia Testnet)

The project uses the **Transparent Proxy Pattern** to manage AI Agents and record user feedback trustlessly on-chain, alongside a staking subsystem and a mock router for executing trades.

*   **Reputation Registry (Proxy Contract):** [`0x2dEE66b5638f2a92E6bBb3ceB45047e67DFfCAE7`](https://explorer.sepolia.mantle.xyz/address/0x2dEE66b5638f2a92E6bBb3ceB45047e67DFfCAE7)
*   **Reputation Registry (Implementation Logic):** [`0x8632cd0beb72EA549e5f1FA6ae006d4560963416`](https://explorer.sepolia.mantle.xyz/address/0x8632cd0beb72EA549e5f1FA6ae006d4560963416)
*   **Staking Contract (Proxy Contract):** [`0x07f436F83a216D8eFF2DFf4F09a9634168632413`](https://explorer.sepolia.mantle.xyz/address/0x07f436F83a216D8eFF2DFf4F09a9634168632413)
*   **Mock Merchant Moe Router:** [`0x5ddeea646Ed2DF37345d8987099A33e60879Bed4`](https://explorer.sepolia.mantle.xyz/address/0x5ddeea646Ed2DF37345d8987099A33e60879Bed4)

---

## 🏆 DoraHacks "20 Project Deployment Award" Qualification

This project successfully fulfills all the technical deployment requirements:

1.  **Mantle Sepolia Deployment:** Smart contracts deployed using OpenZeppelin transparent upgradeable proxies.
2.  **Explorer Verification:** The logic contracts are fully verified on **Sourcify** (decentralized source verification integrated with Mantle Sepolia Blockscout Explorer).
3.  **On-chain AI Functionality:** The contract implements `publishSignal(...)` which allows AI Agents to write inference results (token symbols, buy/sell targets, and reasoning) directly on-chain. An initial signal for the token `$VIRTUAL` was successfully executed by the agent on-chain at deployment.
4.  **On-Chain Swap Transactions:** Users can perform swaps of 0.1 MNT for mock tokens on Mantle Sepolia using the `MockMerchantMoeRouter`, creating mock buy transactions.
5.  **MetaMask Web3 Integration:** The frontend connects to EVM wallets (MetaMask/Wagmi/RainbowKit) and prompts users to submit agent reputation ratings on-chain via the ERC-8004 standard.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    User([User MetaMask Wallet]) -->|Submit Rating| ProxyReg[Transparent Proxy: SwipeAlphaRegistry]
    User -->|Perform Swap (0.1 MNT)| Router[MockMerchantMoeRouter]
    User -->|Stake $DAVEY| ProxyStake[Transparent Proxy: Staking]
    ProxyReg -->|Delegatecall| ImplReg[Logic Contract: SwipeAlphaRegistry]
    ProxyStake -->|Delegatecall| ImplStake[Logic Contract: Staking]
    AIAgent[Nansen AI Agents] -->|Publish Trade Signals| ProxyReg
    AIAgent -->|Curates Swipe Cards| Frontend[React + Vite DApp]
    Frontend -->|Ethers.js / Wagmi| ProxyReg
```

### Components
*   **Main Desktop Dashboard:** A multi-column view displaying live signals from AI Agents, active reputation ratings stored on-chain, and quick-swap transaction triggers.
*   **Mobile Simulator Demo (`/demo`):** A Tinder-style swiping interface simulating a mobile experience where users can rate agents or swap tokens.
*   **Staking Portal:** Staking pool interface for locking `$DAVEY` tokens with real-time interest distribution and leaderboard tracking.
*   **On-Chain Reputation Ledger (ERC-8004):** Review ratings, comments, and tags are saved directly on the Mantle blockchain.

---

## 📦 Local Setup & Run

### Prerequisites
*   Node.js (v18+)
*   MetaMask (or any EVM wallet) connected to **Mantle Sepolia Testnet** (Chain ID: `5003`).

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 3: Access Routes
*   Main Desktop DApp: `http://localhost:5173`
*   Mobile Simulator Demo: `http://localhost:5173/demo`

---

## 📂 Project Structure

```
├── contracts/          # Solidity Smart Contracts (Registry, Staking, Mock Router)
├── scripts/            # Deployment and Hardhat execution scripts
├── src/
│   ├── App.jsx         # Main App routing and staking logic
│   ├── SwipeAlpha.jsx  # SwipeAlpha desktop dashboard and mobile swipe component
│   ├── SwipeAlpha.css  # Stylesheets for desktop/mobile layouts
│   ├── constants.js    # ABIs & deployed contract addresses
│   └── main.jsx        # App entry point with RainbowKit and Wagmi providers
├── vercel.json         # SPA redirection routing rules for Vercel
├── index.html          # HTML head template
└── package.json        # Node dependency configuration
```
