'use client'

import React from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      padding = 'md',
      hoverable = false,
      clickable = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
      elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
      ghost: 'bg-gray-50 dark:bg-gray-900 border border-transparent',
    }

    const sizes = {
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    const hoverStyles = hoverable && !loading ? 'hover:shadow-md transition-shadow duration-200' : ''
    const clickableStyles = clickable && !loading ? 'cursor-pointer' : ''

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'animate-pulse',
            variants[variant],
            sizes[size],
            paddings[padding],
            className
          )}
          {...props}
        >
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          sizes[size],
          paddings[padding],
          hoverStyles,
          clickableStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  title,
  subtitle,
  actions,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-start justify-between',
        (title || subtitle) && 'mb-4',
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  )
}

// Card Body Component
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  // No additional props needed, extends basic div props
}

export const CardBody: React.FC<CardBodyProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('text-gray-700 dark:text-gray-300', className)} {...props}>
      {children}
    </div>
  )
}

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between'
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  align = 'right',
  children,
  ...props
}) => {
  const alignments = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
        alignments[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Preset Card Components
export const ServiceCard: React.FC<CardProps> = (props) => (
  <Card variant="elevated" hoverable clickable {...props} />
)

export const InfoCard: React.FC<CardProps> = (props) => (
  <Card variant="outlined" {...props} />
)

export const MetricCard: React.FC<CardProps> = (props) => (
  <Card variant="default" size="sm" {...props} />
)

// Simple CardTitle and CardContent for compatibility
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props}>
    {children}
  </h3>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("p-4", className)} {...props}>
    {children}
  </div>
)

export default Card