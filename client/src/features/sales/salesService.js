/**
 * Servicio de Ventas
 * Comunicación con la API de ventas y configuración.
 */

import api from '../../services/api';

export const salesService = {
  // Obtener la tasa del día
  getExchangeRate: async () => {
    const response = await api.get('/sales/exchange-rate');
    return response.data.rate;
  },

  // Actualizar la tasa del día
  updateExchangeRate: async (rate) => {
    const response = await api.post('/sales/exchange-rate', { rate });
    return response.data;
  },

  // Registrar una nueva venta
  createSale: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // Obtener historial de ventas
  getSalesHistory: async () => {
    const response = await api.get('/sales/history');
    return response.data;
  }
};
