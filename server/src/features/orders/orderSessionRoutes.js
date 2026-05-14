/**
 * Rutas de Jornadas (Sessions) de Encargos
 */

import express from 'express';
import { supabase } from '../../app.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/orders/sessions
 * @desc    Obtener todas las jornadas
 */
router.get('/', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('order_sessions')
      .select(`
        *,
        orders:orders(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/orders/sessions
 * @desc    Crear una nueva jornada
 */
router.post('/', protect, async (req, res) => {
  try {
    const { name, notes } = req.body;
    const { data, error } = await supabase
      .from('order_sessions')
      .insert([{ name, notes, status: 'active' }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/orders/sessions/:id/finish
 * @desc    Finalizar una jornada
 */
router.patch('/:id/finish', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('order_sessions')
      .update({ status: 'finished', finished_at: new Date() })
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
