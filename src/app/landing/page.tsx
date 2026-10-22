"use client";

import React from "react";
import Link from "next/link";
import { Truck, MapPin, Shield, Zap, CheckCircle, ArrowRight } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Smart Geofencing",
    description: "Automated point-in-zone verification ensures every delivery reaches the right area.",
  },
  {
    icon: Shield,
    title: "Zone Management",
    description: "Create, edit, and toggle delivery zones with real-time map visualization.",
  },
  {
    icon: Zap,
    title: "Live Dispatch",
    description: "Real-time order tracking and driver coordination on an interactive map.",
  },
  {
    icon: CheckCircle,
    title: "Inventory Control",
    description: "Product catalog with stock levels tied to specific delivery zones.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080808] via-[#1a1a2e] to-[#080808]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00d722] animate-pulse" />
              <span className="text-xs font-medium text-white/80">Now with Supabase Auth & Real-time Sync</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Delivery Management
              <br />
              <span className="text-[#7a3dff]">Powered by Geofence Intelligence</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Next-generation delivery zone management and order dispatch platform with 
              automated point-in-zone geospatial verification, inventory control, and real-time operations dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#080808] font-semibold rounded-[6px] hover:bg-white/90 transition-colors text-center shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 inline-block ml-2" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-[6px] hover:border-white/50 hover:bg-white/5 transition-colors text-center"
              >
                See How It Works
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-white/50 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00d722]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00d722]" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00d722]" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          {/* Hero Visual - Mock Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="mx-auto max-w-5xl">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-2 shadow-2xl">
                <div className="rounded-lg bg-[#0a0a0a] border border-white/10 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
                    </div>
                    <div className="flex-1 text-center text-xs text-white/40 font-mono">dispatch.adpromax.delivery</div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "Active Zones", value: "12", icon: MapPin, color: "#7a3dff" },
                        { label: "Live Orders", value: "34", icon: Truck, color: "#00d722" },
                        { label: "Products", value: "156", icon: CheckCircle, color: "#febc2e" },
                        { label: "Drivers Online", value: "8", icon: Shield, color: "#ff5f57" },
                      ].map((stat) => (
                        <div key={stat.label} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                            <span className="text-xs text-white/60">{stat.label}</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{stat.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-white/5 border border-white/10 p-4 h-48 flex items-center justify-center">
                      <div className="text-white/30 text-sm">Live Dispatch Map Preview</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 lg:py-32 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#080808] mb-4">
              Built for Modern Delivery Operations
            </h2>
            <p className="text-lg text-[#5a5a5a]">
              Everything you need to manage zones, dispatch orders, and track deliveries in real-time.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl bg-white border border-[#d8d8d8] hover:border-[#7a3dff]/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-[#f4efff] flex items-center justify-center mb-4 group-hover:bg-[#7a3dff] group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6 text-[#7a3dff] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-[#080808] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#5a5a5a] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Optimize Your Delivery Operations?
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Join dispatch teams already using AdProMax to reduce delivery errors by 87% and improve 
              on-time rates with automated geofence verification.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#7a3dff] text-white font-semibold rounded-[6px] hover:bg-[#6b2fff] transition-colors shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-4 text-sm text-white/50">
              Demo: demo@adpromax.delivery / Demo123456!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#d8d8d8] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[4px] bg-[#080808] flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[#080808]">ADPROMAX</span>
            </div>
            <p className="text-sm text-[#5a5a5a]">
              © 2024 AdProMax Logistics Engineering. Built with Next.js & Supabase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}