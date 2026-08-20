"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronLeft, ChevronRight, HelpCircle, Building, MapPin, ArrowUpRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import GlassCard from "@/components/ui/GlassCard";

interface Project {
  id: string;
  title: string;
  description: string;
  minimumAud: number;
  roiPercent: number;
  strategy: string;
  imageUrl: string;
  location: string;
}

interface Investment {
  id: string;
  projectTitle: string;
  amountInvestedAud: number;
  roiPercent: number;
  startDate: string;
  status: "Active" | "Terminated";
}

const PROJECTS: Project[] = [
  {
    id: "proj_1",
    title: "Bridge Labs at Pegasus Park",
    description: "Life science redevelopment within a thriving new biotech-focused campus in Dallas, recognized as one of the top emerging life science markets.",
    minimumAud: 12000,
    roiPercent: 55,
    strategy: "Fixed Income",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    location: "Dallas, TX"
  },
  {
    id: "proj_2",
    title: "Go Store It Nashville",
    description: "Class A self-storage development in one of Nashville's fastest growing suburbs with constrained supply and a high barrier to entry.",
    minimumAud: 15000,
    roiPercent: 50,
    strategy: "Fixed Income",
    imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    location: "Nashville, TN"
  },
  {
    id: "proj_3",
    title: "Fabian Labs, Palo Alto",
    description: "Two-building life science conversion in the heart of Silicon Valley and minutes from Stanford University, one of the top U.S. research institutions.",
    minimumAud: 24000,
    roiPercent: 45,
    strategy: "Growth & Income",
    imageUrl: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=600&q=80",
    location: "Palo Alto, CA"
  },
  {
    id: "proj_4",
    title: "Palmetto Industrial Park",
    description: "Acquisition of a newly constructed three-building industrial property, already garnering interest from prospective tenants.",
    minimumAud: 25000,
    roiPercent: 47,
    strategy: "Fixed Income",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    location: "Palmetto, FL"
  },
  {
    id: "proj_5",
    title: "The Mirage - Texas State Student Housing",
    description: "A Texas State University student housing acquisition assuming high-efficiency operations near campus with pre-leased occupancy.",
    minimumAud: 18000,
    roiPercent: 52,
    strategy: "Growth & Income",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    location: "San Marcos, TX"
  },
  {
    id: "proj_6",
    title: "Hilton Philadelphia City Avenue",
    description: "Discounted acquisition of a recently renovated hotel property, showcasing stabilized dividends and long-term equity growth potential.",
    minimumAud: 30000,
    roiPercent: 58,
    strategy: "Fixed Income",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    location: "Philadelphia, PA"
  }
];

