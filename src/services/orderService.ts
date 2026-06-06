import api from './api';

export const orderService = {
  getOrders: async (params?: any) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  createOrder: async (orderData: any) => {
    const response = await api.post('/checkout', orderData);
    return response.data;
  },
};
