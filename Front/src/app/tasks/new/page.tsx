'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useStatusTranslation } from '@/lib/i18n-context';
import { useAuthStore, useHydration } from '@/stores/auth-store';
import { taskService } from '@/services/task-service';
import { projectService } from '@/services/project-service';
import { useQueryCache, QUERY_KEYS } from '@/lib/query-cache';
import { Header } from '@/components/layout/header';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { Project, TaskStatus, TaskPriority } from '@/types';

export default function NewTaskPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydration();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryCache = useQueryCache();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Get pre-filled values from URL params
  const prefillProjectId = searchParams.get('projectId');
  const prefillDueDate = searchParams.get('dueDate');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    projectId: prefillProjectId || '',
    dueDate: prefillDueDate || '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects(0, 100);
        setProjects(response?.projects || []);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (hydrated && isAuthenticated) {
      fetchProjects();
    }
  }, [hydrated, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId) {
      setError(t('tasks.selectProject') || 'Please select a project');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      await taskService.createTask({
        title: formData.title,
        description: formData.description || undefined,
        projectId: formData.projectId,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
      });
      
      // Show success toast
      toast({
        title: t('common.success'),
        description: t('tasks.createdSuccess'),
      });
      
      // Invalidate relevant queries
      queryCache.invalidateQueries([
        QUERY_KEYS.MY_TASKS,
        QUERY_KEYS.OVERDUE_TASKS,
        QUERY_KEYS.PROJECTS,
        `${QUERY_KEYS.TASKS_BY_PROJECT}-${formData.projectId}`,
      ]);
      
      // Navigate to tasks list
      router.push('/tasks');
    } catch (err) {
      console.error('Failed to create task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

  return (
    <AppLayout>
      <Header title={t('tasks.createTask')} />
      <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>
        </Button>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tasks.createTask')}</CardTitle>
            <CardDescription>
              {t('tasks.noTasksDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-lg">
                  {error}
                </div>
              )}
              
              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="title">{t('tasks.taskTitle')}</Label>
                <Input
                  id="title"
                  placeholder={t('tasks.taskTitlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('tasks.description')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('tasks.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Project */}
              <div className="space-y-2">
                <Label htmlFor="project">{t('projects.title')}</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder={t('tasks.selectProject')} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingProjects ? (
                      <SelectItem value="_loading" disabled>
                        {t('common.loading')}
                      </SelectItem>
                    ) : projects.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        {t('projects.noProjects')}
                      </SelectItem>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Status & Priority Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">{t('tasks.status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as TaskStatus }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">{t('taskStatus.todo')}</SelectItem>
                      <SelectItem value="IN_PROGRESS">{t('taskStatus.in_progress')}</SelectItem>
                      <SelectItem value="IN_REVIEW">{t('taskStatus.in_review')}</SelectItem>
                      <SelectItem value="COMPLETED">{t('taskStatus.completed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">{t('tasks.priority')}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as TaskPriority }))}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">{t('taskPriority.low')}</SelectItem>
                      <SelectItem value="MEDIUM">{t('taskPriority.medium')}</SelectItem>
                      <SelectItem value="HIGH">{t('taskPriority.high')}</SelectItem>
                      <SelectItem value="URGENT">{t('taskPriority.urgent')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">{t('tasks.dueDate')}</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/tasks">{t('common.cancel')}</Link>
                </Button>
                <Button type="submit" disabled={isLoading || isLoadingProjects}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('tasks.createTask')
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
