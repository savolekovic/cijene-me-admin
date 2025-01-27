import { api } from '../../../services/api';
import { IProductEntriesRepository, ProductEntry } from '../domain/interfaces/IProductEntriesRepository';
import { OrderDirection, ProductEntrySortField } from '../domain/types/sorting';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';

export class ProductEntriesRepository implements IProductEntriesRepository {
  async getAllProductEntries(
    search?: string,
    page: number = 1,
    per_page: number = 10,
    sort_field?: ProductEntrySortField,
    sort_order?: OrderDirection
  ): Promise<PaginatedResponse<ProductEntry>> {
    try {
      const response = await api.get('/product-entries', {
        params: {
          search,
          page,
          per_page,
          order_by: sort_field,
          order_direction: sort_order
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch product entries');
    }
  }

  async createProductEntry(
    product_id: number,
    store_location_id: number,
    price: number
  ): Promise<ProductEntry> {
    try {
      const response = await api.post('/product-entries', {
        product_id,
        store_location_id,
        price
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(error.response?.data?.message || 'Failed to create product entry');
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
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(error.response?.data?.message || 'Failed to update product entry');
    }
  }

  async deleteProductEntry(id: number): Promise<void> {
    try {
      await api.delete(`/product-entries/${id}`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(error.response?.data?.message || 'Failed to delete product entry');
    }
  }
} 