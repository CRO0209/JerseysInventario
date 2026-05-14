/**
 * Auth Routes
 * Handles login and session management.
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../../app.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Authenticate with Supabase Auth (Client side usually does this, but we can do it here too)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    // 2. Get user profile from our 'users' table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, stores(name)')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return res.status(404).json({ error: 'Perfil de usuario no encontrado' });
    }

    // 3. Generate our own JWT for the backend session (optional if using Supabase token directly)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      user,
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', async (req, res) => {
  // 'protect' middleware will attach req.user
  res.json(req.user);
});

export default router;
