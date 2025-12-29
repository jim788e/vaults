# Riverchurn Reserve

Riverchurn Reserve is a premium, high-performance staking platform built on the **Sei Network**. It allows users to stake their **$MOOZ** tokens in a secure vault and earn **$wSEI** rewards in real-time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Sei Network](https://img.shields.io/badge/Network-Sei-red.svg)

## 🚀 Key Features

- **High-Performance Staking**: Optimized for low latency and fast transaction confirmations on the Sei EVM.
- **Real-time Rewards**: Seamlessly track and claim your $wSEI rewards as they are generated.
- **Dynamic RPC Selector**: Built-in latency monitoring and status indicators for multiple Sei RPC endpoints.
- **Resilient Infrastructure**: Multi-node fallback system ensuring 100% uptime even during network congestion.
- **Premium UI/UX**: State-of-the-art interface featuring glassmorphism, smooth animations with Framer Motion, and mobile-optimized design.
- **Optimized Performance**: Advanced CLS (Cumulative Layout Shift) prevention and efficient request batching to avoid rate limits.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Blockchain Connectivity**: [Wagmi v3](https://wagmi.sh/) & [Viem](https://viem.sh/)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jim788e/vaults.git
   cd vaults
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🌉 Network Details (Sei Mainnet)

- **Network Name**: Sei
- **RPC URL**: https://evm-rpc.sei-apis.com
- **Chain ID**: 1329
- **Currency Symbol**: SEI
- **Block Explorer**: https://seitrace.com

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by the Cool Cows Lab team.
