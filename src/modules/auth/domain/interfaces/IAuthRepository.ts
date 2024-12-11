export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthTokens>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
} 
