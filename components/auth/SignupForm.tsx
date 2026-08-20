"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, RefreshCw, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";

const COUNTRIES = [
  { name: "Nigeria", flag: "🇳🇬", code: "+234" },
  { name: "United States", flag: "🇺🇸", code: "+1" },
  { name: "United Kingdom", flag: "🇬🇧", code: "+44" },
  { name: "Canada", flag: "🇨🇦", code: "+1" },
  { name: "Australia", flag: "🇦🇺", code: "+61" },
  { name: "Germany", flag: "🇩🇪", code: "+49" },
  { name: "France", flag: "🇫🇷", code: "+33" },
  { name: "Japan", flag: "🇯🇵", code: "+81" },
  { name: "India", flag: "🇮🇳", code: "+91" },
  { name: "Brazil", flag: "🇧🇷", code: "+55" },
  { name: "South Africa", flag: "🇿🇦", code: "+27" },
  { name: "United Arab Emirates", flag: "🇦🇪", code: "+971" },
];

const CURRENCIES = [
  "USD (Account currency)",
  "EUR (Account currency)",
  "GBP (Account currency)",
  "AUD (Account currency)",
  "CAD (Account currency)",
  "JPY (Account currency)"
];

interface SignupFormProps {
  onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const router = useRouter();
  const { setUser } = useApp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Please enter your first and last name.");
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMsg("Please enter and confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    const username = `${firstName.trim()} ${lastName.trim()}`;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email: email.trim(),
          password,
          country: selectedCountry.name,
          phone: `${selectedCountry.code} ${phoneNumber}`,
          currency: selectedCurrency,
          referralCode: referralCode.trim()
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        setErrorMsg(data.error || "Registration failed. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-8">
        Create a new account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="w-full bg-[#0d0e12] border border-[#1e2028] text-white text-sm rounded-lg px-4 py-3.5 placeholder:text-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        {/* Last Name */}
        <div>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-full bg-[#0d0e12] border border-[#1e2028] text-white text-sm rounded-lg px-4 py-3.5 placeholder:text-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            disabled={isSubmitting}
          />
        </div>

        {/* Email Address */}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full bg-[#0d0e12] border border-[#1e2028] text-white text-sm rounded-lg px-4 py-3.5 placeholder:text-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            disabled={isSubmitting}
          />
        </div>

        {/* Country Select Dropdown */}
        <div className="relative">
          <div className="w-full bg-[#0d0e12] border border-[#1e2028] text-white text-sm rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer focus-within:border-gray-500">
            <div className="flex items-center gap-2.5">
              <span>{selectedCountry.flag}</span>
              <span className="font-semibold">{selectedCountry.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCountry.name}
              onChange={(e) => {
                const found = COUNTRIES.find((c) => c.name === e.target.value);
                if (found) setSelectedCountry(found);
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer bg-black text-white"
              disabled={isSubmitting}
            >
              {COUNTRIES.map((c) => (
                <option key={c.name} value={c.name} className="bg-[#0d0e12] text-white">
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone Number Field */}
        <div className="flex items-center bg-[#0d0e12] border border-[#1e2028] rounded-lg px-3 py-1 focus-within:border-gray-500">
          <div className="relative flex items-center gap-1 pr-2 border-r border-[#1e2028] text-sm text-white">
            <span>{selectedCountry.flag}</span>
            <span className="font-semibold text-xs">{selectedCountry.code}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCountry.name}
              onChange={(e) => {
                const found = COUNTRIES.find((c) => c.name === e.target.value);
                if (found) setSelectedCountry(found);
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer bg-black text-white"
              disabled={isSubmitting}
            >
              {COUNTRIES.map((c) => (
                <option key={c.name} value={c.name} className="bg-[#0d0e12] text-white">
                  {c.flag} {c.code} ({c.name})
                </option>
              ))}
            </select>
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone number"
            className="w-full bg-transparent text-white text-sm px-3 py-2.5 placeholder:text-gray-500 focus:outline-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full bg-[#0d0e12] border border-[#1e2028] text-white text-sm rounded-lg pl-4 pr-11 py-3.5 placeholder:text-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Account Currency Dropdown */}
        <div className="relative">
          <div className="w-full bg-[#0d0e12] border border-[#1e2028] text-white text-sm rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer focus-within:border-gray-500">
            <span className="font-semibold">{selectedCurrency}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer bg-black text-white"
              disabled={isSubmitting}
            >
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr} className="bg-[#0d0e12] text-white">
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Links section */}
        <div className="pt-2 pb-4 space-y-2.5 text-sm font-normal">
          <div>
            <button
              type="button"
              onClick={() => setShowReferralInput(!showReferralInput)}
              className="text-[#0090ff] hover:text-[#33a7ff] hover:underline transition-colors text-left"
            >
              Have a referral code?
            </button>
          </div>

          {showReferralInput && (
            <div className="pt-1">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code"
                className="w-full bg-[#0d0e12] border border-[#1e2028] text-white text-sm rounded-lg px-4 py-2.5 placeholder:text-gray-500 focus:outline-none focus:border-gray-500"
              />
            </div>
          )}

          <div>
            <a
              href="/"
              className="text-[#0090ff] hover:text-[#33a7ff] hover:underline transition-colors"
            >
              Already have an account?
            </a>
          </div>
        </div>

        {/* Error notification */}
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>
    </div>
  );
}
