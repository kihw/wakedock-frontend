// Enhanced Badge Component - Atom
'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    rounded?: boolean;
    outline?: boolean;
    pulse?: boolean;
    animate?: boolean;
    icon?: React.ReactNode;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
    ({
        className,
        variant = 'default',
        size = 'md',
        rounded = false,
        outline = false,
        pulse = false,
        animate = true,
        icon,
        children,
        ...props
    }, ref) => {
        const baseClasses = `
      inline-flex items-center gap-1 font-medium
      ${rounded ? 'rounded-full' : 'rounded-md'}
      ${pulse ? 'animate-pulse' : ''}
      transition-all duration-200
    `;

        const variantClasses = {
            default: outline
                ? 'border border-gray-300 text-gray-700 bg-transparent dark:border-gray-600 dark:text-gray-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
            primary: outline
                ? 'border border-indigo-300 text-indigo-700 bg-transparent dark:border-indigo-600 dark:text-indigo-300'
                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
            secondary: outline
                ? 'border border-purple-300 text-purple-700 bg-transparent dark:border-purple-600 dark:text-purple-300'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
            success: outline
                ? 'border border-green-300 text-green-700 bg-transparent dark:border-green-600 dark:text-green-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
            warning: outline
                ? 'border border-yellow-300 text-yellow-700 bg-transparent dark:border-yellow-600 dark:text-yellow-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
            error: outline
                ? 'border border-red-300 text-red-700 bg-transparent dark:border-red-600 dark:text-red-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
            info: outline
                ? 'border border-blue-300 text-blue-700 bg-transparent dark:border-blue-600 dark:text-blue-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
        };

        const sizeClasses = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-1 text-sm',
            lg: 'px-3 py-1.5 text-base',
        };

        const iconSizeClasses = {
            sm: 'w-3 h-3',
            md: 'w-4 h-4',
            lg: 'w-5 h-5',
        };

        const BadgeComponent = (
            <div
                ref={ref}
                className={cn(
                    baseClasses,
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {icon && (
                    <span className={cn('shrink-0', iconSizeClasses[size])}>
                        {icon}
                    </span>
                )}
                {children}
            </div>
        );

        if (animate) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {BadgeComponent}
                </motion.div>
            );
        }

        return BadgeComponent;
    }
);

Badge.displayName = 'Badge';

// Status Badge variants for common use cases
export const StatusBadge = forwardRef<HTMLDivElement, Omit<BadgeProps, 'variant'> & { status: 'running' | 'stopped' | 'error' | 'warning' | 'pending' }>(
    ({ status, ...props }, ref) => {
        const statusVariants = {
            running: 'success',
            stopped: 'secondary',
            error: 'error',
            warning: 'warning',
            pending: 'info',
        } as const;

        return (
            <Badge
                ref={ref}
                variant={statusVariants[status]}
                {...props}
            />
        );
    }
);

StatusBadge.displayName = 'StatusBadge';

export { Badge };
export default Badge;
