import React from 'react';
import { clsx } from 'clsx';

export interface LoadingSpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
    speed?: 'slow' | 'normal' | 'fast';
    thickness?: 'thin' | 'normal' | 'thick';
    overlay?: boolean;
    overlayColor?: string;
    label?: string;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    variant = 'primary',
    speed = 'normal',
    thickness = 'normal',
    overlay = false,
    overlayColor = 'bg-white bg-opacity-75',
    label,
    className,
}) => {
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    const variantClasses = {
        primary: 'border-blue-600',
        secondary: 'border-gray-600',
        success: 'border-green-600',
        warning: 'border-yellow-600',
        error: 'border-red-600',
        white: 'border-white',
    };

    const speedClasses = {
        slow: 'animate-spin-slow',
        normal: 'animate-spin',
        fast: 'animate-spin-fast',
    };

    const thicknessClasses = {
        thin: 'border',
        normal: 'border-2',
        thick: 'border-4',
    };

    const spinnerClasses = clsx(
        'inline-block rounded-full border-solid border-t-transparent',
        sizeClasses[size],
        variantClasses[variant],
        speedClasses[speed],
        thicknessClasses[thickness],
        className
    );

    const spinner = (
        <div className="flex flex-col items-center justify-center">
            <div className={spinnerClasses} role="status" aria-label={label || 'Loading'} />
            {label && (
                <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {label}
                </span>
            )}
        </div>
    );

    if (overlay) {
        return (
            <div className={clsx(
                'fixed inset-0 z-50 flex items-center justify-center',
                overlayColor
            )}>
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
