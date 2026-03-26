'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckSquare, Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement actual password reset API call when backend endpoint is ready
      // await authService.forgotPassword(email);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state - email sent confirmation
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('auth.emailSent') || 'Email envoyé'}</CardTitle>
            <CardDescription>
              {t('auth.forgotPasswordSuccess') || `Si un compte existe avec l'adresse ${email}, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.`}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('auth.backToLogin') || 'Retour à la connexion'}
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t('auth.didntReceiveEmail') || "Vous n'avez pas reçu l'email ?"}{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-primary hover:underline"
              >
                {t('auth.tryAgain') || 'Réessayer'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-2xl">{t('auth.forgotPasswordTitle') || 'Mot de passe oublié'}</CardTitle>
          <CardDescription>
            {t('auth.forgotPasswordDesc') || "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe."}
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
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder') || 'exemple@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
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
                t('auth.sendResetLink') || 'Envoyer le lien de réinitialisation'
              )}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('auth.backToLogin') || 'Retour à la connexion'}
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
