'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  section?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  menuItems: MenuItem[];
  onClose: () => void;
}

export function MobileMenu({ isOpen, menuItems, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  const groupedItems = menuItems.reduce((acc, item) => {
    const section = item.section || 'main';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const sectionLabels = {
    main: '',
    tools: 'Tools',
    admin: 'Administration', 
    account: 'Account'
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Menu */}
      <div className={clsx(
        'fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
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

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onClose}
                        className={clsx(
                          'group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <span className={clsx(
                          'h-5 w-5 flex-shrink-0',
                          isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                        )}>
                          {/* Icon placeholder - you could map icon strings to components */}
                          📱
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}