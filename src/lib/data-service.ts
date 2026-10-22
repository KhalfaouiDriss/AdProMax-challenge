import { supabase } from "./supabase/client";
import { DeliveryZone, Product, Order, OrderItem } from "./supabase/types";

export const INITIAL_ZONES: DeliveryZone[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];

// All operations now require user_id for RLS compliance
export const DataService = {
  // --- ZONES ---
  async getZones(userId: string): Promise<DeliveryZone[]> {
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("getZones error:", err);
      return [];
    }
  },

  async createZone(
    userId: string,
    zone: Omit<DeliveryZone, "id" | "user_id" | "created_at" | "updated_at">
  ): Promise<DeliveryZone | null> {
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .insert([{ ...zone, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("createZone error:", err);
      return null;
    }
  },

  async updateZone(
    userId: string,
    id: string,
    updates: Partial<DeliveryZone>
  ): Promise<DeliveryZone | null> {
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("updateZone error:", err);
      return null;
    }
  },

  async deleteZone(userId: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("delivery_zones")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("deleteZone error:", err);
      return false;
    }
  },

  // --- PRODUCTS ---
  async getProducts(userId: string): Promise<Product[]> {
    try {
      const { data: productsData, error } = await supabase
        .from("products")
        .select("*, product_zones(zone_id)")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!productsData) return [];

      return productsData.map((p: any) => ({
        ...p,
        zone_ids: p.product_zones ? p.product_zones.map((pz: any) => pz.zone_id) : [],
      }));
    } catch (err) {
      console.error("getProducts error:", err);
      return [];
    }
  },

  async createProduct(
    userId: string,
    product: Omit<Product, "id" | "user_id" | "created_at" | "updated_at" | "zone_ids">,
    zoneIds: string[] = []
  ): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...product, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      if (zoneIds.length > 0) {
        const links = zoneIds.map((zId) => ({
          product_id: data.id,
          zone_id: zId,
        }));
        const { error: linkError } = await supabase.from("product_zones").insert(links);
        if (linkError) console.warn("product_zones link error:", linkError);
      }

      return { ...data, zone_ids: zoneIds };
    } catch (err) {
      console.error("createProduct error:", err);
      return null;
    }
  },

  async updateProduct(
    userId: string,
    id: string,
    updates: Partial<Product>,
    zoneIds?: string[]
  ): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      if (zoneIds !== undefined) {
        await supabase.from("product_zones").delete().eq("product_id", id);
        if (zoneIds.length > 0) {
          await supabase
            .from("product_zones")
            .insert(zoneIds.map((zId) => ({ product_id: id, zone_id: zId })));
        }
      }

      return { ...data, zone_ids: zoneIds ?? data.zone_ids };
    } catch (err) {
      console.error("updateProduct error:", err);
      return null;
    }
  },

  async deleteProduct(userId: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("deleteProduct error:", err);
      return false;
    }
  },

  // --- ORDERS ---
  async getOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((o: any) => ({
        ...o,
        items: o.order_items || [],
      }));
    } catch (err) {
      console.error("getOrders error:", err);
      return [];
    }
  },

  async createOrder(
    userId: string,
    order: Omit<Order, "id" | "user_id" | "created_at" | "updated_at" | "items">,
    items: OrderItem[]
  ): Promise<Order | null> {
    try {
      const { data: orderData, error } = await supabase
        .from("orders")
        .insert([{ ...order, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      if (items.length > 0) {
        const itemRows = items.map((it) => ({
          order_id: orderData.id,
          product_id: it.product_id,
          product_name: it.product_name,
          unit_price: it.unit_price,
          quantity: it.quantity,
          subtotal: it.subtotal,
        }));
        const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
        if (itemsError) console.warn("order_items insert error:", itemsError);
      }

      return { ...orderData, items };
    } catch (err) {
      console.error("createOrder error:", err);
      return null;
    }
  },

  async updateOrderStatus(
    userId: string,
    orderId: string,
    status: Order["status"]
  ): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("updateOrderStatus error:", err);
      return null;
    }
  },
};