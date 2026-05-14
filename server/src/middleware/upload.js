/**
 * Middleware de Subida de Archivos (Multer)
 * Configura el almacenamiento temporal en memoria para procesar imágenes.
 */

import multer from 'multer';

// Configuramos Multer para guardar el archivo en memoria (RAM)
// Esto es ideal antes de enviarlo a un servicio externo como Supabase
const storage = multer.memoryStorage();

// Filtro para asegurar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo no es una imagen válida'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB por imagen
  }
});

export default upload;
