import api from './api';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskListResponse, TaskStatus, ApiResponse } from '@/types';

// Helper to ensure we return an array
function extractTasks(data: unknown): Task[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.tasks)) return obj.tasks;
    if (Array.isArray(obj.data)) return obj.data;
  }
  return [];
}

export const taskService = {
  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await api.post<Task>('/tasks', data);
    if (!response?.data) {
      throw new Error('Failed to create task');
    }
    return response.data;
  },

  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const response = await api.get<TaskListResponse>(`/tasks/project/${projectId}`);
      return extractTasks(response?.data);
    } catch (error) {
      console.error('Failed to fetch tasks by project:', error);
      return [];
    }
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    if (!response?.data) {
      throw new Error('Task not found');
    }
    return response.data;
  },

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    if (!response?.data) {
      throw new Error('Failed to update task');
    }
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}/status`, { status });
    if (!response?.data) {
      throw new Error('Failed to update task status');
    }
    return response.data;
  },

  async getMyTasks(): Promise<Task[]> {
    try {
      const response = await api.get<TaskListResponse>('/tasks/my-tasks');
      return extractTasks(response?.data);
    } catch (error) {
      console.error('Failed to fetch my tasks:', error);
      return [];
    }
  },

  async getOverdueTasks(): Promise<Task[]> {
    try {
      const response = await api.get<TaskListResponse>('/tasks/overdue');
      return extractTasks(response?.data);
    } catch (error) {
      console.error('Failed to fetch overdue tasks:', error);
      return [];
    }
  },

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      const response = await api.get<TaskListResponse>(`/tasks/status/${status}`);
      return extractTasks(response?.data);
    } catch (error) {
      console.error('Failed to fetch tasks by status:', error);
      return [];
    }
  },
};

export default taskService;
