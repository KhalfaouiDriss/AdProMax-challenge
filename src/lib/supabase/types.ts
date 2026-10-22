export interface DeliveryZone {
  id: string;
  name: string;
  description?: string | null;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  color: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock_quantity: number;
  image_url?: string | null;
  category: string;
  created_at?: string;
  updated_at?: string;
  zones?: DeliveryZone[];
  zone_ids?: string[];
}

export interface ProductZone {
  id: string;
  product_id: string;
  zone_id: string;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_address: string;
  delivery_lat: number;
  delivery_lng: number;
  zone_id?: string | null;
  status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  distance_km?: number | null;
  notes?: string | null;
  created_at: string;
  zone?: DeliveryZone | null;
  items?: OrderItem[];
}

export interface ZoneVerificationResult {
  isValid: boolean;
  zone: DeliveryZone | null;
  distanceKm: number;
  errorMessage?: string;
  nearestZone?: DeliveryZone | null;
  distanceToNearestKm?: number;
}
