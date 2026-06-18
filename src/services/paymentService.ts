import api from './api';

export const paymentService = {
  mockConfirm: async (orderId: string) => {
    const response = await api.post(`/payments/${orderId}/mock-confirm`);
    return response.data;
  },
};
