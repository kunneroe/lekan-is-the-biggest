import api from './api';

export const trackingService = {
  getTrackingUpdate: async (orderId: string) => {
    const response = await api.get(`/tracking/${orderId}/tracking`);
    return response.data;
  },
};
