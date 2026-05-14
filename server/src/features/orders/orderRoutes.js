/**
 * Rutas de Encargos (Pedidos Especiales)
 * Maneja pedidos de clientes que no están en stock.
 */

import express from 'express';
import { supabase } from '../../app.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Obtener lista de encargos
 * @access  Privada
 */
router.get('/', protect, async (req, res) => {
  try {
    const store_id = req.user.store_id;
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        users(full_name),
        order_items(*, products(team_name, shirt_year, version))
      `)
      .order('created_at', { ascending: false });

    if (req.user.role !== 'admin') {
      query = query.eq('store_id', store_id);
    }

    if (req.query.session_id) {
      query = query.eq('session_id', req.query.session_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/orders
 * @desc    Crear un nuevo encargo
 * @access  Privada
 */
router.post('/', protect, async (req, res) => {
  try {
    const { 
      client_name, 
      client_phone, 
      items, // Array de { product_id, description, size, quantity, unit_price }
      estimated_date,
      notes,
      total,
      session_id
    } = req.body;

    const store_id = req.user.store_id || req.body.store_id;
    const user_id = req.user.id;

    // 1. Crear cabecera del encargo
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        store_id,
        user_id,
        client_name,
        client_phone,
        estimated_date,
        notes,
        total,
        session_id,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Crear items del encargo
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id, // Puede ser null si es un jersey que no existe en BD aún
      description: item.description,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Actualizar el estado de un encargo
 * @access  Privada
 */
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
