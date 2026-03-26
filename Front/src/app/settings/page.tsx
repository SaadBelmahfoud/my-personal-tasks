'use client';

import { useTranslations } from '@/lib/i18n-context';
import { useAppStore, Locale } from '@/stores/app-store';
import { Header } from '@/components/layout/header';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { useState } from 'react';

export default function SettingsPage() {
  const t = useTranslations();
  const { locale, setLocale } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <Header title={t('settings.title')} />
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
        {/* Language & Theme */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.preferences')}</CardTitle>
            <CardDescription>{t('settings.language')} & {t('settings.theme')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.language')}</Label>
              <Select
                value={locale}
                onValueChange={(value: Locale) => setLocale(value)}
              >
                <SelectTrigger id="language" className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">{t('settings.theme')}</Label>
              <Select
                value={theme}
                onValueChange={(value: string) => setTheme(value)}
              >
                <SelectTrigger id="theme" className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('common.light')}</SelectItem>
                  <SelectItem value="dark">{t('common.dark')}</SelectItem>
                  <SelectItem value="system">{t('common.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.notifications')}</CardTitle>
            <CardDescription>{t('settings.emailNotifications')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.emailNotifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.emailNotificationsDesc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.pushNotifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.pushNotificationsDesc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.taskReminders')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.taskRemindersDesc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.projectUpdates')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.projectUpdatesDesc')}
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.security')}</CardTitle>
            <CardDescription>{t('settings.changePassword')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t('settings.currentPassword')}</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('settings.newPassword')}</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('settings.confirmNewPassword')}</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button>{t('settings.changePassword')}</Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            {saved ? t('settings.saved') : t('common.save')}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
