/**
 * API Service pour la gestion des préférences de thème utilisateur
 */

import React from 'react';
import { ThemePreferences, useThemeStore } from '../stores/theme';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserThemePreferences {
    id?: number;
    user_id: number;
    theme_mode: 'light' | 'dark' | 'auto';
    custom_colors: Record<string, string>;
    animations_enabled: boolean;
    transitions_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

class ThemeApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = localStorage.getItem('wakedock-auth-token');

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Récupère les préférences de thème de l'utilisateur
     */
    async getUserThemePreferences(): Promise<UserThemePreferences | null> {
        try {
            return await this.request<UserThemePreferences>('/api/v1/users/theme-preferences');
        } catch (error) {
            console.warn('Erreur lors de la récupération des préférences de thème:', error);
            return null;
        }
    }

    /**
     * Sauvegarde les préférences de thème de l'utilisateur
     */
    async saveUserThemePreferences(preferences: ThemePreferences): Promise<UserThemePreferences> {
        const payload = {
            theme_mode: preferences.mode,
            custom_colors: preferences.customColors || {},
            animations_enabled: preferences.animations,
            transitions_enabled: preferences.transitions
        };

        return this.request<UserThemePreferences>('/api/v1/users/theme-preferences', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }

    /**
     * Supprime les préférences de thème personnalisées
     */
    async resetUserThemePreferences(): Promise<void> {
        return this.request<void>('/api/v1/users/theme-preferences', {
            method: 'DELETE',
        });
    }

    /**
     * Exporte les préférences de thème
     */
    async exportThemePreferences(): Promise<Blob> {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/theme-preferences/export`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('wakedock-auth-token')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Export Error: ${response.status} ${response.statusText}`);
        }

        return response.blob();
    }

    /**
     * Importe des préférences de thème
     */
    async importThemePreferences(file: File): Promise<UserThemePreferences> {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('wakedock-auth-token');
        const response = await fetch(`${API_BASE_URL}/api/v1/users/theme-preferences/import`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Import Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
}

// Instance singleton
export const themeApiService = new ThemeApiService();

// Hook pour utiliser l'API de thème avec synchronisation automatique
export const useThemeSync = () => {
    const { preferences, initTheme } = useThemeStore();
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [lastSyncError, setLastSyncError] = React.useState<string | null>(null);

    // Charge les préférences depuis l'API au démarrage
    const loadFromAPI = React.useCallback(async () => {
        try {
            setIsSyncing(true);
            setLastSyncError(null);

            const apiPreferences = await themeApiService.getUserThemePreferences();

            if (apiPreferences) {
                const localPreferences: ThemePreferences = {
                    mode: apiPreferences.theme_mode,
                    colorScheme: apiPreferences.theme_mode === 'auto' ? 'light' : apiPreferences.theme_mode,
                    customColors: apiPreferences.custom_colors || {},
                    animations: apiPreferences.animations_enabled,
                    transitions: apiPreferences.transitions_enabled
                };

                // Met à jour le store local avec les préférences de l'API
                useThemeStore.setState({ preferences: localPreferences });

                // Réinitialise le thème pour appliquer les nouveaux paramètres
                initTheme();
            }
        } catch (error) {
            console.warn('Impossible de charger les préférences depuis l\'API:', error);
            setLastSyncError(error instanceof Error ? error.message : 'Erreur inconnue');
        } finally {
            setIsSyncing(false);
        }
    }, [initTheme]);

    // Sauvegarde les préférences vers l'API
    const saveToAPI = React.useCallback(async (preferencesToSave?: ThemePreferences) => {
        try {
            setIsSyncing(true);
            setLastSyncError(null);

            const currentPreferences = preferencesToSave || preferences;
            await themeApiService.saveUserThemePreferences(currentPreferences);

        } catch (error) {
            console.warn('Impossible de sauvegarder les préférences vers l\'API:', error);
            setLastSyncError(error instanceof Error ? error.message : 'Erreur inconnue');
        } finally {
            setIsSyncing(false);
        }
    }, [preferences]);

    // Synchronisation automatique des changements
    React.useEffect(() => {
        loadFromAPI();
    }, [loadFromAPI]);

    // Sauvegarde automatique lors des changements de préférences
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            saveToAPI();
        }, 1000); // Debounce de 1 seconde

        return () => clearTimeout(timeoutId);
    }, [preferences, saveToAPI]);

    return {
        isSyncing,
        lastSyncError,
        loadFromAPI,
        saveToAPI,
        clearError: () => setLastSyncError(null)
    };
};

export default themeApiService;
