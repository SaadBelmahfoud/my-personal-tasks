'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/i18n-context';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'projects', icon: FolderKanban },
  { href: '/tasks', label: 'tasks', icon: CheckSquare },
  { href: '/calendar', label: 'calendar', icon: Calendar },
];

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { logout, user } = useAuthStore();

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-background transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">MyPersonalTasks</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="h-8 w-8"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{t(item.label)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-2">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
            pathname === '/settings' && 'bg-accent text-accent-foreground'
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!sidebarCollapsed && <span>{t('settings')}</span>}
        </Link>

        {user && (
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {user.firstName?.[0] || user.username?.[0] || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 truncate">
                <p className="font-medium truncate">{user.firstName || user.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground',
            sidebarCollapsed && 'justify-center'
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!sidebarCollapsed && <span>{t('logout')}</span>}
        </Button>
      </div>
    </aside>
  );
}
