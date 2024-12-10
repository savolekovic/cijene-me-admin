import { api } from '../../../services/api';
import { IAuthRepository } from '../domain/interfaces/IAuthRepository';
import axios, { AxiosError } from 'axios';

interface ValidationError {
  error: 'Validation error';
  message: string;
}

export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Success Response:', {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log('Error Response:', error.response.data);
        // Return the actual error message from the API
        throw new Error(error.response.data.message || 'Login failed. Please try again.');
      }
      throw new Error('Login failed. Please try again.');
    }
  }
} 