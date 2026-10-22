"use client";

import React, { useState, useMemo } from "react";
import { Order, DeliveryZone } from "@/lib/supabase/types";
import { ShoppingBag, Plus, Search, MapPin, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";

interface OrdersViewProps {
  orders: Order[];
  zones: DeliveryZone[];
  onOpenNewOrder: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

export default function OrdersView({
  orders,
  zones,
  onOpenNewOrder,
  onUpdateOrderStatus,
}: OrdersViewProps) {
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchZone =
        selectedZoneFilter === "All" || order.zone_id === selectedZoneFilter;
      const matchStatus =
        selectedStatusFilter === "All" || order.status === selectedStatusFilter;
      const matchSearch =
        order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_address.toLowerCase().includes(search.toLowerCase()) ||
        (order.customer_phone && order.customer_phone.includes(search));

      return matchZone && matchStatus && matchSearch;
    });
  }, [orders, selectedZoneFilter, selectedStatusFilter, search]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-md border border-[#d8d8d8] shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#ff6b00] bg-[#fff5ec] px-2 py-0.5 rounded-[2px]">
            Order Fulfillment & Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#080808] mt-1.5">
            Customer Orders & Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-[#5a5a5a] mt-0.5">
            Inspect verified orders, view customer locations, and manage delivery status lifecycle.
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="wf-btn-primary py-2.5 px-4 text-xs sm:text-sm font-semibold shadow"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-md border border-[#d8d8d8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#898989] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, address, or phone..."
            className="wf-input pl-9 text-xs py-2"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
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
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-white border border-[#d8d8d8] rounded-[4px] px-3 py-2 text-[#222222] outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-md border border-[#d8d8d8] text-sm text-[#898989]">
            No orders match the current filter criteria.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const assignedZone = zones.find((z) => z.id === order.zone_id);
            const statusConfig: Record<
              string,
              { badgeClass: string; icon: any; label: string }
            > = {
              delivered: {
                badgeClass: "wf-badge-success",
                icon: CheckCircle2,
                label: "Delivered",
              },
              out_for_delivery: {
                badgeClass: "wf-badge-warning",
                icon: Truck,
                label: "Out for Delivery",
              },
              confirmed: {
                badgeClass: "wf-badge-soft",
                icon: Clock,
                label: "Confirmed",
              },
              pending: {
                badgeClass: "wf-badge",
                icon: Clock,
                label: "Pending",
              },
              cancelled: {
                badgeClass: "wf-badge-danger",
                icon: XCircle,
                label: "Cancelled",
              },
            };
            const config = statusConfig[order.status] || {
              badgeClass: "wf-badge",
              icon: Clock,
              label: order.status,
            };
            const StatusIcon = config.icon;

            return (
              <div
                key={order.id}
                className="wf-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-[#080808]">
                      {order.customer_name}
                    </span>
                    <span className={`wf-badge ${config.badgeClass}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{config.label}</span>
                    </span>
                    {assignedZone ? (
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded text-white flex items-center gap-1"
                        style={{ backgroundColor: assignedZone.color }}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{assignedZone.name}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#898989] bg-neutral-100 px-2 py-0.5 rounded">
                        Unassigned Zone
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#363636] flex items-center gap-1.5">
                    <span className="font-medium">{order.customer_address}</span>
                    <span className="text-[#898989]">
                      ({order.delivery_lat.toFixed(4)}, {order.delivery_lng.toFixed(4)})
                    </span>
                    {order.distance_km != null && (
                      <span className="text-[#7a3dff] font-semibold">
                        &bull; {order.distance_km.toFixed(2)} km from hub
                      </span>
                    )}
                  </p>

                  {/* Items List */}
                  {order.items && order.items.length > 0 && (
                    <div className="pt-1 text-xs text-[#5a5a5a] flex flex-wrap gap-x-3 gap-y-1">
                      {order.items.map((it, idx) => (
                        <span key={idx} className="bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                          <strong>{it.quantity}x</strong> {it.product_name} (${it.subtotal.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Total & Status Select */}
                <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  <div className="text-right">
                    <span className="text-[10px] text-[#898989] uppercase tracking-wider block">
                      Total
                    </span>
                    <span className="text-lg font-extrabold text-[#080808]">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) =>
                      onUpdateOrderStatus(order.id, e.target.value as Order["status"])
                    }
                    className="text-xs bg-white border border-[#d8d8d8] rounded-[4px] px-2.5 py-1.5 text-[#080808] font-medium outline-none focus:border-[#080808]"
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
  );
}
