"use client";

import React, { useState } from "react";
import { DeliveryZone, Order } from "@/lib/supabase/types";
import { verifyDeliveryLocation, formatDistance } from "@/lib/geo";
import InteractiveMap from "./InteractiveMap";
import { Compass, Plus, MapPin, CheckCircle2, AlertTriangle, ShoppingBag } from "lucide-react";

interface DispatchMapViewProps {
  zones: DeliveryZone[];
  orders: Order[];
  onOpenNewOrderAt: (lat: number, lng: number) => void;
  onOpenNewZoneAt: (lat: number, lng: number) => void;
}

export default function DispatchMapView({
  zones,
  orders,
  onOpenNewOrderAt,
  onOpenNewZoneAt,
}: DispatchMapViewProps) {
  const [selectedPin, setSelectedPin] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);

  const verification = selectedPin
    ? verifyDeliveryLocation(selectedPin.lat, selectedPin.lng, zones)
    : null;

  const handleMapClick = (lat: number, lng: number, address?: string) => {
    setSelectedPin({ lat, lng, address });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-md border border-[#d8d8d8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7a3dff] bg-[#f4efff] px-2 py-0.5 rounded-[2px]">
            Geospatial Radar
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#080808] mt-1">
            Live Delivery Map & Boundary Radar
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Click anywhere on the interactive map to inspect zone coverage, test coordinate validation, or dispatch.
          </p>
        </div>

        {selectedPin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenNewZoneAt(selectedPin.lat, selectedPin.lng)}
              className="wf-btn-secondary text-xs py-2 px-3"
            >
              <Compass className="w-3.5 h-3.5 text-[#7a3dff]" />
              <span>Center Zone Here</span>
            </button>
            <button
              onClick={() => onOpenNewOrderAt(selectedPin.lat, selectedPin.lng)}
              disabled={!verification?.isValid}
              className="wf-btn-primary text-xs py-2 px-3.5 disabled:opacity-40"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Place Order Here</span>
            </button>
          </div>
        )}
      </div>

      {/* Selected Location Verification Pill */}
      {selectedPin && verification && (
        <div
          className={`p-3.5 rounded-md border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
            verification.isValid
              ? "bg-[#eafaf0] border-[#b7edc5] text-[#0b8e23]"
              : "bg-[#fff0f1] border-[#ffd0d5] text-[#ee1d36]"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {verification.isValid ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#0b8e23]" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#ee1d36]" />
            )}
            <div>
              <div className="font-bold">
                {verification.isValid
                  ? `Valid Point in Zone: ${verification.zone?.name}`
                  : "Rejected: Point is Outside All Service Zones"}
              </div>
              <div className="text-[11px] text-[#363636] mt-0.5">
                {selectedPin.address && <span>{selectedPin.address} &bull; </span>}
                Coordinates: {selectedPin.lat.toFixed(4)}, {selectedPin.lng.toFixed(4)} &bull;{" "}
                {verification.isValid
                  ? `${formatDistance(verification.distanceKm)} from hub center`
                  : verification.errorMessage}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {verification.isValid ? (
              <button
                onClick={() => onOpenNewOrderAt(selectedPin.lat, selectedPin.lng)}
                className="wf-btn-primary py-1 px-3 text-xs"
              >
                Dispatch Order &rarr;
              </button>
            ) : (
              <button
                onClick={() => onOpenNewZoneAt(selectedPin.lat, selectedPin.lng)}
                className="wf-btn-secondary py-1 px-3 text-xs bg-white text-[#080808]"
              >
                Expand Zone Here
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <InteractiveMap
        zones={zones}
        orders={orders}
        selectedLocation={selectedPin}
        onSelectLocation={handleMapClick}
        isSelectingLocation={true}
        height="560px"
        zoom={12}
      />
    </div>
  );
}
