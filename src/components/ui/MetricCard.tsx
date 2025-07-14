'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, MoreHorizontal } from 'lucide-react'

export interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  trend?: {
    value: number
    label?: string
    period?: string
  }
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  actions?: React.ReactNode
  onClick?: () => void
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  trend,
  icon,
  variant = 'default',
  size = 'md',
  loading = false,
  actions,
  onClick,
  className,
}) => {
  const variants = {
    default: {
      card: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      title: 'text-gray-500 dark:text-gray-400',
      value: 'text-gray-900 dark:text-white',
      subtitle: 'text-gray-500 dark:text-gray-400',
    },
    success: {
      card: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
      title: 'text-green-600 dark:text-green-400',
      value: 'text-green-900 dark:text-green-100',
      subtitle: 'text-green-600 dark:text-green-400',
    },
    warning: {
      card: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800',
      title: 'text-yellow-600 dark:text-yellow-400',
      value: 'text-yellow-900 dark:text-yellow-100',
      subtitle: 'text-yellow-600 dark:text-yellow-400',
    },
    danger: {
      card: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
      title: 'text-red-600 dark:text-red-400',
      value: 'text-red-900 dark:text-red-100',
      subtitle: 'text-red-600 dark:text-red-400',
    },
    info: {
      card: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
      title: 'text-blue-600 dark:text-blue-400',
      value: 'text-blue-900 dark:text-blue-100',
      subtitle: 'text-blue-600 dark:text-blue-400',
    },
  }
  
  const sizes = {
    sm: {
      card: 'p-4',
      title: 'text-xs',
      value: 'text-lg',
      subtitle: 'text-xs',
      icon: 'h-4 w-4',
    },
    md: {
      card: 'p-6',
      title: 'text-sm',
      value: 'text-2xl',
      subtitle: 'text-sm',
      icon: 'h-5 w-5',
    },
    lg: {
      card: 'p-8',
      title: 'text-base',
      value: 'text-3xl',
      subtitle: 'text-base',
      icon: 'h-6 w-6',
    },
  }
  
  const currentVariant = variants[variant]
  const currentSize = sizes[size]
  
  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (trend.value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />
    }
  }
  
  const getTrendColor = () => {
    if (!trend) return 'text-gray-500 dark:text-gray-400'
    
    if (trend.value > 0) {
      return 'text-green-600 dark:text-green-400'
    } else if (trend.value < 0) {
      return 'text-red-600 dark:text-red-400'
    } else {
      return 'text-gray-500 dark:text-gray-400'
    }
  }
  
  const formatTrendValue = () => {
    if (!trend) return ''
    
    const sign = trend.value > 0 ? '+' : ''
    return `${sign}${trend.value}%`
  }
  
  if (loading) {
    return (
      <div
        className={cn(
          'border rounded-lg animate-pulse',
          currentVariant.card,
          currentSize.card,
          className
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div
      className={cn(
        'border rounded-lg transition-all duration-200',
        currentVariant.card,
        currentSize.card,
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn('flex-shrink-0', currentVariant.title)}>
              {React.isValidElement(icon) ? 
                React.cloneElement(icon as React.ReactElement, {
                  className: cn(currentSize.icon, (icon as any).props?.className)
                }) : 
                icon
              }
            </div>
          )}
          <h3 className={cn(
            'font-medium truncate',
            currentVariant.title,
            currentSize.title
          )}>
            {title}
          </h3>
        </div>
        
        {actions && (
          <div className="flex items-center gap-1">
            {actions}
          </div>
        )}
      </div>
      
      {/* Value */}
      <div className="mb-2">
        <div className={cn(
          'font-bold',
          currentVariant.value,
          currentSize.value
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && (
            <span className={cn(
              'font-normal ml-1',
              currentVariant.subtitle,
              currentSize.subtitle
            )}>
              {unit}
            </span>
          )}
        </div>
      </div>
      
      {/* Subtitle and Trend */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className={cn(
            'truncate',
            currentVariant.subtitle,
            currentSize.subtitle
          )}>
            {subtitle}
          </p>
        )}
        
        {trend && (
          <div className="flex items-center gap-1 ml-2">
            {getTrendIcon()}
            <span className={cn(
              'font-medium',
              currentSize.subtitle,
              getTrendColor()
            )}>
              {formatTrendValue()}
            </span>
            {trend.period && (
              <span className={cn(
                'text-gray-500 dark:text-gray-400',
                currentSize.subtitle
              )}>
                {trend.period}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Preset Metric Cards
export const CPUMetricCard: React.FC<Omit<MetricCardProps, 'title' | 'unit'>> = (props) => (
  <MetricCard
    title="CPU Usage"
    unit="%"
    variant="info"
    {...props}
  />
)

export const MemoryMetricCard: React.FC<Omit<MetricCardProps, 'title' | 'unit'>> = (props) => (
  <MetricCard
    title="Memory Usage"
    unit="MB"
    variant="warning"
    {...props}
  />
)

export const StorageMetricCard: React.FC<Omit<MetricCardProps, 'title' | 'unit'>> = (props) => (
  <MetricCard
    title="Storage Usage"
    unit="GB"
    variant="default"
    {...props}
  />
)

export const NetworkMetricCard: React.FC<Omit<MetricCardProps, 'title' | 'unit'>> = (props) => (
  <MetricCard
    title="Network I/O"
    unit="MB/s"
    variant="success"
    {...props}
  />
)

export const UptimeMetricCard: React.FC<Omit<MetricCardProps, 'title' | 'unit'>> = (props) => (
  <MetricCard
    title="Uptime"
    unit="days"
    variant="success"
    {...props}
  />
)

export const ResponseTimeMetricCard: React.FC<Omit<MetricCardProps, 'title' | 'unit'>> = (props) => (
  <MetricCard
    title="Response Time"
    unit="ms"
    variant="info"
    {...props}
  />
)

export default MetricCard