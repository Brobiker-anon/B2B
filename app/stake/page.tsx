"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import StatWidget from "@/components/ui/StatWidget";
import { Lock, Unlock, ArrowDownRight, TrendingUp, Percent, Award, BookOpen, Eye } from "lucide-react";
import { useApp } from "@/context/AppContext";

const stakingPools = [
  { id: 1, asset: "Ethereum", symbol: "ETH", apy: "4.5%", lockup: "Flexible", tvl: "$12.5M", minStake: "0.1 ETH" },
  { id: 2, asset: "Solana", symbol: "SOL", apy: "7.2%", lockup: "30 Days", tvl: "$8.2M", minStake: "5 SOL" },
  { id: 3, asset: "Polkadot", symbol: "DOT", apy: "11.5%", lockup: "90 Days", tvl: "$4.5M", minStake: "50 DOT" },
  { id: 4, asset: "Cardano", symbol: "ADA", apy: "5.8%", lockup: "15 Days", tvl: "$15.1M", minStake: "100 ADA" },
  { id: 5, asset: "Polygon", symbol: "MATIC", apy: "6.5%", lockup: "Flexible", tvl: "$9.8M", minStake: "100 MATIC" },
];

const stakingMechanics = [
  { q: "How is staking yield actually generated?", a: "Staking yields are native rewards distributed by Proof-of-Stake (PoS) blockchains. By committing your tokens to a validator node, you support network transaction validation and security. Block rewards and dynamic gas/transaction fees are distributed back to you as APY." },
  { q: "What is the operational difference between Flexible and Locked staking?", a: "Flexible pools prioritize liquidity, allowing you to unstake and withdraw assets at any moment with negligible delay. Locked pools (e.g., 30 or 90 days) lock your assets in smart contracts to secure higher-tier validator rewards, yielding significantly higher APY." },
  { q: "How does the unstaking time-lock protocol function?", a: "Unstaking periods are dictated by native blockchain protocols, not the platform. For Solana, it takes up to 3 days (end of the current epoch), while Ethereum unstaking durations vary depending on the global validator exit queue." },
  { q: "What is slashing risk and how is it prevented?", a: "Slashing is a protocol penalty where nodes lose tokens due to double-signing or prolonged downtime. We eliminate this by delegating solely to institutional validator nodes with multi-region failover configurations and a 100% historical uptime guarantee." }
];

