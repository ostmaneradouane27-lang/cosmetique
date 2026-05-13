-- SUPABASE SCHEMA FOR COSMOPOS
-- Run this in your Supabase SQL Editor

-- 1. PROFILES Table (Extends Auth.Users)
CREATE TABLE public.profiles (
    uid UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'cashier',
    store_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. STORES Table
CREATE TABLE public.stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    owner_id UUID REFERENCES auth.users(id),
    currency TEXT DEFAULT 'USD',
    tax_rate NUMERIC DEFAULT 19,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS Table
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    barcode TEXT NOT NULL,
    category_id TEXT,
    brand TEXT,
    buying_price NUMERIC DEFAULT 0,
    selling_price NUMERIC DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    store_id TEXT REFERENCES public.stores(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CUSTOMERS Table
CREATE TABLE public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    store_id TEXT REFERENCES public.stores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SALES Table
CREATE TABLE public.sales (
    id TEXT PRIMARY KEY,
    total NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL,
    tax NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    payment_method TEXT NOT NULL,
    cashier_id UUID REFERENCES auth.users(id),
    store_id TEXT REFERENCES public.stores(id),
    items_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SALE ITEMS Table
CREATE TABLE public.sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_id TEXT REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id TEXT,
    name TEXT,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL
);

-- 7. INVENTORY LOG Table
CREATE TABLE public.inventory_log (
    id BIGSERIAL PRIMARY KEY,
    product_id TEXT,
    product_name TEXT,
    type TEXT, -- 'SALE', 'RESTOCK', 'ADJUSTMENT'
    quantity INTEGER NOT NULL,
    balance INTEGER,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    store_id TEXT REFERENCES public.stores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_log ENABLE ROW LEVEL SECURITY;

-- Setup Policies (Simplify for first setup - basically allow auth users to interact with their store data)

-- PROFILES: Users can read/write their own profile
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = uid);

-- STORES: Users can manage stores they own
CREATE POLICY "Owners can manage their stores" ON public.stores
    FOR ALL USING (auth.uid() = owner_id);

-- PRODUCTS: Users can manage products in their store
CREATE POLICY "Store staff can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.uid = auth.uid() 
            AND profiles.store_id = products.store_id
        )
    );

-- CUSTOMERS: Users can manage customers in their store
CREATE POLICY "Store staff can manage customers" ON public.customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.uid = auth.uid() 
            AND profiles.store_id = customers.store_id
        )
    );

-- SALES: Users can manage sales in their store
CREATE POLICY "Store staff can manage sales" ON public.sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.uid = auth.uid() 
            AND profiles.store_id = sales.store_id
        )
    );

-- SALE_ITEMS: Cascade from sales or check store
CREATE POLICY "Store staff can manage sale items" ON public.sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sales
            JOIN public.profiles ON profiles.store_id = sales.store_id
            WHERE sales.id = sale_items.sale_id
            AND profiles.uid = auth.uid()
        )
    );

-- INVENTORY_LOG: Users can manage logs in their store
CREATE POLICY "Store staff can manage logs" ON public.inventory_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.uid = auth.uid() 
            AND profiles.store_id = inventory_log.store_id
        )
    );

-- Function to handle new user signup (Optional but recommended)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (uid, email, display_name)
--   VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
