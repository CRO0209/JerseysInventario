/**
 * Servicio de Inventario
 * Comunicación con la API de productos.
 */

import api from '../../services/api';

export const inventoryService = {
  // Obtener productos con filtros opcionales
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/products?${params}`);
    return response.data;
  },

  // Obtener categorías
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Obtener marcas
  getBrands: async () => {
    const response = await api.get('/products/brands');
    return response.data;
  },

  // Crear un nuevo producto
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Eliminar (desactivar) producto
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
