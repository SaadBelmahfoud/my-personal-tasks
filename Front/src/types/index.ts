// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  avatarUrl?: string;
  avatar?: string; // Alias for avatarUrl for backward compatibility
  bio?: string;
  role: UserRole;
  isEnabled: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'USER' | 'ADMIN';

export interface UserStats {
  projectsCount: number;
  tasksCount: number;
  completedCount: number;
}

export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

// Auth Types
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  status: ProjectStatus;
  isPublic: boolean;
  startDate?: string;
  endDate?: string;
  owner: UserSummary;
  members: ProjectMember[];
  taskCount: number;
  completedTaskCount: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  color: string;
  icon?: string;
  status: ProjectStatus;
  taskCount: number;
  progressPercentage: number;
}

export interface ProjectMember {
  id: string;
  user: UserSummary;
  role: ProjectRole;
  isFavorite: boolean;
  notificationEnabled: boolean;
  joinedAt: string;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: ProjectStatus;
  isPublic?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: ProjectStatus;
  isPublic?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ProjectListResponse {
  projects: Project[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  position: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  assignee?: UserSummary;
  project?: ProjectSummary;
  labels: Label[];
  checklistItems: ChecklistItem[];
  commentCount: number;
  attachmentCount: number;
  // Computed properties for convenience
  projectId?: string;
  projectName?: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  isCompleted: boolean;
  isOverdue: boolean;
  assignedTo?: UserSummary;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  assigneeId?: string;
  parentTaskId?: string;
  labelIds?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  assigneeId?: string;
  labelIds?: string[];
}

export interface TaskListResponse {
  tasks: Task[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

// Label Types
export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

// Checklist Types
export interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
  completedAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
  error?: string;
}
