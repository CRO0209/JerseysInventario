-- Actualización de esquema para Inventario Detallado de Fútbol

-- 1. Modificar la tabla de productos para campos específicos de fútbol
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS team_name TEXT,
  ADD COLUMN IF NOT EXISTS shirt_year TEXT,
  ADD COLUMN IF NOT EXISTS kit_type TEXT, -- Local, Visitante, Alternativa, etc.
  ADD COLUMN IF NOT EXISTS sleeve_type TEXT CHECK (sleeve_type IN ('short', 'long')),
  ADD COLUMN IF NOT EXISTS version TEXT CHECK (version IN ('PLAYER', 'FAN', 'RETRO', 'CONJUNTO NIÑO', 'EDICION ESPECIAL')),
  ALTER COLUMN sale_price DROP NOT NULL, -- El precio de venta se carga al vender
  ALTER COLUMN sku DROP NOT NULL; -- SKU opcional por ahora

-- 2. Modificar product_stock para incluir la TALLA
-- Ahora el stock es único por (producto, tienda, talla)
ALTER TABLE product_stock ADD COLUMN IF NOT EXISTS size TEXT NOT NULL;

-- Eliminar la restricción de unicidad anterior y crear una nueva que incluya la talla
ALTER TABLE product_stock DROP CONSTRAINT IF EXISTS product_stock_product_id_store_id_key;
ALTER TABLE product_stock ADD CONSTRAINT product_stock_unique_item UNIQUE(product_id, store_id, size);

-- 3. Actualizar la función de descuento de stock para que considere la TALLA
CREATE OR REPLACE FUNCTION fn_decrease_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_stock
  SET quantity = quantity - NEW.quantity, updated_at = now()
  WHERE product_id = NEW.product_id
    AND store_id = (SELECT store_id FROM sales WHERE id = NEW.sale_id)
    AND size = (SELECT size FROM sale_items WHERE id = NEW.id); -- Necesitaremos guardar la talla en sale_items también
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Asegurar que sale_items y order_items tengan el campo SIZE
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size TEXT;