export default function Stake() {
  const [subPage, setSubPage] = useState("dashboard"); // "dashboard" or "mechanics"
  const [filterType, setFilterType] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("1Y");

  const handleFilterChange = (filter: string) => {
    setFilterType(filter);
  };

  const { usdtBalance, setUsdtBalance, stakedBalance, setStakedBalance, addToast } = useApp();

  const handleStake = (asset: string) => {
    const stakeAmount = 5000;
    if (usdtBalance < stakeAmount) {
      addToast(`Insufficient USDT balance to stake in the ${asset} pool.`, "error");
      return;
    }
    setUsdtBalance(prev => prev - stakeAmount);
    setStakedBalance(prev => prev + stakeAmount);
    addToast(`Successfully staked 5,000 USDT equivalent in the ${asset} pool!`, "success");
  };

  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Staking Portal</h1>
          <p className="text-muted-foreground">Earn passive income on your idle crypto assets.</p>
        </div>
        <div className="flex gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setSubPage("dashboard")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${
              subPage === "dashboard" ? "bg-brand text-white box-glow" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" /> Staking Dashboard
          </button>
          <button
            onClick={() => setSubPage("mechanics")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${
              subPage === "mechanics" ? "bg-brand text-white box-glow" : "text-muted-foreground hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Yield Mechanics
          </button>
        </div>
      </div>

      {subPage === "dashboard" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatWidget title="Total Staked" value={`$${stakedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} change={2.5} icon={Lock} />
            <StatWidget title="Total Rewards" value="$1,245.50" change={12.4} icon={TrendingUp} />
            <StatWidget title="Avg. APY" value="6.8%" change={0.4} icon={Percent} />
            <StatWidget title="Available to Unstake" value="$5,400.00" change={0} icon={Unlock} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-2 overflow-hidden p-0 flex flex-col">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white">Active Pools</h2>
                <div className="flex gap-2">
                  <button onClick={() => handleFilterChange("All")} className={`text-xs px-3 py-1 rounded font-medium transition-colors ${filterType === "All" ? "bg-brand text-white" : "bg-white/10 text-muted-foreground hover:text-white"}`}>All</button>
                  <button onClick={() => handleFilterChange("Flexible")} className={`text-xs px-3 py-1 rounded font-medium transition-colors ${filterType === "Flexible" ? "bg-brand text-white" : "bg-white/10 text-muted-foreground hover:text-white"}`}>Flexible</button>
                  <button onClick={() => handleFilterChange("Locked")} className={`text-xs px-3 py-1 rounded font-medium transition-colors ${filterType === "Locked" ? "bg-brand text-white" : "bg-white/10 text-muted-foreground hover:text-white"}`}>Locked</button>
                </div>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground text-sm">
                      <th className="px-6 py-4 font-medium">Asset</th>
                      <th className="px-6 py-4 font-medium">Est. APY</th>
                      <th className="px-6 py-4 font-medium">Lock-up Period</th>
                      <th className="px-6 py-4 font-medium">Min. Amount</th>
                      <th className="px-6 py-4 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stakingPools.map((pool) => (
                      <tr key={pool.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">
                              {pool.symbol[0]}
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-brand transition-colors cursor-pointer">{pool.asset}</div>
                              <div className="text-xs text-muted-foreground">{pool.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-500 font-bold">{pool.apy}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">
                          <div className="flex items-center gap-1.5">
                            {pool.lockup === 'Flexible' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {pool.lockup}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">{pool.minStake}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleStake(pool.asset)} className="px-4 py-1.5 bg-brand hover:bg-brand/90 text-white rounded transition-colors text-sm font-medium box-glow">
                            Stake
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <div className="space-y-6">
              <GlassCard className="bg-gradient-to-br from-brand/20 to-purple-500/10 border-brand/20 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-brand/20 rotate-12">
                  <Percent className="w-32 h-32" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">Yield Calculator</h3>
                <p className="text-sm text-muted-foreground mb-6 relative z-10">Estimate your potential returns.</p>
                
                <div className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Select Asset</label>
                    <select className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white outline-none text-sm">
                      <option>Polkadot (DOT) - 11.5% APY</option>
                      <option>Solana (SOL) - 7.2% APY</option>
                      <option>Ethereum (ETH) - 4.5% APY</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Stake Amount</label>
                    <div className="relative">
                      <input type="text" placeholder="1000" className="w-full bg-black/40 border border-white/10 rounded-lg pl-3 pr-12 py-2 text-white outline-none text-sm" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">DOT</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Duration</label>
                    <div className="flex gap-2">
                      <button onClick={() => handleDurationChange("1M")} className={`flex-1 py-1.5 text-xs rounded border transition-colors ${selectedDuration === "1M" ? "bg-brand text-white border-brand" : "bg-black/40 text-muted-foreground border-white/5 hover:bg-white/10"}`}>1M</button>
                      <button onClick={() => handleDurationChange("1Y")} className={`flex-1 py-1.5 text-xs rounded border transition-colors ${selectedDuration === "1Y" ? "bg-brand text-white border-brand" : "bg-black/40 text-muted-foreground border-white/5 hover:bg-white/10"}`}>1Y</button>
                      <button onClick={() => handleDurationChange("3Y")} className={`flex-1 py-1.5 text-xs rounded border transition-colors ${selectedDuration === "3Y" ? "bg-brand text-white border-brand" : "bg-black/40 text-muted-foreground border-white/5 hover:bg-white/10"}`}>3Y</button>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm text-muted-foreground">Estimated Yield</span>
                      <span className="text-2xl font-bold text-green-500">115.00 DOT</span>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">≈ $805.00 USD</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          <GlassCard className="bg-brand/5 border-brand/20">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Award className="w-6 h-6 text-brand" /> Yield Staking Protocols Handbook
            </h2>
            <p className="text-sm text-muted-foreground">
              Deep dive technical analysis of Proof-of-Stake rewards, slashing mitigation systems, and epoch execution loops.
            </p>
          </GlassCard>

          <div className="space-y-4">
            {stakingMechanics.map((mechanic, i) => (
              <GlassCard key={i} className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                  {mechanic.q}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pl-9">
                  {mechanic.a}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
