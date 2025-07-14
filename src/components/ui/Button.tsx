import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error' | 'link';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    loadingText?: string;
    leftIcon?: React.ComponentType<{ className?: string }>;
    rightIcon?: React.ComponentType<{ className?: string }>;
    fullWidth?: boolean;
    rounded?: boolean;
    children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            loadingText,
            leftIcon: LeftIcon,
            rightIcon: RightIcon,
            fullWidth = false,
            rounded = false,
            disabled,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const baseClasses = [
            'inline-flex items-center justify-center',
            'font-medium',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'select-none',
        ];

        const variantClasses = {
            primary: [
                'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
                'text-white',
                'border border-transparent',
                'focus:ring-blue-500',
                'shadow-sm hover:shadow-md',
            ],
            secondary: [
                'bg-gray-600 hover:bg-gray-700 active:bg-gray-800',
                'text-white',
                'border border-transparent',
                'focus:ring-gray-500',
                'shadow-sm hover:shadow-md',
            ],
            outline: [
                'bg-transparent hover:bg-gray-50 active:bg-gray-100',
                'text-gray-700 hover:text-gray-900',
                'border border-gray-300 hover:border-gray-400',
                'focus:ring-gray-500',
                'dark:bg-transparent dark:hover:bg-gray-800 dark:active:bg-gray-700',
                'dark:text-gray-300 dark:hover:text-white',
                'dark:border-gray-600 dark:hover:border-gray-500',
            ],
            ghost: [
                'bg-transparent hover:bg-gray-100 active:bg-gray-200',
                'text-gray-700 hover:text-gray-900',
                'border border-transparent',
                'focus:ring-gray-500',
                'dark:hover:bg-gray-800 dark:active:bg-gray-700',
                'dark:text-gray-300 dark:hover:text-white',
            ],
            success: [
                'bg-green-600 hover:bg-green-700 active:bg-green-800',
                'text-white',
                'border border-transparent',
                'focus:ring-green-500',
                'shadow-sm hover:shadow-md',
            ],
            warning: [
                'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800',
                'text-white',
                'border border-transparent',
                'focus:ring-yellow-500',
                'shadow-sm hover:shadow-md',
            ],
            error: [
                'bg-red-600 hover:bg-red-700 active:bg-red-800',
                'text-white',
                'border border-transparent',
                'focus:ring-red-500',
                'shadow-sm hover:shadow-md',
            ],
            link: [
                'bg-transparent hover:bg-transparent',
                'text-blue-600 hover:text-blue-700 active:text-blue-800',
                'border border-transparent',
                'focus:ring-blue-500',
                'underline-offset-4 hover:underline',
                'dark:text-blue-400 dark:hover:text-blue-300',
            ],
        };

        const sizeClasses = {
            xs: {
                button: 'px-2 py-1 text-xs',
                gap: 'gap-1',
                icon: 'w-3 h-3',
                rounded: 'rounded',
            },
            sm: {
                button: 'px-3 py-1.5 text-sm',
                gap: 'gap-1.5',
                icon: 'w-4 h-4',
                rounded: 'rounded-md',
            },
            md: {
                button: 'px-4 py-2 text-sm',
                gap: 'gap-2',
                icon: 'w-4 h-4',
                rounded: 'rounded-md',
            },
            lg: {
                button: 'px-6 py-3 text-base',
                gap: 'gap-2',
                icon: 'w-5 h-5',
                rounded: 'rounded-lg',
            },
            xl: {
                button: 'px-8 py-4 text-lg',
                gap: 'gap-3',
                icon: 'w-6 h-6',
                rounded: 'rounded-lg',
            },
        };

        const isDisabled = disabled || loading;

        const classes = clsx(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size].button,
            (LeftIcon || RightIcon || loading) && sizeClasses[size].gap,
            fullWidth && 'w-full',
            rounded ? 'rounded-full' : sizeClasses[size].rounded,
            className
        );

        const iconSize = sizeClasses[size].icon;

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={classes}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2 className={clsx(iconSize, 'animate-spin')} />
                        {loadingText ? (
                            <span>{loadingText}</span>
                        ) : (
                            <span className="sr-only">Loading...</span>
                        )}
                    </>
                ) : (
                    <>
                        {LeftIcon && (
                            <span className="flex-shrink-0">
                                <LeftIcon className={iconSize} aria-hidden="true" />
                            </span>
                        )}

                        {children && (
                            <span className={clsx(
                                'flex-1',
                                variant === 'link' ? '' : 'whitespace-nowrap'
                            )}>
                                {children}
                            </span>
                        )}

                        {RightIcon && (
                            <span className="flex-shrink-0">
                                <RightIcon className={iconSize} aria-hidden="true" />
                            </span>
                        )}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;

// Button variants for specific use cases
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, size = 'md', rounded = true, ...props }, ref) => (
        <Button
            ref={ref}
            size={size}
            rounded={rounded}
            className={clsx(
                'aspect-square',
                props.className
            )}
            {...props}
        >
            {children}
        </Button>
    )
);

IconButton.displayName = 'IconButton';
