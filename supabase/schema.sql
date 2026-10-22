-- ============================================================
-- AdProMax Delivery Management Platform - Supabase Schema (SECURE)
-- ============================================================

-- 1. Create delivery_zones table with user ownership
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    radius_km DOUBLE PRECISION NOT NULL CHECK (radius_km > 0),
    color TEXT NOT NULL DEFAULT '#7a3dff',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create products table with user ownership
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create product_zones join table
CREATE TABLE IF NOT EXISTS public.product_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_product_zone UNIQUE (product_id, zone_id)
);

-- 4. Create orders table with user ownership
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT NOT NULL,
    delivery_lat DOUBLE PRECISION NOT NULL,
    delivery_lng DOUBLE PRECISION NOT NULL,
    zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    distance_km DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_zones_user_id ON public.delivery_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_zone_id ON public.orders(zone_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_zones_product_id ON public.product_zones(product_id);
CREATE INDEX IF NOT EXISTS idx_product_zones_zone_id ON public.product_zones(zone_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "delivery_zones_all" ON public.delivery_zones;
DROP POLICY IF EXISTS "products_all" ON public.products;
DROP POLICY IF EXISTS "product_zones_all" ON public.product_zones;
DROP POLICY IF EXISTS "orders_all" ON public.orders;
DROP POLICY IF EXISTS "order_items_all" ON public.order_items;

-- ============================================================
-- SECURE RLS POLICIES - Users can only access their own data
-- ============================================================

-- delivery_zones: Users can CRUD their own zones
CREATE POLICY "delivery_zones_select_own" ON public.delivery_zones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "delivery_zones_insert_own" ON public.delivery_zones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delivery_zones_update_own" ON public.delivery_zones
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delivery_zones_delete_own" ON public.delivery_zones
    FOR DELETE USING (auth.uid() = user_id);

-- products: Users can CRUD their own products
CREATE POLICY "products_select_own" ON public.products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "products_insert_own" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_update_own" ON public.products
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_delete_own" ON public.products
    FOR DELETE USING (auth.uid() = user_id);

-- product_zones: Users can manage links for their own products/zones
CREATE POLICY "product_zones_select_own" ON public.product_zones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "product_zones_insert_own" ON public.product_zones
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "product_zones_delete_own" ON public.product_zones
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()
        )
    );

-- orders: Users can CRUD their own orders
CREATE POLICY "orders_select_own" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_own" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_own" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_delete_own" ON public.orders
    FOR DELETE USING (auth.uid() = user_id);

-- order_items: Users can access items for their own orders
CREATE POLICY "order_items_select_own" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "order_items_insert_own" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "order_items_update_own" ON public.order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "order_items_delete_own" ON public.order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

-- ============================================================
-- Helper: Function to get current user's ID (for server-side use)
-- ============================================================
-- Note: In server-side code with service role, you bypass RLS.
-- Client-side uses anon key + these RLS policies automatically.