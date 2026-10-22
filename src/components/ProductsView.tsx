"use client";

import React, { useState, useMemo } from "react";
import { Product, DeliveryZone } from "@/lib/supabase/types";
import { Package, Plus, Search, Edit2, Trash2, Layers, AlertCircle } from "lucide-react";

interface ProductsViewProps {
  products: Product[];
  zones: DeliveryZone[];
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => Promise<void>;
}

export default function ProductsView({
  products,
  zones,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category || "General"));
    return ["All", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCat =
        selectedCategory === "All" || prod.category === selectedCategory;
      const matchSearch =
        prod.name.toLowerCase().includes(search.toLowerCase()) ||
        (prod.description && prod.description.toLowerCase().includes(search.toLowerCase()));
      const matchZone =
        selectedZoneFilter === "All" ||
        (prod.zone_ids && prod.zone_ids.includes(selectedZoneFilter));

      return matchCat && matchSearch && matchZone;
    });
  }, [products, selectedCategory, search, selectedZoneFilter]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-md border border-[#d8d8d8] shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00d722] bg-[#eafaf0] px-2 py-0.5 rounded-[2px]">
            Inventory & Multi-Zone Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#080808] mt-1.5">
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5a5a5a] mt-0.5">
            Create products, manage real-time inventory, and link items to specific delivery zones.
          </p>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="wf-btn-primary py-2.5 px-4 text-xs sm:text-sm font-semibold shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-md border border-[#d8d8d8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#898989] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or description..."
            className="wf-input pl-9 text-xs py-2"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="text-xs bg-white border border-[#d8d8d8] rounded-[4px] px-3 py-2 text-[#222222] outline-none"
          >
            <option value="All">All Delivery Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                Zone: {z.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white border border-[#d8d8d8] rounded-[4px] px-3 py-2 text-[#222222] outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((prod) => {
          const isLowStock = prod.stock_quantity < 10;
          const assignedZones = zones.filter(
            (z) => prod.zone_ids && prod.zone_ids.includes(z.id)
          );

          return (
            <div
              key={prod.id}
              className="wf-card p-4 flex flex-col justify-between group hover:border-[#080808] transition"
            >
              <div>
                {/* Product Image / Placeholder */}
                <div className="w-full h-36 rounded-[6px] bg-neutral-100 mb-3 overflow-hidden relative border border-neutral-200">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ababab]">
                      <Package className="w-10 h-10 stroke-[1.25]" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded text-[#080808] shadow-sm">
                    {prod.category}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#080808] line-clamp-1">
                    {prod.name}
                  </h3>
                  <span className="text-sm font-extrabold text-[#080808]">
                    ${prod.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-[#5a5a5a] line-clamp-2 mt-1 min-h-[32px]">
                  {prod.description || "No product description provided."}
                </p>

                {/* Stock Level Badge */}
                <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-neutral-100">
                  <span className="text-[#898989]">Stock Available:</span>
                  <span
                    className={`font-semibold font-mono ${
                      isLowStock ? "text-[#ee1d36]" : "text-[#080808]"
                    }`}
                  >
                    {prod.stock_quantity} units {isLowStock && "(Low)"}
                  </span>
                </div>

                {/* Assigned Zones Tags */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-[#898989] uppercase tracking-wider block mb-1">
                    Delivery Zones ({assignedZones.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {assignedZones.length === 0 ? (
                      <span className="text-[10px] text-[#ababab] italic">
                        Not assigned to any zone
                      </span>
                    ) : (
                      assignedZones.map((z) => (
                        <span
                          key={z.id}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded text-white flex items-center gap-1"
                          style={{ backgroundColor: z.color }}
                        >
                          {z.name.split(" ")[0]}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#d8d8d8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEditProduct(prod)}
                  className="p-1.5 text-[#5a5a5a] hover:text-[#080808] hover:bg-neutral-100 rounded text-xs flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete product "${prod.name}"?`)) {
                      onDeleteProduct(prod.id);
                    }
                  }}
                  className="p-1.5 text-[#ee1d36] hover:bg-[#fff0f1] rounded text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
