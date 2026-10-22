"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { X, Lock, Mail, User, ShieldCheck, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, loginDemoUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUp(email, password, name);
        if (res.error) {
          setError(res.error);
        } else {
          onClose();
        }
      } else {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    await loginDemoUser();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-md border border-[#d8d8d8] shadow-2xl overflow-hidden">
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#d8d8d8] bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[4px] bg-[#080808] text-white flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-[#080808]">
              {isSignUp ? "Create Dispatcher Account" : "Operator Sign In"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#898989] hover:text-[#080808] rounded hover:bg-neutral-200 transition"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Quick Demo Credentials Banner */}
          <div className="p-3 bg-neutral-50 border border-[#d8d8d8] rounded-[6px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#080808] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00d722]" />
                Test Credentials Included
              </span>
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="text-xs font-bold text-[#3b89ff] hover:underline"
              >
                1-Click Login
              </button>
            </div>
            <p className="text-[11px] text-[#5a5a5a]">
              Email: <code className="bg-white px-1 py-0.5 rounded border border-neutral-200 text-[#080808]">demo@adpromax.delivery</code>
              <br />
              Password: <code className="bg-white px-1 py-0.5 rounded border border-neutral-200 text-[#080808]">Demo123456!</code>
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-[#fff0f1] border border-[#ffd0d5] rounded-[4px] text-xs text-[#ee1d36] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#898989] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Durand"
                    className="wf-input pl-9 text-xs"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#898989] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@adpromax.delivery"
                  className="wf-input pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#898989] absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="wf-input pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full wf-btn-primary py-2.5 text-xs font-semibold shadow mt-2"
            >
              {loading ? "Authenticating..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* <div className="text-center pt-2 border-t border-[#d8d8d8]">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-[#5a5a5a] hover:text-[#080808] font-medium"
            >
              {isSignUp
                ? "Already an operator? Sign in"
                : "Need a new account? Register"}
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
