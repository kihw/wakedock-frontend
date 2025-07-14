import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    rounded?: boolean;
    outlined?: boolean;
    dot?: boolean;
    removable?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    pulse?: boolean;
    clickable?: boolean;
    href?: string;
    target?: string;
    children?: React.ReactNode;
    onRemove?: () => void;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            rounded = false,
            outlined = false,
            dot = false,
            removable = false,
            icon: Icon,
            pulse = false,
            clickable = false,
            href,
            target,
            children,
            className,
            onClick,
            onRemove,
            ...props
        },
        ref
    ) => {
        const baseClasses = [
            'inline-flex items-center justify-center',
            'font-medium',
            'whitespace-nowrap',
            'select-none',
        ];

        // Variant classes
        const variantClasses = {
            primary: {
                filled: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
                outlined: 'border-blue-500 text-blue-700 bg-transparent dark:border-blue-400 dark:text-blue-300',
                dot: 'bg-blue-500',
            },
            secondary: {
                filled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
                outlined: 'border-gray-500 text-gray-700 bg-transparent dark:border-gray-400 dark:text-gray-300',
                dot: 'bg-gray-500',
            },
            success: {
                filled: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
                outlined: 'border-green-500 text-green-700 bg-transparent dark:border-green-400 dark:text-green-300',
                dot: 'bg-green-500',
            },
            warning: {
                filled: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
                outlined: 'border-yellow-500 text-yellow-700 bg-transparent dark:border-yellow-400 dark:text-yellow-300',
                dot: 'bg-yellow-500',
            },
            error: {
                filled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
                outlined: 'border-red-500 text-red-700 bg-transparent dark:border-red-400 dark:text-red-300',
                dot: 'bg-red-500',
            },
            info: {
                filled: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
                outlined: 'border-blue-500 text-blue-700 bg-transparent dark:border-blue-400 dark:text-blue-300',
                dot: 'bg-blue-500',
            },
            neutral: {
                filled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
                outlined: 'border-gray-500 text-gray-700 bg-transparent dark:border-gray-400 dark:text-gray-300',
                dot: 'bg-gray-500',
            },
        };

        // Size classes
        const sizeClasses = {
            sm: {
                badge: 'px-2 py-0.5 text-xs',
                gap: 'gap-1',
                icon: 'w-3 h-3',
                dot: 'w-2 h-2',
                removeButton: 'ml-1 -mr-0.5 w-4 h-4',
            },
            md: {
                badge: 'px-2.5 py-1 text-sm',
                gap: 'gap-1.5',
                icon: 'w-4 h-4',
                dot: 'w-2.5 h-2.5',
                removeButton: 'ml-1.5 -mr-0.5 w-5 h-5',
            },
            lg: {
                badge: 'px-3 py-1.5 text-base',
                gap: 'gap-2',
                icon: 'w-5 h-5',
                dot: 'w-3 h-3',
                removeButton: 'ml-2 -mr-1 w-6 h-6',
            },
        };

        const isInteractive = clickable || href || removable;

        // Build classes
        const classes = clsx(
            baseClasses,
            outlined ? variantClasses[variant].outlined : variantClasses[variant].filled,
            outlined ? 'border-2' : 'border',
            sizeClasses[size].badge,
            (Icon || children) ? sizeClasses[size].gap : '',
            rounded ? 'rounded-full' : 'rounded-md',
            pulse ? 'animate-pulse' : '',
            isInteractive ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : '',
            'transition-all duration-200',
            className
        );

        const handleRemove = (e: React.MouseEvent) => {
            e.stopPropagation();
            onRemove?.();
        };

        // Dot variant
        if (dot) {
            return (
                <span
                    ref={ref}
                    className={clsx(
                        'inline-block rounded-full',
                        sizeClasses[size].dot,
                        variantClasses[variant].dot,
                        pulse ? 'animate-pulse' : '',
                        className
                    )}
                    {...props}
                />
            );
        }

        // Link variant
        if (href) {
            return (
                <a
                    href={href}
                    target={target}
                    className={classes}
                    onClick={onClick}
                    {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                >
                    {Icon && (
                        <span className="flex-shrink-0">
                            <Icon className={sizeClasses[size].icon} aria-hidden="true" />
                        </span>
                    )}

                    {children && (
                        <span className="flex-1 truncate">
                            {children}
                        </span>
                    )}

                    {removable && (
                        <button
                            type="button"
                            className={clsx(
                                sizeClasses[size].removeButton,
                                'flex-shrink-0 rounded-full hover:bg-black hover:bg-opacity-10',
                                'focus:outline-none focus:bg-black focus:bg-opacity-10',
                                'transition-colors duration-200'
                            )}
                            onClick={handleRemove}
                            aria-label="Remove"
                        >
                            <X className="w-full h-full" />
                        </button>
                    )}
                </a>
            );
        }

        // Regular badge
        return (
            <span
                ref={ref}
                className={classes}
                role={isInteractive ? 'button' : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                onClick={onClick}
                {...props}
            >
                {Icon && (
                    <span className="flex-shrink-0">
                        <Icon className={sizeClasses[size].icon} aria-hidden="true" />
                    </span>
                )}

                {children && (
                    <span className="flex-1 truncate">
                        {children}
                    </span>
                )}

                {removable && (
                    <button
                        type="button"
                        className={clsx(
                            sizeClasses[size].removeButton,
                            'flex-shrink-0 rounded-full hover:bg-black hover:bg-opacity-10',
                            'focus:outline-none focus:bg-black focus:bg-opacity-10',
                            'transition-colors duration-200'
                        )}
                        onClick={handleRemove}
                        aria-label="Remove"
                    >
                        <X className="w-full h-full" />
                    </button>
                )}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
