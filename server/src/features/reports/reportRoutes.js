/**
 * Rutas de Reportes y Estadísticas
 * Genera resúmenes para el Dashboard.
 */

import express from 'express';
import { supabase } from '../../app.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/reports/dashboard-summary
 * @desc    Obtener KPIs principales para el dashboard
 * @access  Público (Temporal para pruebas)
 */
router.get('/dashboard-summary', async (req, res) => {
  try {
    const store_id = req.user?.store_id || null;
    const is_admin = req.user?.role === 'admin' || true; // True por defecto para pruebas

    // 1. Obtener ventas de hoy
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let salesQuery = supabase
      .from('sales')
      .select('total, created_at')
      .gte('created_at', today.toISOString());

    if (!is_admin) salesQuery = salesQuery.eq('store_id', store_id);
    const { data: todaySales } = await salesQuery;
    
    const revenueToday = todaySales?.reduce((acc, s) => acc + s.total, 0) || 0;

    // 2. Obtener productos con stock bajo (menos de 3 unidades en alguna talla)
    const { data: lowStock } = await supabase
      .from('product_stock')
      .select('quantity, size, products(team_name, shirt_year)')
      .lt('quantity', 3)
      .limit(5);

    // 3. Obtener total de productos activos
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 4. Datos para la gráfica (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let chartQuery = supabase
      .from('sales')
      .select('total, created_at')
      .gte('created_at', sevenDaysAgo.toISOString());
    
    if (!is_admin) chartQuery = chartQuery.eq('store_id', store_id);
    const { data: chartDataRaw } = await chartQuery;

    // Procesar datos para Recharts
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayTotal = chartDataRaw
        ?.filter(s => new Date(s.created_at).toDateString() === d.toDateString())
        .reduce((acc, s) => acc + s.total, 0) || 0;
      
      chartData.push({ name: dateStr, total: dayTotal });
    }

    res.json({
      revenueToday,
      salesCountToday: todaySales?.length || 0,
      totalProducts,
      lowStock,
      chartData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
