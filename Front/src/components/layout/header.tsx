'use client';

import { useTranslations } from '@/lib/i18n-context';
import { useAppStore, Locale } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Globe, Moon, Sun, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const t = useTranslations();
  const { locale, setLocale } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">{title || t('common.appName')}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5" />
              <span className="sr-only">{t('settings.language')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleLocaleChange('en')}
              className={locale === 'en' ? 'bg-accent' : ''}
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleLocaleChange('fr')}
              className={locale === 'fr' ? 'bg-accent' : ''}
            >
              Français
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t('settings.theme')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              {t('common.light')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              {t('common.dark')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              {t('common.system')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">{t('nav.notifications')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-2">
              <p className="font-medium">{t('nav.notifications')}</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('notifications.none') || 'No new notifications'}</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {user ? getInitials(user.firstName || user.username || 'U') : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">{t('nav.profile')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/profile">{t('nav.profile')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">{t('nav.settings')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
