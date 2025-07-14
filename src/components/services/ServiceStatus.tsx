'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Play, 
  Square, 
  Pause,
  Zap,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react'

export type ServiceStatusType = 
  | 'running'
  | 'stopped'
  | 'starting'
  | 'stopping'
  | 'error'
  | 'pending'
  | 'unknown'

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'unknown'
  checks: {
    name: string
    status: 'passing' | 'failing' | 'unknown'
    message?: string
    duration?: number
  }[]
  lastCheck?: string
}

export interface ServiceStatusProps {
  status: ServiceStatusType
  health?: ServiceHealth
  uptime?: number
  lastHeartbeat?: string
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'detailed' | 'minimal'
  animated?: boolean
  className?: string
  onClick?: () => void
}

const statusConfig = {
  running: {
    icon: Play,
    label: 'Running',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    pulse: false,
  },
  stopped: {
    icon: Square,
    label: 'Stopped',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    pulse: false,
  },
  starting: {
    icon: Play,
    label: 'Starting',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    pulse: true,
  },
  stopping: {
    icon: Pause,
    label: 'Stopping',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    pulse: true,
  },
  error: {
    icon: XCircle,
    label: 'Error',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    pulse: false,
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800',
    pulse: false,
  },
  unknown: {
    icon: AlertCircle,
    label: 'Unknown',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800',
    pulse: false,
  },
}

const healthConfig = {
  healthy: {
    icon: CheckCircle,
    label: 'Healthy',
    color: 'text-green-600 dark:text-green-400',
  },
  unhealthy: {
    icon: XCircle,
    label: 'Unhealthy',
    color: 'text-red-600 dark:text-red-400',
  },
  unknown: {
    icon: AlertCircle,
    label: 'Unknown',
    color: 'text-gray-600 dark:text-gray-400',
  },
}

export const ServiceStatus: React.FC<ServiceStatusProps> = ({
  status,
  health,
  uptime,
  lastHeartbeat,
  showDetails = false,
  size = 'md',
  variant = 'default',
  animated = false,
  className,
  onClick,
}) => {
  const config = statusConfig[status]
  const StatusIcon = config.icon
  
  const sizes = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
      text: 'text-xs',
    },
    md: {
      badge: 'px-2.5 py-1.5 text-sm',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      badge: 'px-3 py-2 text-base',
      icon: 'h-5 w-5',
      text: 'text-base',
    },
  }
  
  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }
  
  const formatLastHeartbeat = (timestamp: string) => {
    const now = new Date()
    const beat = new Date(timestamp)
    const diffMs = now.getTime() - beat.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
    return `${Math.floor(diffSeconds / 86400)}d ago`
  }
  
  const getConnectionStatus = () => {
    if (!lastHeartbeat) return 'disconnected'
    
    const now = new Date()
    const beat = new Date(lastHeartbeat)
    const diffMs = now.getTime() - beat.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    
    // Consider disconnected if no heartbeat for more than 30 seconds
    return diffSeconds > 30 ? 'disconnected' : 'connected'
  }
  
  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        <div className={cn(
          'w-2 h-2 rounded-full',
          config.bg,
          animated && config.pulse && 'animate-pulse'
        )} />
        <span className={cn(config.color, sizes[size].text, 'font-medium')}>
          {config.label}
        </span>
      </div>
    )
  }
  
  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Main Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center rounded-full',
              config.bg,
              sizes[size].badge
            )}>
              <StatusIcon className={cn(
                sizes[size].icon,
                config.color,
                animated && config.pulse && 'animate-pulse'
              )} />
            </div>
            <div>
              <div className={cn('font-medium', config.color, sizes[size].text)}>
                {config.label}
              </div>
              {uptime !== undefined && (
                <div className={cn('text-gray-500 dark:text-gray-400', sizes[size].text)}>
                  Uptime: {formatUptime(uptime)}
                </div>
              )}
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {getConnectionStatus() === 'connected' ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className={cn(
              'text-gray-500 dark:text-gray-400',
              sizes[size].text
            )}>
              {lastHeartbeat ? formatLastHeartbeat(lastHeartbeat) : 'No heartbeat'}
            </span>
          </div>
        </div>
        
        {/* Health Checks */}
        {health && showDetails && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <span className={cn('font-medium text-gray-700 dark:text-gray-300', sizes[size].text)}>
                Health Checks
              </span>
            </div>
            
            <div className="space-y-1">
              {health.checks.map((check, index) => {
                const CheckIcon = check.status === 'passing' 
                  ? CheckCircle 
                  : check.status === 'failing' 
                  ? XCircle 
                  : AlertCircle
                
                const checkColor = check.status === 'passing'
                  ? 'text-green-600 dark:text-green-400'
                  : check.status === 'failing'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
                
                return (
                  <div key={index} className="flex items-center gap-2 pl-6">
                    <CheckIcon className={cn('h-3 w-3', checkColor)} />
                    <span className={cn('flex-1', sizes[size].text, 'text-gray-700 dark:text-gray-300')}>
                      {check.name}
                    </span>
                    {check.duration && (
                      <span className={cn('text-gray-500 dark:text-gray-400', sizes[size].text)}>
                        {check.duration}ms
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // Default variant
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-medium',
        config.bg,
        config.color,
        sizes[size].badge,
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      <StatusIcon className={cn(
        sizes[size].icon,
        animated && config.pulse && 'animate-pulse'
      )} />
      <span>{config.label}</span>
      
      {health && (
        <>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span className={healthConfig[health.status].color}>
            {healthConfig[health.status].label}
          </span>
        </>
      )}
    </div>
  )
}

// Preset Status Components
export const RunningStatus: React.FC<Omit<ServiceStatusProps, 'status'>> = (props) => (
  <ServiceStatus status="running" {...props} />
)

export const StoppedStatus: React.FC<Omit<ServiceStatusProps, 'status'>> = (props) => (
  <ServiceStatus status="stopped" {...props} />
)

export const StartingStatus: React.FC<Omit<ServiceStatusProps, 'status'>> = (props) => (
  <ServiceStatus status="starting" animated {...props} />
)

export const StoppingStatus: React.FC<Omit<ServiceStatusProps, 'status'>> = (props) => (
  <ServiceStatus status="stopping" animated {...props} />
)

export const ErrorStatus: React.FC<Omit<ServiceStatusProps, 'status'>> = (props) => (
  <ServiceStatus status="error" {...props} />
)

export const PendingStatus: React.FC<Omit<ServiceStatusProps, 'status'>> = (props) => (
  <ServiceStatus status="pending" {...props} />
)

export const UnknownStatus: React.FC<Omit<ServiceStatusProps, 'status'>> = (props) => (
  <ServiceStatus status="unknown" {...props} />
)

export default ServiceStatus