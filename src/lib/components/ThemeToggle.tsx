/**
 * ThemeToggle - Composant pour basculer entre les thèmes
 */
import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '../stores/theme';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const { preferences, activeTheme, setMode, toggleTheme } = useThemeStore();

  const getIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return <Sun className={getIconSize()} />;
      case 'dark':
        return <Moon className={getIconSize()} />;
      case 'auto':
        return <Monitor className={getIconSize()} />;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'p-2';
      case 'md':
        return 'p-2.5';
      case 'lg':
        return 'p-3';
    }
  };

  const getLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Thème clair';
      case 'dark':
        return 'Thème sombre';
      case 'auto':
        return 'Automatique';
    }
  };

  // Variante bouton simple (toggle)
  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          ${getButtonSize()}
          rounded-lg
          bg-surface hover:bg-surface-light
          border border-border
          text-text
          transition-all duration-200
          hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-primary/50
          ${className}
        `}
        title={`Basculer vers le thème ${activeTheme === 'light' ? 'sombre' : 'clair'}`}
        aria-label="Basculer le thème"
      >
        <div className="flex items-center gap-2">
          {getIcon(activeTheme === 'light' ? 'dark' : 'light')}
          {showLabel && (
            <span className="text-sm font-medium">
              {getLabel(activeTheme === 'light' ? 'dark' : 'light')}
            </span>
          )}
        </div>
      </button>
    );
  }

  // Variante dropdown
  if (variant === 'dropdown') {
    const modes: ThemeMode[] = ['light', 'dark', 'auto'];

    return (
      <div className={`relative ${className}`}>
        <select
          value={preferences.mode}
          onChange={(e) => setMode(e.target.value as ThemeMode)}
          className={`
            ${getButtonSize()}
            pl-10
            rounded-lg
            bg-surface hover:bg-surface-light
            border border-border
            text-text
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/50
            cursor-pointer
          `}
          aria-label="Choisir le mode de thème"
        >
          {modes.map((mode) => (
            <option key={mode} value={mode}>
              {showLabel ? getLabel(mode) : mode}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {getIcon(preferences.mode)}
        </div>
      </div>
    );
  }

  // Variante switch
  if (variant === 'switch') {
    const modes: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(preferences.mode);

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-text-muted">Thème</span>
        )}
        <div className="flex bg-surface border border-border rounded-lg p-1">
          {modes.map((mode, index) => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`
                ${getButtonSize()}
                rounded-md
                transition-all duration-200
                flex items-center gap-2
                ${
                  preferences.mode === mode
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-light'
                }
              `}
              title={getLabel(mode)}
              aria-label={getLabel(mode)}
              aria-pressed={preferences.mode === mode}
            >
              {getIcon(mode)}
              {showLabel && <span className="text-xs">{mode}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default ThemeToggle;
