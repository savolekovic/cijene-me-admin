import { api } from '../../../services/api';
import { IProductEntriesRepository, ProductEntry } from '../domain/interfaces/IProductEntriesRepository';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';
import { OrderDirection, ProductEntrySortField } from '../../shared/types/sorting';
import axios from 'axios';

export class ProductEntriesRepository implements IProductEntriesRepository {
  async getAllProductEntries(
    search?: string,
    product_id?: number,
    page: number = 1,
    page_size: number = 10,
    sort_field?: ProductEntrySortField,
    sort_order?: OrderDirection
  ): Promise<PaginatedResponse<ProductEntry>> {
    try {
      const params = {
        search: search || '',
        product_id,
        page,
        page_size,
        order_by: sort_field,
        order_direction: sort_order
      };
      
      console.log('Request params:', params);
      
      const response = await api.get('/product-entries/', { params });
      
      console.log('Response data:', response.data);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
        if (error.response?.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch product entries');
      }
      throw error;
    }
  }

  async createProductEntry(
    product_id: number,
    store_location_id: number,
    price: number
  ): Promise<ProductEntry> {
    try {
      const response = await api.post('/product-entries/', {
        product_id,
        store_location_id,
        price
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(error.response?.data?.message || 'Failed to create product entry');
      }
      throw error;
    }
  }

  async updateProductEntry(
    id: number,
    product_id: number,
    store_location_id: number,
    price: number
  ): Promise<ProductEntry> {
    try {
      const response = await api.put(`/product-entries/${id}`, {
        product_id,
        store_location_id,
        price
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(error.response?.data?.message || 'Failed to update product entry');
      }
      throw error;
    }
  }

  async deleteProductEntry(id: number): Promise<void> {
    try {
      await api.delete(`/product-entries/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete product entry');
      }
      throw error;
    }
  }
} 