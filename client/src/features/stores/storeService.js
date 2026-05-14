/**
 * Servicio de Sucursales y Transferencias
 * Maneja la lógica de tiendas y movimiento de stock.
 */

import api from '../../services/api';

export const storeService = {
  // Obtener todas las tiendas
  getStores: async () => {
    const response = await api.get('/stores');
    return response.data;
  },

  // Obtener historial de transferencias
  getTransfers: async () => {
    const response = await api.get('/transfers');
    return response.data;
  },

  // Crear una nueva transferencia
  createTransfer: async (transferData) => {
    const response = await api.post('/transfers', transferData);
    return response.data;
  }
};
