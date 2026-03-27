'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslations, useStatusTranslation } from '@/lib/i18n-context';
import { useAuthStore, useHydration } from '@/stores/auth-store';
import { taskService } from '@/services/task-service';
import { Header } from '@/components/layout/header';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Task } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';

// Helper to ensure array
function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.tasks)) return obj.tasks;
  }
  return [];
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

export default function CalendarPage() {
  const t = useTranslations();
  const { getStatusLabel, getPriorityLabel } = useStatusTranslation();
  const router = useRouter();
  const hydrated = useHydration();
  const { isAuthenticated } = useAuthStore();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Memoize calendar calculations - MUST be before any conditional returns
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const calendarStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const calendarEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 1 }), [monthEnd]);
  const calendarDays = useMemo(() => eachDayOfInterval({ start: calendarStart, end: calendarEnd }), [calendarStart, calendarEnd]);
  const currentMonthLabel = useMemo(() => format(currentDate, 'MMMM yyyy'), [currentDate]);

  // Get tasks for a specific day
  const getTasksForDay = useCallback((day: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  }, [tasks]);

  // Handle day click
  const handleDayClick = useCallback((day: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDate(day);
    setIsDialogOpen(true);
  }, []);

  // Navigate months
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate((prev) => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
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
    };

    if (hydrated && isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, hydrated]);

  // Auth redirect
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hydrated, router]);

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

  // Internationalized day names
  const days = [
    t('calendar.days.mon'),
    t('calendar.days.tue'),
    t('calendar.days.wed'),
    t('calendar.days.thu'),
    t('calendar.days.fri'),
    t('calendar.days.sat'),
    t('calendar.days.sun'),
  ];
  const selectedDateTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  return (
    <AppLayout>
      <Header title={t('nav.calendar')} />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('nav.calendar')}</h2>
            <p className="text-muted-foreground">{currentMonthLabel}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={goToToday}>
              {t('common.today') || 'Today'}
            </Button>
            <Button asChild>
              <Link href="/tasks/new">
                <Plus className="h-4 w-4 mr-2" />
                {t('tasks.createTask')}
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{currentMonthLabel}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {days.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const dayTasks = getTasksForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodayDate = isToday(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day, isCurrentMonth)}
                        className={`
                          min-h-16 p-1 border rounded-lg text-sm text-left w-full
                          transition-colors duration-200
                          ${isCurrentMonth ? 'bg-background hover:bg-accent hover:border-primary/50 cursor-pointer' : 'bg-muted/50 cursor-default'}
                          ${isTodayDate ? 'ring-2 ring-primary' : ''}
                          ${isSelected ? 'bg-primary/10 border-primary' : ''}
                        `}
                      >
                        {isCurrentMonth && (
                          <>
                            <span className={isTodayDate ? 'font-bold text-primary' : ''}>
                              {format(day, 'd')}
                            </span>
                            {dayTasks.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-0.5">
                                {dayTasks.slice(0, 3).map((task) => (
                                  <div
                                    key={task.id}
                                    className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority] || 'bg-primary'}`}
                                    title={task.title}
                                  />
                                ))}
                                {dayTasks.length > 3 && (
                                  <span className="text-xs text-muted-foreground">+{dayTasks.length - 3}</span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.upcomingTasks')}</CardTitle>
                <CardDescription>{t('dashboard.recentActivity')}</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t('dashboard.noTasks')}</p>
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <Link href="/tasks/new">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('tasks.createTask')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {tasks
                      .filter((task) => task.dueDate)
                      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                      .slice(0, 10)
                      .map((task) => (
                        <Link key={task.id} href={`/tasks/${task.id}`}>
                          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${priorityColors[task.priority] || 'bg-primary'}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : ''}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getStatusLabel(task.status)}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Day Tasks Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate && format(selectedDate, 'EEEE d MMMM yyyy')}
            </DialogTitle>
            <DialogDescription>
              {selectedDateTasks.length === 0 
                ? t('dashboard.noTasks')
                : `${selectedDateTasks.length} ${t('tasks.title').toLowerCase()}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">{t('dashboard.noTasks')}</p>
                <Button asChild>
                  <Link href={`/tasks/new?dueDate=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('tasks.createTask')}
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedDateTasks.map((task) => (
                    <Link key={task.id} href={`/tasks/${task.id}`}>
                      <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${priorityColors[task.priority] || 'bg-primary'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getStatusLabel(task.status)}
                            </Badge>
                            <Badge 
                              variant={task.priority === 'HIGH' || task.priority === 'URGENT' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {getPriorityLabel(task.priority)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/tasks/new?dueDate=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('tasks.createTask')}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
