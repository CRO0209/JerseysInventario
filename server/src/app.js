/**
 * Jerseys Inventory System - Backend Entry Point
 * Architecture: Node.js + Express (ES Modules)
 * Primary database: Supabase (PostgreSQL)
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Feature Routes
import authRoutes from './features/auth/authRoutes.js';
import productRoutes from './features/products/productRoutes.js';
import uploadRoutes from './features/uploads/uploadRoutes.js';
import storeRoutes from './features/stores/storeRoutes.js';
import salesRoutes from './features/sales/salesRoutes.js';
import reportRoutes from './features/reports/reportRoutes.js';
import orderRoutes from './features/orders/orderRoutes.js';
import orderSessionRoutes from './features/orders/orderSessionRoutes.js';
import transferRoutes from './features/stores/transferRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// --- Configuration & Middlewares ---

// CORS: Allows frontend to communicate with backend
app.use(cors());

// Body Parser: Allows Express to read JSON data from requests
app.use(express.json());

// Logger: Prints API requests to the console for debugging
app.use(morgan('dev'));

// --- Supabase Connection ---

// Initialize Supabase client using environment variables
// Note: These must be set in your .env file
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role for backend logic

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: Supabase URL or Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Base Routes ---

// Health Check: Verify if the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Jerseys API is running smoothly' });
});

// --- Feature Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-sessions', orderSessionRoutes);
app.use('/api/transfers', transferRoutes);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

export default app;
