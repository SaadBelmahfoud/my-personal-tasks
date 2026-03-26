'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import type { ProjectStatus } from '@/types';

export default function NewProjectPage() {
  const t = useTranslations();
  const router = useRouter();
  const hydrated = useHydration();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryCache = useQueryCache();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PLANNING' as ProjectStatus,
    color: '#3B82F6',
    startDate: '',
    endDate: '',
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const project = await projectService.createProject({
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
        description: t('projects.createdSuccess'),
      });
      
      // Invalidate relevant queries
      queryCache.invalidateQueries([
        QUERY_KEYS.PROJECTS,
        QUERY_KEYS.USER_STATS,
      ]);
      
      // Navigate to projects list
      router.push('/projects');
    } catch (err) {
      console.error('Failed to create project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
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
      <Header title={t('projects.createProject')} />
      <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>
        </Button>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('projects.createProject')}</CardTitle>
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
                  <Link href="/projects">{t('common.cancel')}</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('projects.createProject')
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
