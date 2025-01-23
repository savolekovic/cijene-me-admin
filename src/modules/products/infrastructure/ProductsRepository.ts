import { api, uploadApi, createFormData } from '../../../services/api';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';
import { IProductsRepository, Product, ProductDropdownItem } from '../domain/interfaces/IProductsRepository';
import axios from 'axios';

export class ProductsRepository implements IProductsRepository {
  async getAllProducts(search?: string, page: number = 1, per_page: number = 10): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get('/products/', {
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
      // Create FormData directly here for better control
      const formData = new FormData();
      formData.append('name', name);
      formData.append('barcode', barcode);
      formData.append('category_id', String(categoryId));
      formData.append('image', image);

      // Make request without setting any headers - let axios handle it
      const response = await uploadApi.post('/products/', formData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to create a product");
        } else if (error.response?.status === 404) {
          throw new Error("Category not found");
        } else if (error.response?.status === 400) {
          throw new Error(error.response.data?.message || "Invalid data provided");
        }
        throw new Error(error.response?.data?.message || 'Failed to create product');
      }
      throw new Error('Failed to create product');
    }
  }

  async updateProduct(productId: number, name: string, barcode: string, image: File | null, categoryId: number): Promise<Product> {
    try {
      let response;
      
      if (image) {
        const formData = createFormData({ name, barcode, category_id: categoryId }, image);
        response = await uploadApi.put(`/products/${productId}`, formData);
      } else {
        response = await api.put(`/products/${productId}`, {
          name,
          barcode,
          category_id: categoryId
        });
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to update product");
        } else if (error.response?.status === 404) {
          throw new Error("Product or category not found");
        } else if (error.response?.status === 400) {
          throw new Error(error.response.data?.message || "Invalid data provided");
        }
        throw new Error(error.response?.data?.message || 'Failed to update product');
      }
      throw new Error('Failed to update product');
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    try {
      await api.delete(`/products/${productId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error("Don't have permission to delete product");
        } else if (error.response?.status === 404) {
          throw new Error("Product not found");
        }
        throw new Error(error.response?.data?.message || 'Failed to delete product');
      }
      throw new Error('Failed to delete product');
    }
  }
} 