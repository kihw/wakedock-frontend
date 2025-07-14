'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLayoutStore } from '@/lib/stores/layout-store';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileMenu } from './mobile-menu';
import { BottomNavigation } from './bottom-navigation';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { 
    sidebarOpen, 
    mobileMenuOpen, 
    closeSidebarOnMobile, 
    toggleMobileMenu,
    closeMobileMenu,
    handleEscapeKey,
    handleResize 
  } = useLayoutStore();

  // Navigation items for mobile
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/' },
    { id: 'services', label: 'Services', icon: 'container', href: '/services' },
    { id: 'monitoring', label: 'Monitor', icon: 'activity', href: '/monitoring' },
    { id: 'logs', label: 'Logs', icon: 'file-text', href: '/logs' },
    { id: 'backup', label: 'Backup', icon: 'download', href: '/backup', section: 'tools' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart', href: '/analytics', section: 'tools' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings', section: 'admin' },
    { id: 'users', label: 'Users', icon: 'users', href: '/users', section: 'admin' },
    { id: 'profile', label: 'Profile', icon: 'user', href: '/profile', section: 'account' }
  ];

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Handle keyboard events
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) {
          closeMobileMenu();
        } else if (sidebarOpen) {
          handleEscapeKey(event);
        }
      }
    }

    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen, sidebarOpen, closeMobileMenu, handleEscapeKey, handleResize]);

  // Close mobile menu on route change
  useEffect(() => {
    closeSidebarOnMobile();
    closeMobileMenu();
  }, [closeSidebarOnMobile, closeMobileMenu]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div 
      className={`app flex flex-1 bg-background relative ${
        sidebarOpen ? 'sidebar-open' : ''
      } ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}
    >
      {/* Desktop Sidebar */}
      <Sidebar open={sidebarOpen} />

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        menuItems={navigationItems}
        onClose={closeMobileMenu}
      />

      {/* Main Content Area */}
      <div className="main-container flex-1 flex flex-col min-w-0 transition-all duration-200">
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen} 
          onToggleMobileMenu={toggleMobileMenu} 
        />

        {/* Main Content */}
        <main className="main-content flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="content-wrapper flex-1 p-4 lg:p-6 overflow-y-auto bg-background w-full scroll-smooth">
            {children}
          </div>
        </main>

        {/* Desktop Footer */}
        <footer className="app-footer hidden lg:block bg-surface border-t border-border-light p-6 mt-auto backdrop-blur-sm">
          <div className="footer-content flex justify-between items-center gap-6">
            <div className="footer-left flex-1">
              <p className="footer-text text-text-secondary text-sm m-0">
                © 2024 WakeDock. Made with ❤️ for Docker enthusiasts.
              </p>
            </div>
            <div className="footer-right flex items-center gap-6">
              <div className="footer-links flex gap-4">
                <a href="/docs" className="footer-link text-text-secondary text-sm hover:text-primary transition-colors px-2 py-1 rounded">Documentation</a>
                <a href="/api" className="footer-link text-text-secondary text-sm hover:text-primary transition-colors px-2 py-1 rounded">API</a>
                <a href="/support" className="footer-link text-text-secondary text-sm hover:text-primary transition-colors px-2 py-1 rounded">Support</a>
                <a href="https://github.com/wakedock" target="_blank" rel="noopener noreferrer" className="footer-link text-text-secondary text-sm hover:text-primary transition-colors px-2 py-1 rounded">GitHub</a>
              </div>
              <div className="footer-version flex items-center">
                <span className="version-badge bg-gradient-to-r from-primary-600 to-primary-700 text-white px-2 py-1 rounded-full text-xs font-medium font-mono">
                  v1.1.0
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation items={navigationItems.slice(0, 5)} />

      {/* Scroll to Top Button */}
      <button
        className="scroll-to-top fixed bottom-6 right-6 w-11 h-11 bg-primary text-white border-none rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-200 z-50 opacity-0 invisible lg:bottom-6 lg:right-6"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18,15 12,9 6,15" />
        </svg>
      </button>
    </div>
  );
}