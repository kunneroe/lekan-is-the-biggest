import api from './api';

type CartListener = () => void;
const listeners: CartListener[] = [];

export const cartService = {
  subscribe: (listener: CartListener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  },
  
  notify: () => {
    listeners.forEach((l) => l());
  },

  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  
  addItem: async (productId: string, quantity: number) => {
    const response = await api.post('/cart/items', { productId, quantity });
    cartService.notify();
    return response.data;
  },
  
  updateItemQuantity: async (itemId: string, quantity: number) => {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    cartService.notify();
    return response.data;
  },
  
  removeItem: async (itemId: string) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    cartService.notify();
    return response.data;
  },
  
  clearCart: async () => {
    const response = await api.delete('/cart');
    cartService.notify();
    return response.data;
  },
};
