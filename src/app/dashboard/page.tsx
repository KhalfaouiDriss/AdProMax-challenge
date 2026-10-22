"use client";

import React, { useState, useEffect } from "react";
import { DeliveryZone, Product, Order, OrderItem } from "@/lib/supabase/types";
import { DataService } from "@/lib/data-service";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import DashboardView from "@/components/DashboardView";
import DispatchMapView from "@/components/DispatchMapView";
import ZonesView from "@/components/ZonesView";
import ProductsView from "@/components/ProductsView";
import OrdersView from "@/components/OrdersView";
import ZoneModal from "@/components/ZoneModal";
import ProductModal from "@/components/ProductModal";
import OrderModal from "@/components/OrderModal";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Map coordination pins
  const [zonePinLocation, setZonePinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSqlNotice, setShowSqlNotice] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      await DataService.initialize();
      const [fetchedZones, fetchedProducts, fetchedOrders] = await Promise.all([
        DataService.getZones(),
        DataService.getProducts(),
        DataService.getOrders(),
      ]);
      setZones(fetchedZones);
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
    } catch (e) {
      console.error("Error loading delivery platform data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Zone handlers
  const handleSaveZone = async (zoneData: Omit<DeliveryZone, "id" | "created_at">) => {
    if (editingZone) {
      const updated = await DataService.updateZone(editingZone.id, zoneData);
      if (updated) {
        setZones((prev) => prev.map((z) => (z.id === updated.id ? updated : z)));
        showToast(`Zone "${updated.name}" updated successfully.`);
      }
    } else {
      const created = await DataService.createZone(zoneData);
      setZones((prev) => [...prev, created]);
      showToast(`New zone "${created.name}" created and active.`);
    }
    setEditingZone(null);
  };

  const handleDeleteZone = async (id: string) => {
    await DataService.deleteZone(id);
    setZones((prev) => prev.filter((z) => z.id !== id));
    showToast("Delivery zone removed.");
  };

  const handleToggleZoneActive = async (zone: DeliveryZone) => {
    const nextState = !zone.is_active;
    const updated = await DataService.updateZone(zone.id, { is_active: nextState });
    if (updated) {
      setZones((prev) => prev.map((z) => (z.id === updated.id ? updated : z)));
      showToast(
        `Zone "${zone.name}" is now ${nextState ? "operational" : "temporarily paused"}.`
      );
    }
  };

  // Product handlers
  const handleSaveProduct = async (
    productData: Omit<Product, "id">,
    zoneIds: string[]
  ) => {
    if (editingProduct) {
      const updated = await DataService.updateProduct(
        editingProduct.id,
        productData,
        zoneIds
      );
      if (updated) {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(`Product "${updated.name}" updated.`);
      }
    } else {
      const created = await DataService.createProduct(productData, zoneIds);
      setProducts((prev) => [...prev, created]);
      showToast(`Product "${created.name}" added to catalog.`);
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    await DataService.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("Product deleted from catalog.");
  };

  // Order handlers
  const handleOrderCreated = async (
    orderData: Omit<Order, "id" | "created_at">,
    items: OrderItem[]
  ) => {
    const created = await DataService.createOrder(orderData, items);
    setOrders((prev) => [created, ...prev]);

    // Refresh products to reflect reduced inventory stock
    const freshProducts = await DataService.getProducts();
    setProducts(freshProducts);

    showToast(
      `Order dispatched for ${created.customer_name}! Verified inside delivery zone.`
    );
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    const updated = await DataService.updateOrderStatus(orderId, status);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(`Order status updated to "${status.replace(/_/g, " ")}".`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewZone={() => {}}
          onOpenNewProduct={() => {}}
          onOpenNewOrder={() => {}}
          onOpenAuth={() => {}}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <RefreshCw className="w-8 h-8 text-[#7a3dff] animate-spin" />
            <p className="text-xs text-[#898989] font-medium tracking-wide">
              Verifying authentication...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewZone={() => {}}
          onOpenNewProduct={() => {}}
          onOpenNewOrder={() => {}}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-[8px] bg-[#f4efff] flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#7a3dff]" />
            </div>
            <h1 className="text-2xl font-bold text-[#080808] mb-2">Welcome to AdProMax Dispatch</h1>
            <p className="text-[#5a5a5a] text-sm mb-6">
              Sign in to access the delivery management dashboard, live dispatch map, and zone controls.
            </p>
          </div>
        </main>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewZone={() => {
          setEditingZone(null);
          setIsZoneModalOpen(true);
        }}
        onOpenNewProduct={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        onOpenNewOrder={() => setIsOrderModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[2000] bg-[#080808] text-white text-xs sm:text-sm px-4 py-2.5 rounded-[4px] shadow-2xl flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-[#00d722]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <RefreshCw className="w-8 h-8 text-[#7a3dff] animate-spin" />
            <p className="text-xs text-[#898989] font-medium tracking-wide">
              Connecting geospatial data & Supabase...
            </p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardView
                zones={zones}
                products={products}
                orders={orders}
                onSelectZone={(zoneId) => {
                  setActiveTab("zones");
                }}
                onOpenNewOrder={() => setIsOrderModalOpen(true)}
                onOpenNewZone={() => {
                  setEditingZone(null);
                  setIsZoneModalOpen(true);
                }}
                onOpenNewProduct={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {activeTab === "map" && (
              <DispatchMapView
                zones={zones}
                orders={orders}
                onOpenNewOrderAt={(lat, lng) => {
                  setIsOrderModalOpen(true);
                }}
                onOpenNewZoneAt={(lat, lng) => {
                  setZonePinLocation({ lat, lng });
                  setEditingZone(null);
                  setIsZoneModalOpen(true);
                }}
              />
            )}

            {activeTab === "zones" && (
              <ZonesView
                zones={zones}
                orders={orders}
                onOpenNewZone={() => {
                  setEditingZone(null);
                  setIsZoneModalOpen(true);
                }}
                onEditZone={(zone) => {
                  setEditingZone(zone);
                  setIsZoneModalOpen(true);
                }}
                onDeleteZone={handleDeleteZone}
                onToggleActive={handleToggleZoneActive}
              />
            )}

            {activeTab === "products" && (
              <ProductsView
                products={products}
                zones={zones}
                onOpenNewProduct={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                onEditProduct={(product) => {
                  setEditingProduct(product);
                  setIsProductModalOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === "orders" && (
              <OrdersView
                orders={orders}
                zones={zones}
                onOpenNewOrder={() => setIsOrderModalOpen(true)}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        onSave={handleSaveZone}
        editingZone={editingZone}
        currentPinLocation={zonePinLocation}
        onStartPinSelection={() => {
          setActiveTab("map");
          showToast("Click anywhere on the map to set zone center coordinate.");
        }}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        availableZones={zones}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        zones={zones}
        products={products}
        onOrderCreated={handleOrderCreated}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
}