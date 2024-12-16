import { api } from '../../../services/api';
import { IProductsRepository, Product } from '../domain/interfaces/IProductsRepository';
import axios from 'axios';

export class ProductsRepository implements IProductsRepository {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products/', {
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

  async createProduct(name: string, imageUrl: string, categoryId: number): Promise<Product> {
    try {
      const response = await api.post('/products/', {
        name,
        image_url: imageUrl,
        category_id: categoryId
      });
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
          throw new Error("Product name already exists");
        }
        throw new Error(error.response?.data?.message || 'Failed to create product');
      }
      throw new Error('Failed to create product');
    }
  }

  async updateProduct(productId: number, name: string, imageUrl: string, categoryId: number): Promise<Product> {
    try {
      const response = await api.put(`/products/${productId}`, {
        name,
        image_url: imageUrl,
        category_id: categoryId
      });
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
          throw new Error("Product name already exists");
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