'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Settings, 
  FileText, 
  Trash2, 
  ExternalLink,
  MoreVertical,
  Download,
  Upload,
  Copy,
  Edit,
  RefreshCw,
  Terminal,
  Archive,
  AlertTriangle
} from 'lucide-react'

export interface ServiceActionsProps {
  serviceId: string
  serviceName: string
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error'
  actions?: {
    start?: boolean
    stop?: boolean
    restart?: boolean
    configure?: boolean
    logs?: boolean
    delete?: boolean
    clone?: boolean
    export?: boolean
    terminal?: boolean
    visit?: boolean
  }
  loading?: boolean
  disabled?: boolean
  variant?: 'buttons' | 'dropdown' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onAction?: (action: string, serviceId: string) => void
  onConfirmAction?: (action: string, serviceId: string) => Promise<boolean>
}

const actionConfig = {
  start: {
    icon: Play,
    label: 'Start',
    color: 'text-green-600 hover:text-green-700',
    bg: 'bg-green-100 hover:bg-green-200',
    requiresConfirm: false,
  },
  stop: {
    icon: Square,
    label: 'Stop',
    color: 'text-red-600 hover:text-red-700',
    bg: 'bg-red-100 hover:bg-red-200',
    requiresConfirm: true,
  },
  restart: {
    icon: RotateCcw,
    label: 'Restart',
    color: 'text-blue-600 hover:text-blue-700',
    bg: 'bg-blue-100 hover:bg-blue-200',
    requiresConfirm: true,
  },
  configure: {
    icon: Settings,
    label: 'Configure',
    color: 'text-gray-600 hover:text-gray-700',
    bg: 'bg-gray-100 hover:bg-gray-200',
    requiresConfirm: false,
  },
  logs: {
    icon: FileText,
    label: 'View Logs',
    color: 'text-gray-600 hover:text-gray-700',
    bg: 'bg-gray-100 hover:bg-gray-200',
    requiresConfirm: false,
  },
  delete: {
    icon: Trash2,
    label: 'Delete',
    color: 'text-red-600 hover:text-red-700',
    bg: 'bg-red-100 hover:bg-red-200',
    requiresConfirm: true,
  },
  clone: {
    icon: Copy,
    label: 'Clone',
    color: 'text-blue-600 hover:text-blue-700',
    bg: 'bg-blue-100 hover:bg-blue-200',
    requiresConfirm: false,
  },
  export: {
    icon: Download,
    label: 'Export',
    color: 'text-gray-600 hover:text-gray-700',
    bg: 'bg-gray-100 hover:bg-gray-200',
    requiresConfirm: false,
  },
  terminal: {
    icon: Terminal,
    label: 'Terminal',
    color: 'text-gray-600 hover:text-gray-700',
    bg: 'bg-gray-100 hover:bg-gray-200',
    requiresConfirm: false,
  },
  visit: {
    icon: ExternalLink,
    label: 'Visit',
    color: 'text-blue-600 hover:text-blue-700',
    bg: 'bg-blue-100 hover:bg-blue-200',
    requiresConfirm: false,
  },
}