export default function RealEstate() {
  const { usdtBalance, setUsdtBalance, addToast } = useApp();
  
  // States
  const [showPortfolio, setShowPortfolio] = useState(true);
  const [activeTab, setActiveTab] = useState<"Open" | "Closed" | "Your investments" | "How it works">("Open");
  const [currentTickIndex, setCurrentTickIndex] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [showInvestModal, setShowInvestModal] = useState(false);

  const bannerTicks = [
    "🏢 Dallas property value index increases by 4.2% YoY • Bio-space demand strong",
    "🏗️ Stanford research expansion drives Silicon Valley lab conversion demand",
    "🏬 Industrial logistics utilization hits record highs in eastern shipping hubs",
    "🏨 Stabilized leisure assets show steady dividend performance across secondary submarkets"
  ];

  // Derived Values
  const audExchangeRate = 1.4925;
  const availableBalanceAud = usdtBalance * audExchangeRate;
  
  const totalPortfolioValueAud = investments.reduce((sum, item) => sum + item.amountInvestedAud, 0);

  const handleOpenInvest = (project: Project) => {
    setSelectedProject(project);
    setInvestAmount(project.minimumAud.toString());
    setShowInvestModal(true);
  };

  const handleConfirmInvestment = () => {
    if (!selectedProject) return;

    const amt = parseFloat(investAmount);
    if (isNaN(amt) || amt < selectedProject.minimumAud) {
      addToast(`Minimum investment for this project is A$${selectedProject.minimumAud.toLocaleString()}.`, "error");
      return;
    }

    if (amt > availableBalanceAud) {
      addToast("Insufficient wallet balance for this investment amount.", "error");
      return;
    }

    // Deduct balance (converting back to USD/USDT equivalent)
    const usdDeduction = amt / audExchangeRate;
    setUsdtBalance(prev => prev - usdDeduction);

    // Register active investment
    const newInvestment: Investment = {
      id: "INV-" + Math.floor(1000 + Math.random() * 9000),
      projectTitle: selectedProject.title,
      amountInvestedAud: amt,
      roiPercent: selectedProject.roiPercent,
      startDate: new Date().toLocaleDateString(),
      status: "Active"
    };

    setInvestments(prev => [...prev, newInvestment]);
    setShowInvestModal(false);
    addToast(`Successfully invested A$${amt.toLocaleString()} in ${selectedProject.title}!`, "success");
  };

  const handleWithdraw = () => {
    if (totalPortfolioValueAud <= 0) {
      addToast("You have no investments in your portfolio to withdraw.", "error");
      return;
    }
    addToast("Withdrawal request submitted. Project maturity dates apply.", "info");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-100 min-h-[85vh]">
      
      {/* Top Header portfolio view */}
      <GlassCard className="p-6 bg-[#0c0f16] border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] sm:text-xs font-bold tracking-wider uppercase">
            <span>Total portfolio value</span>
            <button onClick={() => setShowPortfolio(!showPortfolio)} className="cursor-pointer">
              {showPortfolio ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
          
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1.5 font-mono">
            {showPortfolio ? `A$${totalPortfolioValueAud.toLocaleString(undefined, { minimumFractionDigits: 0 })}` : "A$ ••••••"}
          </div>
        </div>

        <button 
          onClick={handleWithdraw}
          className="px-4 py-1.5 bg-black/45 border border-white/10 hover:bg-white/5 text-slate-200 text-xs font-semibold rounded-md transition-colors cursor-pointer"
        >
          Withdraw
        </button>
      </GlassCard>

      {/* Tabs navigation row */}
      <div className="flex gap-4 border-b border-white/5 pb-2.5 overflow-x-auto select-none">
        {(["Open", "Closed", "Your investments", "How it works"] as const).map((tab) => (
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

      {/* OPEN TAB CONTENT */}
      {activeTab === "Open" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Open projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {PROJECTS.map((project) => (
              <GlassCard key={project.id} className="p-0 overflow-hidden bg-[#0c0f16] border border-white/5 flex flex-col justify-between group">
                
                {/* Property Image header */}
                <div className="h-44 w-full relative overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-medium text-white border border-white/10 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#089981]" /> {project.location}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight min-h-[36px]">{project.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 min-h-[50px]">{project.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-4 text-center border-t border-white/5 mt-4">
                    <div>
                      <div className="text-[9px] text-muted-foreground font-semibold">Minimum</div>
                      <div className="text-[10px] text-white font-mono font-bold mt-0.5">A${project.minimumAud.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground font-semibold">ROI</div>
                      <div className="text-[10px] text-[#089981] font-mono font-bold mt-0.5">{project.roiPercent}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground font-semibold">Strategy</div>
                      <div className="text-[10px] text-slate-300 font-bold mt-0.5 whitespace-nowrap">{project.strategy}</div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <button 
                      onClick={() => addToast(`Opening documents for ${project.title}`, "info")}
                      className="py-2 bg-black/35 hover:bg-white/5 border border-white/10 text-slate-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      View project
                    </button>
                    <button 
                      onClick={() => handleOpenInvest(project)}
                      className="py-2 bg-[#089981] hover:bg-[#089981]/90 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Invest now
                    </button>
                  </div>
                </div>

              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* CLOSED TAB CONTENT */}
      {activeTab === "Closed" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Closed projects</h2>
          <GlassCard className="p-6 bg-[#0c0f16] border border-white/5 text-center py-12">
            <Building className="w-8 h-8 text-muted-foreground/60 mx-auto mb-3" />
            <div className="text-xs text-muted-foreground">All closed investment projects have been fully liquidated and returns distributed.</div>
          </GlassCard>
        </div>
      )}

      {/* YOUR INVESTMENTS TAB CONTENT */}
      {activeTab === "Your investments" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Your holdings</h2>
          <GlassCard className="p-0 overflow-hidden bg-[#0c0f16] border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Project Title</th>
                    <th className="px-6 py-4 text-right">Amount Invested</th>
                    <th className="px-6 py-4 text-right">Target ROI</th>
                    <th className="px-6 py-4 text-right">Start Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-xs text-muted-foreground">
                        No active property investments. Select "Open" tab to invest.
                      </td>
                    </tr>
                  ) : (
                    investments.map((inv) => (
                      <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors font-medium">
                        <td className="px-6 py-4 text-white font-mono">{inv.id}</td>
                        <td className="px-6 py-4">{inv.projectTitle}</td>
                        <td className="px-6 py-4 text-right font-mono">A${inv.amountInvestedAud.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-mono font-bold">{inv.roiPercent}%</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">{inv.startDate}</td>
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
              <HelpCircle className="w-4 h-4 text-[#089981]" /> Fractional Real Estate Investing
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fractional real estate tokenization divides premium properties into compliant digital share units. Each share represents equity within a Special Purpose Vehicle (SPV) LLC that legally owns the physical asset, giving you passive rental distributions and capital gains.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-2">
                <div className="text-white font-bold text-xs">1. Browse Offerings</div>
                <div className="text-[11px] text-muted-foreground">Select stabilized or development assets matching your preferred strategy.</div>
              </div>
              <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-2">
                <div className="text-white font-bold text-xs">2. Dynamic Share Lease</div>
                <div className="text-[11px] text-muted-foreground">Invest the required minimum amount. Equity allocation registers instantly under your account.</div>
              </div>
              <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-2">
                <div className="text-white font-bold text-xs">3. Receive APY Dividends</div>
                <div className="text-[11px] text-muted-foreground">Collect rental payouts and property appreciation rewards directly.</div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* INVESTMENT MODAL */}
      {showInvestModal && selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6 bg-[#0f121a] border border-white/10 space-y-6 relative">
            <div>
              <h3 className="text-base font-bold text-white">Invest in {selectedProject.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">Configure your investment parameters to purchase project shares.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block mb-1.5">Investment Amount (AUD)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    min={selectedProject.minimumAud}
                    step="any"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#089981] text-white"
                  />
                  <button 
                    onClick={() => setInvestAmount(Math.floor(availableBalanceAud).toString())}
                    className="px-3 bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 rounded-lg font-bold cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                  Min Investment Required: A${selectedProject.minimumAud.toLocaleString()} • Available: A${availableBalanceAud.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Estimate Preview */}
              <div className="p-4 bg-black/35 rounded-lg border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target ROI Yield:</span>
                  <span className="text-[#089981] font-bold">{selectedProject.roiPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projected Returns:</span>
                  <span className="text-white font-bold">
                    A${(parseFloat(investAmount) ? (parseFloat(investAmount) * selectedProject.roiPercent * 0.01).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setShowInvestModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold rounded-md cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmInvestment}
                className="px-5 py-2 bg-[#089981] hover:bg-[#089981]/90 text-white text-xs font-semibold rounded-md shadow-sm shadow-[#089981]/20 cursor-pointer transition-colors"
              >
                Confirm Investment
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
