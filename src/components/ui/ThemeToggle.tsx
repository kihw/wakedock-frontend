import React, { useState } from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme, setTheme, actualTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </span>
        )}
        <button
          onClick={toggleTheme}
          className={`
            relative inline-flex items-center justify-center
            ${sizeClasses[size]}
            rounded-full
            bg-gray-200 dark:bg-gray-700
            hover:bg-gray-300 dark:hover:bg-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-all duration-200 ease-in-out
            theme-toggle
          `}
          aria-label={`Switch to ${themes.find(t => t.value !== theme)?.label || 'next'} theme`}
        >
          <div className="relative">
            <currentTheme.icon 
              className={`
                ${iconSizeClasses[size]}
                transition-all duration-200 ease-in-out
                ${actualTheme === 'dark' ? 'text-yellow-400' : 'text-gray-600'}
              `}
            />
            {theme === 'system' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </button>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-3 py-2
            rounded-lg border
            bg-white dark:bg-gray-800
            border-gray-300 dark:border-gray-600
            hover:bg-gray-50 dark:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-all duration-200 ease-in-out
            ${sizeClasses[size]}
          `}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <currentTheme.icon className={iconSizeClasses[size]} />
          {showLabel && (
            <span className="text-sm font-medium hidden sm:block">
              {currentTheme.label}
            </span>
          )}
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1" role="menu">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value as any);
                      setIsOpen(false);
                    }}
                    className={`
                      flex items-center gap-3 w-full px-4 py-2 text-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors duration-150
                      ${theme === themeOption.value 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                    role="menuitem"
                  >
                    <themeOption.icon className="w-4 h-4" />
                    <span>{themeOption.label}</span>
                    {theme === themeOption.value && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        ${sizeClasses[size]}
        rounded-lg
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transition-all duration-200 ease-in-out
        theme-toggle
        ${className}
      `}
      aria-label={`Current theme: ${currentTheme.label}. Click to switch theme.`}
      title={`Current theme: ${currentTheme.label}`}
    >
      <div className="relative">
        <currentTheme.icon 
          className={`
            ${iconSizeClasses[size]}
            transition-all duration-200 ease-in-out
            ${actualTheme === 'dark' ? 'text-yellow-400' : 'text-gray-600 dark:text-gray-300'}
          `}
        />
        {theme === 'system' && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        )}
      </div>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {currentTheme.label}
        </span>
      )}
    </button>
  );
};

// Color palette component for advanced theme customization
export const ColorPalette: React.FC = () => {
  const { actualTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState<string>('blue');

  const colors = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  ];

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Apply color to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', `var(--color-${color}-600)`);
    root.style.setProperty('--color-primary-hover', `var(--color-${color}-700)`);
    root.style.setProperty('--color-primary-active', `var(--color-${color}-800)`);
    
    // Save to localStorage
    localStorage.setItem('wakedock-primary-color', color);
  };

  // Load saved color on mount
  React.useEffect(() => {
    const savedColor = localStorage.getItem('wakedock-primary-color');
    if (savedColor) {
      setSelectedColor(savedColor);
      handleColorChange(savedColor);
    }
  }, []);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Color Palette
        </h3>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => handleColorChange(color.value)}
            className={`
              relative w-12 h-12 rounded-lg transition-all duration-200
              ${color.class}
              hover:scale-105 hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${selectedColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}
            `}
            aria-label={`Select ${color.name} color`}
            title={color.name}
          >
            {selectedColor === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;