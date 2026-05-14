/**
 * Rutas de Ventas y Configuración
 * Maneja el registro de transacciones y la tasa del día.
 */

import express from 'express';
import { supabase } from '../../app.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// --- CONFIGURACIÓN (TASA DEL DÍA) ---

/**
 * @route   GET /api/sales/exchange-rate
 * @desc    Obtener la tasa del día actual
 */
router.get('/exchange-rate', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'exchange_rate')
      .single();
    
    if (error) throw error;
    res.json({ rate: parseFloat(data.value) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/sales/exchange-rate
 * @desc    Actualizar la tasa del día
 * @access  Privada (Admin)
 */
router.post('/exchange-rate', protect, async (req, res) => {
  try {
    const { rate } = req.body;
    const { data, error } = await supabase
      .from('settings')
      .upsert({ id: 'exchange_rate', value: rate.toString(), updated_at: new Date() })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ message: 'Tasa actualizada', rate: parseFloat(data.value) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- OPERACIONES DE VENTA ---

/**
 * @route   POST /api/sales
 * @desc    Registrar una nueva venta
 * @access  Privada
 */
router.post('/', protect, async (req, res) => {
  try {
    const { 
      items, // Array de { product_id, size, quantity, unit_price }
      payment_method, 
      notes,
      total_usd,
      exchange_rate 
    } = req.body;

    const store_id = req.user.store_id || items[0]?.store_id || null;
    const user_id = req.user.id;
    const final_rate = parseFloat(exchange_rate) || 0;

    // 1. Crear la cabecera de la venta
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        store_id,
        user_id,
        total: parseFloat(total_usd),
        subtotal: parseFloat(total_usd),
        payment_method,
        notes: notes || '',
        exchange_rate_snapshot: final_rate
      }])
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Crear los items de la venta
    const saleItems = items.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.unit_price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    // NOTA: El stock se descuenta solo mediante el TRIGGER de la DB
    // que ya configuramos en la migración anterior.

    res.status(201).json(sale);
  } catch (error) {
    console.error('Sale Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/sales/history
 * @desc    Obtener historial de ventas de la tienda actual
 * @access  Privada
 */
router.get('/history', protect, async (req, res) => {
  try {
    const store_id = req.user.store_id;
    
    let query = supabase
      .from('sales')
      .select(`
        *,
        users(full_name),
        sale_items(*, products(team_name, shirt_year, kit_type, sleeve_type, version))
      `)
      .order('created_at', { ascending: false });

    // Si no es admin, solo ve las de su tienda
    if (req.user.role !== 'admin') {
      query = query.eq('store_id', store_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
