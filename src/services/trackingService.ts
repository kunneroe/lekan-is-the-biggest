import api from './api';

export const trackingService = {
  getTrackingUpdate: async (orderId: string) => {
    const response = await api.get(`/tracking/${orderId}`);
    return response.data;
  },
  
  getRiderLocation: async (riderId: string) => {
    const response = await api.get(`/tracking/rider/${riderId}`);
    return response.data;
  },
};
