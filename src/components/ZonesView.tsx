"use client";

import React, { useState } from "react";
import { DeliveryZone, Order } from "@/lib/supabase/types";
import InteractiveMap from "./InteractiveMap";
import { Compass, Plus, Edit2, Trash2, Power } from "lucide-react";

interface ZonesViewProps {
  zones: DeliveryZone[];
  orders: Order[];
  onOpenNewZone: () => void;
  onEditZone: (zone: DeliveryZone) => void;
  onDeleteZone: (id: string) => Promise<void>;
  onToggleActive: (zone: DeliveryZone) => Promise<void>;
}

export default function ZonesView({
  zones,
  orders,
  onOpenNewZone,
  onEditZone,
  onDeleteZone,
  onToggleActive,
}: ZonesViewProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-md border border-[#d8d8d8] shadow-sm">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#3b89ff] bg-[#eff6ff] px-2 py-0.5 rounded-[2px]">
            Geofence & Dispatch Logistics
          </span>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[#080808] mt-1">
            Delivery Zone Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5a5a5a] mt-0.5">
            Define active circular service areas, radii, and dispatch hubs on the interactive map.
          </p>
        </div>

        <button
          onClick={onOpenNewZone}
          className="wf-btn-primary py-2 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Create Delivery Zone</span>
        </button>
      </div>

      {/* Main Interactive Map Showcase */}
      <div className="bg-white p-3 sm:p-4 rounded-md border border-[#d8d8d8] shadow-sm">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#7a3dff]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#080808]">
              Live Map Geofences ({zones.length} Configured)
            </h3>
          </div>
          <span className="text-[11px] text-[#5a5a5a]">
            Circular coverage boundaries
          </span>
        </div>

        <InteractiveMap
          zones={zones}
          orders={orders}
          selectedZoneId={selectedZoneId}
          height="360px"
          zoom={12}
        />
      </div>

      {/* Zones Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {zones.length === 0 ? (
          <div className="wf-card p-8 text-center col-span-full">
            <div className="w-12 h-12 rounded-full bg-[#f4efff] text-[#7a3dff] flex items-center justify-center mx-auto mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#080808]">No Delivery Zones Yet</h3>
            <p className="text-xs text-[#5a5a5a] max-w-sm mx-auto mt-1 mb-4">
              Add your first circular service area by choosing a center coordinate and radius.
            </p>
            <button
              onClick={onOpenNewZone}
              className="wf-btn-primary py-2 px-4 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create Delivery Zone</span>
            </button>
          </div>
        ) : (
          zones.map((zone) => {
            const zoneOrders = orders.filter((o) => o.zone_id === zone.id);
            const isSelected = selectedZoneId === zone.id;

            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZoneId(isSelected ? null : zone.id)}
                className={`wf-card p-4 sm:p-5 cursor-pointer flex flex-col justify-between transition-all ${
                  isSelected ? "ring-2 ring-[#080808] border-transparent" : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: zone.color }}
                      />
                      <h3 className="text-sm font-bold text-[#080808] truncate">
                        {zone.name}
                      </h3>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        zone.is_active
                          ? "bg-[#eafaf0] text-[#0b8e23] border border-[#b7edc5]"
                          : "bg-neutral-100 text-[#898989] border border-neutral-300"
                      }`}
                    >
                      {zone.is_active ? "Operational" : "Paused"}
                    </span>
                  </div>

                  <p className="text-xs text-[#5a5a5a] min-h-[32px] mb-3">
                    {zone.description || "Active metropolitan delivery sector."}
                  </p>

                  <div className="space-y-1.5 p-2.5 sm:p-3 bg-neutral-50 rounded-[4px] border border-neutral-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#898989]">Service Radius:</span>
                      <span className="font-mono font-bold text-[#080808]">
                        {zone.radius_km} km ({Math.round(zone.radius_km * 1000).toLocaleString()} m)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#898989]">Hub Coordinates:</span>
                      <span className="font-mono text-[11px] text-[#222222]">
                        {zone.center_lat.toFixed(4)}, {zone.center_lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#898989]">Orders Dispatched:</span>
                      <span className="font-bold text-[#7a3dff]">{zoneOrders.length}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-2.5 border-t border-[#d8d8d8] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActive(zone);
                    }}
                    className="text-xs text-[#5a5a5a] hover:text-[#080808] flex items-center gap-1 font-medium"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{zone.is_active ? "Pause" : "Activate"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditZone(zone);
                      }}
                      className="p-1.5 text-[#5a5a5a] hover:text-[#080808] hover:bg-neutral-100 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete zone "${zone.name}"?`)) {
                          onDeleteZone(zone.id);
                        }
                      }}
                      className="p-1.5 text-[#ee1d36] hover:bg-[#fff0f1] rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
