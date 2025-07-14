import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'default' | 'filled' | 'outlined';
    inputSize?: 'sm' | 'md' | 'lg';
    label?: string;
    helperText?: string;
    error?: boolean;
    errorMessage?: string;
    success?: boolean;
    successMessage?: string;
    leftIcon?: React.ComponentType<{ className?: string }>;
    rightIcon?: React.ComponentType<{ className?: string }>;
    leftAddon?: React.ReactNode;
    rightAddon?: React.ReactNode;
    clearable?: boolean;
    onClear?: () => void;
    showPasswordToggle?: boolean;
    loading?: boolean;
    containerClassName?: string;
    labelClassName?: string;
    helperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            variant = 'default',
            inputSize = 'md',
            label,
            helperText,
            error = false,
            errorMessage,
            success = false,
            successMessage,
            leftIcon: LeftIcon,
            rightIcon: RightIcon,
            leftAddon,
            rightAddon,
            clearable = false,
            onClear,
            showPasswordToggle = false,
            loading = false,
            type = 'text',
            disabled,
            className,
            containerClassName,
            labelClassName,
            helperClassName,
            value,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        const isPassword = type === 'password';
        const actualType = isPassword && showPassword ? 'text' : type;
        const hasValue = value !== undefined && value !== '' && value !== null;
        const canClear = clearable && hasValue && !disabled && !loading;
        const hasError = error || !!errorMessage;
        const hasSuccess = success || !!successMessage;

        const baseClasses = [
            'w-full',
            'transition-all duration-200',
            'placeholder:text-gray-400',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'dark:placeholder:text-gray-500',
        ];

        const variantClasses = {
            default: [
                'border border-gray-300',
                'bg-white',
                'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                'dark:bg-gray-800 dark:border-gray-600',
                'dark:focus:border-blue-400 dark:focus:ring-blue-400',
            ],
            filled: [
                'border border-transparent',
                'bg-gray-100',
                'focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                'dark:bg-gray-700',
                'dark:focus:bg-gray-800 dark:focus:border-blue-400 dark:focus:ring-blue-400',
            ],
            outlined: [
                'border-2 border-gray-300',
                'bg-transparent',
                'focus:border-blue-500',
                'dark:border-gray-600',
                'dark:focus:border-blue-400',
            ],
        };

        const sizeClasses = {
            sm: {
                input: 'px-3 py-1.5 text-sm',
                icon: 'w-4 h-4',
                addon: 'px-3 text-sm',
                rounded: 'rounded',
            },
            md: {
                input: 'px-4 py-2 text-base',
                icon: 'w-5 h-5',
                addon: 'px-4 text-base',
                rounded: 'rounded-md',
            },
            lg: {
                input: 'px-5 py-3 text-lg',
                icon: 'w-6 h-6',
                addon: 'px-5 text-lg',
                rounded: 'rounded-lg',
            },
        };

        const stateClasses = {
            error: 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400',
            success: 'border-green-500 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:focus:border-green-400 dark:focus:ring-green-400',
        };

        const inputClasses = clsx(
            baseClasses,
            variantClasses[variant],
            sizeClasses[inputSize].input,
            sizeClasses[inputSize].rounded,
            hasError && stateClasses.error,
            hasSuccess && stateClasses.success,
            LeftIcon || leftAddon ? 'pl-10' : '',
            RightIcon || rightAddon || canClear || (isPassword && showPasswordToggle) ? 'pr-10' : '',
            className
        );

        const iconClasses = clsx(
            'absolute top-1/2 transform -translate-y-1/2 text-gray-400',
            sizeClasses[inputSize].icon,
            hasError && 'text-red-500',
            hasSuccess && 'text-green-500'
        );

        const handleClear = () => {
            if (onClear) {
                onClear();
            }
        };

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        const renderRightElements = () => {
            const elements = [];

            if (loading) {
                elements.push(
                    <div key="loading" className={clsx(iconClasses, 'right-3')}>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    </div>
                );
            } else {
                if (hasError) {
                    elements.push(
                        <AlertCircle key="error" className={clsx(iconClasses, 'right-3 text-red-500')} />
                    );
                } else if (hasSuccess) {
                    elements.push(
                        <Check key="success" className={clsx(iconClasses, 'right-3 text-green-500')} />
                    );
                } else if (canClear) {
                    elements.push(
                        <button
                            key="clear"
                            type="button"
                            onClick={handleClear}
                            className={clsx(iconClasses, 'right-3 hover:text-gray-600 cursor-pointer')}
                        >
                            <X />
                        </button>
                    );
                } else if (isPassword && showPasswordToggle) {
                    elements.push(
                        <button
                            key="password-toggle"
                            type="button"
                            onClick={togglePasswordVisibility}
                            className={clsx(iconClasses, 'right-3 hover:text-gray-600 cursor-pointer')}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                    );
                } else if (RightIcon) {
                    elements.push(
                        <RightIcon key="right-icon" className={clsx(iconClasses, 'right-3')} />
                    );
                }
            }

            return elements;
        };

        return (
            <div className={clsx('w-full', containerClassName)}>
                {label && (
                    <label
                        className={clsx(
                            'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
                            hasError && 'text-red-700 dark:text-red-400',
                            hasSuccess && 'text-green-700 dark:text-green-400',
                            labelClassName
                        )}
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {/* Left addon */}
                    {leftAddon && (
                        <div className={clsx(
                            'absolute left-0 top-0 bottom-0 flex items-center',
                            'bg-gray-50 border-r border-gray-300',
                            'dark:bg-gray-700 dark:border-gray-600',
                            sizeClasses[inputSize].addon,
                            sizeClasses[inputSize].rounded.replace('rounded', 'rounded-l')
                        )}>
                            {leftAddon}
                        </div>
                    )}

                    {/* Left icon */}
                    {LeftIcon && (
                        <LeftIcon className={clsx(iconClasses, 'left-3')} />
                    )}

                    {/* Input */}
                    <input
                        ref={ref}
                        type={actualType}
                        disabled={disabled || loading}
                        value={value}
                        className={inputClasses}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        {...props}
                    />

                    {/* Right elements */}
                    {renderRightElements()}

                    {/* Right addon */}
                    {rightAddon && (
                        <div className={clsx(
                            'absolute right-0 top-0 bottom-0 flex items-center',
                            'bg-gray-50 border-l border-gray-300',
                            'dark:bg-gray-700 dark:border-gray-600',
                            sizeClasses[inputSize].addon,
                            sizeClasses[inputSize].rounded.replace('rounded', 'rounded-r')
                        )}>
                            {rightAddon}
                        </div>
                    )}
                </div>

                {/* Helper text */}
                {(helperText || errorMessage || successMessage) && (
                    <p className={clsx(
                        'mt-1 text-sm',
                        hasError ? 'text-red-600 dark:text-red-400' :
                            hasSuccess ? 'text-green-600 dark:text-green-400' :
                                'text-gray-500 dark:text-gray-400',
                        helperClassName
                    )}>
                        {errorMessage || successMessage || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
