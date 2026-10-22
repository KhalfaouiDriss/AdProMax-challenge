"use client";

import React from "react";
import { LayoutDashboard, Map, Compass, Package, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export default function MobileNav({
  activeTab,
  setActiveTab,
  onOpenAuth,
}: MobileNavProps) {
  const { user } = useAuth();

  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "map", label: "Dispatch Map", icon: Map },
    { id: "zones", label: "Zones", icon: Compass },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#d8d8d8] pb-safe shadow-lg">
      <div className="flex items-center justify-around h-14 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? "text-[#080808]" : "text-[#898989]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#080808]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? "font-semibold" : "font-normal"}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Profile / Auth trigger */}
        <button
          onClick={onOpenAuth}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[#898989] hover:text-[#080808]"
        >
          <div className="relative">
            <User className="w-5 h-5 stroke-[1.75]" />
            {user && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00d722] border border-white" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-normal">
            {user ? "Account" : "Sign In"}
          </span>
        </button>
      </div>
    </div>
  );
}
