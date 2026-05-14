/**
 * Rutas de Tiendas (Sucursales)
 */

import express from 'express';
import { supabase } from '../../app.js';

const router = express.Router();

/**
 * @route   GET /api/stores
 * @desc    Obtener todas las tiendas activas
 */
router.get('/', async (req, res) => {
  try {
    // Consultar tiendas con su stock y precios de productos relacionados
    const { data: stores, error } = await supabase
      .from('stores')
      .select(`
        *,
        product_stock (
          quantity,
          products (purchase_price)
        )
      `)
      .order('name');
    
    if (error) throw error;

    // Procesar los datos para calcular totales por cada tienda
    const results = stores.map(store => {
      const total_jerseys = store.product_stock?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
      const inventory_value = store.product_stock?.reduce((acc, curr) => {
        const price = curr.products?.purchase_price || 0;
        return acc + (curr.quantity * price);
      }, 0) || 0;

      return {
        ...store,
        total_jerseys,
        inventory_value
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
