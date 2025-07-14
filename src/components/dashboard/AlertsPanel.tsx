'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  CheckCircle, 
  Info,
  Bell,
  BellOff,
  X,
  Filter,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success'
export type AlertStatus = 'active' | 'resolved' | 'acknowledged' | 'muted'

export interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  timestamp: string
  resolvedAt?: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface AlertsPanelProps {
  alerts: Alert[]
  loading?: boolean
  error?: string
  showResolved?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  onRefresh?: () => void
  onAcknowledge?: (alertId: string) => void
  onResolve?: (alertId: string) => void
  onMute?: (alertId: string) => void
  onUnmute?: (alertId: string) => void
  onDelete?: (alertId: string) => void
  onClearAll?: () => void
  onSettings?: () => void
  className?: string
}

const severityConfig = {
  critical: {
    icon: XCircle,
    label: 'Critical',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    priority: 4,
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    priority: 3,
  },
  info: {
    icon: Info,
    label: 'Info',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    priority: 2,
  },
  success: {
    icon: CheckCircle,
    label: 'Success',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    priority: 1,
  },
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
  },
  muted: {
    label: 'Muted',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
  },
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  loading = false,
  error,
  showResolved = false,
  autoRefresh = true,
  refreshInterval = 30000,
  onRefresh,
  onAcknowledge,
  onResolve,
  onMute,
  onUnmute,
  onDelete,
  onClearAll,
  onSettings,
  className,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity[]>([])
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const filteredAlerts = useMemo(() => {
    let filtered = alerts
    
    // Filter by resolved status
    if (!showResolved) {
      filtered = filtered.filter(alert => alert.status !== 'resolved')
    }
    
    // Filter by severity
    if (selectedSeverity.length > 0) {
      filtered = filtered.filter(alert => selectedSeverity.includes(alert.severity))
    }
    
    // Filter by status
    if (selectedStatus.length > 0) {
      filtered = filtered.filter(alert => selectedStatus.includes(alert.status))
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.source.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Sort by priority and timestamp
    filtered.sort((a, b) => {
      const aPriority = severityConfig[a.severity].priority
      const bPriority = severityConfig[b.severity].priority
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
    
    return filtered
  }, [alerts, showResolved, selectedSeverity, selectedStatus, searchQuery])
  
  const alertCounts = useMemo(() => {
    const counts = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
      warning: alerts.filter(a => a.severity === 'warning' && a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
    }
    return counts
  }, [alerts])
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    }
  }
  
  const toggleSeverityFilter = (severity: AlertSeverity) => {
    setSelectedSeverity(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    )
  }
  
  const toggleStatusFilter = (status: AlertStatus) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }
  
  const renderAlertActions = (alert: Alert) => (
    <div className="flex items-center gap-2">
      {alert.status === 'active' && onAcknowledge && (
        <button
          onClick={() => onAcknowledge(alert.id)}
          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
          title="Acknowledge"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
      
      {alert.status === 'active' && onResolve && (
        <button
          onClick={() => onResolve(alert.id)}
          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
          title="Resolve"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      )}
      
      {alert.status !== 'muted' && onMute && (
        <button
          onClick={() => onMute(alert.id)}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Mute"
        >
          <BellOff className="h-4 w-4" />
        </button>
      )}
      
      {alert.status === 'muted' && onUnmute && (
        <button
          onClick={() => onUnmute(alert.id)}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Unmute"
        >
          <Bell className="h-4 w-4" />
        </button>
      )}
      
      {onDelete && (
        <button
          onClick={() => onDelete(alert.id)}
          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
  
  const renderAlert = (alert: Alert) => {
    const severityConf = severityConfig[alert.severity]
    const statusConf = statusConfig[alert.status]
    const SeverityIcon = severityConf.icon
    const isExpanded = expandedAlert === alert.id
    
    return (
      <div
        key={alert.id}
        className={cn(
          'border rounded-lg p-4 transition-all duration-200',
          severityConf.bg,
          severityConf.border,
          alert.status === 'muted' && 'opacity-60'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <SeverityIcon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', severityConf.color)} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {alert.title}
                </h4>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  statusConf.bg,
                  statusConf.color
                )}>
                  {statusConf.label}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {alert.message}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimestamp(alert.timestamp)}</span>
                </div>
                
                <span>Source: {alert.source}</span>
                
                {alert.tags && alert.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {alert.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {alert.tags.length > 3 && (
                      <span className="text-gray-400">+{alert.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              
              {alert.acknowledgedAt && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  Acknowledged {formatTimestamp(alert.acknowledgedAt)}
                  {alert.acknowledgedBy && ` by ${alert.acknowledgedBy}`}
                </div>
              )}
              
              {alert.resolvedAt && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  Resolved {formatTimestamp(alert.resolvedAt)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {renderAlertActions(alert)}
            
            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
              <button
                onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Show details"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
        
        {isExpanded && alert.metadata && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Details</h5>
            <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
              {JSON.stringify(alert.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className={cn('space-y-4 animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Alerts
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Alerts
          </h3>
          
          <div className="flex items-center gap-2">
            {alertCounts.critical > 0 && (
              <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                {alertCounts.critical} Critical
              </span>
            )}
            
            {alertCounts.warning > 0 && (
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                {alertCounts.warning} Warning
              </span>
            )}
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAlerts.length} of {alertCounts.total}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
          </button>
          
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          
          {onClearAll && alertCounts.total > 0 && (
            <button
              onClick={onClearAll}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Severity Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Severity:</span>
            {Object.entries(severityConfig).map(([severity, config]) => (
              <button
                key={severity}
                onClick={() => toggleSeverityFilter(severity as AlertSeverity)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                  selectedSeverity.includes(severity as AlertSeverity)
                    ? `${config.color} ${config.bg}`
                    : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
          
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status as AlertStatus)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                  selectedStatus.includes(status as AlertStatus)
                    ? `${config.color} ${config.bg}`
                    : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No alerts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {alerts.length === 0 ? 'All systems are running smoothly.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(renderAlert)}
        </div>
      )}
    </div>
  )
}

export default AlertsPanel