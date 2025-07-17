/**
 * Theme Store - Gestion du système de thèmes clair/sombre avec Zustand
 */
import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types de thèmes
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'light' | 'dark';

// Interface des préférences de thème
export interface ThemePreferences {
    mode: ThemeMode;
    colorScheme: ColorScheme;
    customColors: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
        surface?: string;
        text?: string;
    };
    animations: boolean;
    transitions: boolean;
}

// Interface du store de thème
interface ThemeStore {
    preferences: ThemePreferences;
    systemTheme: ColorScheme;
    activeTheme: ColorScheme;
    isInitialized: boolean;

    // Actions
    initTheme: () => void;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
    setCustomColors: (colors: Partial<ThemePreferences['customColors']>) => void;
    resetCustomColors: () => void;
    setAnimations: (enabled: boolean) => void;
    setTransitions: (enabled: boolean) => void;
    updateSystemTheme: (theme: ColorScheme) => void;
    exportPreferences: () => string;
    importPreferences: (json: string) => boolean;
}

// Préférences par défaut
const defaultPreferences: ThemePreferences = {
    mode: 'auto',
    colorScheme: 'light',
    customColors: {},
    animations: true,
    transitions: true
};

// Variables CSS de base pour chaque thème
const getBaseThemeVariables = (theme: ColorScheme): Record<string, string> => {
    if (theme === 'dark') {
        return {
            '--color-primary': '#3b82f6',
            '--color-primary-light': '#60a5fa',
            '--color-primary-dark': '#1d4ed8',
            '--color-secondary': '#6366f1',
            '--color-secondary-light': '#818cf8',
            '--color-secondary-dark': '#4338ca',
            '--color-accent': '#f59e0b',
            '--color-accent-light': '#fbbf24',
            '--color-accent-dark': '#d97706',
            '--color-success': '#10b981',
            '--color-warning': '#f59e0b',
            '--color-danger': '#ef4444',
            '--color-info': '#3b82f6',
            '--color-background': '#0f172a',
            '--color-background-light': '#1e293b',
            '--color-background-lighter': '#334155',
            '--color-surface': '#1e293b',
            '--color-surface-light': '#334155',
            '--color-surface-dark': '#0f172a',
            '--color-text': '#f8fafc',
            '--color-text-light': '#cbd5e1',
            '--color-text-dark': '#e2e8f0',
            '--color-text-muted': '#94a3b8',
            '--color-border': '#334155',
            '--color-border-light': '#475569',
            '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
            '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
            '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        };
    } else {
        return {
            '--color-primary': '#3b82f6',
            '--color-primary-light': '#93c5fd',
            '--color-primary-dark': '#1e40af',
            '--color-secondary': '#6366f1',
            '--color-secondary-light': '#a5b4fc',
            '--color-secondary-dark': '#3730a3',
            '--color-accent': '#f59e0b',
            '--color-accent-light': '#fcd34d',
            '--color-accent-dark': '#b45309',
            '--color-success': '#10b981',
            '--color-warning': '#f59e0b',
            '--color-danger': '#ef4444',
            '--color-info': '#3b82f6',
            '--color-background': '#ffffff',
            '--color-background-light': '#f8fafc',
            '--color-background-lighter': '#f1f5f9',
            '--color-surface': '#ffffff',
            '--color-surface-light': '#f8fafc',
            '--color-surface-dark': '#f1f5f9',
            '--color-text': '#0f172a',
            '--color-text-light': '#475569',
            '--color-text-dark': '#1e293b',
            '--color-text-muted': '#64748b',
            '--color-border': '#e2e8f0',
            '--color-border-light': '#f1f5f9',
            '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        };
    }
};

// Calcul du thème actif
const calculateActiveTheme = (preferences: ThemePreferences, systemTheme: ColorScheme): ColorScheme => {
    if (preferences.mode === 'auto') {
        return systemTheme;
    }
    return preferences.colorScheme;
};

// Application des variables CSS
const applyThemeVariables = (preferences: ThemePreferences, activeTheme: ColorScheme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const baseVariables = getBaseThemeVariables(activeTheme);
    const customVariables = preferences.customColors || {};

    // Applique les variables de base
    Object.entries(baseVariables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });

    // Applique les couleurs personnalisées
    Object.entries(customVariables).forEach(([key, value]) => {
        if (value) {
            root.style.setProperty(`--color-${key}`, value);
        }
    });

    // Applique la classe de thème
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${activeTheme}`);

    // Met à jour l'attribut data-theme pour compatibilité
    document.documentElement.setAttribute('data-theme', activeTheme);

    // Gère les animations et transitions
    if (!preferences.animations) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }

    if (!preferences.transitions) {
        document.body.classList.add('no-transitions');
    } else {
        document.body.classList.remove('no-transitions');
    }
};

// Store Zustand avec persistance
export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            preferences: defaultPreferences,
            systemTheme: 'light',
            activeTheme: 'light',
            isInitialized: false,

            initTheme: () => {
                if (typeof window === 'undefined') return;

                const state = get();

                // Détecte le thème système
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const systemTheme = mediaQuery.matches ? 'dark' : 'light';

                // Calcule le thème actif
                const activeTheme = calculateActiveTheme(state.preferences, systemTheme);

                // Met à jour le state
                set({
                    systemTheme,
                    activeTheme,
                    isInitialized: true
                });

                // Applique le thème
                applyThemeVariables(state.preferences, activeTheme);

                // Écoute les changements du thème système
                mediaQuery.addEventListener('change', (e) => {
                    const newSystemTheme = e.matches ? 'dark' : 'light';
                    const newActiveTheme = calculateActiveTheme(state.preferences, newSystemTheme);

                    set({
                        systemTheme: newSystemTheme,
                        activeTheme: newActiveTheme
                    });

                    applyThemeVariables(state.preferences, newActiveTheme);
                });
            },

            setMode: (mode: ThemeMode) => {
                const state = get();
                const newPreferences = { ...state.preferences, mode };
                const newActiveTheme = calculateActiveTheme(newPreferences, state.systemTheme);

                // Si on passe en mode manuel, on définit le colorScheme
                if (mode !== 'auto') {
                    newPreferences.colorScheme = mode as ColorScheme;
                }

                set({
                    preferences: newPreferences,
                    activeTheme: newActiveTheme
                });

                applyThemeVariables(newPreferences, newActiveTheme);
            },

            toggleTheme: () => {
                const state = get();
                const newColorScheme: ColorScheme = state.activeTheme === 'light' ? 'dark' : 'light';
                const newPreferences: ThemePreferences = {
                    ...state.preferences,
                    mode: newColorScheme,
                    colorScheme: newColorScheme
                };

                set({
                    preferences: newPreferences,
                    activeTheme: newColorScheme
                });

                applyThemeVariables(newPreferences, newColorScheme);
            },

            setCustomColors: (colors: Partial<ThemePreferences['customColors']>) => {
                const state = get();
                const newPreferences = {
                    ...state.preferences,
                    customColors: { ...state.preferences.customColors, ...colors }
                };

                set({ preferences: newPreferences });
                applyThemeVariables(newPreferences, state.activeTheme);
            },

            resetCustomColors: () => {
                const state = get();
                const newPreferences = {
                    ...state.preferences,
                    customColors: {}
                };

                set({ preferences: newPreferences });
                applyThemeVariables(newPreferences, state.activeTheme);
            },

            setAnimations: (enabled: boolean) => {
                const state = get();
                const newPreferences = {
                    ...state.preferences,
                    animations: enabled
                };

                set({ preferences: newPreferences });
                applyThemeVariables(newPreferences, state.activeTheme);
            },

            setTransitions: (enabled: boolean) => {
                const state = get();
                const newPreferences = {
                    ...state.preferences,
                    transitions: enabled
                };

                set({ preferences: newPreferences });
                applyThemeVariables(newPreferences, state.activeTheme);
            },

            updateSystemTheme: (theme: ColorScheme) => {
                const state = get();
                const newActiveTheme = calculateActiveTheme(state.preferences, theme);

                set({
                    systemTheme: theme,
                    activeTheme: newActiveTheme
                });

                applyThemeVariables(state.preferences, newActiveTheme);
            },

            exportPreferences: () => {
                const state = get();
                return JSON.stringify(state.preferences, null, 2);
            },

            importPreferences: (json: string): boolean => {
                try {
                    const preferences = JSON.parse(json);
                    const state = get();
                    const newPreferences = { ...defaultPreferences, ...preferences };
                    const newActiveTheme = calculateActiveTheme(newPreferences, state.systemTheme);

                    set({
                        preferences: newPreferences,
                        activeTheme: newActiveTheme
                    });

                    applyThemeVariables(newPreferences, newActiveTheme);
                    return true;
                } catch {
                    return false;
                }
            }
        }),
        {
            name: 'wakedock-theme-preferences',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ preferences: state.preferences })
        }
    )
);

// Hook utilitaire pour l'initialisation
export const useThemeInit = () => {
    const { initTheme, isInitialized } = useThemeStore();

    React.useEffect(() => {
        if (!isInitialized) {
            initTheme();
        }
    }, [initTheme, isInitialized]);
};
