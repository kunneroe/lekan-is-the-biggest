import api from './api';

export const supermarketService = {
  getSupermarkets: async (params?: any) => {
    const response = await api.get('/supermarkets', { params });
    return response.data;
  },
  
  getSupermarketById: async (id: string) => {
    const response = await api.get(`/supermarkets/${id}`);
    return response.data;
  },
};
