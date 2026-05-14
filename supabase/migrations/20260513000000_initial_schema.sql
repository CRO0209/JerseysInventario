-- Initial Schema for Jerseys Inventory System

-- 1. Create Tables

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users table (profiles that link to auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
  store_id UUID REFERENCES stores(id),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id),
  brand_id UUID REFERENCES brands(id),
  size TEXT,
  color TEXT,
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product Stock table (Stock per store)
CREATE TABLE IF NOT EXISTS product_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, store_id)
);

-- Product Images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number SERIAL,
  store_id UUID NOT NULL REFERENCES stores(id),
  user_id UUID NOT NULL REFERENCES users(id),
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','transfer','card')),
  status TEXT NOT NULL CHECK (status IN ('completed','cancelled')) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sale Items table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table (Encargos)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  store_id UUID NOT NULL REFERENCES stores(id),
  user_id UUID NOT NULL REFERENCES users(id),
  client_name TEXT NOT NULL,
  client_phone TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','in_progress','completed','delivered')) DEFAULT 'pending',
  estimated_date DATE,
  notes TEXT,
  total DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Store Transfers table
CREATE TABLE IF NOT EXISTS store_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  from_store_id UUID NOT NULL REFERENCES stores(id),
  to_store_id UUID NOT NULL REFERENCES stores(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  user_id UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','completed','cancelled')) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (from_store_id != to_store_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_stock_product ON product_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_store ON product_stock(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);

-- 3. Functions & Triggers

-- Decrease stock on sale
CREATE OR REPLACE FUNCTION fn_decrease_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_stock
  SET quantity = quantity - NEW.quantity, updated_at = now()
  WHERE product_id = NEW.product_id
    AND store_id = (SELECT store_id FROM sales WHERE id = NEW.sale_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sale_item_decrease_stock
AFTER INSERT ON sale_items
FOR EACH ROW EXECUTE FUNCTION fn_decrease_stock();

-- Restore stock on cancel
CREATE OR REPLACE FUNCTION fn_restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status = 'completed' THEN
    UPDATE product_stock ps
    SET quantity = ps.quantity + si.quantity, updated_at = now()
    FROM sale_items si
    WHERE si.sale_id = NEW.id
      AND ps.product_id = si.product_id
      AND ps.store_id = NEW.store_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sale_cancel_restore_stock
AFTER UPDATE ON sales
FOR EACH ROW EXECUTE FUNCTION fn_restore_stock_on_cancel();

-- Process transfer between stores
CREATE OR REPLACE FUNCTION fn_process_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove from source
  UPDATE product_stock SET quantity = quantity - NEW.quantity, updated_at = now()
  WHERE product_id = NEW.product_id AND store_id = NEW.from_store_id;

  -- Add to destination
  INSERT INTO product_stock (product_id, store_id, quantity)
  VALUES (NEW.product_id, NEW.to_store_id, NEW.quantity)
  ON CONFLICT (product_id, store_id)
  DO UPDATE SET quantity = product_stock.quantity + NEW.quantity, updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_process_transfer
AFTER INSERT ON store_transfers
FOR EACH ROW WHEN (NEW.status = 'completed')
EXECUTE FUNCTION fn_process_transfer();

-- Auto generate SKU
CREATE OR REPLACE FUNCTION fn_generate_sku()
RETURNS TRIGGER AS $$
DECLARE
  cat_prefix TEXT;
  seq_num INTEGER;
BEGIN
  SELECT UPPER(LEFT(c.slug, 3)) INTO cat_prefix FROM categories c WHERE c.id = NEW.category_id;
  SELECT COUNT(*) + 1 INTO seq_num FROM products WHERE category_id = NEW.category_id;
  NEW.sku := cat_prefix || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_sku
BEFORE INSERT ON products
FOR EACH ROW WHEN (NEW.sku IS NULL OR NEW.sku = '')
EXECUTE FUNCTION fn_generate_sku();

-- 4. Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Authenticated users can see everything, Admins can do everything)
CREATE POLICY "Authenticated users can read all tables" ON stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON product_stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON product_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON store_transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all tables" ON brands FOR SELECT TO authenticated USING (true);

-- 5. Seed Data

-- Insert Stores
INSERT INTO stores (name, location, address) VALUES 
('Jerseys Caracas', 'Caracas', 'C.C. Sambil Caracas'),
('Jerseys Lecheria', 'Lecheria', 'Av. Principal de Lecheria');

-- Insert Categories
INSERT INTO categories (name, slug) VALUES 
('Camisetas', 'camisetas'),
('Shorts', 'shorts'),
('Medias', 'medias'),
('Camperas', 'camperas'),
('Gorras', 'gorras'),
('Accesorios', 'accesorios'),
('Botines', 'botines'),
('Otros', 'otros');

-- Insert Brands
INSERT INTO brands (name, slug) VALUES 
('Nike', 'nike'),
('Adidas', 'adidas'),
('Puma', 'puma'),
('Under Armour', 'under-armour'),
('Reebok', 'reebok');
