import api from './api';

export const productService = {
  getProducts: async (params?: any) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  getProductsBySupermarket: async (supermarketId: string, params?: any) => {
    const response = await api.get(`/supermarkets/${supermarketId}/products`, { params });
    return response.data;
  },
};
