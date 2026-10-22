"use client";

import React, { useMemo } from "react";
import { DeliveryZone, Product, Order } from "@/lib/supabase/types";
import {
  TrendingUp,
  Package,
  Compass,
  ShoppingBag,
  Truck,
  ArrowUpRight,
  Plus,
  MapPin,
  Sparkles,
} from "lucide-react";

interface DashboardViewProps {
  zones: DeliveryZone[];
  products: Product[];
  orders: Order[];
  onSelectZone: (zoneId: string) => void;
  onOpenNewOrder: () => void;
  onOpenNewZone: () => void;
  onOpenNewProduct: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

export default function DashboardView({
  zones,
  products,
  orders,
  onSelectZone,
  onOpenNewOrder,
  onOpenNewZone,
  onOpenNewProduct,
  onUpdateOrderStatus,
}: DashboardViewProps) {
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  }, [orders]);

  const activeZonesCount = useMemo(() => {
    return zones.filter((z) => z.is_active).length;
  }, [zones]);

  const activeDeliveriesCount = useMemo(() => {
    return orders.filter(
      (o) => o.status === "confirmed" || o.status === "out_for_delivery"
    ).length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock_quantity < 10).length;
  }, [products]);

  const zoneStats = useMemo(() => {
    return zones.map((zone) => {
      const zoneOrders = orders.filter((o) => o.zone_id === zone.id);
      const zoneRevenue = zoneOrders.reduce((sum, o) => sum + o.total_amount, 0);
      const zoneProducts = products.filter(
        (p) => !p.zone_ids || p.zone_ids.includes(zone.id)
      );
      return {
        zone,
        ordersCount: zoneOrders.length,
        revenue: zoneRevenue,
        productsCount: zoneProducts.length,
      };
    });
  }, [zones, orders, products]);

  const isBrandNew = zones.length === 0 && products.length === 0 && orders.length === 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Hero Welcome & Metric Tiles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-md border border-[#d8d8d8] shadow-sm">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#7a3dff] bg-[#f4efff] px-2 py-0.5 rounded-[2px]">
            Dispatcher Control Station
          </span>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[#080808] mt-1.5">
            Fleet & Delivery Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#5a5a5a] mt-0.5">
            Real-time geospatial boundary verification and catalog dispatch overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onOpenNewZone} className="wf-btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-3.5">
            <Compass className="w-4 h-4 text-[#7a3dff]" />
            <span>Add Zone</span>
          </button>
          <button onClick={onOpenNewOrder} className="wf-btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 shadow">
            <ShoppingBag className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1 */}
        <div className="wf-card p-3.5 sm:p-5">
          <div className="flex items-center justify-between text-[#898989] mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Revenue</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#f4efff] flex items-center justify-center text-[#7a3dff]">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-[#080808]">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#00d722] font-semibold mt-0.5 sm:mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>{orders.length} total orders</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="wf-card p-3.5 sm:p-5">
          <div className="flex items-center justify-between text-[#898989] mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Active Deliveries</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#eafaf0] flex items-center justify-center text-[#00d722]">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-[#080808]">
            {activeDeliveriesCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#5a5a5a] mt-0.5 sm:mt-1 truncate">
            En route or confirmed
          </div>
        </div>

        {/* Metric 3 */}
        <div className="wf-card p-3.5 sm:p-5">
          <div className="flex items-center justify-between text-[#898989] mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Zones</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#3b89ff]">
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-[#080808]">
            {activeZonesCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#5a5a5a] mt-0.5 sm:mt-1 truncate">
            {zones.length} configured radii
          </div>
        </div>

        {/* Metric 4 */}
        <div className="wf-card p-3.5 sm:p-5">
          <div className="flex items-center justify-between text-[#898989] mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Catalog</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#fff9ea] flex items-center justify-center text-[#ffae13]">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-[#080808]">
            {products.length} Items
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#5a5a5a] mt-0.5 sm:mt-1 truncate">
            {lowStockCount > 0 ? `${lowStockCount} low in stock` : "Ready for dispatch"}
          </div>
        </div>
      </div>

      {/* Onboarding Guide if Fresh/Empty */}
      {isBrandNew && (
        <div className="bg-white rounded-md border border-[#d8d8d8] p-5 sm:p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-[#080808]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#080808]">
            Welcome to Your Clean Delivery Platform
          </h2>
          <p className="text-xs sm:text-sm text-[#5a5a5a] max-w-md mx-auto mt-1 mb-6">
            All mock data has been cleared. Follow these quick steps to set up your delivery operation:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
            <div
              onClick={onOpenNewZone}
              className="p-4 rounded-md border border-[#d8d8d8] bg-neutral-50 hover:bg-white hover:border-[#080808] transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-[4px] bg-[#7a3dff] text-white flex items-center justify-center text-xs font-bold mb-2">
                1
              </div>
              <h3 className="text-sm font-bold text-[#080808]">Create a Zone</h3>
              <p className="text-xs text-[#5a5a5a] mt-1">
                Pick a center on the map and define the radius in kilometers.
              </p>
            </div>

            <div
              onClick={onOpenNewProduct}
              className="p-4 rounded-md border border-[#d8d8d8] bg-neutral-50 hover:bg-white hover:border-[#080808] transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-[4px] bg-[#3b89ff] text-white flex items-center justify-center text-xs font-bold mb-2">
                2
              </div>
              <h3 className="text-sm font-bold text-[#080808]">Add Products</h3>
              <p className="text-xs text-[#5a5a5a] mt-1">
                Define price, stock, and assign products to your delivery zones.
              </p>
            </div>

            <div
              onClick={onOpenNewOrder}
              className="p-4 rounded-md border border-[#d8d8d8] bg-neutral-50 hover:bg-white hover:border-[#080808] transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-[4px] bg-[#00d722] text-white flex items-center justify-center text-xs font-bold mb-2">
                3
              </div>
              <h3 className="text-sm font-bold text-[#080808]">Place Orders</h3>
              <p className="text-xs text-[#5a5a5a] mt-1">
                Test customer address pin verification and dispatch orders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Zone-by-Zone Operations Breakdown */}
      {zones.length > 0 && (
        <div className="bg-white rounded-md border border-[#d8d8d8] shadow-sm overflow-hidden">
          <div className="p-3.5 sm:p-5 border-b border-[#d8d8d8] flex items-center justify-between bg-[#fafafa]">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#080808]">
                Zone-by-Zone Performance Breakdown
              </h2>
              <p className="text-[11px] sm:text-xs text-[#5a5a5a]">
                Coverage radii, active catalog depth, and dispatched orders per zone
              </p>
            </div>
            <button
              onClick={onOpenNewZone}
              className="text-xs font-semibold text-[#7a3dff] hover:underline"
            >
              + Add Zone
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#d8d8d8]">
            {zoneStats.map(({ zone, ordersCount, revenue, productsCount }) => (
              <div
                key={zone.id}
                onClick={() => onSelectZone(zone.id)}
                className="p-4 sm:p-5 hover:bg-neutral-50 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="text-xs font-bold text-[#080808] truncate max-w-[140px]">
                        {zone.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#898989] bg-neutral-100 px-1.5 py-0.5 rounded">
                      {zone.radius_km} km
                    </span>
                  </div>
                  <p className="text-xs text-[#5a5a5a] line-clamp-2 min-h-[32px]">
                    {zone.description || "Active metropolitan delivery sector."}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] uppercase text-[#898989] block">Orders</span>
                    <span className="font-bold text-[#080808]">{ordersCount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#898989] block">Revenue</span>
                    <span className="font-bold text-[#080808]">${revenue.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#898989] block">Products</span>
                    <span className="font-bold text-[#7a3dff]">{productsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Dispatched Orders Stream */}
      <div className="bg-white rounded-md border border-[#d8d8d8] shadow-sm overflow-hidden">
        <div className="p-3.5 sm:p-5 border-b border-[#d8d8d8] flex items-center justify-between bg-[#fafafa]">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#080808]">
              Recent Delivery Orders & Statuses
            </h2>
            <p className="text-[11px] sm:text-xs text-[#5a5a5a]">
              Direct customer verification, zone assignment, and status dispatch
            </p>
          </div>
          <button
            onClick={onOpenNewOrder}
            className="wf-btn-primary py-1 px-3 text-xs"
          >
            + Create Order
          </button>
        </div>

        <div className="divide-y divide-[#d8d8d8] overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-xs sm:text-sm text-[#898989]">
              No orders placed yet. Click &quot;+ Create Order&quot; to test zone verification!
            </div>
          ) : (
            orders.slice(0, 10).map((order) => {
              const assignedZone = zones.find((z) => z.id === order.zone_id);
              const statusBadges: Record<string, { label: string; class: string }> = {
                delivered: { label: "Delivered", class: "wf-badge-success" },
                out_for_delivery: { label: "En Route", class: "wf-badge-warning" },
                confirmed: { label: "Confirmed", class: "wf-badge-soft" },
                pending: { label: "Pending", class: "wf-badge" },
                cancelled: { label: "Cancelled", class: "wf-badge-danger" },
              };
              const badge = statusBadges[order.status] || {
                label: order.status,
                class: "wf-badge",
              };

              return (
                <div
                  key={order.id}
                  className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-sm font-bold text-[#080808]">
                        {order.customer_name}
                      </span>
                      <span className={`wf-badge ${badge.class}`}>
                        {badge.label}
                      </span>
                      {assignedZone && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: assignedZone.color }}
                        >
                          {assignedZone.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5a5a5a]">
                      {order.customer_address} &bull; Distance: {order.distance_km?.toFixed(2)} km
                    </p>
                    {order.items && order.items.length > 0 && (
                      <div className="text-[11px] text-[#898989]">
                        Items: {order.items.map((it) => `${it.quantity}x ${it.product_name}`).join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <span className="text-base font-bold text-[#080808]">
                      ${order.total_amount.toFixed(2)}
                    </span>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        onUpdateOrderStatus(order.id, e.target.value as Order["status"])
                      }
                      className="text-xs bg-white border border-[#d8d8d8] rounded-[4px] px-2 py-1 text-[#222222] focus:border-[#080808] outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
