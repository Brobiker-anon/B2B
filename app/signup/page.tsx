"use client";

import React from "react";
import SignupForm from "@/components/auth/SignupForm";

export default function Signup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-slate-100">
      <SignupForm />
    </div>
  );
}