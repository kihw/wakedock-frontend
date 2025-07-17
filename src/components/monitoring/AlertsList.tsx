'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { 
  AlertTriangle, 
  Bell, 
  BellOff, 
  CheckCircle, 
  XCircle, 
  Info, 
  Clock, 
  Filter, 
  Search, 
  RefreshCw, 
  Settings, 
  Eye, 
  EyeOff, 
  Trash2, 
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Target,
  Tag,
  ExternalLink,
  Copy,
  Archive,
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react'

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type AlertStatus = 'active' | 'resolved' | 'acknowledged' | 'suppressed'
export type AlertCategory = 'system' | 'security' | 'performance' | 'availability' | 'capacity'

export interface Alert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  category: AlertCategory
  source: string
  timestamp: string
  resolvedAt?: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  suppressedUntil?: string
  tags: string[]
  metadata?: Record<string, any>
  count?: number
  relatedAlerts?: string[]
  runbook?: string
  affectedResources?: string[]
}

export interface AlertsListProps {
  alerts: Alert[]
  loading?: boolean
  error?: string
  onAcknowledge?: (alertId: string) => void
  onResolve?: (alertId: string) => void
  onSuppress?: (alertId: string, duration: number) => void
  onDelete?: (alertId: string) => void
  onBulkAction?: (alertIds: string[], action: string) => void
  onRefresh?: () => void
  onAlertClick?: (alert: Alert) => void
  showResolved?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  className?: string
}

const severityConfig = {
  critical: {
    icon: XCircle,
    label: 'Critical',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    priority: 5,
  },
  high: {
    icon: AlertTriangle,
    label: 'High',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    priority: 4,
  },
  medium: {
    icon: AlertTriangle,
    label: 'Medium',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    priority: 3,
  },
  low: {
    icon: Info,
    label: 'Low',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    priority: 2,
  },
  info: {
    icon: Info,
    label: 'Info',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800',
    priority: 1,
  },
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
    icon: AlertCircle,
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
    icon: CheckCircle,
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    icon: Eye,
  },
  suppressed: {
    label: 'Suppressed',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    icon: EyeOff,
  },
}

const categoryConfig = {
  system: {
    label: 'System',
    color: 'text-blue-600 dark:text-blue-400',
    icon: Activity,
  },
  security: {
    label: 'Security',
    color: 'text-red-600 dark:text-red-400',
    icon: AlertTriangle,
  },
  performance: {
    label: 'Performance',
    color: 'text-yellow-600 dark:text-yellow-400',
    icon: Zap,
  },
  availability: {
    label: 'Availability',
    color: 'text-green-600 dark:text-green-400',
    icon: Target,
  },
  capacity: {
    label: 'Capacity',
    color: 'text-purple-600 dark:text-purple-400',
    icon: Archive,
  },
}

