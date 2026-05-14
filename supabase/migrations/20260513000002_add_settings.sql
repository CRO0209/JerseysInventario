-- Tabla para configuraciones globales del sistema (Tasa del Día, etc.)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY, -- Usaremos 'exchange_rate' como ID
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Actualizar tabla sales para guardar la tasa de cambio en el momento de la venta
ALTER TABLE sales ADD COLUMN IF NOT EXISTS exchange_rate_snapshot DECIMAL(10,2) DEFAULT 0;

-- Insertar valor inicial de la tasa (Ejemplo: 40.00 Bs/$)
INSERT INTO settings (id, value) 
VALUES ('exchange_rate', '40.00')
ON CONFLICT (id) DO NOTHING;
