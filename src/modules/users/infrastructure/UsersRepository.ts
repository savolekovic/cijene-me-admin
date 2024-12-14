import { api } from '../../../services/api';
import { IUsersRepository, User } from '../domain/interfaces/IUsersRepository';
import axios from 'axios';

export class UsersRepository implements IUsersRepository {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users/');
      console.log('Success Response:', {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('Error Response:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
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
      const response = await api.put(`/users/${userId}/role`, { role: newRole });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to change user role');
      }
      throw new Error('Failed to change user role');
    }
  }
} 