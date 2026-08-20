"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { User, Shield, Bell, Key, CreditCard, Monitor, Smartphone, Globe } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Profile");
  const { user, addToast } = useApp();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPhishingModal, setShowPhishingModal] = useState(false);

  const handleChangeAvatar = () => {
    setShowAvatarModal(true);
  };

  const handleSaveChanges = () => {
    addToast("Profile changes saved successfully!", "success");
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleManage2FA = () => {
    setShow2FAModal(true);
  };

  const handleSetupPhishing = () => {
    setShowPhishingModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences, security, and notifications.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0">
          <GlassCard className="p-3 flex flex-col gap-1">
            {[
              { name: "Profile", icon: User },
              { name: "Security", icon: Shield },
              { name: "Notifications", icon: Bell },
              { name: "API Management", icon: Key },
              { name: "Payment Methods", icon: CreditCard },
              { name: "Preferences", icon: Monitor },
              { name: "Devices", icon: Smartphone },
            ].map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.name 
                    ? "bg-brand/10 text-brand box-glow" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </GlassCard>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === "Profile" && (
            <GlassCard className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-brand flex items-center justify-center text-white text-3xl font-bold border-4 border-background">
                    {user?.avatar || user?.username?.substring(0, 2).toUpperCase() || "??"}
                  </div>
                  <div>
                    <button onClick={handleChangeAvatar} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/10 mb-2">
                      Change Avatar
                    </button>
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <input type="text" defaultValue={user?.username || ""} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-brand" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <input type="text" defaultValue={user?.role || ""} disabled className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-muted-foreground outline-none cursor-not-allowed" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <input type="email" defaultValue={user?.email || ""} disabled className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-muted-foreground outline-none cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">Identity Verification (KYC)</h2>
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div>
                    <h3 className="font-bold text-green-500 mb-1">Level 2 Verified</h3>
                    <p className="text-sm text-muted-foreground">Daily withdrawal limit: 100 BTC</p>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors border border-white/10">
                    Upgrade to VIP
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={handleSaveChanges} className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors box-glow">
                  Save Changes
                </button>
              </div>
            </GlassCard>
          )}

          {activeTab === "Security" && (
            <GlassCard className="space-y-8">
              <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                  <div>
                    <h3 className="font-bold text-white mb-1">Password</h3>
                    <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                  <button onClick={handleChangePassword} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">Two-Factor Authentication (2FA)</h3>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] rounded font-bold">ENABLED</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Google Authenticator app</p>
                  </div>
                  <button onClick={handleManage2FA} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                    Manage
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                  <div>
                    <h3 className="font-bold text-white mb-1">Anti-Phishing Code</h3>
                    <p className="text-sm text-muted-foreground">Protects your account from phishing attempts</p>
                  </div>
                  <button onClick={handleSetupPhishing} className="px-4 py-2 bg-brand/20 text-brand hover:bg-brand hover:text-white rounded-lg text-sm font-medium transition-colors">
                    Setup
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Other tabs can just show a placeholder to save time, as instructed to build MVP */}
          {activeTab !== "Profile" && activeTab !== "Security" && (
            <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
              <Globe className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">{activeTab} Settings</h2>
              <p className="text-muted-foreground">This section is currently under construction in the MVP.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
