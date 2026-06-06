import api from './api';

export const paymentService = {
  processPayment: async (orderId: string, paymentData: any) => {
    const response = await api.post(`/payments/order/${orderId}`, paymentData);
    return response.data;
  },
  
  verifyPayment: async (reference: string) => {
    const response = await api.get(`/payments/verify/${reference}`);
    return response.data;
  },
  
  mockConfirm: async (orderId: string) => {
    const response = await api.post(`/payments/${orderId}/mock-confirm`);
    return response.data;
  },
};