export const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  loading = false,
  error,
  onAcknowledge,
  onResolve,
  onSuppress,
  onDelete,
  onBulkAction,
  onRefresh,
  onAlertClick,
  showResolved = false,
  autoRefresh = false,
  refreshInterval = 30000,
  className,
}) => {
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity[]>([])
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus[]>([])
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'status'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const filteredAlerts = useMemo(() => {
    let filtered = alerts
    
    // Filter by resolved status
    if (!showResolved) {
      filtered = filtered.filter(alert => alert.status !== 'resolved')
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // Apply severity filter
    if (selectedSeverity.length > 0) {
      filtered = filtered.filter(alert => selectedSeverity.includes(alert.severity))
    }
    
    // Apply status filter
    if (selectedStatus.length > 0) {
      filtered = filtered.filter(alert => selectedStatus.includes(alert.status))
    }
    
    // Apply category filter
    if (selectedCategory.length > 0) {
      filtered = filtered.filter(alert => selectedCategory.includes(alert.category))
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case 'severity':
          aValue = severityConfig[a.severity].priority
          bValue = severityConfig[b.severity].priority
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return filtered
  }, [alerts, showResolved, searchQuery, selectedSeverity, selectedStatus, selectedCategory, sortBy, sortOrder])
  
  const alertCounts = useMemo(() => {
    const counts = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
      high: alerts.filter(a => a.severity === 'high' && a.status === 'active').length,
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
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}m ago`
    }
  }
  
  const toggleAlertSelection = (alertId: string) => {
    setSelectedAlerts(prev =>
      prev.includes(alertId)
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    )
  }
  
  const selectAllAlerts = () => {
    setSelectedAlerts(filteredAlerts.map(alert => alert.id))
  }
  
  const clearSelection = () => {
    setSelectedAlerts([])
  }
  
  const handleBulkAction = (action: string) => {
    if (selectedAlerts.length > 0) {
      onBulkAction?.(selectedAlerts, action)
      clearSelection()
    }
  }
  
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
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
  
  const toggleCategoryFilter = (category: AlertCategory) => {
    setSelectedCategory(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }
  
  const renderAlert = (alert: Alert) => {
    const severityConf = severityConfig[alert.severity]
    const statusConf = statusConfig[alert.status]
    const categoryConf = categoryConfig[alert.category]
    const SeverityIcon = severityConf.icon
    const StatusIcon = statusConf.icon
    const CategoryIcon = categoryConf.icon
    const isExpanded = expandedAlert === alert.id
    const isSelected = selectedAlerts.includes(alert.id)
    
    return (
      <div
        key={alert.id}
        className={cn(
          'border rounded-lg transition-all duration-200',
          severityConf.border,
          isSelected && 'ring-2 ring-blue-500',
          alert.status === 'suppressed' && 'opacity-60'
        )}
      >
        <div
          className={cn(
            'p-4 cursor-pointer',
            severityConf.bg,
            onAlertClick && 'hover:bg-opacity-80'
          )}
          onClick={() => onAlertClick?.(alert)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleAlertSelection(alert.id)
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <SeverityIcon className={cn('h-5 w-5', severityConf.color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {alert.title}
                  </h3>
                  
                  {alert.count && alert.count > 1 && (
                    <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                      {alert.count}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {alert.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(alert.timestamp)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <CategoryIcon className="h-3 w-3" />
                    <span>{categoryConf.label}</span>
                  </div>
                  
                  <span>Source: {alert.source}</span>
                  
                  {alert.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span>{alert.tags.slice(0, 2).join(', ')}</span>
                      {alert.tags.length > 2 && (
                        <span>+{alert.tags.length - 2}</span>
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
                
                {alert.suppressedUntil && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Suppressed until {new Date(alert.suppressedUntil).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={cn('px-2 py-1 rounded-full text-xs font-medium', statusConf.bg, statusConf.color)}>
                {statusConf.label}
              </div>
              
              <div className="flex items-center gap-1">
                {alert.status === 'active' && onAcknowledge && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAcknowledge(alert.id)
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                    title="Acknowledge"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                
                {alert.status !== 'resolved' && onResolve && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onResolve(alert.id)
                    }}
                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                    title="Resolve"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                
                {alert.status !== 'suppressed' && onSuppress && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSuppress(alert.id, 3600000) // 1 hour
                    }}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Suppress for 1 hour"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(alert.id)
                    }}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedAlert(isExpanded ? null : alert.id)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Alert ID:</span>
                    <span className="ml-2 font-mono text-gray-900 dark:text-white">{alert.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Severity:</span>
                    <span className={cn('ml-2 font-medium', severityConf.color)}>{severityConf.label}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                    <span className={cn('ml-2', categoryConf.color)}>{categoryConf.label}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Source:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{alert.source}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {alert.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {alert.affectedResources && alert.affectedResources.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Affected Resources</h4>
                    <div className="space-y-1">
                      {alert.affectedResources.map((resource, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {resource}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Metadata</h4>
                <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                  {JSON.stringify(alert.metadata, null, 2)}
                </pre>
              </div>
            )}
            
            {alert.runbook && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Runbook</h4>
                <a
                  href={alert.runbook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Runbook
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="text-center py-8">
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
      </div>
    )
  }
  
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Bell className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Alerts
          </h3>
          
          <div className="flex items-center gap-2">
            {alertCounts.critical > 0 && (
              <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                {alertCounts.critical} Critical
              </span>
            )}
            
            {alertCounts.high > 0 && (
              <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                {alertCounts.high} High
              </span>
            )}
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAlerts.length} of {alertCounts.total}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedAlerts.length} selected
              </span>
              
              <button
                onClick={() => handleBulkAction('acknowledge')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40"
              >
                Acknowledge
              </button>
              
              <button
                onClick={() => handleBulkAction('resolve')}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/40"
              >
                Resolve
              </button>
              
              <button
                onClick={clearSelection}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
          </button>
          
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
              {Object.entries(categoryConfig).map(([category, config]) => (
                <button
                  key={category}
                  onClick={() => toggleCategoryFilter(category as AlertCategory)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    selectedCategory.includes(category as AlertCategory)
                      ? `${config.color} bg-gray-100 dark:bg-gray-700`
                      : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
            onChange={(e) => e.target.checked ? selectAllAlerts() : clearSelection()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Select All</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSort('timestamp')}
            className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Clock className="h-4 w-4" />
            Time
            {sortBy === 'timestamp' && (
              sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            )}
          </button>
          
          <button
            onClick={() => handleSort('severity')}
            className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <AlertTriangle className="h-4 w-4" />
            Severity
            {sortBy === 'severity' && (
              sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            )}
          </button>
          
          <button
            onClick={() => handleSort('status')}
            className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <CheckCircle className="h-4 w-4" />
            Status
            {sortBy === 'status' && (
              sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
      
      {/* Alerts List */}
      <div className="max-h-96 overflow-y-auto">
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
          <div className="p-4 space-y-4">
            {filteredAlerts.map(renderAlert)}
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsList