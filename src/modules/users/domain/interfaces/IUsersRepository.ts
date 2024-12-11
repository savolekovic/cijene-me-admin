export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface IUsersRepository {
  getAllUsers(): Promise<User[]>;
} 