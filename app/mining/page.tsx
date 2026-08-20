"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Calculator, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import GlassCard from "@/components/ui/GlassCard";

interface ActiveMining {
  id: string;
  poolName: string;
  poolSymbol: string;
  amountLeased: number;
  hashrateGh: number;
  startDate: string;
  earningsAccumulated: number;
}

const MINING_POOLS = [
  { id: "btc_miner", name: "BitMiner", label: "BTC POOL", symbol: "BTC", roi: "100% ROI", min: 1, max: 10, hashrateFactor: 18036473, iconColor: "#F7931A", initial: "₿" },
  { id: "eth_miner", name: "EthMiner", label: "ETH POOL", symbol: "ETH", roi: "95% ROI", min: 5, max: 50, hashrateFactor: 420500, iconColor: "#627EEA", initial: "Ξ" },
  { id: "sol_miner", name: "SolMiner", label: "SOL POOL", symbol: "SOL", roi: "110% ROI", min: 50, max: 500, hashrateFactor: 120600, iconColor: "#14F195", initial: "S" }
];

export default function Mining() {
  const { btcBalance, setBtcBalance, addToast } = useApp();
  
  // Simulated stats
  const [showMinings, setShowMinings] = useState(true);
  const [activeTab, setActiveTab] = useState<"Pools" | "Your history" | "How it works">("Pools");
  const [currentTickIndex, setCurrentTickIndex] = useState(0);
  const [networkHashrate, setNetworkHashrate] = useState(18036473);

  // Active leased rigs state
  const [activeMiningsList, setActiveMiningsList] = useState<ActiveMining[]>([]);
  const [closedMiningsCount, setClosedMiningsCount] = useState(0);

  // Lease Modal state
  const [selectedPool, setSelectedPool] = useState<typeof MINING_POOLS[0] | null>(null);
  const [leaseAmount, setLeaseAmount] = useState("1");
  const [showLeaseModal, setShowLeaseModal] = useState(false);

  // ROI Calculator modal state
  const [showRoiModal, setShowRoiModal] = useState(false);
  const [calcPool, setCalcPool] = useState(MINING_POOLS[0].id);
  const [calcAmount, setCalcAmount] = useState("1.5");

  const bannerTicks = [
    "⚡ Current Network Difficulty: 83.15 T • Average Block Time: 9m 42s",
    "📈 Halving Countdown: 184,242 blocks remaining • Est. Date: April 2028",
    "🔌 Global Energy Efficiency Average: 22.4 J/TH • Cooling Efficiency: PUE 1.04",
    "🛠️ Next Datacenter Maintenance: July 15, 2026 04:00 UTC (Redundant hot-swap active)"
  ];

  // Fluctuating network hashrate simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setNetworkHashrate(prev => Math.floor(prev + (Math.random() - 0.5) * 5000));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Ticking active minings earnings simulation
  useEffect(() => {
    if (activeMiningsList.length === 0) return;

    const timer = setInterval(() => {
      setActiveMiningsList(prev => 
        prev.map(m => {
          // Accumulate tiny decimal increments to simulate active real-time GPU hash computation
          const increment = m.amountLeased * 0.00000003;
          return {
            ...m,
            earningsAccumulated: +(m.earningsAccumulated + increment).toFixed(8)
          };
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, [activeMiningsList.length]);

  // Derived Values
  const btcPriceAud = 90853.94;
  const totalLeasedBtc = activeMiningsList.reduce((sum, item) => {
    // Standardize to BTC equivalent for calculations
    if (item.poolSymbol === "BTC") return sum + item.amountLeased;
    if (item.poolSymbol === "ETH") return sum + (item.amountLeased * 0.05); // conversion estimate
    return sum + (item.amountLeased * 0.002);
  }, 0);
  
  const totalMiningsAud = totalLeasedBtc * btcPriceAud;

  const handleChoosePool = (pool: typeof MINING_POOLS[0]) => {
    setSelectedPool(pool);
    setLeaseAmount(pool.min.toString());
    setShowLeaseModal(true);
  };

  const handleConfirmLease = () => {
    if (!selectedPool) return;

    const amt = parseFloat(leaseAmount);
    if (isNaN(amt) || amt < selectedPool.min || amt > selectedPool.max) {
      addToast(`Lease amount must be between ${selectedPool.min} and ${selectedPool.max} ${selectedPool.symbol}.`, "error");
      return;
    }

    // Check balances
    if (selectedPool.symbol === "BTC") {
      if (btcBalance < amt) {
        addToast("Insufficient BTC balance to lease this hashpower pool.", "error");
        return;
      }
      setBtcBalance(prev => prev - amt);
    } else {
      // Simulate deduction for non-BTC assets for testing purposes
      addToast(`Simulated leasing with ${amt} ${selectedPool.symbol}.`, "info");
    }

    // Create active mining item
    const newMining: ActiveMining = {
      id: "MIN-" + Math.floor(1000 + Math.random() * 9000),
      poolName: selectedPool.name,
      poolSymbol: selectedPool.symbol,
      amountLeased: amt,
      hashrateGh: Math.floor(amt * selectedPool.hashrateFactor * 0.05),
      startDate: new Date().toLocaleDateString(),
      earningsAccumulated: 0
    };

    setActiveMiningsList(prev => [...prev, newMining]);
    setShowLeaseModal(false);
    addToast(`Successfully leased ${selectedPool.name} hashpower!`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-100 min-h-[85vh]">
      
      {/* Top Header stats view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Stats Block */}
        <GlassCard className="p-6 bg-[#0c0f16] border border-white/5 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              <span>Your total minings</span>
              <button onClick={() => setShowMinings(!showMinings)} className="cursor-pointer">
                {showMinings ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1.5 font-mono">
              {showMinings ? `A$${totalMiningsAud.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "A$ ••••••"}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              ~{activeMiningsList.length} TOTAL MININGS
            </div>
          </div>

          <button 
            onClick={() => setShowRoiModal(true)}
            className="w-full py-2 mt-4 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Calculator className="w-4 h-4" />
            CALCULATE ROI
          </button>
        </GlassCard>

        {/* Right Stats Block */}
        <GlassCard className="p-6 bg-[#0c0f16] border border-white/5 grid grid-cols-2 gap-y-4 gap-x-2">
          <div>
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Cycle</div>
            <div className="text-sm font-bold text-white mt-1">DAILY</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Total hashrate</div>
            <div className="text-sm font-bold text-white mt-1 font-mono">{networkHashrate.toLocaleString()} GH/s</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Active minings</div>
            <div className="text-sm font-bold text-white mt-1 font-mono">{activeMiningsList.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Closed minings</div>
            <div className="text-sm font-bold text-white mt-1 font-mono">{closedMiningsCount}</div>
          </div>
        </GlassCard>

      </div>

      {/* Tabs navigation row */}
      <div className="flex gap-4 border-b border-white/5 pb-2.5 overflow-x-auto select-none">
        {(["Pools", "Your history", "How it works"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-2 py-1 text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab 
                ? "text-white border-b-2 border-[#089981] pb-2.5" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sliding Banner Ticker */}
      <div className="flex items-center justify-between bg-white text-slate-900 rounded-md py-2 px-3 text-[11px] font-semibold border border-white/10 select-none">
        <button 
          onClick={() => setCurrentTickIndex(prev => (prev === 0 ? bannerTicks.length - 1 : prev - 1))}
          className="cursor-pointer hover:bg-black/5 p-0.5 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-800" />
        </button>
        
        <span className="text-center flex-1 px-4">{bannerTicks[currentTickIndex]}</span>
        
        <button 
          onClick={() => setCurrentTickIndex(prev => (prev === bannerTicks.length - 1 ? 0 : prev + 1))}
          className="cursor-pointer hover:bg-black/5 p-0.5 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-800" />
        </button>
      </div>

      {/* POOLS TAB CONTENT */}
      {activeTab === "Pools" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Pools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MINING_POOLS.map((pool) => (
              <GlassCard key={pool.id} className="p-0 overflow-hidden bg-[#0c0f16] border border-white/5 flex flex-col justify-between">
                
                {/* Rig Illustration Header */}
                <div className="p-6 bg-black/45 border-b border-white/5 flex items-center justify-center min-h-[180px]">
                  <svg className="w-36 h-36 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="40" y="50" width="120" height="110" rx="8" fill="#1F2937" stroke="#374151" strokeWidth="2.5" />
                    <rect x="45" y="55" width="110" height="100" rx="4" fill="#0d1117" />
                    
                    {/* Left Fan spinning vector */}
                    <circle cx="75" cy="105" r="28" fill="#1F2937" stroke="#4B5563" strokeWidth="1.5" />
                    <circle cx="75" cy="105" r="25" fill="#030712" />
                    <path d="M 75 80 L 75 130 M 50 105 L 100 105" stroke="#374151" strokeWidth="3" strokeLinecap="round" className="animate-spin origin-[75px_105px]" style={{ transformOrigin: '75px 105px', animationDuration: '3s' }} />
                    <circle cx="75" cy="105" r="6" fill="#6B7280" />
                    
                    {/* Right Fan spinning vector */}
                    <circle cx="125" cy="105" r="28" fill="#1F2937" stroke="#4B5563" strokeWidth="1.5" />
                    <circle cx="125" cy="105" r="25" fill="#030712" />
                    <path d="M 125 80 L 125 130 M 100 105 L 150 105" stroke="#374151" strokeWidth="3" strokeLinecap="round" className="animate-spin origin-[125px_105px]" style={{ transformOrigin: '125px 105px', animationDuration: '3s' }} />
                    <circle cx="125" cy="105" r="6" fill="#6B7280" />
                    
                    {/* Power module */}
                    <rect x="55" y="30" width="90" height="20" rx="4" fill="#374151" stroke="#4B5563" strokeWidth="1.5" />
                    <circle cx="65" cy="40" r="3" fill="#10B981" className="animate-pulse" />
                    <circle cx="75" cy="40" r="3" fill="#10B981" className="animate-pulse" />
                  </svg>
                </div>

                {/* Pool Detail Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shadow-sm select-none"
                      style={{ 
                        backgroundColor: pool.iconColor + "15", 
                        border: `1.2px solid ${pool.iconColor}45`,
                        color: pool.iconColor === "#FFFFFF" ? "#E2E8F0" : pool.iconColor 
                      }}
                    >
                      {pool.initial}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono font-semibold uppercase">{pool.label}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{pool.name}</h3>
                    <div className="text-[11px] text-[#089981] font-bold mt-2 font-mono">{pool.roi}</div>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-1 font-mono">
                    <div><span className="font-bold text-slate-300">{pool.min} {pool.symbol}</span> (MINIMUM)</div>
                    <div><span className="font-bold text-slate-300">{pool.max} {pool.symbol}</span> (MAXIMUM)</div>
                  </div>

                  <button
                    onClick={() => handleChoosePool(pool)}
                    className="w-full py-2.5 mt-2 bg-[#1e222d] border border-white/5 hover:bg-[#2a2e39] hover:border-white/10 text-slate-200 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    CHOOSE THIS POOL
                  </button>
                </div>

              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* YOUR HISTORY TAB CONTENT */}
      {activeTab === "Your history" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Lease Registry</h2>
          <GlassCard className="p-0 overflow-hidden bg-[#0c0f16] border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Pool Name</th>
                    <th className="px-6 py-4 text-right">Amount Leased</th>
                    <th className="px-6 py-4 text-right">Estimated Hashrate</th>
                    <th className="px-6 py-4">Start Date</th>
                    <th className="px-6 py-4 text-right">Accumulated Returns</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMiningsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                        No active leases. Select "Pools" tab to register a lease.
                      </td>
                    </tr>
                  ) : (
                    activeMiningsList.map((mining) => (
                      <tr key={mining.id} className="border-b border-white/5 hover:bg-white/5 transition-colors font-medium">
                        <td className="px-6 py-4 text-white font-mono">{mining.id}</td>
                        <td className="px-6 py-4">{mining.poolName} ({mining.poolSymbol})</td>
                        <td className="px-6 py-4 text-right font-mono">{mining.amountLeased} {mining.poolSymbol}</td>
                        <td className="px-6 py-4 text-right font-mono">{mining.hashrateGh.toLocaleString()} GH/s</td>
                        <td className="px-6 py-4 text-muted-foreground">{mining.startDate}</td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-mono font-bold">
                          +{mining.earningsAccumulated.toFixed(8)} {mining.poolSymbol}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-mono uppercase">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* HOW IT WORKS TAB CONTENT */}
      {activeTab === "How it works" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <GlassCard className="p-6 bg-[#0c0f16] border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#089981]" /> How Cloud Mining Works
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When you lease hashpower, you are renting dedicated hashing capacity from physical institutional-grade ASICs hosted in datacenters. Block calculations run in real-time, and block rewards are computed dynamically and added directly to your mining metrics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-2">
                <div className="text-white font-bold text-xs">1. Select Pool</div>
                <div className="text-[11px] text-muted-foreground">Choose a pool matching your parameters and enter your desired lease value.</div>
              </div>
              <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-2">
                <div className="text-white font-bold text-xs">2. Active Hashing</div>
                <div className="text-[11px] text-muted-foreground">ASIC miner allocation initiates instantly. Hash computation outputs rewards directly to your dashboard.</div>
              </div>
              <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-2">
                <div className="text-white font-bold text-xs">3. Receive Yields</div>
                <div className="text-[11px] text-muted-foreground">Mining rewards accumulate in real time, increasing your overall portfolio yields dynamically.</div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* LEASE CONFIG MODAL */}
      {showLeaseModal && selectedPool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6 bg-[#0f121a] border border-white/10 space-y-6 relative">
            <div>
              <h3 className="text-base font-bold text-white">Lease {selectedPool.name} Hashpower</h3>
              <p className="text-xs text-muted-foreground mt-1">Configure your lease value to proceed with ASIC allocation.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block mb-1.5">Lease Amount ({selectedPool.symbol})</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={leaseAmount}
                    onChange={(e) => setLeaseAmount(e.target.value)}
                    min={selectedPool.min}
                    max={selectedPool.max}
                    step="any"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#089981] text-white"
                  />
                  <button 
                    onClick={() => setLeaseAmount(selectedPool.max.toString())}
                    className="px-3 bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 rounded-lg font-bold cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                  Min: {selectedPool.min} • Max: {selectedPool.max} {selectedPool.symbol}
                </div>
              </div>

              {/* Estimate Preview */}
              <div className="p-4 bg-black/35 rounded-lg border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Hashrate:</span>
                  <span className="text-white font-bold">{(parseFloat(leaseAmount) ? (parseFloat(leaseAmount) * selectedPool.hashrateFactor * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0)} GH/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Yield Cycle:</span>
                  <span className="text-[#089981] font-bold">{selectedPool.roi}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setShowLeaseModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold rounded-md cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmLease}
                className="px-5 py-2 bg-[#089981] hover:bg-[#089981]/90 text-white text-xs font-semibold rounded-md shadow-sm shadow-[#089981]/20 cursor-pointer transition-colors"
              >
                Start Leased Miner
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ROI CALCULATOR MODAL */}
      {showRoiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6 bg-[#0f121a] border border-white/10 space-y-6 relative">
            <div>
              <h3 className="text-base font-bold text-white">ROI Estimator Calculator</h3>
              <p className="text-xs text-muted-foreground mt-1">Estimate daily yields and payback cycles based on pool settings.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block mb-1.5">Select Target Pool</label>
                <select
                  value={calcPool}
                  onChange={(e) => {
                    setCalcPool(e.target.value);
                    const selected = MINING_POOLS.find(p => p.id === e.target.value);
                    if (selected) setCalcAmount(selected.min.toString());
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#089981] text-white"
                >
                  {MINING_POOLS.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#0f121a]">{p.name} ({p.symbol} Pool)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block mb-1.5">Investment Value</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#089981] text-white"
                />
              </div>

              {/* Estimates */}
              {(() => {
                const p = MINING_POOLS.find(pool => pool.id === calcPool) || MINING_POOLS[0];
                const inputVal = parseFloat(calcAmount) || 0;
                const estDailyVal = inputVal * 0.0012; // simulated ROI estimate yield
                return (
                  <div className="p-4 bg-black/35 rounded-lg border border-white/5 space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Hashrate:</span>
                      <span className="text-white font-bold">{(inputVal * p.hashrateFactor * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })} GH/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Projected Yield:</span>
                      <span className="text-white font-bold">{estDailyVal.toFixed(6)} {p.symbol}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2.5">
                      <span className="text-muted-foreground">Cycle Return Target:</span>
                      <span className="text-[#089981] font-bold">{p.roi}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowRoiModal(false)}
                className="px-5 py-2 bg-[#1e222d] border border-white/5 hover:bg-[#2a2e39] text-white text-xs font-semibold rounded-md cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
