"use client";

import React, { useState, useEffect } from "react";
import { DeliveryZone } from "@/lib/supabase/types";
import { X, MapPin, Sliders, Palette, Check, AlertCircle } from "lucide-react";

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (zone: Omit<DeliveryZone, "id" | "created_at">) => Promise<void>;
  editingZone?: DeliveryZone | null;
  currentPinLocation?: { lat: number; lng: number } | null;
  onStartPinSelection: () => void;
}

const BRAND_COLORS = [
  { name: "Purple", hex: "#7a3dff" },
  { name: "Blue", hex: "#3b89ff" },
  { name: "Green", hex: "#00d722" },
  { name: "Orange", hex: "#ff6b00" },
  { name: "Pink", hex: "#ed52cb" },
];

export default function ZoneModal({
  isOpen,
  onClose,
  onSave,
  editingZone,
  currentPinLocation,
  onStartPinSelection,
}: ZoneModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState<number>(48.8566);
  const [lng, setLng] = useState<number>(2.3522);
  const [radiusKm, setRadiusKm] = useState<number>(3.5);
  const [color, setColor] = useState<string>("#7a3dff");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingZone) {
      setName(editingZone.name);
      setDescription(editingZone.description || "");
      setLat(editingZone.center_lat);
      setLng(editingZone.center_lng);
      setRadiusKm(editingZone.radius_km);
      setColor(editingZone.color || "#7a3dff");
      setIsActive(editingZone.is_active);
    } else {
      setName("");
      setDescription("");
      if (currentPinLocation) {
        setLat(currentPinLocation.lat);
        setLng(currentPinLocation.lng);
      } else {
        setLat(48.8566);
        setLng(2.3522);
      }
      setRadiusKm(3.5);
      setColor("#7a3dff");
      setIsActive(true);
    }
    setError(null);
  }, [editingZone, isOpen]);

  useEffect(() => {
    if (currentPinLocation && isOpen) {
      setLat(currentPinLocation.lat);
      setLng(currentPinLocation.lng);
    }
  }, [currentPinLocation]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please specify a zone name.");
      return;
    }
    if (radiusKm <= 0) {
      setError("Radius must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        center_lat: Number(lat),
        center_lng: Number(lng),
        radius_km: Number(radiusKm),
        color,
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save delivery zone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-md border border-[#d8d8d8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Mobile handle */}
        <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#d8d8d8] bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-sm sm:text-base font-bold text-[#080808]">
              {editingZone ? "Edit Delivery Zone" : "Create Delivery Zone"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#898989] hover:text-[#080808] rounded hover:bg-neutral-200 transition"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
            {error && (
              <div className="p-2.5 bg-[#fff0f1] border border-[#ffd0d5] rounded-[4px] text-xs text-[#ee1d36] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Zone Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Central Downtown Express Hub"
                className="wf-input text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Coverage details, transit type, or speed guarantees"
                rows={2}
                className="wf-input resize-none text-xs"
              />
            </div>

            {/* Coordinate Center Selection */}
            <div className="p-3 bg-neutral-50 border border-[#d8d8d8] rounded-[6px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#080808] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7a3dff]" />
                  Center Coordinates
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onStartPinSelection();
                    onClose();
                  }}
                  className="text-xs text-[#3b89ff] hover:underline font-semibold"
                >
                  Pick Center on Map
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#5a5a5a] block mb-0.5">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className="wf-input py-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#5a5a5a] block mb-0.5">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className="wf-input py-1 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Radius Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#222222] flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Delivery Radius
                </label>
                <span className="text-xs font-mono font-bold text-[#080808] bg-neutral-100 px-2 py-0.5 rounded border border-[#d8d8d8]">
                  {radiusKm} km ({Math.round(radiusKm * 1000).toLocaleString()} m)
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                className="w-full accent-[#080808] cursor-pointer h-2 bg-neutral-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[#898989] mt-0.5">
                <span>0.5 km (Ultra-dense)</span>
                <span>10 km</span>
                <span>20 km (Regional)</span>
              </div>
            </div>

            {/* Color Tag Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                Zone Accent Color
              </label>
              <div className="flex items-center gap-3">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className="relative w-8 h-8 rounded-full border border-neutral-300 transition-transform hover:scale-110 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: c.hex }}
                  >
                    {color === c.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Active status */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#d8d8d8]">
              <input
                type="checkbox"
                id="isActiveZone"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#080808] focus:ring-[#080808]"
              />
              <label htmlFor="isActiveZone" className="text-xs font-medium text-[#222222]">
                Zone is operational and active
              </label>
            </div>
          </div>

          {/* Sticky Mobile Actions */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#d8d8d8] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="wf-btn-secondary py-2 px-4 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="wf-btn-primary py-2 px-5 text-xs font-semibold shadow"
            >
              {isSubmitting ? "Saving..." : editingZone ? "Update Zone" : "Create Zone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
