"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Truck, ShieldCheck, LogIn, LogOut, Plus } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewZone: () => void;
  onOpenNewProduct: () => void;
  onOpenNewOrder: () => void;
  onOpenAuth: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onOpenNewZone,
  onOpenNewProduct,
  onOpenNewOrder,
  onOpenAuth,
}: HeaderProps) {
  const { user, signOut, loginDemoUser } = useAuth();

  const navLinks = [
    { id: "dashboard", label: "Dashboard" },
    { id: "map", label: "Live Map & Dispatch" },
    { id: "zones", label: "Zones" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#d8d8d8]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-4 sm:gap-8">
            <div
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] bg-[#080808] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex items-center">
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#080808]">
                  ADPROMAX
                </span>
                <span className="hidden xs:inline-block ml-1.5 text-[10px] font-semibold text-[#7a3dff] bg-[#f4efff] px-1.5 py-0.5 rounded-[2px]">
                  DISPATCH
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links (hidden on mobile, bottom bar used instead) */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-[4px] transition-colors ${
                      isActive
                        ? "text-[#080808] bg-[#f2f2f2]"
                        : "text-[#5a5a5a] hover:text-[#080808] hover:bg-[#fafafa]"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Direct New Order CTA */}
            <button
              onClick={onOpenNewOrder}
              className="wf-btn-primary py-1.5 px-3 sm:px-4 text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Order</span>
            </button>

            {/* User Session Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[#d8d8d8]">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-[#080808] truncate max-w-[120px]">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <span className="text-[10px] text-[#00d722] font-medium flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d722]" />
                    Operator
                  </span>
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-1.5 sm:p-2 text-[#5a5a5a] hover:text-[#ee1d36] hover:bg-[#fff0f1] rounded-[4px] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={loginDemoUser}
                  title="Quick 1-Click Demo Login"
                  className="hidden sm:inline-flex wf-btn-secondary py-1.5 px-2.5 text-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7a3dff]" />
                  <span>Demo</span>
                </button>
                <button
                  onClick={onOpenAuth}
                  className="wf-btn-secondary py-1.5 px-2.5 sm:px-3 text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
