'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from '@/lib/i18n-context';
import { useAuthStore, useHydration } from '@/stores/auth-store';
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
import type { ProjectStatus, Project } from '@/types';

export default function EditProjectPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const hydrated = useHydration();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryCache = useQueryCache();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PLANNING' as ProjectStatus,
    color: '#3B82F6',
    startDate: '',
    endDate: '',
    isPublic: false,
  });

  const hasFetchedRef = useRef(false);

  // Fetch project data
  useEffect(() => {
    if (hasFetchedRef.current || !hydrated || !isAuthenticated) return;
    hasFetchedRef.current = true;

    const fetchProject = async () => {
      try {
        const data = await projectService.getProjectById(projectId);
        setProject(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          status: data.status || 'PLANNING',
          color: data.color || '#3B82F6',
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          endDate: data.endDate ? data.endDate.split('T')[0] : '',
          isPublic: data.isPublic || false,
        });
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
        toast({
          title: t('common.error'),
          description: err instanceof Error ? err.message : 'Failed to load project',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, hydrated, isAuthenticated, t, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await projectService.updateProject(projectId, {
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
        status: formData.status,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        isPublic: formData.isPublic,
      });

      // Show success toast
      toast({
        title: t('common.success'),
        description: t('projects.updatedSuccess'),
      });

      // Invalidate relevant queries
      queryCache.invalidateQueries([
        QUERY_KEYS.PROJECTS,
        QUERY_KEYS.PROJECT_DETAIL,
        QUERY_KEYS.USER_STATS,
      ]);

      // Navigate to project detail
      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error('Failed to update project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <Header title={t('projects.editProject')} />
        <div className="p-4 lg:p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error && !project) {
    return (
      <AppLayout>
        <Header title={t('projects.editProject')} />
        <div className="p-4 lg:p-6 space-y-6">
          <Button variant="ghost" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header title={t('projects.editProject')} />
      <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>
        </Button>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('projects.editProject')}</CardTitle>
            <CardDescription>
              {t('projects.noProjectsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-lg">
                  {error}
                </div>
              )}

              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('projects.projectName')}</Label>
                <Input
                  id="name"
                  placeholder={t('projects.projectNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('projects.description')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('projects.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">{t('projects.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as ProjectStatus }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">{t('projectStatus.planning')}</SelectItem>
                    <SelectItem value="ACTIVE">{t('projectStatus.active')}</SelectItem>
                    <SelectItem value="ON_HOLD">{t('projectStatus.on_hold')}</SelectItem>
                    <SelectItem value="COMPLETED">{t('projectStatus.completed')}</SelectItem>
                    <SelectItem value="ARCHIVED">{t('projectStatus.archived')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t('projects.startDate')}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">{t('projects.endDate')}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">{t('projects.color')}</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="flex-1"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/projects/${projectId}`}>{t('common.cancel')}</Link>
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('common.save')
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
