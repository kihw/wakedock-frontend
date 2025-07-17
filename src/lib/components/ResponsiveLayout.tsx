/**
 * Layout responsive pour WakeDock
 * Adapte automatiquement l'interface selon l'appareil et l'orientation
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { useBreakpoint, useOrientation, useTouchGestures } from '../utils/responsive';
import MobileNavigation from './MobileNavigation';

interface ResponsiveLayoutProps {
    children: ReactNode;
    currentPath?: string;
    onNavigate?: (href: string) => void;
    header?: ReactNode;
    sidebar?: ReactNode;
    className?: string;
    enableMobileSwipe?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
    children,
    currentPath = '/',
    onNavigate,
    header,
    sidebar,
    className = '',
    enableMobileSwipe = true
}) => {
    const { isMobile, isTablet, isDesktop, width, height } = useBreakpoint();
    const { orientation, isPortrait } = useOrientation();
    const { isTouch, supportsHover } = useTouchGestures();
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    // Détection du clavier virtuel sur mobile
    useEffect(() => {
        if (!isMobile) return;

        const initialHeight = window.visualViewport?.height || window.innerHeight;

        const handleViewportChange = () => {
            const currentHeight = window.visualViewport?.height || window.innerHeight;
            const heightDifference = initialHeight - currentHeight;

            // Si la hauteur diminue de plus de 150px, on considère que le clavier est ouvert
            setIsKeyboardOpen(heightDifference > 150);
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
            return () => {
                if (window.visualViewport) {
                    window.visualViewport.removeEventListener('resize', handleViewportChange);
                }
            };
        } else {
            window.addEventListener('resize', handleViewportChange);
            return () => window.removeEventListener('resize', handleViewportChange);
        }
    }, [isMobile]);

    // Classes CSS dynamiques selon le contexte
    const getLayoutClasses = () => {
        const classes = [
            'min-h-screen',
            'bg-gray-50',
            'dark:bg-gray-900',
            'transition-all',
            'duration-300',
            className
        ];

        // Support des safe areas pour les appareils avec notch
        if (isMobile) {
            classes.push(
                'pt-[env(safe-area-inset-top)]',
                'pb-[env(safe-area-inset-bottom)]',
                'pl-[env(safe-area-inset-left)]',
                'pr-[env(safe-area-inset-right)]'
            );
        }

        // Adaptations selon l'orientation
        if (isMobile && isPortrait) {
            classes.push('flex', 'flex-col');
        }

        // Adaptations pour le clavier virtuel
        if (isKeyboardOpen) {
            classes.push('h-[100vh]', 'overflow-hidden');
        }

        // Support tactile
        if (isTouch) {
            classes.push('touch-manipulation');
        }

        return classes.join(' ');
    };

    const getContentClasses = () => {
        const classes = ['flex-1', 'overflow-auto'];

        if (isMobile) {
            classes.push(
                'pt-16', // Espace pour le header mobile
                'px-4',
                'pb-4'
            );

            if (isKeyboardOpen) {
                classes.push('pb-0');
            }
        } else if (isTablet) {
            classes.push('p-6');
        } else {
            classes.push('p-8');
        }

        return classes.join(' ');
    };

    // Layout mobile
    if (isMobile) {
        return (
            <div className={getLayoutClasses()}>
                <MobileNavigation
                    currentPath={currentPath}
                    onNavigate={onNavigate}
                    className="z-50"
                />

                <main className={getContentClasses()}>
                    {/* Container adapté au mobile */}
                    <div className="max-w-full">
                        {children}
                    </div>
                </main>

                {/* Indicateur de connexion/statut en bas pour mobile */}
                <div className="fixed bottom-4 right-4 z-40">
                    <div className="bg-green-500 w-3 h-3 rounded-full shadow-lg"></div>
                </div>
            </div>
        );
    }

    // Layout tablette
    if (isTablet) {
        return (
            <div className={getLayoutClasses()}>
                <div className="flex h-screen">
                    {/* Sidebar réduite pour tablette */}
                    {sidebar && (
                        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                            {sidebar}
                        </aside>
                    )}

                    <div className="flex-1 flex flex-col">
                        {/* Header tablette */}
                        {header && (
                            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                                {header}
                            </header>
                        )}

                        <main className={getContentClasses()}>
                            <div className="max-w-6xl mx-auto">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }

    // Layout desktop
    return (
        <div className={getLayoutClasses()}>
            <div className="flex h-screen">
                {/* Sidebar complète pour desktop */}
                {sidebar && (
                    <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                        {sidebar}
                    </aside>
                )}

                <div className="flex-1 flex flex-col">
                    {/* Header desktop */}
                    {header && (
                        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
                            {header}
                        </header>
                    )}

                    <main className={getContentClasses()}>
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

// Hook pour informations sur le layout actuel
export function useLayoutInfo() {
    const { isMobile, isTablet, isDesktop, width, height } = useBreakpoint();
    const { orientation, isPortrait, isLandscape } = useOrientation();
    const { isTouch, supportsHover } = useTouchGestures();

    return {
        device: {
            isMobile,
            isTablet,
            isDesktop,
            isTouch,
            supportsHover
        },
        viewport: {
            width,
            height,
            orientation,
            isPortrait,
            isLandscape
        },
        layout: {
            containerMaxWidth: isMobile ? 'full' : isTablet ? '6xl' : '7xl',
            sidebarWidth: isMobile ? 0 : isTablet ? 256 : 288,
            headerHeight: isMobile ? 64 : 72,
            contentPadding: isMobile ? 16 : isTablet ? 24 : 32
        }
    };
}

// Composant pour content adaptatif
interface ResponsiveContentProps {
    children: ReactNode;
    mobileLayout?: ReactNode;
    tabletLayout?: ReactNode;
    desktopLayout?: ReactNode;
    className?: string;
}

export const ResponsiveContent: React.FC<ResponsiveContentProps> = ({
    children,
    mobileLayout,
    tabletLayout,
    desktopLayout,
    className = ''
}) => {
    const { isMobile, isTablet, isDesktop } = useBreakpoint();

    const content = (() => {
        if (isMobile && mobileLayout) return mobileLayout;
        if (isTablet && tabletLayout) return tabletLayout;
        if (isDesktop && desktopLayout) return desktopLayout;
        return children;
    })();

    return (
        <div className={`responsive-content ${className}`}>
            {content}
        </div>
    );
};

// Composant pour affichage conditionnel selon l'appareil
interface ShowOnProps {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
    touch?: boolean;
    hover?: boolean;
    children: ReactNode;
    className?: string;
}

export const ShowOn: React.FC<ShowOnProps> = ({
    mobile = false,
    tablet = false,
    desktop = false,
    touch = false,
    hover = false,
    children,
    className = ''
}) => {
    const { isMobile, isTablet, isDesktop } = useBreakpoint();
    const { isTouch, supportsHover } = useTouchGestures();

    const shouldShow = (() => {
        if (mobile && isMobile) return true;
        if (tablet && isTablet) return true;
        if (desktop && isDesktop) return true;
        if (touch && isTouch) return true;
        if (hover && supportsHover) return true;
        return false;
    })();

    if (!shouldShow) return null;

    return <div className={className}>{children}</div>;
};

export default ResponsiveLayout;
