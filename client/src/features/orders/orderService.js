/**
 * Servicio de Encargos
 * Comunicación con la API de pedidos especiales y jornadas.
 */

import api from '../../services/api';

export const orderService = {
  // --- JORNADAS ---
  
  // Obtener todas las jornadas
  getSessions: async () => {
    const response = await api.get('/order-sessions');
    return response.data;
  },

  // Crear una nueva jornada
  createSession: async (sessionData) => {
    const response = await api.post('/order-sessions', sessionData);
    return response.data;
  },

  // Finalizar una jornada
  finishSession: async (id) => {
    const response = await api.patch(`/order-sessions/${id}/finish`);
    return response.data;
  },

  // --- ENCARGOS ---

  // Obtener todos los encargos (opcionalmente filtrados por jornada)
  getOrders: async (sessionId = null) => {
    const url = sessionId ? `/orders?session_id=${sessionId}` : '/orders';
    const response = await api.get(url);
    return response.data;
  },

  // Crear un nuevo encargo
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Actualizar el estado de un encargo
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};
