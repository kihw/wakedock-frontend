/**
 * ThemeProvider - Fournisseur de contexte pour le système de thèmes
 */
import React, { useEffect } from 'react';
import { useThemeStore } from '../stores/theme';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const { initTheme, isInitialized } = useThemeStore();

    useEffect(() => {
        if (!isInitialized) {
            initTheme();
        }
    }, [initTheme, isInitialized]);

    return <>{children}</>;
};

export default ThemeProvider;
