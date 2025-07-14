import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { User } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'square' | 'rounded';
  colorVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  status?: 'online' | 'offline' | 'away' | 'busy';
  statusPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  border?: boolean;
  borderColor?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  backgroundColor?: string;
  textColor?: string;
  clickable?: boolean;
  loading?: boolean;
  href?: string;
  target?: string;
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onImageLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      name,
      initials,
      size = 'md',
      variant = 'circle',
      colorVariant = 'neutral',
      status,
      statusPosition = 'bottom-right',
      border = false,
      borderColor = 'border-gray-300',
      fallbackIcon: FallbackIcon,
      backgroundColor,
      textColor,
      clickable = false,
      loading = false,
      href,
      target,
      className,
      onClick,
      onImageError,
      onImageLoad,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Computed values
    const displayInitials = initials || getInitials(name);
    const hasImage = src && !imageError;
    const hasInitials = displayInitials && !hasImage;
    const hasFallbackIcon = FallbackIcon && !hasImage && !hasInitials;
    const isInteractive = clickable || href;
    const isLink = href !== undefined;

    // Color variants
    const colorVariants = {
      primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    // Size classes
    const sizeClasses = {
      xs: {
        container: 'w-6 h-6',
        text: 'text-xs',
        icon: 'w-3 h-3',
        status: 'w-2 h-2',
      },
      sm: {
        container: 'w-8 h-8',
        text: 'text-sm',
        icon: 'w-4 h-4',
        status: 'w-2.5 h-2.5',
      },
      md: {
        container: 'w-10 h-10',
        text: 'text-base',
        icon: 'w-5 h-5',
        status: 'w-3 h-3',
      },
      lg: {
        container: 'w-12 h-12',
        text: 'text-lg',
        icon: 'w-6 h-6',
        status: 'w-3.5 h-3.5',
      },
      xl: {
        container: 'w-16 h-16',
        text: 'text-xl',
        icon: 'w-8 h-8',
        status: 'w-4 h-4',
      },
      '2xl': {
        container: 'w-20 h-20',
        text: 'text-2xl',
        icon: 'w-10 h-10',
        status: 'w-5 h-5',
      },
    };

    // Variant classes
    const variantClasses = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-md',
    };

    // Status classes
    const statusClasses = {
      online: 'bg-green-400 border-green-500',
      offline: 'bg-gray-400 border-gray-500',
      away: 'bg-yellow-400 border-yellow-500',
      busy: 'bg-red-400 border-red-500',
    };

    // Status position classes
    const statusPositionClasses = {
      'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
      'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
      'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
      'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    };

    const finalBackgroundColor = backgroundColor || colorVariants[colorVariant];
    const finalTextColor = textColor || '';

    // Build classes
    const classes = clsx(
      'relative inline-flex items-center justify-center',
      'flex-shrink-0',
      'overflow-hidden',
      sizeClasses[size].container,
      variantClasses[variant],
      border ? `border-2 ${borderColor}` : '',
      isInteractive ? 'cursor-pointer transition-all duration-200 hover:opacity-80' : '',
      loading ? 'animate-pulse' : '',
      className
    );

    // Utility functions
    function getInitials(name: string | undefined): string {
      if (!name) return '';

      const names = name.trim().split(' ');
      if (names.length === 1) {
        return names[0]?.substring(0, 2).toUpperCase() || '';
      }

      return names
        .slice(0, 2)
        .map((n) => n?.charAt(0).toUpperCase() || '')
        .join('');
    }

    // Event handlers
    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setImageError(true);
      setImageLoaded(false);
      onImageError?.(event);
    };

    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setImageError(false);
      setImageLoaded(true);
      onImageLoad?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (!isInteractive) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event as any);
      }
    };

    // Content renderer
    const renderContent = () => {
      if (hasImage) {
        return (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover transition-opacity duration-200"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        );
      }

      if (hasInitials) {
        return (
          <div className={clsx('w-full h-full flex items-center justify-center', finalBackgroundColor)}>
            <span className={clsx('font-medium', finalTextColor, sizeClasses[size].text)}>
              {displayInitials}
            </span>
          </div>
        );
      }

      if (hasFallbackIcon && FallbackIcon) {
        return (
          <div className={clsx('w-full h-full flex items-center justify-center', finalBackgroundColor)}>
            <FallbackIcon className={clsx(sizeClasses[size].icon, finalTextColor)} aria-hidden="true" />
          </div>
        );
      }

      // Default user icon
      return (
        <div className={clsx('w-full h-full flex items-center justify-center', finalBackgroundColor)}>
          <User className={clsx(sizeClasses[size].icon, finalTextColor)} aria-hidden="true" />
        </div>
      );
    };

    // Status indicator
    const renderStatus = () => {
      if (!status) return null;

      return (
        <div className={clsx('absolute', statusPositionClasses[statusPosition])}>
          <div
            className={clsx(
              sizeClasses[size].status,
              statusClasses[status],
              'rounded-full border-2 border-white dark:border-gray-800'
            )}
          />
        </div>
      );
    };

    // Loading overlay
    const renderLoading = () => {
      if (!loading) return null;

      return (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-1/2 w-1/2 border-b-2 border-white" />
        </div>
      );
    };

    // Link variant
    if (isLink && href) {
      return (
        <a
          href={href}
          target={target}
          className={classes}
          onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {renderContent()}
          {renderStatus()}
          {renderLoading()}
        </a>
      );
    }

    // Regular avatar
    return (
      <div
        ref={ref}
        className={classes}
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? 'button' : 'img'}
        aria-label={alt || name}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {renderContent()}
        {renderStatus()}
        {renderLoading()}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
