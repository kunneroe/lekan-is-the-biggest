import api from './api';

export const addressService = {
  getAddresses: async () => {
    const response = await api.get('/addresses');
    return response.data;
  },
  

  
  createAddress: async (addressData: any) => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },
  
  updateAddress: async (id: string, addressData: any) => {
    const response = await api.patch(`/addresses/${id}`, addressData);
    return response.data;
  },
  
  setDefaultAddress: async (id: string) => {
    const response = await api.patch(`/addresses/${id}/default`);
    return response.data;
  },
  
  deleteAddress: async (id: string) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },
};
