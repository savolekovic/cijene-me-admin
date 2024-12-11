import { api } from '../../../services/api';
import { IAuthRepository } from '../domain/interfaces/IAuthRepository';
import axios from 'axios';


export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Success Response:', {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log('Error Response:', error.response.data);
        throw new Error(error.response.data.message || 'Login failed. Please try again.');
      }
      throw new Error('Login failed. Please try again.');
    }
  }
} 