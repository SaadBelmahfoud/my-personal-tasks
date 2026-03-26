'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useStatusTranslation } from '@/lib/i18n-context';
import { useAuthStore, useHydration } from '@/stores/auth-store';
import { projectService } from '@/services/project-service';
import { taskService } from '@/services/task-service';
import { Header } from '@/components/layout/header';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FolderKanban,
  CheckSquare,
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type { Project, Task } from '@/types';

// Helper to check if a task is overdue
function isTaskOverdue(dueDate?: string, isCompleted?: boolean): boolean {
  if (!dueDate || isCompleted) return false;
  return new Date(dueDate) < new Date();
}

// Helper to ensure array
function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.tasks)) return obj.tasks;
    if (Array.isArray(obj.projects)) return obj.projects;
  }
  return [];
}

export default function DashboardPage() {
  const t = useTranslations();
  const { getStatusLabel, getPriorityLabel } = useStatusTranslation();
  const router = useRouter();
  const hydrated = useHydration();
  const { user, isAuthenticated } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate stats safely using useMemo - MUST be before any conditional returns
  const stats = useMemo(() => {
    const projectsArr = Array.isArray(projects) ? projects : [];
    const tasksArr = Array.isArray(tasks) ? tasks : [];
    const overdueArr = Array.isArray(overdueTasks) ? overdueTasks : [];
    
    return [
      { labelKey: 'totalProjects', value: projectsArr.length, icon: FolderKanban, color: 'text-blue-500' },
      { labelKey: 'totalTasks', value: tasksArr.length, icon: CheckSquare, color: 'text-green-500' },
      { labelKey: 'completedTasks', value: tasksArr.filter((t) => t?.isCompleted).length, icon: CheckSquare, color: 'text-emerald-500' },
      { labelKey: 'overdueTasks', value: overdueArr.length, icon: AlertCircle, color: 'text-red-500' },
    ];
  }, [projects, tasks, overdueTasks]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hydrated, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        
        // Fetch projects
        const projectsResponse = await projectService.getProjects(0, 5);
        setProjects(ensureArray(projectsResponse?.projects));
        
        // Fetch tasks
        const myTasks = await taskService.getMyTasks();
        setTasks(ensureArray(myTasks));
        
        // Fetch overdue tasks
        const overdue = await taskService.getOverdueTasks();
        setOverdueTasks(ensureArray(overdue));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setProjects([]);
        setTasks([]);
        setOverdueTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (hydrated && isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, hydrated]);

  // Wait for hydration
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, don't show content (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <Header title={t('dashboard.title')} />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t('dashboard.welcome', { name: user?.fullName || user?.username || 'User' })}
            </h2>
            <p className="text-muted-foreground">
              {t('dashboard.overview')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.newProject')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tasks/new">
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.newTask')}
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.labelKey}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t(`dashboard.${stat.labelKey}`)}
                        </p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Tasks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('dashboard.upcomingTasks')}</CardTitle>
                    <CardDescription>{t('dashboard.recentActivity')}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                      {t('common.viewAll')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>{t('dashboard.noTasks')}</p>
                      <Button variant="outline" size="sm" asChild className="mt-2">
                        <Link href="/tasks/new">
                          <Plus className="h-4 w-4 mr-2" />
                          {t('tasks.createTask')}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.slice(0, 5).map((task) => {
                        if (!task) return null;
                        const overdue = isTaskOverdue(task.dueDate, task.isCompleted);
                        return (
                          <Link key={task.id} href={`/tasks/${task.id}`}>
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{task.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {overdue && (
                                    <span className="text-xs text-red-500">{t('tasks.overdue')}</span>
                                  )}
                                  {task.project?.name && (
                                    <span className="text-xs text-muted-foreground">{task.project.name}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={task.priority === 'HIGH' || task.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                                  {getPriorityLabel(task.priority)}
                                </Badge>
                                <Badge variant="outline">
                                  {getStatusLabel(task.status)}
                                </Badge>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Projects */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('projects.title')}</CardTitle>
                    <CardDescription>{t('projects.activeProjects')}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/projects">
                      {t('common.viewAll')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderKanban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>{t('dashboard.noProjects')}</p>
                      <Button variant="outline" size="sm" asChild className="mt-2">
                        <Link href="/projects/new">
                          <Plus className="h-4 w-4 mr-2" />
                          {t('projects.createProject')}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.slice(0, 5).map((project) => {
                        if (!project) return null;
                        return (
                          <Link key={project.id} href={`/projects/${project.id}`}>
                            <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: project.color || '#3B82F6' }}
                                  />
                                  <p className="font-medium">{project.name}</p>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {project.taskCount || 0} {t('tasks.title').toLowerCase()}
                                </span>
                              </div>
                              <Progress value={project.progressPercentage || 0} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {project.progressPercentage || 0}% {t('tasks.completed').toLowerCase()}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/projects/new">{t('projects.createProject')}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/tasks/new">{t('tasks.createTask')}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/calendar">{t('nav.calendar')}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/settings">{t('nav.settings')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
