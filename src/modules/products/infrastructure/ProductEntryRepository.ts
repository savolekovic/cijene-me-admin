import axios from 'axios';
import { api } from '../../../services/api';
import { IProductEntryRepository, ProductEntry } from '../domain/interfaces/IProductEntryRepository';

export class ProductEntryRepository implements IProductEntryRepository {

  async getAllProductEntries(): Promise<ProductEntry[]> {
    try {
      const response = await api.get('/product_entries/', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch products');
      }
      throw new Error('Failed to fetch products');
    }
  }

  async createProductEntry(productId: number, storeBrandId: number, storeLocationId: number, price: string): Promise<ProductEntry> {
    try {
      const response = await api.post('/product_entries/', {
        product_id: productId,
        store_brand_id: storeBrandId,
        store_location_id: storeLocationId,
        price: price
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error("Invalid price format");
        } else if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to create a product entry");
        } else if (error.response?.status === 404) {
          throw new Error("Product, store brand, or store location not found");
        } else
          throw new Error(error.response?.data?.message || 'Failed to create product entry');
      }
      throw new Error('Failed to create product entry');
    }
  }
  async updateProductEntry(productEntryId: number, productId: number, storeBrandId: number, storeLocationId: number, price: string): Promise<ProductEntry> {
    try {
      const response = await api.put(`/product_entries/${productEntryId}`, {
        product_id: productId,
        store_brand_id: storeBrandId,
        store_location_id: storeLocationId,
        price: price
      });
      return response.data;
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error("Invalid price format");
        } else if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to update product entry");
        } else if (error.response?.status === 404) {
          throw new Error("Product, store brand, or store location not found");
        } else
          throw new Error(error.response?.data?.message || 'Failed to update product entry');
      }
      throw new Error('Failed to update product entry');
    }
  }

  async deleteProductEntry(productEntryId: number): Promise<void> {
    try {
      await api.delete(`/product_entries/${productEntryId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to delete product entry");
        } else if (error.response?.status === 404) {
          throw new Error("Product entry not found");
        }
        throw new Error(error.response?.data?.message || 'Failed to delete product entry');
      }
      throw new Error('Failed to delete product entry');
    }
  }
} 