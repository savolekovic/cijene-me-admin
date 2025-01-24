import { api } from '../../../services/api';
import { ICategoriesRepository, Category, CategoryDropdownItem } from '../domain/interfaces/ICategoriesRepository';
import axios from 'axios';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';

export class CategoriesRepository implements ICategoriesRepository {
  async getAllCategories(search?: string, page: number = 1, per_page: number = 10): Promise<PaginatedResponse<Category>> {
    try {
      const response = await api.get('/categories/', {
        params: {
          search: search || '',
          per_page,
          page
        },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch categories');
      }
      throw new Error('Failed to fetch categories');
    }
  }

  async getCategoriesForDropdown(): Promise<CategoryDropdownItem[]> {
    try {
      const response = await api.get('/categories/simple');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch categories for dropdown');
      }
      throw new Error('Failed to fetch categories for dropdown');
    }
  }

  async createCategory(name: string): Promise<Category> {
    try {
      const response = await api.post('/categories/', { name });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to create a category");
        } else if (error.response?.status === 409) {
          throw new Error("Category already exists");
        }
        throw new Error(error.response?.data?.message || 'Failed to create category');
      }
      throw new Error('Failed to create category');
    }
  }

  async deleteCategory(categoryId: number): Promise<void> {
    try {
      await api.delete(`/categories/${categoryId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized to delete a category');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to delete a category");
        } else if (error.response?.status === 404) {
          throw new Error('Category not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete category');
      }
      throw new Error('Failed to delete category');
    }
  }

  async updateCategory(categoryId: number, name: string): Promise<Category> {
    try {
      const response = await api.put(`/categories/${categoryId}`, { name });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to update category");
        } else if (error.response?.status === 404) {
          throw new Error('Category not found');
        } else if (error.response?.status === 409) {
          throw new Error('Category name already exists');
        }
        throw new Error(error.response?.data?.message || 'Failed to update category');
      }
      throw new Error('Failed to update category');
    }
  }
}