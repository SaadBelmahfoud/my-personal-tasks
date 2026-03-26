import api from './api';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User,
} from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (!response?.data) {
      throw new Error('Login failed');
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (!response?.data) {
      throw new Error('Registration failed');
    }
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    if (!response?.data) {
      throw new Error('Token refresh failed');
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    if (!response?.data) {
      throw new Error('Failed to get user');
    }
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    if (!response?.data) {
      throw new Error('Failed to update profile');
    }
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/users/me/change-password', { currentPassword, newPassword });
  },
};

export default authService;
