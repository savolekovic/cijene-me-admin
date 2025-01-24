import { api } from '../../../services/api';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';
import { IStoreBrandRepository, StoreBrand, StoreBrandDropdownItem } from '../domain/interfaces/IStoreBrandRepository';
import axios from 'axios';

export class StoreBrandRepository implements IStoreBrandRepository {
  async getAllStoreBrands(search?: string, page: number = 1, per_page: number = 10): Promise<PaginatedResponse<StoreBrand>> {
    try {
      const response = await api.get('/store-brands/', {
        params: {
          search: search || '',
          page,
          per_page
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
        throw new Error(error.response?.data?.message || 'Failed to fetch store brands');
      }
      throw new Error('Failed to fetch store brands');
    }
  }

  async getStoreBrandsForDropdown(): Promise<StoreBrandDropdownItem[]> {
    try {
      const response = await api.get('/store-brands/simple');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch store brands');
      }
      throw new Error('Failed to fetch store brands');
    }
  }

  async createStoreBrand(name: string): Promise<StoreBrand> {
    try {
      const response = await api.post('/store-brands/', { name });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to create a store brand");
        } else if (error.response?.status === 400) {
          throw new Error("Store brand already exists");
        }
        throw new Error(error.response?.data?.message || 'Failed to create store brand');
      }
      throw new Error('Failed to create store brand');
    }
  }

  async updateStoreBrand(id: number, name: string): Promise<StoreBrand> {
    try {
      const response = await api.put(`/store-brands/${id}`, { name });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to update store brand");
        } else if (error.response?.status === 404) {
          throw new Error("Store brand not found");
        } else if (error.response?.status === 400) {
          throw new Error("Store brand already exists");
        }
        throw new Error(error.response?.data?.message || 'Failed to update store brand');
      }
      throw new Error('Failed to update store brand');
    }
  }

  async deleteStoreBrand(id: number): Promise<void> {
    try {
      await api.delete(`/store-brands/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to delete store brand");
        } else if (error.response?.status === 404) {
          throw new Error('Store brand not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete store brand');
      }
      throw new Error('Failed to delete store brand');
    }
  }
} 