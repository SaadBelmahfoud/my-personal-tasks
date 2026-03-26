'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useStatusTranslation } from '@/lib/i18n-context';
import { useAuthStore, useHydration } from '@/stores/auth-store';
import { taskService } from '@/services/task-service';
import { Header } from '@/components/layout/header';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Loader2, Calendar, Clock, CheckCircle2, Circle, Edit, Trash2, MessageSquare, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Task } from '@/types';

export default function TaskDetailPage() {
  const t = useTranslations();
  const { getStatusLabel, getPriorityLabel } = useStatusTranslation();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const hydrated = useHydration();
  const { isAuthenticated } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hydrated, router]);

  // Use ref to track if we've already fetched to prevent infinite loops
  const hasFetchedRef = useRef(false);

  const fetchTask = useCallback(async () => {
    if (!taskId || !isAuthenticated) return;
    
    // Prevent duplicate fetches
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    try {
      setIsLoading(true);
      const taskData = await taskService.getTaskById(taskId);
      setTask(taskData);
    } catch (err) {
      console.error('Failed to fetch task:', err);
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setIsLoading(false);
    }
  }, [taskId, isAuthenticated]);

  useEffect(() => {
    if (hydrated && isAuthenticated && taskId) {
      fetchTask();
    }
  }, [hydrated, isAuthenticated, taskId, fetchTask]);

  // Reset fetch ref when task ID changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [taskId]);

  const handleToggleComplete = async () => {
    if (!task) return;
    
    try {
      const newStatus = task.isCompleted ? 'TODO' : 'COMPLETED';
      const updatedTask = await taskService.updateTaskStatus(task.id, newStatus);
      setTask(updatedTask);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    try {
      await taskService.deleteTask(task.id);
      toast({
        title: t('common.success'),
        description: t('tasks.deletedSuccess'),
      });
      router.push('/tasks');
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast({
        title: t('common.error'),
        description: err instanceof Error ? err.message : 'Failed to delete task',
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
        <Header title={t('tasks.title')} />
        <div className="p-4 lg:p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !task) {
    return (
      <AppLayout>
        <Header title={t('tasks.title')} />
        <div className="p-4 lg:p-6 space-y-6">
          <Button variant="ghost" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500">{error || t('tasks.notFound')}</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header title={task.title} />
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>
        </Button>

        {/* Task Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <button onClick={handleToggleComplete} className="mt-1">
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
                <div>
                  <h1 className={`text-2xl font-bold ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant={task.priority === 'URGENT' || task.priority === 'HIGH' ? 'destructive' : 'secondary'}
                    >
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    <Badge variant="outline">
                      {getStatusLabel(task.status)}
                    </Badge>
                    {task.project?.name && (
                      <Badge
                        variant="outline"
                        style={{ borderColor: task.project.color || '#3B82F6' }}
                      >
                        {task.project.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit')}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('common.delete')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('tasks.deleteConfirm')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('common.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {task.description && (
              <p className="text-muted-foreground mt-4 whitespace-pre-wrap">{task.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Task Details */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('tasks.dueDate')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.dueDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tasks.dueDate')}</span>
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {task.startDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tasks.startDate')}</span>
                  <span>{new Date(task.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {!task.dueDate && !task.startDate && (
                <p className="text-muted-foreground text-sm">{t('tasks.noDueDate') || 'No date set'}</p>
              )}
            </CardContent>
          </Card>

          {/* Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('tasks.estimatedHours') || 'Time'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.estimatedHours && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tasks.estimatedHours')}</span>
                  <span>{task.estimatedHours}h</span>
                </div>
              )}
              {task.actualHours && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tasks.actualHours') || 'Actual'}</span>
                  <span>{task.actualHours}h</span>
                </div>
              )}
              {!task.estimatedHours && !task.actualHours && (
                <p className="text-muted-foreground text-sm">{t('tasks.noTimeSet') || 'No time set'}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tasks.labels')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label) => (
                  <Badge key={label.id} variant="outline" style={{ backgroundColor: label.color + '20', borderColor: label.color }}>
                    {label.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold">{task.commentCount || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('tasks.comments')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold">{task.checklistItems?.filter(i => i.isCompleted).length || 0}/{task.checklistItems?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('tasks.checklist')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold">{task.attachmentCount || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('tasks.attachments')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checklist */}
        {task.checklistItems && task.checklistItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tasks.checklist')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {task.checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={item.isCompleted ? 'line-through text-muted-foreground' : ''}>
                      {item.content}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
