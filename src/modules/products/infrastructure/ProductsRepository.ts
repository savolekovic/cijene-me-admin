import { api, uploadApi, createFormData } from '../../../services/api';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';
import { IProductsRepository, Product, ProductDropdownItem } from '../domain/interfaces/IProductsRepository';
import axios from 'axios';
import { OrderDirection, ProductSortField } from '../domain/types/sorting';

export class ProductsRepository implements IProductsRepository {
  async getAllProducts(
    search?: string, 
    page: number = 1, 
    per_page: number = 10,
    sort_field?: ProductSortField,
    sort_order?: OrderDirection
  ): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get('/products/', {
        params: {
          search: search || '',
          per_page,
          page,
          order_by: sort_field,
          order_direction: sort_order
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
        throw new Error(error.response?.data?.message || 'Failed to fetch products');
      }
      throw new Error('Failed to fetch products');
    }
  }

  async getProductsForDropdown(): Promise<ProductDropdownItem[]> {
    try {
      const response = await api.get('/products/simple');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch products for dropdown');
      }
      throw new Error('Failed to fetch products for dropdown');
    }
  }

  async createProduct(name: string, barcode: string, image: File, categoryId: number): Promise<Product> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('barcode', barcode);
      formData.append('image', image);
      formData.append('category_id', categoryId.toString());

      const response = await api.post('/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to create a product");
        } else if (error.response?.status === 409) {
          throw new Error("Product already exists");
        }
        throw new Error(error.response?.data?.message || 'Failed to create product');
      }
      throw new Error('Failed to create product');
    }
  }

  async updateProduct(id: number, name: string, barcode: string, image: File | null, categoryId: number): Promise<Product> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('barcode', barcode);
      formData.append('category_id', categoryId.toString());
      if (image) {
        formData.append('image', image);
      }

      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to update product");
        } else if (error.response?.status === 404) {
          throw new Error('Product not found');
        } else if (error.response?.status === 409) {
          throw new Error('Product already exists');
        }
        throw new Error(error.response?.data?.message || 'Failed to update product');
      }
      throw new Error('Failed to update product');
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to delete product");
        } else if (error.response?.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete product');
      }
      throw new Error('Failed to delete product');
    }
  }
} 