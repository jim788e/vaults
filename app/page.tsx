'use client';

import Image from 'next/image';
import { Header } from '@/components/Header';
import { VaultStats } from '@/components/staking/VaultStats';
import { RewardsCard } from '@/components/staking/RewardsCard';
import { StakingInterface } from '@/components/staking/StakingInterface';
import { TopStakers } from '@/components/staking/TopStakers';
import { AdminPanel } from '@/components/staking/AdminPanel';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      <Header />

      {/* Background Image Container - Always Rendered */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/vaults.png"
          alt="Vaults Background"
          fill
          priority
          className="object-cover opacity-40 grayscale-[0.2]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#020617]/80 via-[#020617]/40 to-[#020617]" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 flex-1">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section - Always Rendered */}
          <section className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter">
                Riverchurn <br />
                <span className="bg-linear-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent italic">
                  Reserve
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-400 font-medium leading-relaxed">
                Stake your <span className="text-white font-bold">$MOOZ</span> tokens in our secure reserve and earn <span className="text-cyan-400 font-bold">$wSEI</span> rewards in real-time. The more you stake, the higher your share.
              </p>
            </motion.div>
          </section>

          {/* Stable Content Area to prevent CLS */}
          <div className="min-h-[500px]">
            {!mounted ? (
              /* Initial Hydration Placeholder */
              <div className="w-full h-[500px] flex items-center justify-center bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl animate-pulse">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                  <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Initializing Reserve...</p>
                </div>
              </div>
            ) : !isConnected ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl h-full"
              >
                <div className="w-20 h-20 rounded-full bg-linear-to-tr from-pink-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mb-6">
                  <div className="w-10 h-10 border-2 border-dashed border-gray-600 rounded-full animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-black mb-4">Connect Wallet to Start</h2>
                <p className="text-gray-500 mb-8 max-w-sm text-center">
                  Join the Riverchurn Reserve ecosystem to start earning rewards today.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left Column: Dashboard */}
                <div className="lg:col-span-8 space-y-8">
                  <VaultStats />
                  <RewardsCard />
                  <TopStakers />
                  <AdminPanel />
                </div>

                {/* Right Column: Interaction */}
                <div className="lg:col-span-4 sticky top-28">
                  <div className="h-[600px]">
                    <StakingInterface />
                  </div>

                  {/* Secondary Info Card */}
                  <div className="mt-6 p-6 rounded-3xl bg-linear-to-br from-white/5 to-white/[0.02] border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Reserve Stats</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-gray-500 uppercase">Yield Multiplier</span>
                        <span className="text-lg font-black text-white">1.0x</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-gray-500 uppercase">Lock Period</span>
                        <span className="text-lg font-black text-white italic">None</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-gray-500 uppercase">Network Fee</span>
                        <span className="text-lg font-black text-white italic">~0.01 SEI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-10 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-[10px] md:text-sm font-bold uppercase tracking-widest">© 2025 Cool Cows Lab. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="https://x.com/CoolCowsLab" target="_blank" rel="noopener noreferrer" className="text-xs font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Twitter</a>
            <a href="https://discord.com/invite/WWBJYYkYt2" target="_blank" rel="noopener noreferrer" className="text-xs font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Discord</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
