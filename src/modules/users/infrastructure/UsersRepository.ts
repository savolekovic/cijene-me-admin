import { api } from '../../../services/api';
import { IUsersRepository, User } from '../domain/interfaces/IUsersRepository';
import axios from 'axios';

export class UsersRepository implements IUsersRepository {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users/');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch users.');
      }
      throw new Error('Failed to fetch users.');
    }
  }
} 