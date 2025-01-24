import { PaginatedResponse } from '../../../shared/types/PaginatedResponse';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface IUsersRepository {
  getAllUsers(search?: string, page?: number, per_page?: number): Promise<PaginatedResponse<User>>;
  deleteUser(userId: number): Promise<{ message: string }>;
  changeRole(userId: number, newRole: string): Promise<User>;
} 