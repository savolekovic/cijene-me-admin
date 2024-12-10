export interface IAuthRepository {
  login(email: string, password: string): Promise<{
    access_token: string;
    refresh_token: string;
  }>;
} 