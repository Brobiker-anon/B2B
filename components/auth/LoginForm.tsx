"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { setUser, setUserPlan } = useApp();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!emailInput.trim() || !passwordInput) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: emailInput.trim(), password: passwordInput }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        if (data.user.role === "Administrator") {
          setUserPlan("Pro");
        }
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        setErrorMsg(data.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-8">
        Log in to your account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email address field */}
        <div>
          <input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Email address"
            className="w-full bg-[#0d0e12] border border-[#1e2028] text-white text-sm rounded-lg px-4 py-3.5 placeholder:text-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        {/* Password field */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
            className="w-full bg-[#0d0e12] border border-[#1e2028] text-white text-sm rounded-lg pl-4 pr-11 py-3.5 placeholder:text-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Links section */}
        <div className="pt-2 pb-4 space-y-2 text-sm font-normal">
          <div>
            <a
              href="/signup"
              className="text-[#0090ff] hover:text-[#33a7ff] hover:underline transition-colors"
            >
              Don&apos;t have an account?
            </a>
          </div>
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset instructions have been sent if account exists.");
              }}
              className="text-[#0090ff] hover:text-[#33a7ff] hover:underline transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#71717a] hover:bg-[#80808a] active:bg-[#606068] text-white font-medium py-3.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Log in</span>
          )}
        </button>
      </form>
    </div>
  );
}
