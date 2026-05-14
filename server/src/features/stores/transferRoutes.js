/**
 * Rutas de Transferencias entre Sucursales
 * Permite mover stock de una tienda a otra.
 */

import express from 'express';
import { supabase } from '../../app.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/stores/transfers
 * @desc    Obtener historial de transferencias
 * @access  Privada
 */
router.get('/', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('store_transfers')
      .select(`
        *,
        products(team_name, shirt_year, version),
        from:from_store_id(name),
        to:to_store_id(name),
        users(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/stores/transfers
 * @desc    Registrar una nueva transferencia de stock
 * @access  Privada
 */
router.post('/', protect, async (req, res) => {
  try {
    const { 
      product_id, 
      from_store_id, 
      to_store_id, 
      size, 
      quantity, 
      notes 
    } = req.body;

    const user_id = req.user.id;

    // 1. Verificar que haya stock suficiente en la tienda de origen
    const { data: sourceStock, error: stockError } = await supabase
      .from('product_stock')
      .select('quantity')
      .eq('product_id', product_id)
      .eq('store_id', from_store_id)
      .eq('size', size)
      .single();

    if (stockError || !sourceStock || sourceStock.quantity < quantity) {
      return res.status(400).json({ error: 'Stock insuficiente en la sucursal de origen' });
    }

    // 2. Registrar la transferencia
    // Nota: El TRIGGER fn_process_transfer (que crearemos o actualizaremos) 
    // se encargará de mover los números en product_stock automáticamente.
    const { data: transfer, error: transferError } = await supabase
      .from('store_transfers')
      .insert([{
        product_id,
        from_store_id,
        to_store_id,
        size,
        quantity,
        user_id,
        notes,
        status: 'completed'
      }])
      .select()
      .single();

    if (transferError) throw transferError;

    res.status(201).json(transfer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
