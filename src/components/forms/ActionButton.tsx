'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
      md: 'px-4 py-2 text-base rounded-lg gap-2',
      lg: 'px-6 py-3 text-lg rounded-lg gap-2.5'
    }
    
    const iconSizes = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }
    
    const renderIcon = () => {
      if (loading) {
        return <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      }
      if (icon && React.isValidElement(icon)) {
        return React.cloneElement(icon as React.ReactElement<any>, {
          className: cn((icon as any).props?.className, iconSizes[size])
        })
      }
      return icon
    }
    
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {iconPosition === 'left' && renderIcon()}
        {children && <span>{children}</span>}
        {iconPosition === 'right' && renderIcon()}
      </button>
    )
  }
)

ActionButton.displayName = 'ActionButton'

// Preset action buttons for common use cases
export const PrimaryActionButton: React.FC<Omit<ActionButtonProps, 'variant'>> = (props) => (
  <ActionButton variant="primary" {...props} />
)

export const SecondaryActionButton: React.FC<Omit<ActionButtonProps, 'variant'>> = (props) => (
  <ActionButton variant="secondary" {...props} />
)

export const DangerActionButton: React.FC<Omit<ActionButtonProps, 'variant'>> = (props) => (
  <ActionButton variant="danger" {...props} />
)

export const SuccessActionButton: React.FC<Omit<ActionButtonProps, 'variant'>> = (props) => (
  <ActionButton variant="success" {...props} />
)