// Enhanced Button Component - Atom
'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    rounded?: boolean;
    shadow?: boolean;
    animate?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'default',
        size = 'md',
        loading = false,
        icon,
        iconPosition = 'left',
        fullWidth = false,
        rounded = false,
        shadow = true,
        animate = true,
        disabled,
        children,
        ...props
    }, ref) => {
        const baseClasses = `
      relative inline-flex items-center justify-center
      font-medium transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-60 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
      ${rounded ? 'rounded-full' : 'rounded-lg'}
    `;

        const variantClasses = {
            default: `
        bg-white text-gray-900 border-gray-300
        hover:bg-gray-50 hover:text-gray-800
        focus:ring-indigo-500
        dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
        dark:hover:bg-gray-700
        ${shadow ? 'shadow-md hover:shadow-lg' : ''}
      `,
            primary: `
        bg-gradient-to-r from-indigo-600 to-purple-600
        text-white border-transparent
        hover:from-indigo-700 hover:to-purple-700
        focus:ring-indigo-500
        ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
      `,
            secondary: `
        bg-gray-100 text-gray-900 border-gray-300
        hover:bg-gray-200 hover:text-gray-800
        focus:ring-gray-500
        dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
        dark:hover:bg-gray-700
        ${shadow ? 'shadow-md hover:shadow-lg' : ''}
      `,
            success: `
        bg-gradient-to-r from-green-600 to-emerald-600
        text-white border-transparent
        hover:from-green-700 hover:to-emerald-700
        focus:ring-green-500
        ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
      `,
            warning: `
        bg-gradient-to-r from-yellow-500 to-orange-500
        text-white border-transparent
        hover:from-yellow-600 hover:to-orange-600
        focus:ring-yellow-500
        ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
      `,
            error: `
        bg-gradient-to-r from-red-600 to-pink-600
        text-white border-transparent
        hover:from-red-700 hover:to-pink-700
        focus:ring-red-500
        ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
      `,
            ghost: `
        bg-transparent text-gray-700 border-transparent
        hover:bg-gray-100 hover:text-gray-900
        focus:ring-gray-500
        dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100
      `,
            outline: `
        bg-transparent border-2 border-gray-300
        text-gray-700 hover:bg-gray-50 hover:text-gray-900
        focus:ring-gray-500
        dark:border-gray-600 dark:text-gray-300
        dark:hover:bg-gray-800 dark:hover:text-gray-100
      `,
        };

        const sizeClasses = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
            xl: 'px-8 py-4 text-lg',
        };

        const ButtonComponent = (
            <button
                ref={ref}
                className={cn(
                    baseClasses,
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <div className={cn(
                    'flex items-center gap-2',
                    loading && 'opacity-0'
                )}>
                    {icon && iconPosition === 'left' && icon}
                    {children}
                    {icon && iconPosition === 'right' && icon}
                </div>
            </button>
        );

        if (animate) {
            return (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    {ButtonComponent}
                </motion.div>
            );
        }

        return ButtonComponent;
    }
);

Button.displayName = 'Button';

export { Button };
