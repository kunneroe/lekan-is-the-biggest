import api from './api';

export const favoriteService = {
  getFavorites: () => api.get('/favorites'),
  addFavorite: (productId: string) => api.post('/favorites', { productId }),
  removeFavorite: (productId: string) => api.delete(`/favorites/${productId}`),
};
