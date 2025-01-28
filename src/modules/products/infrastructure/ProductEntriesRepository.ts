import { api } from '../../../services/api';
import { IProductEntriesRepository, ProductEntry, ProductEntryFilters } from '../domain/interfaces/IProductEntriesRepository';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';
import { OrderDirection, ProductEntrySortField } from '../../shared/types/sorting';

export class ProductEntriesRepository implements IProductEntriesRepository {
  async getAllProductEntries(filters: ProductEntryFilters): Promise<PaginatedResponse<ProductEntry>> {
    try {
      const response = await api.get('/product-entries', {
        params: {
          search: filters.search,
          product_id: filters.product_id,
          store_brand_id: filters.store_brand_id,
          store_location_id: filters.store_location_id,
          price_min: filters.price_min,
          price_max: filters.price_max,
          date_from: filters.date_from,
          date_to: filters.date_to,
          page: filters.page || 1,
          page_size: filters.page_size || 10,
          sort_field: filters.sort_field,
          sort_order: filters.sort_order
        }
      });

      return response.data;
    } catch (error) {
      throw error;
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