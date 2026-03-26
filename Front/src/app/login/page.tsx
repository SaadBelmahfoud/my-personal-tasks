'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n-context';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({
        usernameOrEmail,
        password,
      });

      setAuth({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      router.push('/');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl">MyPersonalTasks</span>
            </div>
          </div>
          <CardTitle className="text-2xl">{t('auth.loginTitle')}</CardTitle>
          <CardDescription>
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="text-primary hover:underline">
              {t('auth.signUp')}
            </Link>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">{t('auth.usernameOrEmail') || 'Username or Email'}</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder={t('auth.usernameOrEmailPlaceholder') || 'Enter your username or email'}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  {t('auth.rememberMe')}
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('auth.signIn')
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
