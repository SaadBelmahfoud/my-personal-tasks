'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useStatusTranslation } from '@/lib/i18n-context';
import { useAuthStore, useHydration } from '@/stores/auth-store';
import { projectService } from '@/services/project-service';
import { taskService } from '@/services/task-service';
import { useQueryCache, QUERY_KEYS } from '@/lib/query-cache';
import { Header } from '@/components/layout/header';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Calendar, Users, CheckSquare, Edit, Archive, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { Project, Task } from '@/types';

export default function ProjectDetailPage() {
  const t = useTranslations();
  const { getProjectStatusLabel } = useStatusTranslation();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const hydrated = useHydration();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryCache = useQueryCache();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hydrated, router]);

  // Use ref to track if we've already fetched to prevent infinite loops
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!projectId || !isAuthenticated) return;
    
    // Prevent duplicate fetches
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Validate project ID format (UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(projectId)) {
        throw new Error('Invalid project ID format');
      }
      
      // Fetch project details
      const projectData = await projectService.getProjectById(projectId);
      setProject(projectData);
      
      // Fetch project tasks
      const taskData = await taskService.getTasksByProject(projectId);
      setTasks(taskData);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, isAuthenticated]);

  useEffect(() => {
    if (hydrated && isAuthenticated && projectId) {
      fetchData();
    }
  }, [hydrated, isAuthenticated, projectId, fetchData]);

  // Reset fetch ref when project ID changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!project) return;
    
    try {
      await projectService.deleteProject(project.id);
      toast({
        title: t('common.success'),
        description: t('projects.deletedSuccess'),
      });
      queryCache.invalidateQueries([QUERY_KEYS.PROJECTS, QUERY_KEYS.USER_STATS]);
      router.push('/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast({
        title: t('common.error'),
        description: t('errors.generic'),
        variant: 'destructive',
      });
    }
  };

  const handleArchiveProject = async () => {
    if (!project) return;
    
    try {
      await projectService.archiveProject(project.id);
      toast({
        title: t('common.success'),
        description: t('projects.updatedSuccess'),
      });
      queryCache.invalidateQueries([QUERY_KEYS.PROJECTS]);
      // Refresh project data
      const updatedProject = await projectService.getProjectById(project.id);
      setProject(updatedProject);
    } catch (err) {
      console.error('Failed to archive project:', err);
      toast({
        title: t('common.error'),
        description: t('errors.generic'),
        variant: 'destructive',
      });
    }
  };

  // Wait for hydration
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Header title={t('projects.title')} />
        <div className="p-4 lg:p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <Header title={t('projects.title')} />
        <div className="p-4 lg:p-6 space-y-6">
          <Button variant="ghost" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-500 mb-4">{error || t('projects.notFound')}</p>
              <Button asChild>
                <Link href="/projects">{t('projects.title')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Calculate progress
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AppLayout>
      <Header title={project.name} />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>
        </Button>

        {/* Project Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: project.color || '#3B82F6' }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {getProjectStatusLabel(project.status)}
                    </Badge>
                    {project.isPublic && (
                      <Badge variant="outline">{t('projects.isPublic')}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projects/${project.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleArchiveProject}>
                  <Archive className="h-4 w-4 mr-2" />
                  {t('projects.archiveProject')}
                </Button>
              </div>
            </div>

            {project.description && (
              <p className="text-muted-foreground mt-4">{project.description}</p>
            )}

            {/* Date Range */}
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : ''} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <CheckSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                  <p className="text-sm text-muted-foreground">{t('tasks.title')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <CheckSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                  <p className="text-sm text-muted-foreground">{t('tasks.completed')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{project.members?.length || 1}</p>
                  <p className="text-sm text-muted-foreground">{t('projects.members')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('projects.progress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progressPercentage}%</span>
                <span className="text-muted-foreground">
                  {completedTasks} / {totalTasks} {t('tasks.completed').toLowerCase()}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('tasks.title')}</CardTitle>
              <CardDescription>{tasks.length} {t('tasks.title').toLowerCase()}</CardDescription>
            </div>
            <Button asChild>
              <Link href={`/tasks/new?projectId=${project.id}`}>
                {t('tasks.createTask')}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t('tasks.noTasks')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {task.isCompleted && (
                        <CheckSquare className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
