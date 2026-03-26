'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n-context';
import { useAuthStore, useHydration } from '@/stores/auth-store';
import { userService } from '@/services/user-service';
import { Header } from '@/components/layout/header';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { Camera, FolderKanban, CheckSquare, CheckCircle2, Loader2 } from 'lucide-react';
import type { UserStats } from '@/types';

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const hydrated = useHydration();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<UserStats>({ projectsCount: 0, tasksCount: 0, completedCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hydrated, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const userStats = await userService.getUserStats();
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (hydrated && isAuthenticated) {
      fetchStats();
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
      <Header title={t('profile.title')} />
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-2xl">
                    {user ? getInitials(user.firstName || user.username || 'U') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username || 'User'}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                  <Badge variant="secondary">{t('profile.member') || 'Member'}</Badge>
                  {user?.createdAt && (
                    <Badge variant="outline">
                      {t('profile.since') || 'Since'} {new Date(user.createdAt).getFullYear()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.projectsCount}</p>
                    <p className="text-sm text-muted-foreground">{t('profile.projectsCount')}</p>
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
                    <p className="text-2xl font-bold">{stats.tasksCount}</p>
                    <p className="text-sm text-muted-foreground">{t('profile.tasksCount')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedCount}</p>
                    <p className="text-sm text-muted-foreground">{t('profile.completedCount')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
            <CardDescription>{t('profile.editProfile')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                <Input
                  id="firstName"
                  defaultValue={user?.firstName}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                <Input
                  id="lastName"
                  defaultValue={user?.lastName}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                defaultValue={user?.username}
                placeholder="Username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email}
                placeholder="Email address"
              />
            </div>
            <div className="flex justify-end">
              <Button>{t('common.save')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
