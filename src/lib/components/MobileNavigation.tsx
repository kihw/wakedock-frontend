/**
 * Navigation mobile optimisée pour WakeDock
 * Comprend hamburger menu, navigation tactile et gestes
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Container, 
  BarChart3, 
  Settings, 
  User,
  Bell,
  Search,
  Activity,
  Shield,
  Layers,
  Terminal,
  GitBranch,
  Palette
} from 'lucide-react';
import { useBreakpoint, useTouchGestures } from '../utils/responsive';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },
  {
    id: 'containers',
    label: 'Containers',
    icon: Container,
    href: '/containers',
    children: [
      { id: 'containers-list', label: 'Liste', icon: Container, href: '/containers' },
      { id: 'containers-compose', label: 'Compose', icon: Layers, href: '/containers/compose' }
    ]
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: BarChart3,
    href: '/monitoring',
    children: [
      { id: 'monitoring-metrics', label: 'Métriques', icon: BarChart3, href: '/monitoring/metrics' },
      { id: 'monitoring-logs', label: 'Logs', icon: Terminal, href: '/monitoring/logs' },
      { id: 'monitoring-alerts', label: 'Alertes', icon: Bell, href: '/monitoring/alerts' }
    ]
  },
  {
    id: 'security',
    label: 'Sécurité',
    icon: Shield,
    href: '/security'
  },
  {
    id: 'cicd',
    label: 'CI/CD',
    icon: GitBranch,
    href: '/cicd'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    href: '/settings',
    children: [
      { id: 'settings-general', label: 'Général', icon: Settings, href: '/settings' },
      { id: 'settings-theme', label: 'Thème', icon: Palette, href: '/settings/theme' },
      { id: 'settings-profile', label: 'Profil', icon: User, href: '/settings/profile' }
    ]
  }
];

interface MobileNavigationProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPath = '/',
  onNavigate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { isMobile } = useBreakpoint();
  const { isTouch } = useTouchGestures();

  // Fermer le menu quand on passe en mode desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  // Fermer le menu lors du scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  // Gestion des gestes tactiles pour ouvrir/fermer
  useEffect(() => {
    if (!isTouch || !isMobile) return;

    let startX = 0;
    let currentX = 0;
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0 && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && e.touches[0]) {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      const deltaX = currentX - startX;
      const deltaY = Math.abs(currentY - startY);
      
      // Swipe horizontal avec peu de mouvement vertical
      if (Math.abs(deltaX) > 50 && deltaY < 100) {
        // Swipe from left edge to open
        if (deltaX > 0 && startX < 20 && !isOpen) {
          setIsOpen(true);
        }
        // Swipe to left to close
        else if (deltaX < -50 && isOpen) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouch, isMobile, isOpen]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      onNavigate?.(item.href);
      setIsOpen(false);
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = currentPath.startsWith(item.href);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <button
          onClick={() => handleItemClick(item)}
          className={`
            w-full flex items-center justify-between p-3 rounded-lg text-left
            transition-all duration-200 touch-manipulation
            ${isActive 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
            ${isTouch ? 'min-h-[48px]' : 'min-h-[40px]'}
            active:scale-95 active:bg-blue-600
          `}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isMobile) {
    return null; // Ne pas afficher sur desktop
  }

  return (
    <>
      {/* Header mobile avec hamburger */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-between p-4 safe-area-top">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              p-2 rounded-lg touch-manipulation
              ${isTouch ? 'min-w-[48px] min-h-[48px]' : 'min-w-[40px] min-h-[40px]'}
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              active:scale-95 transition-all duration-200
            `}
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            WakeDock
          </h1>

          <div className="flex items-center space-x-2">
            <button className={`
              p-2 rounded-lg touch-manipulation
              ${isTouch ? 'min-w-[48px] min-h-[48px]' : 'min-w-[40px] min-h-[40px]'}
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              active:scale-95 transition-all duration-200
            `}>
              <Search className="w-5 h-5" />
            </button>
            <button className={`
              p-2 rounded-lg touch-manipulation relative
              ${isTouch ? 'min-w-[48px] min-h-[48px]' : 'min-w-[40px] min-h-[40px]'}
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              active:scale-95 transition-all duration-200
            `}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <div
        className={`
          fixed top-0 left-0 z-50 w-80 h-full bg-white dark:bg-gray-900
          transform transition-transform duration-300 ease-in-out md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-xl border-r border-gray-200 dark:border-gray-700
        `}
      >
        {/* Header sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 safe-area-top">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">WakeDock</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className={`
              p-2 rounded-lg touch-manipulation
              ${isTouch ? 'min-w-[48px] min-h-[48px]' : 'min-w-[40px] min-h-[40px]'}
              text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              active:scale-95 transition-all duration-200
            `}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 safe-area-bottom">
          {navigationItems.map(item => renderNavigationItem(item))}
        </div>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Utilisateur
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                admin@wakedock.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
