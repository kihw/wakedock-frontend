// Theme Hook - Enhanced theme management
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThemeState } from '@/models/ui/interface';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    themeState: ThemeState;
    updateThemeState: (updates: Partial<ThemeState>) => void;
}

const THEME_STORAGE_KEY = 'wakedock-theme';
const THEME_STATE_STORAGE_KEY = 'wakedock-theme-state';

const defaultThemeState: ThemeState = {
    mode: 'system',
    primaryColor: '#6366f1',
    animations: true,
    reducedMotion: false,
    fontSize: 'md',
    density: 'comfortable',
};

export const useTheme = (): ThemeContextType => {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const [themeState, setThemeStateState] = useState<ThemeState>(defaultThemeState);
    const [mounted, setMounted] = useState(false);

    // Initialize theme from storage
    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        const savedThemeState = localStorage.getItem(THEME_STATE_STORAGE_KEY);

        if (savedTheme) {
            setThemeState(savedTheme);
        }

        if (savedThemeState) {
            try {
                const parsed = JSON.parse(savedThemeState);
                setThemeStateState({ ...defaultThemeState, ...parsed });
            } catch (error) {
                console.error('Error parsing theme state:', error);
            }
        }

        setMounted(true);
    }, []);

    // Resolve theme based on system preference
    const resolveTheme = useCallback((currentTheme: Theme): 'light' | 'dark' => {
        if (currentTheme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return currentTheme;
    }, []);

    // Apply theme to document
    const applyTheme = useCallback((resolved: 'light' | 'dark') => {
        const root = document.documentElement;

        // Remove existing theme classes
        root.classList.remove('light', 'dark');

        // Add new theme class
        root.classList.add(resolved);

        // Set data attribute for CSS variables
        root.setAttribute('data-theme', resolved);

        // Set color scheme meta tag
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', resolved === 'dark' ? '#1a1a1a' : '#ffffff');
        }
    }, []);

    // Update resolved theme when theme changes
    useEffect(() => {
        if (!mounted) return;

        const resolved = resolveTheme(theme);
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, [theme, mounted, resolveTheme, applyTheme]);

    // Listen for system theme changes
    useEffect(() => {
        if (!mounted || theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const resolved = resolveTheme(theme);
            setResolvedTheme(resolved);
            applyTheme(resolved);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted, resolveTheme, applyTheme]);

    // Listen for reduced motion preference
    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = () => {
            setThemeStateState(prev => ({
                ...prev,
                reducedMotion: mediaQuery.matches,
            }));
        };

        handleChange(); // Initial check
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mounted]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        if (theme === 'system') {
            const resolved = resolveTheme(theme);
            setTheme(resolved === 'light' ? 'dark' : 'light');
        } else {
            setTheme(theme === 'light' ? 'dark' : 'light');
        }
    }, [theme, resolveTheme, setTheme]);

    const updateThemeState = useCallback((updates: Partial<ThemeState>) => {
        setThemeStateState(prev => {
            const newState = { ...prev, ...updates };
            localStorage.setItem(THEME_STATE_STORAGE_KEY, JSON.stringify(newState));
            return newState;
        });
    }, []);

    return {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        themeState,
        updateThemeState,
    };
};
