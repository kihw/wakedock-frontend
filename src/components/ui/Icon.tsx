import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import * as LucideIcons from 'lucide-react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: keyof typeof LucideIcons | string;
  size?: IconSize | number;
  variant?: IconVariant;
  spin?: boolean;
  pulse?: boolean;
  clickable?: boolean;
  ariaLabel?: string;
}

const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      name,
      size = 'md',
      variant = 'default',
      spin = false,
      pulse = false,
      clickable = false,
      ariaLabel,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
      '2xl': 'w-10 h-10',
    };

    // Variant classes
    const variantClasses = {
      default: 'text-current',
      primary: 'text-blue-600 dark:text-blue-400',
      secondary: 'text-gray-600 dark:text-gray-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      info: 'text-blue-600 dark:text-blue-400',
    };

    // Build classes
    const classes = clsx(
      'inline-block flex-shrink-0',
      typeof size === 'string' ? sizeClasses[size as IconSize] : '',
      variantClasses[variant],
      spin ? 'animate-spin' : '',
      pulse ? 'animate-pulse' : '',
      clickable ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : '',
      className
    );

    // Custom size style
    const customSizeStyle = typeof size === 'number' ? {
      width: `${size}px`,
      height: `${size}px`,
    } : {};

    // Get the icon component
    const getIconComponent = () => {
      // Try to get from Lucide Icons
      if (name in LucideIcons) {
        const LucideIcon = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<any>;
        return LucideIcon;
      }

      // If not found, return a fallback icon (Square for unknown icons)
      return LucideIcons.Square;
    };

    const IconComponent = getIconComponent();

    // Handle keyboard events for clickable icons
    const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
      if (!clickable) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event as any);
      }
    };

    return (
      <IconComponent
        ref={ref}
        className={classes}
        style={customSizeStyle}
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';

export default Icon;

// Export commonly used icons for convenience
export const {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Edit,
  Eye,
  EyeOff,
  Home,
  Info,
  Loader,
  Lock,
  Mail,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Star,
  Trash,
  User,
  X,
  XCircle,
} = LucideIcons;
