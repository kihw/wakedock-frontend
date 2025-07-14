import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export type SpinnerType = 'spin' | 'pulse' | 'bounce' | 'dots' | 'bars' | 'ring';
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: SpinnerType;
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  fullScreen?: boolean;
  overlay?: boolean;
  label?: string;
  showLabel?: boolean;
  duration?: number;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      type = 'spin',
      size = 'md',
      variant = 'primary',
      fullScreen = false,
      overlay = false,
      label,
      showLabel = false,
      duration,
      className,
      ...props
    },
    ref
  ) => {
    const hasLabel = label || showLabel;
    const accessibleLabel = label || 'Loading...';

    // Size classes
    const sizeClasses = {
      xs: {
        spinner: 'w-4 h-4',
        dot: 'w-2 h-2',
        bar: 'w-1 h-4',
        text: 'text-xs',
      },
      sm: {
        spinner: 'w-5 h-5',
        dot: 'w-2.5 h-2.5',
        bar: 'w-1.5 h-5',
        text: 'text-sm',
      },
      md: {
        spinner: 'w-6 h-6',
        dot: 'w-3 h-3',
        bar: 'w-2 h-6',
        text: 'text-base',
      },
      lg: {
        spinner: 'w-8 h-8',
        dot: 'w-4 h-4',
        bar: 'w-3 h-8',
        text: 'text-lg',
      },
      xl: {
        spinner: 'w-12 h-12',
        dot: 'w-6 h-6',
        bar: 'w-4 h-12',
        text: 'text-xl',
      },
    };

    // Variant classes
    const variantClasses = {
      primary: 'text-blue-600 dark:text-blue-400',
      secondary: 'text-gray-600 dark:text-gray-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      white: 'text-white',
    };

    // Container classes
    const containerClasses = clsx(
      'flex items-center justify-center',
      fullScreen ? 'fixed inset-0 z-50' : '',
      overlay ? 'bg-black bg-opacity-50' : '',
      hasLabel ? 'flex-col space-y-2' : '',
      className
    );

    // Animation duration style
    const animationStyle = duration ? { animationDuration: `${duration}ms` } : {};

    // Render different spinner types
    const renderSpinner = () => {
      const spinnerColor = variantClasses[variant];
      const spinnerSize = sizeClasses[size].spinner;

      switch (type) {
        case 'spin':
          return (
            <svg
              className={clsx(spinnerSize, spinnerColor, 'animate-spin')}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              style={animationStyle}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          );

        case 'ring':
          return (
            <div className={clsx(spinnerSize, 'relative')} style={animationStyle}>
              <div className={clsx('absolute inset-0 border-4 border-current border-opacity-25 rounded-full', spinnerColor)} />
              <div className={clsx('absolute inset-0 border-4 border-transparent border-t-current rounded-full animate-spin', spinnerColor)} />
            </div>
          );

        case 'pulse':
          return (
            <div className={clsx(spinnerSize, spinnerColor, 'animate-pulse')} style={animationStyle}>
              <div className="w-full h-full bg-current rounded-full" />
            </div>
          );

        case 'bounce':
          return (
            <div className={clsx(spinnerSize, spinnerColor, 'animate-bounce')} style={animationStyle}>
              <div className="w-full h-full bg-current rounded-full" />
            </div>
          );

        case 'dots':
          return (
            <div className="flex space-x-1">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className={clsx(
                    sizeClasses[size].dot,
                    spinnerColor,
                    'bg-current rounded-full animate-bounce'
                  )}
                  style={{
                    ...animationStyle,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          );

        case 'bars':
          return (
            <div className="flex space-x-1">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className={clsx(
                    sizeClasses[size].bar,
                    spinnerColor,
                    'bg-current animate-pulse'
                  )}
                  style={{
                    ...animationStyle,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={containerClasses}
        role="status"
        aria-live="polite"
        aria-label={accessibleLabel}
        {...props}
      >
        {renderSpinner()}

        {hasLabel && (
          <div className={clsx(sizeClasses[size].text, variantClasses[variant], 'font-medium')}>
            {label || 'Loading...'}
          </div>
        )}

        {/* Screen reader only text */}
        <span className="sr-only">{accessibleLabel}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner;
