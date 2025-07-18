'use client'

import React, { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string
    error?: string
    helperText?: string
    variant?: 'default' | 'filled' | 'outlined'
    size?: 'sm' | 'md' | 'lg'
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    isLoading?: boolean
    isValid?: boolean
    showValidation?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        className,
        type = 'text',
        label,
        error,
        helperText,
        variant = 'default',
        size = 'md',
        leftIcon,
        rightIcon,
        isLoading = false,
        isValid,
        showValidation = false,
        disabled,
        ...props
    }, ref) => {
        const [isFocused, setIsFocused] = useState(false)
        const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue)

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true)
            props.onFocus?.(e)
        }

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false)
            props.onBlur?.(e)
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(!!e.target.value)
            props.onChange?.(e)
        }

        const baseClasses = cn(
            'w-full transition-all duration-200 focus:outline-none',
            'placeholder:text-gray-500 dark:placeholder:text-gray-400',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Size variants
            {
                'px-3 py-2 text-sm': size === 'sm',
                'px-4 py-3 text-base': size === 'md',
                'px-5 py-4 text-lg': size === 'lg',
            },
            // Padding adjustments for icons
            {
                'pl-10': leftIcon && size === 'sm',
                'pl-12': leftIcon && size === 'md',
                'pl-14': leftIcon && size === 'lg',
                'pr-10': rightIcon && size === 'sm',
                'pr-12': rightIcon && size === 'md',
                'pr-14': rightIcon && size === 'lg',
            }
        )

        const variantClasses = cn(
            {
                // Default variant
                'bg-white/5 border border-gray-300 dark:border-gray-600 rounded-lg': variant === 'default',
                'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20': variant === 'default' && !error,
                'border-red-500 focus:border-red-500 focus:ring-red-500/20': variant === 'default' && error,
                'border-green-500 focus:border-green-500 focus:ring-green-500/20': variant === 'default' && isValid && showValidation,

                // Filled variant
                'bg-gray-100 dark:bg-gray-800 border-0 rounded-lg': variant === 'filled',
                'focus:bg-gray-50 dark:focus:bg-gray-700': variant === 'filled' && !error,
                'bg-red-50 dark:bg-red-900/20': variant === 'filled' && error,
                'bg-green-50 dark:bg-green-900/20': variant === 'filled' && isValid && showValidation,

                // Outlined variant
                'bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-lg': variant === 'outlined',
                'focus:border-primary-500': variant === 'outlined' && !error,
                'border-red-500': variant === 'outlined' && error,
                'border-green-500': variant === 'outlined' && isValid && showValidation,
            }
        )

        const iconClasses = cn(
            'absolute inset-y-0 flex items-center pointer-events-none transition-colors duration-200',
            {
                'text-gray-400': !isFocused && !error && !isValid,
                'text-primary-500': isFocused && !error && !isValid,
                'text-red-500': error,
                'text-green-500': isValid && showValidation,
            }
        )

        const leftIconClasses = cn(iconClasses, {
            'left-3': size === 'sm',
            'left-4': size === 'md',
            'left-5': size === 'lg',
        })

        const rightIconClasses = cn(iconClasses, {
            'right-3': size === 'sm',
            'right-4': size === 'md',
            'right-5': size === 'lg',
        })

        return (
            <div className="w-full">
                {label && (
                    <motion.label
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            'block text-sm font-medium mb-2 transition-colors duration-200',
                            {
                                'text-gray-700 dark:text-gray-300': !error && !isValid,
                                'text-red-600 dark:text-red-400': error,
                                'text-green-600 dark:text-green-400': isValid && showValidation,
                            }
                        )}
                    >
                        {label}
                    </motion.label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className={leftIconClasses}>
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        type={type}
                        className={cn(
                            baseClasses,
                            variantClasses,
                            'transform transition-transform duration-200 focus:scale-[1.01]',
                            className
                        )}
                        disabled={disabled || isLoading}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        {...props}
                    />

                    {rightIcon && (
                        <div className={rightIconClasses}>
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"
                                />
                            ) : (
                                rightIcon
                            )}
                        </div>
                    )}

                    {/* Validation icon */}
                    {showValidation && !rightIcon && (isValid || error) && (
                        <div className={rightIconClasses}>
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isValid ? (
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Error or helper text */}
                <AnimatePresence mode="wait">
                    {(error || helperText) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2"
                        >
                            <p className={cn(
                                'text-sm transition-colors duration-200',
                                {
                                    'text-red-600 dark:text-red-400': error,
                                    'text-gray-600 dark:text-gray-400': !error && helperText,
                                }
                            )}>
                                {error || helperText}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Focus indicator */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 origin-center"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
