"use client";

import React, { useState, useEffect } from "react";
import { Product, DeliveryZone } from "@/lib/supabase/types";
import { X, Package, Layers, AlertCircle } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, "id">, zoneIds: string[]) => Promise<void>;
  editingProduct?: Product | null;
  availableZones: DeliveryZone[];
}

const CATEGORIES = [
  "Beverages",
  "Bakery",
  "Gourmet Meals",
  "Fresh Produce",
  "Electronics",
  "Confectionery",
  "General",
];

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  availableZones,
}: ProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(9.99);
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description || "");
      setPrice(editingProduct.price);
      setStockQuantity(editingProduct.stock_quantity);
      setCategory(editingProduct.category || "General");
      setImageUrl(editingProduct.image_url || "");
      setSelectedZoneIds(editingProduct.zone_ids || []);
    } else {
      setName("");
      setDescription("");
      setPrice(9.99);
      setStockQuantity(25);
      setCategory("General");
      setImageUrl("");
      setSelectedZoneIds(availableZones.filter((z) => z.is_active).map((z) => z.id));
    }
    setError(null);
  }, [editingProduct, isOpen, availableZones]);

  if (!isOpen) return null;

  const toggleZone = (id: string) => {
    setSelectedZoneIds((prev) =>
      prev.includes(id) ? prev.filter((zId) => zId !== id) : [...prev, id]
    );
  };

  const selectAllZones = () => {
    if (selectedZoneIds.length === availableZones.length) {
      setSelectedZoneIds([]);
    } else {
      setSelectedZoneIds(availableZones.map((z) => z.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (price < 0) {
      setError("Price cannot be negative.");
      return;
    }
    if (stockQuantity < 0) {
      setError("Stock quantity cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(
        {
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          stock_quantity: Number(stockQuantity),
          category,
          image_url: imageUrl.trim() || null,
        },
        selectedZoneIds
      );
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-md border border-[#d8d8d8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#d8d8d8] bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#080808]" />
            <h2 className="text-sm sm:text-base font-bold text-[#080808]">
              {editingProduct ? "Edit Product" : "Add New Product"}
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
                Product Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cold-Pressed Green Glow Juice"
                className="wf-input text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="wf-input text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">
                  Price ($ USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="wf-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                  className="wf-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="wf-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specifications, flavor profile, details"
                rows={2}
                className="wf-input resize-none text-xs"
              />
            </div>

            {/* Assigned Delivery Zones */}
            <div className="p-3 bg-neutral-50 border border-[#d8d8d8] rounded-[6px]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#080808] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#7a3dff]" />
                  Assigned Zones ({selectedZoneIds.length}/{availableZones.length})
                </label>
                <button
                  type="button"
                  onClick={selectAllZones}
                  className="text-[11px] text-[#3b89ff] hover:underline font-semibold"
                >
                  {selectedZoneIds.length === availableZones.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {availableZones.map((zone) => {
                  const isChecked = selectedZoneIds.includes(zone.id);
                  return (
                    <div
                      key={zone.id}
                      onClick={() => toggleZone(zone.id)}
                      className={`flex items-center justify-between p-2 rounded-[4px] border cursor-pointer transition ${
                        isChecked
                          ? "bg-white border-[#080808]"
                          : "bg-white/60 border-neutral-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: zone.color }}
                        />
                        <span className="text-xs font-medium text-[#222222]">
                          {zone.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#898989] font-mono">
                        {zone.radius_km} km
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Actions */}
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
              {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
