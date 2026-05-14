/**
 * Rutas de Productos
 * Maneja el inventario, categorías y marcas.
 */

import express from 'express';
import { supabase } from '../../app.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// --- RUTAS DE CATEGORÍAS ---

// --- RUTAS DE PRODUCTOS ---

/**
 * @route   GET /api/products
 * @desc    Obtener lista de productos con filtros
 * @access  Público (Temporal para pruebas)
 */
router.get('/', async (req, res) => {
  try {
    const { category, brand, store_id, search } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        product_stock(*),
        product_images(*)
      `)
      .eq('is_active', true);

    // Aplicar filtros si existen
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Si se pide una tienda específica, filtramos el stock en el resultado
    let results = data;
    if (store_id) {
      results = data.map(product => ({
        ...product,
        current_stock: product.product_stock.find(s => s.store_id === store_id)?.quantity || 0
      }));
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/products
 * @desc    Crear un nuevo producto
 * @access  Privada (Admin)
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { 
      name, description, 
      team_name, shirt_year, kit_type, sleeve_type, version,
      purchase_price, image_url,
      sizes_stock // Array de { store_id, size, quantity }
    } = req.body;

    // 1. Insertar producto con valores por defecto para evitar fallos de integridad
    const { data: product, error: prodError } = await supabase
      .from('products')
      .insert([{
        name, 
        description: description || '', 
        team_name, shirt_year, kit_type, sleeve_type, version,
        purchase_price
      }])
      .select()
      .single();

    if (prodError) throw prodError;

    // 2. Insertar imagen si se proporciona
    if (image_url) {
      await supabase
        .from('product_images')
        .insert([{ product_id: product.id, url: image_url, is_primary: true }]);
    }

    // 3. Insertar stock por talla y tienda
    if (sizes_stock && sizes_stock.length > 0) {
      const stockData = sizes_stock
        .filter(s => s.quantity > 0) // Solo insertar si hay cantidad
        .map(s => ({
          product_id: product.id,
          store_id: s.store_id,
          size: s.size,
          quantity: parseInt(s.quantity)
        }));

      if (stockData.length > 0) {
        const { error: stockError } = await supabase
          .from('product_stock')
          .insert(stockData);
        
        if (stockError) throw stockError;
      }
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Create Product Error:', error);
    // Error 23505 es violación de unicidad en PostgreSQL
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Esta camisa ya existe en el inventario (mismo equipo, año, versión y tipo)' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar un producto
 * @access  Privada (Admin)
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Construir objeto de actualización solo con campos presentes
    const updateFields = {};
    const allowedFields = ['name', 'description', 'team_name', 'shirt_year', 'kit_type', 'sleeve_type', 'version', 'purchase_price', 'is_active'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    let productData = null;

    // Solo actualizar la tabla de productos si hay campos para cambiar
    if (Object.keys(updateFields).length > 0) {
      const { data, error } = await supabase
        .from('products')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      productData = data;
    }

    // 2. Actualizar stock (Modo Reposición: Sumar a lo existente)
    const { sizes_stock } = req.body;
    if (sizes_stock && sizes_stock.length > 0) {
      for (const item of sizes_stock) {
        // Usamos una función RPC de Supabase para incrementar o crear el stock de forma segura
        await supabase.rpc('increment_product_stock', {
          p_id: id,
          s_id: item.store_id,
          sz: item.size,
          qty: item.quantity
        });
      }
    }

    res.json(productData || { success: true, message: 'Inventario actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Desactivar un producto (Soft delete)
 * @access  Privada (Admin)
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Producto eliminado permanentemente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
