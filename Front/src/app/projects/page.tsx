'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useStatusTranslation } from '@/lib/i18n-context';
import { useAuthStore, useHydration } from '@/stores/auth-store';
import { projectService } from '@/services/project-service';
import { useQueryCache, QUERY_KEYS } from '@/lib/query-cache';
import { Header } from '@/components/layout/header';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  MoreHorizontal,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types';

// Helper to ensure array
function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'projects' in data) {
    return (data as { projects: T[] }).projects;
  }
  return [];
}

export default function ProjectsPage() {
  const t = useTranslations();
  const { getProjectStatusLabel } = useStatusTranslation();
  const router = useRouter();
  const hydrated = useHydration();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryCache = useQueryCache();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Fetch projects function
  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await projectService.getProjects(0, 100);
      setProjects(ensureArray(response?.projects));
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects([]);
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
      fetchProjects();
    }
  }, [isAuthenticated, hydrated, fetchProjects]);

  // Register for cache invalidation
  useEffect(() => {
    queryCache.registerInvalidator(QUERY_KEYS.PROJECTS, fetchProjects);
    return () => {
      queryCache.unregisterInvalidator(QUERY_KEYS.PROJECTS);
    };
  }, [fetchProjects, queryCache]);

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      await projectService.deleteProject(projectToDelete.id);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      toast({
        title: t('common.success'),
        description: t('projects.deletedSuccess'),
      });
      queryCache.invalidateQueries([QUERY_KEYS.USER_STATS]);
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast({
        title: t('common.error'),
        description: t('errors.generic'),
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleArchiveProject = async (project: Project) => {
    try {
      await projectService.archiveProject(project.id);
      toast({
        title: t('common.success'),
        description: t('projects.updatedSuccess'),
      });
      // Refresh projects
      fetchProjects();
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <Header title={t('projects.title')} />
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('projects.myProjects')}</h2>
            <p className="text-muted-foreground">{t('projects.activeProjects')}</p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('projects.createProject')}
            </Link>
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('projects.noProjects')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('projects.noProjectsDesc')}
              </p>
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('projects.createProject')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && projects.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              if (!project) return null;
              return (
                <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Link href={`/projects/${project.id}`} className="flex items-center gap-2 hover:opacity-80">
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: project.color || '#3B82F6' }}
                        />
                        <h3 className="font-semibold text-lg hover:text-primary">{project.name}</h3>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}`}>
                              {t('common.edit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveProject(project)}>
                            {t('projects.archiveProject')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteClick(project)}
                          >
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-4 w-4" />
                        <span>{project.taskCount || 0} {t('tasks.title').toLowerCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('projects.progress')}</span>
                        <span className="font-medium">{project.progressPercentage || 0}%</span>
                      </div>
                      <Progress value={project.progressPercentage || 0} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <Badge variant={getStatusVariant(project.status)}>
                        {getProjectStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('projects.deleteProject')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('projects.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
