import { api } from '../../../services/api';
import { IStoreLocationRepository, StoreLocation, StoreLocationDropdownItem, StoreLocationDropdownOptions } from '../domain/interfaces/IStoreLocationRepository';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';
import axios from 'axios';
import { OrderDirection, StoreLocationSortField } from '../domain/types/sorting';

export class StoreLocationRepository implements IStoreLocationRepository {
  async getAllStoreLocations(
    search?: string,
    page: number = 1,
    per_page: number = 10,
    sort_field?: StoreLocationSortField,
    sort_order?: OrderDirection
  ): Promise<PaginatedResponse<StoreLocation>> {
    try {
      const response = await api.get('/store-locations/', {
        params: {
          search: search || '',
          page,
          per_page,
          order_by: sort_field,
          order_direction: sort_order
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch store locations');
      }
      throw new Error('Failed to fetch store locations');
    }
  }

  async createStoreLocation(address: string, store_brand_id: number): Promise<StoreLocation> {
    try {
      const response = await api.post('/store-locations/', { address, store_brand_id });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to create a store location");
        } else if (error.response?.status === 400) {
          throw new Error("Store location already exists");
        }
        throw new Error(error.response?.data?.message || 'Failed to create store location');
      }
      throw new Error('Failed to create store location');
    }
  }

  async updateStoreLocation(id: number, address: string, store_brand_id: number): Promise<StoreLocation> {
    try {
      const response = await api.put(`/store-locations/${id}`, { address, store_brand_id });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to update store location");
        } else if (error.response?.status === 404) {
          throw new Error("Store location not found");
        } else if (error.response?.status === 400) {
          throw new Error("Store location already exists");
        }
        throw new Error(error.response?.data?.message || 'Failed to update store location');
      }
      throw new Error('Failed to update store location');
    }
  }

  async deleteStoreLocation(id: number): Promise<void> {
    try {
      await api.delete(`/store-locations/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to delete store location");
        } else if (error.response?.status === 404) {
          throw new Error('Store location not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete store location');
      }
      throw new Error('Failed to delete store location');
    }
  }

  async getStoreLocationsForDropdown(options?: StoreLocationDropdownOptions): Promise<StoreLocationDropdownItem[]> {
    try {
      const response = await api.get('/store-locations/simple', {
        params: {
          search: options?.search || '',
          store_brand_id: options?.store_brand_id
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch store locations for dropdown');
      }
      throw new Error('Failed to fetch store locations for dropdown');
    }
  }
}