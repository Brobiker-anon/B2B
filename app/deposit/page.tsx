"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { 
  CreditCard, 
  Landmark, 
  Wallet, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Lock, 
  Search, 
  MessageSquare,
  ArrowLeft,
  X,
  ChevronDown
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface DepositRecord {
  id: string;
  date: string;
  reference: string;
  method: string;
  type: string;
  amountVal: string;
  amountAsset: string;
  totalUsd: string;
  status: "Approved" | "Pending" | "Cancelled";
}

export default function Deposit() {
  const [viewMode, setViewMode] = useState<"history" | "form">("history");
  const [method, setMethod] = useState("crypto");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const { kycLevel, setKycLevel, addToast } = useApp();

  const [depositRecords, setDepositRecords] = useState<DepositRecord[]>([
    {
      id: "1",
      date: "55 seconds ago",
      reference: "G1gH63256",
      method: "BTC",
      type: "Regular",
      amountVal: "0.00001",
      amountAsset: "BTC",
      totalUsd: "$0.856",
      status: "Pending",
    },
    {
      id: "2",
      date: "1 month ago",
      reference: "42iK1587",
      method: "BTC",
      type: "Regular",
      amountVal: "0.0087",
      amountAsset: "BTC",
      totalUsd: "$682.45",
      status: "Approved",
    },
    {
      id: "3",
      date: "1 month ago",
      reference: "42iK49234",
      method: "BTC",
      type: "Regular",
      amountVal: "0.0062",
      amountAsset: "BTC",
      totalUsd: "$486.20",
      status: "Approved",
    },
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText("TYB2k3c...9xjL2p");
    setCopied(true);
    addToast("Address copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartVerification = () => {
    setKycLevel(2);
    addToast("KYC Level 2 Identity Verification Approved successfully!", "success");
  };

  const handleNewDepositSubmit = async (amount: string, methodType: string) => {
    const newRecord: DepositRecord = {
      id: Date.now().toString(),
      date: "Just now",
      reference: "G1gH" + Math.floor(10000 + Math.random() * 90000),
      method: methodType.toUpperCase(),
      type: "Regular",
      amountVal: amount || "0.00001",
      amountAsset: methodType.toUpperCase(),
      totalUsd: "$" + (parseFloat(amount || "0.00001") * 63000).toFixed(3),
      status: "Pending",
    };
    setDepositRecords([newRecord, ...depositRecords]);
    addToast("Deposit request submitted and currently pending!", "success");
    setViewMode("history");

    try {
      await fetch("/api/submissions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "deposit",
          reference: newRecord.reference,
          method: newRecord.method,
          amountVal: newRecord.amountVal,
          amountAsset: newRecord.amountAsset,
          totalUsd: newRecord.totalUsd,
          status: "Pending",
          details: { type: newRecord.type, submittedAt: new Date().toISOString() },
        }),
      });
    } catch (err) {
      console.error("Failed to persist deposit submission:", err);
    }
  };

  const filteredRecords = depositRecords.filter((rec) => {
    const matchesSearch = rec.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.method.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8 text-slate-100 relative min-h-[80vh]"
    >
      <AnimatePresence mode="wait">
        {viewMode === "history" ? (
          <motion.div
            key="history-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header controls matching screenshot */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-white">Deposits</h1>
                <button
                  onClick={() => setViewMode("form")}
                  className="px-4 py-2 bg-[#00a3ff] hover:bg-[#0090e0] text-white rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-500/10 active:scale-95"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Deposit now</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for deposits"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#0d0e12] border border-[#1e2028] rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-gray-500 w-full text-white transition-colors"
                  />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#0d0e12] border border-[#1e2028] rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-gray-500 appearance-none pr-8 cursor-pointer font-medium"
                  >
                    <option value="All">All</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Deposits list Table matching layout */}
            <GlassCard className="overflow-hidden border border-[#1e2028] bg-black/40 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e2028] text-gray-400 text-xs font-normal">
                      <th className="px-6 py-4 font-normal">Date</th>
                      <th className="px-6 py-4 font-normal">Reference</th>
                      <th className="px-6 py-4 font-normal">Method</th>
                      <th className="px-6 py-4 font-normal">Type</th>
                      <th className="px-6 py-4 font-normal">Amount</th>
                      <th className="px-6 py-4 font-normal">Total (USD)</th>
                      <th className="px-6 py-4 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                          No deposits found matching search filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((rec) => (
                        <tr key={rec.id} className="border-b border-[#1e2028]/60 hover:bg-white/[0.02] transition-colors text-xs font-normal">
                          <td className="px-6 py-5 text-gray-400">{rec.date}</td>
                          <td className="px-6 py-5 text-gray-400">{rec.reference}</td>
                          <td className="px-6 py-5 text-white font-medium">{rec.method}</td>
                          <td className="px-6 py-5 text-gray-300">{rec.type}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#f7931a] text-black font-bold flex items-center justify-center text-[10px]">
                                ₿
                              </span>
                              <span className="text-white font-semibold">{rec.amountVal} {rec.amountAsset}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-gray-300 font-medium">{rec.totalUsd}</td>
                          <td className="px-6 py-5">
                            {rec.status === "Pending" ? (
                              <span className="px-3 py-1 bg-[#00a3ff]/10 border border-[#00a3ff]/20 text-[#00a3ff] rounded text-xs font-medium inline-block">
                                Pending
                              </span>
                            ) : rec.status === "Approved" ? (
                              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs font-medium inline-block">
                                Approved
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs font-medium inline-block">
                                Cancelled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Go back header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode("history")}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs border border-white/5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to deposits list</span>
                </button>
                <h1 className="text-xl font-bold text-white">New Deposit</h1>
              </div>
              <button onClick={() => setViewMode("history")} className="text-muted-foreground hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original deposit selection layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "crypto", icon: Wallet, title: "Crypto Deposit", desc: "Transfer from another wallet" },
                { id: "card", icon: CreditCard, title: "Bank Card", desc: "Instant deposit via Visa/Mastercard" },
                { id: "bank", icon: Landmark, title: "Bank Transfer", desc: "Wire transfer (1-3 business days)" }
              ].map((m) => (
                <GlassCard 
                  key={m.id} 
                  hoverEffect 
                  className={`cursor-pointer ${method === m.id ? 'border-brand box-glow bg-brand/5' : ''}`}
                  onClick={() => setMethod(m.id)}
                >
                  <div>
                    <m.icon className={`w-8 h-8 mb-4 ${method === m.id ? 'text-brand' : 'text-muted-foreground'}`} />
                    <h3 className="text-lg font-semibold text-white mb-1">{m.title}</h3>
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </div>

            {method === "crypto" && (
              <GlassCard className="space-y-6">
                <h2 className="text-xl font-bold text-white">Crypto Deposit Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Select Asset</label>
                      <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-brand transition-colors">
                        <option>USDT (Tether)</option>
                        <option>BTC (Bitcoin)</option>
                        <option>ETH (Ethereum)</option>
                        <option>SOL (Solana)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Select Network</label>
                      <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-brand transition-colors">
                        <option>TRC20 (Tron)</option>
                        <option>ERC20 (Ethereum)</option>
                        <option>BEP20 (BNB Smart Chain)</option>
                        <option>Polygon</option>
                      </select>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <p className="text-xs text-yellow-500 leading-relaxed">
                        <strong>Warning:</strong> Only send USDT to this address via the TRC20 network. Sending any other asset or using a different network will result in permanent loss.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 border border-white/10 rounded-lg bg-black/20">
                    <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      <QrCode className="w-40 h-40 text-black" />
                    </div>
                    <div className="w-full">
                      <label className="block text-xs font-medium text-muted-foreground mb-1 text-center">Deposit Address</label>
                      <div className="flex items-center gap-2 bg-black/40 p-3 rounded-lg border border-white/5">
                        <code className="text-sm text-brand-glow truncate flex-1">TYB2k3c...9xjL2p</code>
                        <button onClick={handleCopy} className="text-muted-foreground hover:text-white transition-colors">
                          {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {method !== "crypto" && kycLevel < 2 && (
              <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Fiat Verification Required</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  To deposit via bank card or wire transfer, you must complete KYC Level 2 identity verification.
                </p>
                <button onClick={handleStartVerification} className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors box-glow">
                  Start Verification
                </button>
              </GlassCard>
            )}

            {method === "card" && kycLevel >= 2 && (
              <GlassCard className="space-y-6">
                <h2 className="text-xl font-bold text-white">Credit / Debit Card Deposit</h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cardholder Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-brand transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Expiry Date</label>
                      <input type="text" placeholder="MM/YY" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-brand transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">CVV</label>
                      <input type="password" placeholder="***" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-brand transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amount (USD)</label>
                    <input type="number" placeholder="1000.00" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-brand transition-colors" />
                  </div>
                  <button onClick={() => {
                    handleNewDepositSubmit("1000.00", "Card");
                  }} className="w-full py-3 bg-[#00a3ff] hover:bg-[#0090e0] text-white rounded-lg font-bold transition-all shadow-md shadow-blue-500/10">
                    Submit Deposit
                  </button>
                </div>
              </GlassCard>
            )}

            {method === "bank" && kycLevel >= 2 && (
              <GlassCard className="space-y-6">
                <h2 className="text-xl font-bold text-white">Bank Wire Transfer Details</h2>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Bank Name</p>
                      <p className="text-sm font-bold text-white">Silicon Valley International Bank</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Beneficiary Name</p>
                      <p className="text-sm font-bold text-white">BrokerageX Inc.</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Account Number (IBAN)</p>
                      <p className="text-sm font-bold text-brand-glow font-mono select-all">US76 SVIB 9903 1234 5678 90</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">SWIFT / BIC Code</p>
                      <p className="text-sm font-bold text-white font-mono select-all">SVIBUS33XXX</p>
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-2">
                    <p className="text-xs text-yellow-500 leading-relaxed">
                      <strong>Transfer Notice:</strong> Please include your BrokerageX username in the transfer reference memo. Transfers typically take 1-3 business days to credit to your account.
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Bubble Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/chat"
          className="w-12 h-12 rounded-full bg-[#0066cc] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-400/25"
          title="Open Live Chat"
        >
          <MessageSquare className="w-5 h-5 fill-white text-[#0066cc]" />
        </Link>
      </div>
    </motion.div>
  );
}
