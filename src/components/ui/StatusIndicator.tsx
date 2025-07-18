'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import { CheckCircle, XCircle, AlertCircle, Clock, Zap, Pause, Play, Square } from 'lucide-react'

export type StatusType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'pending' 
  | 'running' 
  | 'stopped' 
  | 'paused'
  | 'loading'

export interface StatusIndicatorProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'subtle' | 'outline' | 'dot'
  showIcon?: boolean
  animated?: boolean
  className?: string
  iconClassName?: string
  labelClassName?: string
  onClick?: () => void
}

const statusConfig = {
  success: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
  },
  error: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: XCircle,
  },
  warning: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertCircle,
  },
  info: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: AlertCircle,
  },
  pending: {
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800',
    icon: Clock,
  },
  running: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: Play,
  },
  stopped: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: Square,
  },
  paused: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: Pause,
  },
  loading: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Zap,
  },
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  variant = 'default',
  showIcon = true,
  animated = false,
  className,
  iconClassName,
  labelClassName,
  onClick,
}) => {
  const config = statusConfig[status]
  const Icon = config.icon
  
  const sizes = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
      dot: 'h-2 w-2',
    },
    md: {
      container: 'px-2.5 py-1.5 text-sm',
      icon: 'h-4 w-4',
      dot: 'h-2.5 w-2.5',
    },
    lg: {
      container: 'px-3 py-2 text-base',
      icon: 'h-5 w-5',
      dot: 'h-3 w-3',
    },
  }
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'subtle':
        return cn(
          'bg-transparent',
          config.color
        )
      case 'outline':
        return cn(
          'bg-transparent border',
          config.color,
          config.border
        )
      case 'dot':
        return 'bg-transparent'
      default:
        return cn(
          config.bg,
          config.color,
          'border border-transparent'
        )
    }
  }
  
  const getAnimationStyles = () => {
    if (!animated) return ''
    
    switch (status) {
      case 'loading':
        return 'animate-pulse'
      case 'running':
        return 'animate-pulse'
      default:
        return ''
    }
  }
  
  const containerClasses = cn(
    'inline-flex items-center gap-1.5 font-medium rounded-full',
    sizes[size].container,
    getVariantStyles(),
    getAnimationStyles(),
    onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
    className
  )
  
  if (variant === 'dot') {
    return (
      <div
        className={cn('inline-flex items-center gap-2', className)}
        onClick={onClick}
      >
        <div
          className={cn(
            'rounded-full',
            config.bg,
            sizes[size].dot,
            animated && status === 'loading' && 'animate-ping'
          )}
        />
        {label && (
          <span
            className={cn(
              'text-gray-700 dark:text-gray-300',
              sizes[size].container.includes('text-xs') && 'text-xs',
              sizes[size].container.includes('text-sm') && 'text-sm',
              sizes[size].container.includes('text-base') && 'text-base',
              labelClassName
            )}
          >
            {label}
          </span>
        )}
      </div>
    )
  }
  
  return (
    <div className={containerClasses} onClick={onClick}>
      {showIcon && (
        <Icon
          className={cn(
            sizes[size].icon,
            animated && status === 'loading' && 'animate-spin',
            iconClassName
          )}
        />
      )}
      {label && (
        <span className={cn('truncate', labelClassName)}>
          {label}
        </span>
      )}
    </div>
  )
}

// Preset Status Components
export const SuccessStatus: React.FC<Omit<StatusIndicatorProps, 'status'>> = (props) => (
  <StatusIndicator status="success" {...props} />
)

export const ErrorStatus: React.FC<Omit<StatusIndicatorProps, 'status'>> = (props) => (
  <StatusIndicator status="error" {...props} />
)

export const WarningStatus: React.FC<Omit<StatusIndicatorProps, 'status'>> = (props) => (
  <StatusIndicator status="warning" {...props} />
)

export const InfoStatus: React.FC<Omit<StatusIndicatorProps, 'status'>> = (props) => (
  <StatusIndicator status="info" {...props} />
)

export const PendingStatus: React.FC<Omit<StatusIndicatorProps, 'status'>> = (props) => (
  <StatusIndicator status="pending" {...props} />
)

export const RunningStatus: React.FC<Omit<StatusIndicatorProps, 'status'>> = (props) => (
  <StatusIndicator status="running" animated {...props} />
)

export const StoppedStatus: React.FC<Omit<StatusIndicatorProps, 'status'>> = (props) => (
  <StatusIndicator status="stopped" {...props} />
)

export const PausedStatus: React.FC<Omit<StatusIndicatorProps, 'status'>> = (props) => (
  <StatusIndicator status="paused" {...props} />
)

export const LoadingStatus: React.FC<Omit<StatusIndicatorProps, 'status'>> = (props) => (
  <StatusIndicator status="loading" animated {...props} />
)

// Service Status specific component
export interface ServiceStatusProps {
  status: 'healthy' | 'unhealthy' | 'starting' | 'stopping' | 'unknown'
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'subtle' | 'outline' | 'dot'
  className?: string
}

export const ServiceStatus: React.FC<ServiceStatusProps> = ({
  status,
  label,
  ...props
}) => {
  const statusMap = {
    healthy: 'running' as const,
    unhealthy: 'error' as const,
    starting: 'loading' as const,
    stopping: 'loading' as const,
    unknown: 'pending' as const,
  }
  
  const labelMap = {
    healthy: label || 'Healthy',
    unhealthy: label || 'Unhealthy',
    starting: label || 'Starting',
    stopping: label || 'Stopping',
    unknown: label || 'Unknown',
  }
  
  return (
    <StatusIndicator
      status={statusMap[status]}
      label={labelMap[status]}
      animated={status === 'starting' || status === 'stopping'}
      {...props}
    />
  )
}

export default StatusIndicator