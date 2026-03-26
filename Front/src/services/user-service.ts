import api from './api';
import type { User, UserStats } from '@/types';

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    if (!response?.data) {
      throw new Error('Failed to get user');
    }
    return response.data;
  },

  async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get<UserStats>('/users/me/stats');
      return response?.data || { projectsCount: 0, tasksCount: 0, completedCount: 0 };
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return { projectsCount: 0, tasksCount: 0, completedCount: 0 };
    }
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

export default userService;
