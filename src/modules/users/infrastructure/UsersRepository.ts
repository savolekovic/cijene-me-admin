import { api } from '../../../services/api';
import { IUsersRepository, User } from '../domain/interfaces/IUsersRepository';
import axios from 'axios';
import { PaginatedResponse } from '../../shared/types/PaginatedResponse';
import { OrderDirection, UserSortField } from '../presentation/components/UsersPage';

export class UsersRepository implements IUsersRepository {
  async getAllUsers(
    search?: string, 
    page: number = 1, 
    per_page: number = 10,
    sort_field?: UserSortField,
    sort_order?: OrderDirection
  ): Promise<PaginatedResponse<User>> {
    try {
      const response = await api.get('/users/', {
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
        console.log('Error Response:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        
        if (error.response?.status === 401) {
          // Let the interceptor handle the token refresh
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error('Access forbidden. Insufficient permissions.');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch users.');
      }
      throw new Error('Failed to fetch users.');
    }
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/users/delete/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete user');
      }
      throw new Error('Failed to delete user');
    }
  }

  async changeRole(userId: number, newRole: string): Promise<User> {
    try {
      const response = await api.put(`/users/${userId}/role`, {
        role: newRole
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 404) {
          throw new Error('User not found');
        } else if (error.response?.status === 500) {
          console.error('Server Error:', error.response.data);
          throw new Error('Server error occurred while changing role');
        }
        throw new Error(error.response?.data?.message || 'Failed to change user role');
      }
      throw new Error('Failed to change user role');
    }
  }
} 