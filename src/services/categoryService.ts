import api from './api';
import { parseCategoriesResponse, type ApiCategory } from '../utils/catalogFormat';

export const categoryService = {
  getCategories: async (): Promise<ApiCategory[]> => {
    const response = await api.get('/categories');
    return parseCategoriesResponse(response.data);
  },
};
