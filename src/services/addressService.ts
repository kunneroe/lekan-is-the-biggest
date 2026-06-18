import type { CreateAddressPayload } from '../types/address';
import api from './api';

export const addressService = {
  getAddresses: async () => {
    const response = await api.get('/addresses');
    return response.data;
  },

  createAddress: async (addressData: CreateAddressPayload) => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },

  updateAddress: async (id: string, addressData: Partial<CreateAddressPayload>) => {
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
