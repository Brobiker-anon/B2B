"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Users, TrendingUp, ShieldCheck, Copy, Star, BookOpen, Eye } from "lucide-react";
import { ComposedChart, Bar, Cell, ResponsiveContainer } from "recharts";

const generateData = () => {
  return Array.from({ length: 12 }).map((_, i) => {
    const open = Math.random() * 50 + i * 4 + 10;
    const close = open + (Math.random() - 0.45) * 15;
    const high = Math.max(open, close) + Math.random() * 6;
    const low = Math.min(open, close) - Math.random() * 6;
    const isBullish = close >= open;
    return {
      name: i.toString(),
      open,
      close,
      high,
      low,
      isBullish,
      wick: [low, high],
      body: [open, close]
    };
  });
};

const traders = [
  { id: 1, name: "CryptoWhale_99", winRate: "85%", roi: "+342%", copiers: 12450, risk: "High", chart: generateData() },
  { id: 2, name: "SteadyGains", winRate: "92%", roi: "+125%", copiers: 8320, risk: "Low", chart: generateData() },
  { id: 3, name: "AlphaSeeker", winRate: "78%", roi: "+210%", copiers: 5100, risk: "Medium", chart: generateData() },
  { id: 4, name: "DefiNinja", winRate: "88%", roi: "+450%", copiers: 15600, risk: "High", chart: generateData() },
  { id: 5, name: "SafeHaven", winRate: "95%", roi: "+85%", copiers: 22000, risk: "Low", chart: generateData() },
  { id: 6, name: "MomentumTrade", winRate: "81%", roi: "+175%", copiers: 4200, risk: "Medium", chart: generateData() },
];

const copyTradingMechanics = [
  { q: "How is trader performance and ROI calculated?", a: "Traders' performance is tracked using the Time-Weighted Return (TWR) methodology. This standard formula measures portfolio compounding growth without distortion from account deposits or withdrawals, guaranteeing an accurate, transparent display of the trader's actual return." },
  { q: "What is the fee distribution and execution model?", a: "Copiers pay a fixed 10% performance fee on net profits earned through copied trades. This is calculated and settled automatically every weekend. If a master trade results in a loss, no fee is charged, and future profits must exceed previous losses before performance fees resume." },
  { q: "How does the slippage protection protocol work?", a: "Our proprietary smart execution engine replicates positions within milliseconds. To protect copiers, slippage protection automatically skips copying any order where the executed price deviates by more than 0.5% compared to the master trader's price." },
  { q: "What risk control options are available?", a: "Copiers have full control over risk metrics. You can define a custom Stop-Loss threshold (e.g., stop copying if total drawdown exceeds 15%), restrict the maximum size allocated to any single trade, or instantly terminate copying and liquidate all active positions with a single click." }
];

export default function CopyTrading() {
  const [subPage, setSubPage] = useState("leaderboard"); // "leaderboard" or "mechanics"
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyTrader = (traderName: string) => {
    alert(`Copying ${traderName} - feature coming soon!`);
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
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Copy Trading Portal</h1>
          <p className="text-muted-foreground">Automatically copy the trades of top-performing investors.</p>
        </div>
        <div className="flex gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setSubPage("leaderboard")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${
              subPage === "leaderboard" ? "bg-brand text-white box-glow" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" /> Leaderboard
          </button>
          <button
            onClick={() => setSubPage("mechanics")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${
              subPage === "mechanics" ? "bg-brand text-white box-glow" : "text-muted-foreground hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Execution Mechanics
          </button>
        </div>
      </div>

      {subPage === "leaderboard" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Copiers", value: "145,230", icon: Users },
              { title: "Avg. ROI (Top 10)", value: "+245%", icon: TrendingUp },
              { title: "Total Invested", value: "$12.5M", icon: Copy },
              { title: "Active Traders", value: "854", icon: Star },
            ].map((stat, i) => (
              <GlassCard key={i} className="flex items-center gap-4 py-4 px-6">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {traders.map((trader) => (
              <GlassCard key={trader.id} hoverEffect className="flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-brand flex items-center justify-center font-bold text-white text-lg">
                      {trader.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">{trader.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {trader.copiers.toLocaleString()} copiers
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${
                    trader.risk === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    trader.risk === 'Low' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {trader.risk} Risk
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                    <div className="font-bold text-white">{trader.winRate}</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">Total ROI</div>
                    <div className="font-bold text-green-500">{trader.roi}</div>
                  </div>
                </div>

                  {(() => {
                    const riskColor = trader.risk === "High" ? "#ef4444" : trader.risk === "Medium" ? "#f59e0b" : "#10b981";
                    return (
                      <div className="h-16 w-full mb-6 relative">
                        {mounted ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trader.chart} barGap="-100%" margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                              {/* Wicks */}
                              <Bar dataKey="wick" barSize={0.8} fill="transparent">
                                {trader.chart.map((entry: any, index: number) => (
                                  <Cell key={`cell-wick-${index}`} fill={entry.isBullish ? "#089981" : "#f23645"} />
                                ))}
                              </Bar>
                              
                              {/* Bodies */}
                              <Bar dataKey="body" barSize={4} fill="transparent">
                                {trader.chart.map((entry: any, index: number) => (
                                  <Cell key={`cell-body-${index}`} fill={entry.isBullish ? "#089981" : "#f23645"} />
                                ))}
                              </Bar>
                            </ComposedChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full w-full bg-white/5 animate-pulse rounded flex items-center justify-center text-muted-foreground text-[10px]">
                            Loading sparkline...
                          </div>
                        )}
                        <div className="absolute top-0 right-0 text-[9px] font-mono text-muted-foreground bg-black/40 px-1.5 py-0.5 rounded border border-white/5">30d RANGE</div>
                      </div>
                    );
                  })()}

                <button onClick={() => handleCopyTrader(trader.name)} className="mt-auto w-full py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors box-glow">
                  Copy Trader
                </button>
              </GlassCard>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          <GlassCard className="bg-brand/5 border-brand/20">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-brand" /> Execution Engine Guide & Mechanics
            </h2>
            <p className="text-sm text-muted-foreground">
              Deep dive into how our social copy execution engine works, profit settlement protocols, and slippage guarantees.
            </p>
          </GlassCard>

          <div className="space-y-4">
            {copyTradingMechanics.map((mechanic, i) => (
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
