'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Container, 
  Activity, 
  FileText, 
  Settings 
} from 'lucide-react';
import clsx from 'clsx';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

interface BottomNavigationProps {
  items: NavigationItem[];
}

// Map icon strings to components
const iconMap = {
  dashboard: LayoutDashboard,
  container: Container,
  activity: Activity,
  'file-text': FileText,
  settings: Settings,
};

export function BottomNavigation({ items }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Container;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <IconComponent className={clsx(
                'h-6 w-6 mb-1',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              )} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}