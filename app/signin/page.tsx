"use client";

import React from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function Signin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-slate-100">
      <LoginForm />
    </div>
  );
}