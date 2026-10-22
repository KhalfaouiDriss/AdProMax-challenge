import { supabase } from "./supabase/client";
import { DeliveryZone, Product, Order, OrderItem } from "./supabase/types";

// Empty initial states - ready for production data
export const INITIAL_ZONES: DeliveryZone[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];

// Local Storage helpers for resilient operation
function getLocalItem<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export const DataService = {
  // Clear any existing cached demo/fake data
  clearCachedData() {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("adpromax_zones");
        localStorage.removeItem("adpromax_products");
        localStorage.removeItem("adpromax_orders");
        localStorage.removeItem("adpromax_seeded");
      } catch (e) {
        console.error(e);
      }
    }
  },

  // Initialize: clear stale localStorage and force fresh fetch from Supabase
  async initialize() {
    this.clearCachedData();
    await Promise.all([this.getZones(), this.getProducts(), this.getOrders()]);
  },

  // --- ZONES ---
  async getZones(): Promise<DeliveryZone[]> {
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .order("created_at", { ascending: true });

      if (error || !data) {
        return getLocalItem<DeliveryZone[]>("adpromax_zones", []);
      }
      setLocalItem("adpromax_zones", data);
      return data;
    } catch {
      return getLocalItem<DeliveryZone[]>("adpromax_zones", []);
    }
  },

  async createZone(
    zone: Omit<DeliveryZone, "id" | "created_at">
  ): Promise<DeliveryZone> {
    const newZone: DeliveryZone = {
      ...zone,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .insert([newZone])
        .select()
        .single();

      if (!error && data) {
        const current = getLocalItem<DeliveryZone[]>("adpromax_zones", []);
        setLocalItem("adpromax_zones", [...current, data]);
        return data;
      }
    } catch (err) {
      console.warn("Using local store for zone insertion:", err);
    }

    const current = getLocalItem<DeliveryZone[]>("adpromax_zones", []);
    const updated = [...current, newZone];
    setLocalItem("adpromax_zones", updated);
    return newZone;
  },

  async updateZone(
    id: string,
    updates: Partial<DeliveryZone>
  ): Promise<DeliveryZone | null> {
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        const current = getLocalItem<DeliveryZone[]>("adpromax_zones", []);
        setLocalItem(
          "adpromax_zones",
          current.map((z) => (z.id === id ? data : z))
        );
        return data;
      }
    } catch (err) {
      console.warn("Using local store for zone update:", err);
    }

    const current = getLocalItem<DeliveryZone[]>("adpromax_zones", []);
    const index = current.findIndex((z) => z.id === id);
    if (index === -1) return null;
    const updatedZone = { ...current[index], ...updates };
    current[index] = updatedZone;
    setLocalItem("adpromax_zones", current);
    return updatedZone;
  },

  async deleteZone(id: string): Promise<boolean> {
    try {
      await supabase.from("delivery_zones").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase zone delete:", err);
    }
    const current = getLocalItem<DeliveryZone[]>("adpromax_zones", []);
    setLocalItem(
      "adpromax_zones",
      current.filter((z) => z.id !== id)
    );
    return true;
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    try {
      const { data: productsData, error } = await supabase
        .from("products")
        .select("*, product_zones(zone_id)")
        .order("created_at", { ascending: true });

      if (error || !productsData) {
        return getLocalItem<Product[]>("adpromax_products", []);
      }

      const formatted: Product[] = productsData.map((p: any) => ({
        ...p,
        zone_ids: p.product_zones ? p.product_zones.map((pz: any) => pz.zone_id) : [],
      }));

      setLocalItem("adpromax_products", formatted);
      return formatted;
    } catch {
      return getLocalItem<Product[]>("adpromax_products", []);
    }
  },

  async createProduct(
    product: Omit<Product, "id">,
    zoneIds: string[] = []
  ): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      zone_ids: zoneIds,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            id: newProduct.id,
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            stock_quantity: newProduct.stock_quantity,
            category: newProduct.category,
            image_url: newProduct.image_url,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        if (zoneIds.length > 0) {
          const links = zoneIds.map((zId) => ({
            product_id: data.id,
            zone_id: zId,
          }));
          await supabase.from("product_zones").insert(links);
        }
        const current = getLocalItem<Product[]>("adpromax_products", []);
        const finalP = { ...data, zone_ids: zoneIds };
        setLocalItem("adpromax_products", [...current, finalP]);
        return finalP;
      }
    } catch (err) {
      console.warn("Local product insert fallback:", err);
    }

    const current = getLocalItem<Product[]>("adpromax_products", []);
    setLocalItem("adpromax_products", [...current, newProduct]);
    return newProduct;
  },

  async updateProduct(
    id: string,
    updates: Partial<Product>,
    zoneIds?: string[]
  ): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        if (zoneIds !== undefined) {
          await supabase.from("product_zones").delete().eq("product_id", id);
          if (zoneIds.length > 0) {
            await supabase
              .from("product_zones")
              .insert(zoneIds.map((zId) => ({ product_id: id, zone_id: zId })));
          }
        }
      }
    } catch (err) {
      console.warn("Local product update:", err);
    }

    const current = getLocalItem<Product[]>("adpromax_products", []);
    const index = current.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = {
      ...current[index],
      ...updates,
      ...(zoneIds !== undefined ? { zone_ids: zoneIds } : {}),
    };
    current[index] = updated;
    setLocalItem("adpromax_products", current);
    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await supabase.from("products").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase product delete:", err);
    }
    const current = getLocalItem<Product[]>("adpromax_products", []);
    setLocalItem(
      "adpromax_products",
      current.filter((p) => p.id !== id)
    );
    return true;
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (error || !data) {
        return getLocalItem<Order[]>("adpromax_orders", []);
      }

      const formatted: Order[] = data.map((o: any) => ({
        ...o,
        items: o.order_items || [],
      }));

      setLocalItem("adpromax_orders", formatted);
      return formatted;
    } catch {
      return getLocalItem<Order[]>("adpromax_orders", []);
    }
  },

  async createOrder(
    order: Omit<Order, "id" | "created_at">,
    items: OrderItem[]
  ): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      created_at: new Date().toISOString(),
      items: items,
    };

    try {
      const { data: orderData, error } = await supabase
        .from("orders")
        .insert([
          {
            id: newOrder.id,
            customer_name: newOrder.customer_name,
            customer_email: newOrder.customer_email,
            customer_phone: newOrder.customer_phone,
            customer_address: newOrder.customer_address,
            delivery_lat: newOrder.delivery_lat,
            delivery_lng: newOrder.delivery_lng,
            zone_id: newOrder.zone_id,
            status: newOrder.status,
            total_amount: newOrder.total_amount,
            distance_km: newOrder.distance_km,
            notes: newOrder.notes,
          },
        ])
        .select()
        .single();

      if (!error && orderData && items.length > 0) {
        const itemRows = items.map((it) => ({
          order_id: orderData.id,
          product_id: it.product_id,
          product_name: it.product_name,
          unit_price: it.unit_price,
          quantity: it.quantity,
          subtotal: it.subtotal,
        }));
        await supabase.from("order_items").insert(itemRows);
      }
    } catch (err) {
      console.warn("Order creation fallback:", err);
    }

    // Deduct stock in local products
    const products = getLocalItem<Product[]>("adpromax_products", []);
    const updatedProducts = products.map((prod) => {
      const orderItem = items.find((it) => it.product_id === prod.id);
      if (orderItem) {
        return {
          ...prod,
          stock_quantity: Math.max(0, prod.stock_quantity - orderItem.quantity),
        };
      }
      return prod;
    });
    setLocalItem("adpromax_products", updatedProducts);

    const currentOrders = getLocalItem<Order[]>("adpromax_orders", []);
    const updatedOrders = [newOrder, ...currentOrders];
    setLocalItem("adpromax_orders", updatedOrders);
    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    status: Order["status"]
  ): Promise<Order | null> {
    try {
      await supabase.from("orders").update({ status }).eq("id", orderId);
    } catch (err) {
      console.warn("Update status error:", err);
    }
    const current = getLocalItem<Order[]>("adpromax_orders", []);
    const index = current.findIndex((o) => o.id === orderId);
    if (index === -1) return null;
    current[index].status = status;
    setLocalItem("adpromax_orders", [...current]);
    return current[index];
  },
};
