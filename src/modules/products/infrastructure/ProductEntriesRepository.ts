import { api } from '../../../services/api';
import { IProductEntriesRepository, ProductEntry } from '../domain/interfaces/IProductEntriesRepository';
import { ProductEntrySortField, SortOrder } from '../domain/types/sorting';
import axios from 'axios';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';

export class ProductEntriesRepository implements IProductEntriesRepository {
  async getAllProductEntries(
    search?: string, 
    page: number = 1, 
    per_page: number = 10,
    sort_field?: ProductEntrySortField,
    sort_order?: SortOrder
  ): Promise<PaginatedResponse<ProductEntry>> {
    try {
      const response = await api.get('/product-entries/', {
        params: {
          search: search || '',
          per_page,
          page,
          sort_field,
          sort_order
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
        throw new Error(error.response?.data?.message || 'Failed to fetch product entries');
      }
      throw new Error('Failed to fetch product entries');
    }
  }

  async createProductEntry(product_id: number, store_location_id: number, price: number): Promise<ProductEntry> {
    try {
      const response = await api.post('/product-entries/', {
        product_id,
        store_location_id,
        price: price.toString()
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to create a product entry");
        } else if (error.response?.status === 404) {
          throw new Error("Product or store location not found");
        } else if (error.response?.status === 400) {
          throw new Error("Invalid data provided");
        }
        throw new Error(error.response?.data?.message || 'Failed to create product entry');
      }
      throw new Error('Failed to create product entry');
    }
  }

  async updateProductEntry(id: number, product_id: number, store_location_id: number, price: number): Promise<ProductEntry> {
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
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to update product entry");
        } else if (error.response?.status === 404) {
          throw new Error("Product entry, product, or store location not found");
        } else if (error.response?.status === 400) {
          throw new Error("Invalid data provided");
        }
        throw new Error(error.response?.data?.message || 'Failed to update product entry');
      }
      throw new Error('Failed to update product entry');
    }
  }

  async deleteProductEntry(id: number): Promise<void> {
    try {
      await api.delete(`/product-entries/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to delete product entry");
        } else if (error.response?.status === 404) {
          throw new Error('Product entry not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete product entry');
      }
      throw new Error('Failed to delete product entry');
    }
  }
} 