export const ServiceActions: React.FC<ServiceActionsProps> = ({
  serviceId,
  serviceName,
  status,
  actions = {},
  loading = false,
  disabled = false,
  variant = 'buttons',
  size = 'md',
  className,
  onAction,
  onConfirmAction,
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const sizes = {
    sm: {
      button: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      button: 'px-3 py-2 text-sm',
      icon: 'h-4 w-4',
    },
    lg: {
      button: 'px-4 py-3 text-base',
      icon: 'h-5 w-5',
    },
  }
  
  const getAvailableActions = () => {
    const availableActions: string[] = []
    
    // Status-dependent actions
    if (status === 'stopped' || status === 'error') {
      if (actions.start !== false) availableActions.push('start')
    }
    
    if (status === 'running') {
      if (actions.stop !== false) availableActions.push('stop')
      if (actions.restart !== false) availableActions.push('restart')
      if (actions.terminal !== false) availableActions.push('terminal')
      if (actions.visit !== false) availableActions.push('visit')
    }
    
    // Always available actions
    if (actions.configure !== false) availableActions.push('configure')
    if (actions.logs !== false) availableActions.push('logs')
    if (actions.clone !== false) availableActions.push('clone')
    if (actions.export !== false) availableActions.push('export')
    
    // Destructive actions
    if (actions.delete !== false) availableActions.push('delete')
    
    return availableActions
  }
  
  const handleAction = async (action: string) => {
    if (disabled || loading) return
    
    const config = actionConfig[action as keyof typeof actionConfig]
    if (!config) return
    
    setActionLoading(action)
    
    try {
      if (config.requiresConfirm && onConfirmAction) {
        const confirmed = await onConfirmAction(action, serviceId)
        if (!confirmed) {
          setActionLoading(null)
          return
        }
      }
      
      onAction?.(action, serviceId)
      setShowDropdown(false)
    } catch (error) {
      console.error(`Error executing action ${action}:`, error)
    } finally {
      setActionLoading(null)
    }
  }
  
  const renderActionButton = (action: string, key?: string) => {
    const config = actionConfig[action as keyof typeof actionConfig]
    if (!config) return null
    
    const Icon = config.icon
    const isLoading = actionLoading === action
    
    return (
      <button
        key={key || action}
        onClick={() => handleAction(action)}
        disabled={disabled || loading || isLoading}
        className={cn(
          'inline-flex items-center gap-2 font-medium rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          config.color,
          config.bg,
          sizes[size].button
        )}
      >
        {isLoading ? (
          <RefreshCw className={cn(sizes[size].icon, 'animate-spin')} />
        ) : (
          <Icon className={sizes[size].icon} />
        )}
        <span>{config.label}</span>
      </button>
    )
  }
  
  const renderDropdownItem = (action: string) => {
    const config = actionConfig[action as keyof typeof actionConfig]
    if (!config) return null
    
    const Icon = config.icon
    const isLoading = actionLoading === action
    const isDangerous = action === 'delete' || action === 'stop'
    
    return (
      <button
        key={action}
        onClick={() => handleAction(action)}
        disabled={disabled || loading || isLoading}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
          'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isDangerous 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-700 dark:text-gray-300'
        )}
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span>{config.label}</span>
      </button>
    )
  }
  
  const availableActions = getAvailableActions()
  
  if (availableActions.length === 0) {
    return null
  }
  
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {availableActions.slice(0, 3).map(action => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            disabled={disabled || loading || actionLoading === action}
            className={cn(
              'p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              actionConfig[action as keyof typeof actionConfig].color
            )}
          >
            {actionLoading === action ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              React.createElement(actionConfig[action as keyof typeof actionConfig].icon, {
                className: 'h-4 w-4'
              })
            )}
          </button>
        ))}
        {availableActions.length > 3 && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
  
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled || loading}
          className={cn(
            'inline-flex items-center gap-2 font-medium rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200',
            sizes[size].button
          )}
        >
          <MoreVertical className={sizes[size].icon} />
          <span>Actions</span>
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <div className="py-1">
              {availableActions.map(renderDropdownItem)}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // Default buttons variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {availableActions.map(action => renderActionButton(action))}
    </div>
  )
}

// Quick Action Buttons
export const QuickStartButton: React.FC<{
  serviceId: string
  onAction: (action: string, serviceId: string) => void
  disabled?: boolean
  loading?: boolean
}> = ({ serviceId, onAction, disabled, loading }) => (
  <button
    onClick={() => onAction('start', serviceId)}
    disabled={disabled || loading}
    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? (
      <RefreshCw className="h-4 w-4 animate-spin" />
    ) : (
      <Play className="h-4 w-4" />
    )}
    Start
  </button>
)

export const QuickStopButton: React.FC<{
  serviceId: string
  onAction: (action: string, serviceId: string) => void
  disabled?: boolean
  loading?: boolean
}> = ({ serviceId, onAction, disabled, loading }) => (
  <button
    onClick={() => onAction('stop', serviceId)}
    disabled={disabled || loading}
    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? (
      <RefreshCw className="h-4 w-4 animate-spin" />
    ) : (
      <Square className="h-4 w-4" />
    )}
    Stop
  </button>
)

export const QuickRestartButton: React.FC<{
  serviceId: string
  onAction: (action: string, serviceId: string) => void
  disabled?: boolean
  loading?: boolean
}> = ({ serviceId, onAction, disabled, loading }) => (
  <button
    onClick={() => onAction('restart', serviceId)}
    disabled={disabled || loading}
    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? (
      <RefreshCw className="h-4 w-4 animate-spin" />
    ) : (
      <RotateCcw className="h-4 w-4" />
    )}
    Restart
  </button>
)

export default ServiceActions