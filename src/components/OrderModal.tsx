"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DeliveryZone, Product, OrderItem, Order } from "@/lib/supabase/types";
import { verifyDeliveryLocation, formatDistance } from "@/lib/geo";
import InteractiveMap from "./InteractiveMap";
import {
  X,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: DeliveryZone[];
  products: Product[];
  onOrderCreated: (
    order: Omit<Order, "id" | "created_at">,
    items: OrderItem[]
  ) => Promise<void>;
}

export default function OrderModal({
  isOpen,
  onClose,
  zones,
  products,
  onOrderCreated,
}: OrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+33 6 ");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryLat, setDeliveryLat] = useState<number>(48.857);
  const [deliveryLng, setDeliveryLng] = useState<number>(2.353);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomerName("");
      setCustomerPhone("+33 6 ");
      setCustomerEmail("");
      setCustomerAddress("14 Rue de Rivoli, Paris");
      const firstZone = zones.find((z) => z.is_active) || zones[0];
      if (firstZone) {
        setDeliveryLat(firstZone.center_lat);
        setDeliveryLng(firstZone.center_lng);
      }
      if (products.length > 0) {
        setQuantities({ [products[0].id]: 1 });
      } else {
        setQuantities({});
      }
      setSubmissionError(null);
    }
  }, [isOpen, zones, products]);

  const verification = useMemo(() => {
    return verifyDeliveryLocation(deliveryLat, deliveryLng, zones);
  }, [deliveryLat, deliveryLng, zones]);

  const availableProducts = useMemo(() => {
    if (!verification.isValid || !verification.zone) {
      return products;
    }
    const currentZoneId = verification.zone.id;
    return products.filter(
      (p) => !p.zone_ids || p.zone_ids.length === 0 || p.zone_ids.includes(currentZoneId)
    );
  }, [verification, products]);

  const handleLocationPicked = (lat: number, lng: number, address?: string) => {
    setDeliveryLat(lat);
    setDeliveryLng(lng);
    if (address) {
      setCustomerAddress(address);
    }
  };

  const handleQtyChange = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    const maxStock = product?.stock_quantity ?? 99;
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const selectedItems: OrderItem[] = useMemo(() => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([pId, qty]) => {
        const prod = products.find((p) => p.id === pId);
        return {
          product_id: pId,
          product_name: prod?.name || "Product",
          unit_price: prod?.price || 0,
          quantity: qty,
          subtotal: Number(((prod?.price || 0) * qty).toFixed(2)),
        };
      });
  }, [quantities, products]);

  const orderTotal = useMemo(() => {
    return Number(
      selectedItems.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)
    );
  }, [selectedItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verification.isValid) {
      setSubmissionError(
        verification.errorMessage || "Selected location is outside all delivery zones."
      );
      return;
    }
    if (selectedItems.length === 0) {
      setSubmissionError("Please select at least one product quantity.");
      return;
    }
    if (!customerName.trim()) {
      setSubmissionError("Customer name is required.");
      return;
    }
    if (!customerAddress.trim()) {
      setSubmissionError("Customer delivery address is required.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await onOrderCreated(
        {
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim() || null,
          customer_phone: customerPhone.trim() || null,
          customer_address: customerAddress.trim(),
          delivery_lat: deliveryLat,
          delivery_lng: deliveryLng,
          zone_id: verification.zone?.id || null,
          status: "confirmed",
          total_amount: orderTotal,
          distance_km: verification.distanceKm,
          notes: orderNotes.trim() || null,
        },
        selectedItems
      );

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7a3dff", "#3b89ff", "#00d722", "#ff6b00"],
        });
      } catch {
        // ignore
      }

      onClose();
    } catch (err: any) {
      setSubmissionError(err.message || "Failed to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-t-2xl sm:rounded-md border border-[#d8d8d8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#d8d8d8] bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] bg-[#080808] flex items-center justify-center text-white">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#080808]">Create Customer Order</h2>
              <p className="text-[10px] sm:text-xs text-[#5a5a5a]">
                Point-in-zone boundary validation & dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#898989] hover:text-[#080808] rounded hover:bg-neutral-200 transition"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Top Zone Verification Banner */}
            {verification.isValid ? (
              <div className="p-3 bg-[#eafaf0] border border-[#b7edc5] rounded-[6px] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0b8e23] shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#0b8e23]">
                      Location Inside Active Zone:
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: verification.zone?.color || "#7a3dff" }}
                    >
                      {verification.zone?.name}
                    </span>
                  </div>
                  <p className="text-[#222222] mt-0.5 text-[11px]">
                    Distance to hub: <strong>{formatDistance(verification.distanceKm)}</strong> (within {verification.zone?.radius_km} km radius).
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#fff0f1] border border-[#ffd0d5] rounded-[6px] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#ee1d36] shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-[#ee1d36]">
                    Order Rejected: Outside All Zones
                  </div>
                  <p className="text-[#363636] mt-0.5 text-[11px]">
                    {verification.errorMessage}
                  </p>
                  <p className="text-[10px] text-[#898989] mt-1">
                    Tap anywhere inside the colored circular zones on the map to qualify for dispatch.
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Delivery Pin Map */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#222222] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#080808]" />
                  Delivery Map Pin
                </label>
                <span className="text-[10px] text-[#5a5a5a] font-mono">
                  {deliveryLat.toFixed(4)}, {deliveryLng.toFixed(4)}
                </span>
              </div>
              <InteractiveMap
                zones={zones}
                selectedLocation={{ lat: deliveryLat, lng: deliveryLng }}
                onSelectLocation={handleLocationPicked}
                isSelectingLocation={true}
                height="170px"
                zoom={13}
              />
            </div>

            {/* Customer Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#222222] mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="wf-input text-xs py-1.5"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#222222] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="wf-input text-xs py-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#222222] mb-1">
                  Delivery Address Text *
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="14 Rue de Rivoli, Paris, France"
                  className="wf-input text-xs py-1.5"
                  required
                />
              </div>
            </div>

            {/* Product Selection List */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#222222] flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Select Products ({availableProducts.length} in zone)
                </label>
                <span className="text-[11px] font-semibold text-[#080808]">
                  {selectedItems.length} items chosen
                </span>
              </div>

              <div className="border border-[#d8d8d8] rounded-[6px] divide-y divide-[#d8d8d8] max-h-48 overflow-y-auto">
                {products.map((prod) => {
                  const qty = quantities[prod.id] || 0;
                  const isAvailableInZone =
                    !verification.isValid ||
                    !prod.zone_ids ||
                    prod.zone_ids.length === 0 ||
                    (verification.zone && prod.zone_ids.includes(verification.zone.id));

                  return (
                    <div
                      key={prod.id}
                      className={`p-2.5 flex items-center justify-between gap-2 ${
                        !isAvailableInZone ? "opacity-40 bg-neutral-50" : "bg-white"
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#080808] truncate">
                            {prod.name}
                          </span>
                          {!isAvailableInZone && (
                            <span className="text-[9px] text-[#ee1d36] font-bold bg-[#fff0f1] px-1 py-0.5 rounded">
                              Out of Zone
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-bold text-[#080808]">
                            ${prod.price.toFixed(2)}
                          </span>
                          <span className="text-[#898989]">
                            &bull; Stock: {prod.stock_quantity}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector with Touch Targets */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(prod.id, -1)}
                          disabled={qty <= 0 || !isAvailableInZone}
                          className="w-8 h-8 rounded-[4px] border border-[#d8d8d8] bg-white hover:bg-neutral-100 flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(prod.id, 1)}
                          disabled={
                            !isAvailableInZone ||
                            qty >= prod.stock_quantity ||
                            prod.stock_quantity <= 0
                          }
                          className="w-8 h-8 rounded-[4px] border border-[#080808] bg-[#080808] text-white hover:bg-neutral-800 flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {submissionError && (
              <div className="p-2.5 bg-[#fff0f1] border border-[#ffd0d5] rounded-[4px] text-xs text-[#ee1d36]">
                {submissionError}
              </div>
            )}
          </div>

          {/* Sticky Mobile Bottom Confirmation Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#d8d8d8] flex items-center justify-between gap-3 shadow-lg">
            <div>
              <span className="text-[10px] text-[#5a5a5a] block uppercase font-medium">
                Total
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-[#080808]">
                ${orderTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="wf-btn-secondary py-2 px-3 sm:px-4 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!verification.isValid || selectedItems.length === 0 || isSubmitting}
                className="wf-btn-primary py-2 px-4 sm:px-6 text-xs sm:text-sm font-semibold shadow disabled:opacity-40"
              >
                {isSubmitting ? (
                  "Processing..."
                ) : !verification.isValid ? (
                  "Outside Zone"
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Confirm Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
