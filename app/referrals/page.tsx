"use client";

import { useState } from "react";
import { ChevronLeft, X, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function Referrals() {
  const router = useRouter();
  const { usdtBalance, setUsdtBalance, addToast } = useApp();
  
  // States
  const [referralBalance, setReferralBalance] = useState(8643.572);
  const [friendsCount, setFriendsCount] = useState(0);
  const [rewardsClaimed, setRewardsClaimed] = useState(0.00);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClose = () => {
    router.push("/");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("NDJpS1E3WWk5cWJPTkY0VzJKUk4wNjRTTjl");
    addToast("Referral code copied to clipboard!", "success");
  };

  const handleClaim = () => {
    if (referralBalance <= 0) {
      addToast("Referral balance is empty.", "error");
      return;
    }
    const claimedAmt = referralBalance;
    // Add to USDT balance (convert AUD to USD equivalent at 1.45)
    const usdEquivalent = claimedAmt / 1.4925;
    setUsdtBalance(prev => prev + usdEquivalent);
    setRewardsClaimed(prev => prev + claimedAmt);
    setReferralBalance(0);
    addToast(`Successfully claimed A$${claimedAmt.toLocaleString(undefined, { minimumFractionDigits: 3 })} to your account!`, "success");
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E2E8F0] p-6 flex flex-col space-y-6 max-w-md mx-auto border-x border-white/5 shadow-2xl relative">
      
      {/* Header back/close triggers */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 select-none">
        <button 
          onClick={handleClose} 
          className="flex items-center gap-2 font-bold text-white text-sm hover:text-slate-300 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Referral program
        </button>
        <button 
          onClick={handleClose} 
          className="text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description text */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        Invite your friends to join our platform by using your referral code on sign up! You'll earn <span className="text-slate-200 font-semibold">A$8,643.572</span> anytime your friends make a deposit on our platform. It's a win-win for everyone!
      </p>

      {/* Referral Balance Row */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Your referral balance:</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={`A$${referralBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`}
            className="flex-1 bg-black/35 border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-white outline-none select-none"
          />
          <button 
            onClick={handleClaim}
            className={`px-5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              referralBalance > 0 
                ? "bg-white text-slate-900 hover:bg-slate-200" 
                : "bg-[#8E9297]/25 text-white/40 cursor-not-allowed"
            }`}
          >
            CLAIM
          </button>
        </div>
      </div>

      {/* Referral Code Row */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Your referral code:</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value="NDJpS1E3WWk5cWJPTkY0VzJKUk4wNjRTTjl"
            className="flex-1 bg-black/35 border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-white outline-none select-all"
          />
          <button 
            onClick={handleCopy}
            className="px-5 py-2 bg-[#0099ff] hover:bg-[#0099ff]/90 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
          >
            COPY
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-3 border-t border-white/5 pt-4">
        <h4 className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Statistics</h4>
        <div className="flex gap-12">
          <div>
            <div className="text-[10px] text-muted-foreground font-semibold">Friends invited</div>
            <div className="text-base font-bold text-white mt-0.5">{friendsCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground font-semibold">Rewards claimed</div>
            <div className="text-base font-bold text-white mt-0.5">A${rewardsClaimed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Referrals section and Search box */}
      <div className="space-y-3 pt-4 border-t border-white/5 flex-1 flex flex-col">
        <h4 className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Referrals</h4>
        
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for a referral"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/35 border border-white/10 rounded-md pl-8.5 pr-4 py-2 text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-muted-foreground select-none">
          {/* Central SVG Empty State Icon */}
          <svg className="w-12 h-12 mb-3 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="12" y2="13" />
            <circle cx="15.5" cy="13.5" r="1.5" strokeDasharray="3 3" />
          </svg>
          <div className="text-xs">No referrals yet.</div>
        </div>
      </div>

    </div>
  );
}
