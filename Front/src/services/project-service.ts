import api from './api';
import type { Project, CreateProjectRequest, UpdateProjectRequest, ProjectListResponse, ApiResponse } from '@/types';

// Helper to calculate progress percentage
function calculateProgress(taskCount: number, completedTaskCount: number): number {
  if (taskCount === 0) return 0;
  return Math.round((completedTaskCount / taskCount) * 100);
}

// Helper to extract projects from response
function extractProjects(data: unknown): { projects: Project[]; totalCount: number } {
  if (!data) return { projects: [], totalCount: 0 };
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    const projects = Array.isArray(obj.projects) ? obj.projects : [];
    const totalCount = typeof obj.totalCount === 'number' ? obj.totalCount : projects.length;
    return { projects, totalCount };
  }
  return { projects: [], totalCount: 0 };
}

export const projectService = {
  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    if (!response?.data) {
      throw new Error('Failed to create project');
    }
    const project = response.data;
    return {
      ...project,
      progressPercentage: calculateProgress(project.taskCount || 0, project.completedTaskCount || 0),
    };
  },

  async getProjects(page = 0, size = 10): Promise<{ projects: Project[]; totalCount: number }> {
    try {
      const response = await api.get<ProjectListResponse>('/projects', { page, size });
      const { projects: rawProjects, totalCount } = extractProjects(response?.data);
      
      // Calculate progress percentage for each project
      const projects = rawProjects.map(p => ({
        ...p,
        progressPercentage: calculateProgress(p.taskCount || 0, p.completedTaskCount || 0),
      }));
      
      return { projects, totalCount };
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return { projects: [], totalCount: 0 };
    }
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    if (!response?.data) {
      throw new Error('Project not found');
    }
    const project = response.data;
    return {
      ...project,
      progressPercentage: calculateProgress(project.taskCount || 0, project.completedTaskCount || 0),
    };
  },

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, data);
    if (!response?.data) {
      throw new Error('Failed to update project');
    }
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async archiveProject(id: string): Promise<void> {
    await api.put(`/projects/${id}/archive`);
  },
};

export default projectService;
