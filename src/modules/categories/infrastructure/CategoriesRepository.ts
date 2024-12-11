import { api } from '../../../services/api';
import { ICategoriesRepository, Category } from '../domain/interfaces/ICategoriesRepository';
import axios from 'axios';

export class CategoriesRepository implements ICategoriesRepository {
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch categories');
      }
      throw new Error('Failed to fetch categories');
    }
  }
} 