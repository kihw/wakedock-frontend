'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Container, 
  Activity, 
  FileText, 
  Download, 
  BarChart3, 
  Settings, 
  Users, 
  User,
  X 
} from 'lucide-react';
import { useLayoutStore } from '@/lib/stores/layout-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import clsx from 'clsx';

interface SidebarProps {
  open: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  section?: string;
  adminOnly?: boolean;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'services', label: 'Services', icon: Container, href: '/services' },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, href: '/monitoring' },
  { id: 'logs', label: 'Logs', icon: FileText, href: '/logs' },
  { id: 'backup', label: 'Backup', icon: Download, href: '/backup', section: 'tools' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics', section: 'tools' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', section: 'admin', adminOnly: true },
  { id: 'users', label: 'Users', icon: Users, href: '/users', section: 'admin', adminOnly: true },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile', section: 'account' }
];

export function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();
  const { setSidebarOpen } = useLayoutStore();
  const { user } = useAuthStore();

  const isAdmin = user?.roles?.includes('admin') || user?.role === 'admin';

  const filteredItems = navigationItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    const section = item.section || 'main';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  const sectionLabels = {
    main: '',
    tools: 'Tools',
    admin: 'Administration',
    account: 'Account'
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="WakeDock"
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                WakeDock
              </span>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
            {Object.entries(groupedItems).map(([section, items]) => (
              <div key={section}>
                {sectionLabels[section as keyof typeof sectionLabels] && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {sectionLabels[section as keyof typeof sectionLabels]}
                  </h3>
                )}
                <div className="space-y-1">
                  {items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          // Close sidebar on mobile after navigation
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={clsx(
                          'group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <Icon className={clsx(
                          'h-5 w-5 flex-shrink-0',
                          isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                        )} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              WakeDock v1.1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}