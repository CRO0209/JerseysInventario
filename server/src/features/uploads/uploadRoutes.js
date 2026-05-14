/**
 * Rutas de Subida de Archivos
 * Maneja la carga de imágenes a Supabase Storage.
 */

import express from 'express';
import upload from '../../middleware/upload.js';
import { supabase } from '../../app.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/uploads/image
 * @desc    Subir una imagen a Supabase Storage
 * @access  Privada
 */
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    // Nombre único para el archivo (usamos timestamp + nombre original)
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // 1. Subir al bucket 'products' de Supabase
    // Asegúrate de haber creado el bucket 'products' como PUBLIC en Supabase
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // 2. Obtener la URL pública de la imagen
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    res.json({
      url: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Error al subir la imagen a la nube' });
  }
});

export default router;
