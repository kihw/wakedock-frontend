/**
 * Responsive design utilities for WakeDock
 * Provides breakpoints, device detection, and responsive hooks
 */

// Breakpoints standard pour WakeDock
export const breakpoints = {
  xs: 320,   // Extra small devices (phones)
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536 // 2X large devices (larger desktops)
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Media queries pour CSS-in-JS
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  mobile: `(max-width: ${breakpoints.md - 1}px)`,
  tablet: `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `(min-width: ${breakpoints.lg}px)`,
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)'
} as const;

// Device detection utilities
export const deviceDetection = {
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoints.md;
  },

  isTablet: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
  },

  isDesktop: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints.lg;
  },

  isTouchDevice: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  supportsHover: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover)').matches;
  },

  getOrientation: (): 'portrait' | 'landscape' => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  },

  getViewportSize: (): { width: number; height: number } => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
};

// Hook pour détection de breakpoint
import { useState, useEffect } from 'react';

export function useBreakpoint(): {
  current: Breakpoint | null;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
} {
  const [viewport, setViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return deviceDetection.getViewportSize();
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport(deviceDetection.getViewportSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentBreakpoint = (): Breakpoint | null => {
    const { width } = viewport;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    if (width >= breakpoints.xs) return 'xs';
    return null;
  };

  return {
    current: getCurrentBreakpoint(),
    isMobile: viewport.width < breakpoints.md,
    isTablet: viewport.width >= breakpoints.md && viewport.width < breakpoints.lg,
    isDesktop: viewport.width >= breakpoints.lg,
    width: viewport.width,
    height: viewport.height
  };
}

// Hook pour orientation
export function useOrientation(): {
  orientation: 'portrait' | 'landscape';
  isPortrait: boolean;
  isLandscape: boolean;
} {
  const [orientation, setOrientation] = useState(() => 
    deviceDetection.getOrientation()
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      // Petit délai pour que le viewport se mette à jour
      setTimeout(() => {
        setOrientation(deviceDetection.getOrientation());
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
}

// Hook pour détecter les gestes tactiles
export function useTouchGestures() {
  const [touchInfo, setTouchInfo] = useState({
    isTouch: false,
    supportsHover: true
  });

  useEffect(() => {
    setTouchInfo({
      isTouch: deviceDetection.isTouchDevice(),
      supportsHover: deviceDetection.supportsHover()
    });
  }, []);

  return touchInfo;
}

// Utilitaires pour les classes CSS responsives
export const responsiveUtils = {
  // Génère des classes Tailwind pour différents breakpoints
  responsive: (baseClass: string, variants: Partial<Record<Breakpoint, string>>) => {
    const classes = [baseClass];
    
    Object.entries(variants).forEach(([breakpoint, variant]) => {
      if (variant) {
        classes.push(`${breakpoint}:${variant}`);
      }
    });
    
    return classes.join(' ');
  },

  // Classes pour masquer/afficher selon l'appareil
  hideOn: (devices: ('mobile' | 'tablet' | 'desktop')[]): string => {
    const classes: string[] = [];
    
    if (devices.includes('mobile')) {
      classes.push('md:block', 'hidden');
    }
    if (devices.includes('tablet')) {
      classes.push('lg:block', 'md:hidden');
    }
    if (devices.includes('desktop')) {
      classes.push('lg:hidden');
    }
    
    return classes.join(' ');
  },

  showOn: (devices: ('mobile' | 'tablet' | 'desktop')[]): string => {
    const classes: string[] = [];
    
    if (devices.includes('mobile') && !devices.includes('tablet')) {
      classes.push('md:hidden');
    }
    if (devices.includes('tablet') && !devices.includes('mobile') && !devices.includes('desktop')) {
      classes.push('hidden', 'md:block', 'lg:hidden');
    }
    if (devices.includes('desktop') && !devices.includes('mobile') && !devices.includes('tablet')) {
      classes.push('hidden', 'lg:block');
    }
    
    return classes.join(' ');
  }
};

// Safe area insets pour mobile (notch, etc.)
export const safeArea = {
  top: 'env(safe-area-inset-top)',
  right: 'env(safe-area-inset-right)', 
  bottom: 'env(safe-area-inset-bottom)',
  left: 'env(safe-area-inset-left)'
};

// Classes CSS utilitaires pour safe area
export const safeAreaClasses = {
  paddingTop: 'pt-[env(safe-area-inset-top)]',
  paddingRight: 'pr-[env(safe-area-inset-right)]',
  paddingBottom: 'pb-[env(safe-area-inset-bottom)]',
  paddingLeft: 'pl-[env(safe-area-inset-left)]',
  padding: 'p-[env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)]'
};
