'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useStatusTranslation } from '@/lib/i18n-context';
import { useAuthStore, useHydration } from '@/stores/auth-store';
import { taskService } from '@/services/task-service';
import { useQueryCache, QUERY_KEYS } from '@/lib/query-cache';
import { Header } from '@/components/layout/header';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  CheckSquare,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { Task, TaskStatus, TaskPriority } from '@/types';

// Helper to ensure array
function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.tasks)) return obj.tasks;
  }
  return [];
}

export default function TasksPage() {
  const t = useTranslations();
  const { getStatusLabel, getPriorityLabel } = useStatusTranslation();
  const router = useRouter();
  const hydrated = useHydration();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryCache = useQueryCache();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Fetch tasks function
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const myTasks = await taskService.getMyTasks();
      setTasks(ensureArray(myTasks));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hydrated, router]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, hydrated, fetchTasks]);

  // Register for cache invalidation
  useEffect(() => {
    queryCache.registerInvalidator(QUERY_KEYS.MY_TASKS, fetchTasks);
    return () => {
      queryCache.unregisterInvalidator(QUERY_KEYS.MY_TASKS);
    };
  }, [fetchTasks, queryCache]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus, isCompleted: newStatus === 'COMPLETED' } : t
      ));
      toast({
        title: t('common.success'),
        description: t('tasks.updatedSuccess'),
      });
      // Invalidate queries
      queryCache.invalidateQueries([QUERY_KEYS.OVERDUE_TASKS, QUERY_KEYS.USER_STATS]);
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({
        title: t('common.error'),
        description: t('errors.generic'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast({
        title: t('common.success'),
        description: t('tasks.deletedSuccess'),
      });
      // Invalidate queries
      queryCache.invalidateQueries([QUERY_KEYS.OVERDUE_TASKS, QUERY_KEYS.USER_STATS, QUERY_KEYS.PROJECTS]);
    } catch (error) {
      console.error('Failed to delete task:', error);
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
      <Header title={t('tasks.title')} />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('tasks.myTasks')}</h2>
            <p className="text-muted-foreground">{t('tasks.allTasks')}</p>
          </div>
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('tasks.createTask')}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t('tasks.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tasks.allTasks')}</SelectItem>
                  <SelectItem value="TODO">{t('taskStatus.todo')}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t('taskStatus.in_progress')}</SelectItem>
                  <SelectItem value="IN_REVIEW">{t('taskStatus.in_review')}</SelectItem>
                  <SelectItem value="COMPLETED">{t('taskStatus.completed')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t('tasks.priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tasks.allPriorities')}</SelectItem>
                  <SelectItem value="LOW">{t('taskPriority.low')}</SelectItem>
                  <SelectItem value="MEDIUM">{t('taskPriority.medium')}</SelectItem>
                  <SelectItem value="HIGH">{t('taskPriority.high')}</SelectItem>
                  <SelectItem value="URGENT">{t('taskPriority.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('tasks.noTasks')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('tasks.noTasksDesc')}
              </p>
              <Button asChild>
                <Link href="/tasks/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('tasks.createTask')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button 
                      className="mt-1 hover:scale-110 transition-transform"
                      onClick={() => handleStatusChange(task.id, task.isCompleted ? 'TODO' : 'COMPLETED')}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{task.project?.name || ''}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/tasks/${task.id}`}>{t('common.edit')}</Link>
                            </DropdownMenuItem>
                            {!task.isCompleted && (
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'COMPLETED')}>
                                {t('tasks.markComplete')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(task.id)}
                            >
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant={task.priority === 'URGENT' || task.priority === 'HIGH' ? 'destructive' : 'secondary'}
                        >
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        <Badge variant="outline">
                          {getStatusLabel(task.status)}
                        </Badge>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.labels?.map((label) => (
                          <Badge key={label.id} variant="outline" className="text-xs">
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
