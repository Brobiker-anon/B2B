"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Check, X, Zap, Crown, Shield } from "lucide-react";
import { useApp } from "@/context/AppContext";

const plans = [
  {
    name: "Basic",
    price: "Free",
    desc: "Essential trading tools for beginners.",
    icon: Shield,
    color: "text-muted-foreground",
    glow: "",
    features: [
      { name: "Spot Trading", included: true },
      { name: "Basic Charts", included: true },
      { name: "Standard Support", included: true },
      { name: "Copy Trading", included: false },
      { name: "Trading Signals", included: false },
      { name: "VIP Events", included: false },
    ],
    buttonText: "Switch to Basic",
    buttonClass: "bg-white/10 text-white hover:bg-white/20",
  },
  {
    name: "Pro",
    price: "$49/mo",
    desc: "Advanced features for serious traders.",
    icon: Zap,
    color: "text-brand",
    glow: "box-glow border-brand/50",
    features: [
      { name: "Spot & Futures Trading", included: true },
      { name: "Advanced Charts & API", included: true },
      { name: "Priority Support (24/7)", included: true },
      { name: "Copy Trading (Up to 5)", included: true },
      { name: "Trading Signals", included: true },
      { name: "VIP Events", included: false },
    ],
    buttonText: "Upgrade to Pro",
    buttonClass: "bg-brand text-white hover:bg-brand/90 box-glow",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199/mo",
    desc: "Maximum limits and VIP treatment.",
    icon: Crown,
    color: "text-purple-500",
    glow: "box-glow-purple border-purple-500/50",
    features: [
      { name: "Zero Trading Fees (up to 1M)", included: true },
      { name: "Institutional Charts & API", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "Unlimited Copy Trading", included: true },
      { name: "Premium Trading Signals", included: true },
      { name: "VIP Events & Networking", included: true },
    ],
    buttonText: "Upgrade to Enterprise",
    buttonClass: "bg-purple-500 text-white hover:bg-purple-600 box-glow-purple",
  },
];

export default function Subscribe() {
  const { userPlan, setUserPlan, addToast } = useApp();

  const handlePlanAction = (planName: string) => {
    const isBasicActive = planName === "Basic" && userPlan === "Free";
    const isActive = userPlan === planName || isBasicActive;
    
    if (isActive) {
      addToast("This is already your active plan.", "info");
      return;
    }

    if (planName === "Basic") {
      setUserPlan("Free");
      addToast("Downgraded to Basic plan.", "success");
    } else if (planName === "Pro") {
      setUserPlan("Pro");
      addToast("Upgraded to Pro tier! Welcome to premium trading.", "success");
    } else if (planName === "Enterprise") {
      setUserPlan("Enterprise");
      addToast("Upgraded to Enterprise tier! VIP benefits unlocked.", "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-12 py-8 text-slate-100"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Upgrade Your Trading Experience</h1>
        <p className="text-lg text-muted-foreground">Unlock powerful tools, lower fees, and premium signals to maximize your profitability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="absolute inset-0 bg-brand/5 blur-[100px] pointer-events-none rounded-full"></div>

        {plans.map((plan) => {
          const isBasicActive = plan.name === "Basic" && userPlan === "Free";
          const isActive = userPlan === plan.name || isBasicActive;

          return (
            <GlassCard key={plan.name} className={`relative flex flex-col p-8 transition-transform hover:-translate-y-2 ${plan.glow} ${plan.popular ? 'md:-mt-4 md:mb-4 bg-brand/5' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <plan.icon className={`w-10 h-10 mb-4 ${plan.color}`} />
                <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? 'text-white' : 'text-muted-foreground'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handlePlanAction(plan.name)} 
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  isActive 
                    ? "bg-white/5 text-muted-foreground cursor-not-allowed" 
                    : plan.buttonClass
                }`}
                disabled={isActive}
              >
                {isActive ? "Current Plan" : plan.buttonText}
              </button>
            </GlassCard>
          );
        })}
      </div>
    </motion.div>
  );
}
