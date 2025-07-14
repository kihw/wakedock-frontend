'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { 
  Activity, 
  User, 
  Server, 
  Settings, 
  Play, 
  Square, 
  RotateCcw, 
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Database,
  Network,
  Shield,
  Code,
  Zap
} from 'lucide-react'

export type ActivityType = 
  | 'service_start'
  | 'service_stop'
  | 'service_restart'
  | 'service_create'
  | 'service_delete'
  | 'service_update'
  | 'system_alert'
  | 'system_warning'
  | 'system_info'
  | 'user_login'
  | 'user_logout'
  | 'config_change'
  | 'backup_created'
  | 'backup_restored'
  | 'network_change'
  | 'security_event'
  | 'deployment'
  | 'error'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
  target?: {
    id: string
    name: string
    type: 'service' | 'container' | 'network' | 'volume' | 'image'
  }
  metadata?: Record<string, any>
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'success' | 'failure' | 'pending' | 'cancelled'
}

export interface ActivityFeedProps {
  activities: ActivityItem[]
  loading?: boolean
  error?: string
  autoRefresh?: boolean
  refreshInterval?: number
  maxItems?: number
  showFilters?: boolean
  showUserInfo?: boolean
  showTimestamp?: boolean
  onRefresh?: () => void
  onItemClick?: (item: ActivityItem) => void
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
}

const activityConfig = {
  service_start: {
    icon: Play,
    label: 'Service Started',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  service_stop: {
    icon: Square,
    label: 'Service Stopped',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  service_restart: {
    icon: RotateCcw,
    label: 'Service Restarted',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  service_create: {
    icon: Server,
    label: 'Service Created',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  service_delete: {
    icon: Trash2,
    label: 'Service Deleted',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  service_update: {
    icon: Settings,
    label: 'Service Updated',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  system_alert: {
    icon: AlertTriangle,
    label: 'System Alert',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  system_warning: {
    icon: AlertTriangle,
    label: 'System Warning',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  system_info: {
    icon: CheckCircle,
    label: 'System Info',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  user_login: {
    icon: User,
    label: 'User Login',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  user_logout: {
    icon: User,
    label: 'User Logout',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-900/20',
  },
  config_change: {
    icon: Settings,
    label: 'Configuration Changed',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  backup_created: {
    icon: Download,
    label: 'Backup Created',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  backup_restored: {
    icon: Upload,
    label: 'Backup Restored',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  network_change: {
    icon: Network,
    label: 'Network Change',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  security_event: {
    icon: Shield,
    label: 'Security Event',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  deployment: {
    icon: Code,
    label: 'Deployment',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
}

const severityConfig = {
  low: {
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
  },
  medium: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  high: {
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
  },
  critical: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
}

const statusConfig = {
  success: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
  },
  failure: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
  pending: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
  },
  cancelled: {
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
  },
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  error,
  autoRefresh = false,
  refreshInterval = 30000,
  maxItems = 50,
  showFilters = true,
  showUserInfo = true,
  showTimestamp = true,
  onRefresh,
  onItemClick,
  onLoadMore,
  hasMore = false,
  className,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([])
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  
  const filteredActivities = useMemo(() => {
    let filtered = activities
    
    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item => selectedTypes.includes(item.type))
    }
    
    // Apply severity filter
    if (selectedSeverity.length > 0) {
      filtered = filtered.filter(item => 
        item.severity && selectedSeverity.includes(item.severity)
      )
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.target?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Limit items
    if (maxItems > 0) {
      filtered = filtered.slice(0, maxItems)
    }
    
    return filtered
  }, [activities, selectedTypes, selectedSeverity, searchQuery, maxItems])
  
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
  
  const formatFullTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }
  
  const toggleTypeFilter = (type: ActivityType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }
  
  const toggleSeverityFilter = (severity: string) => {
    setSelectedSeverity(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    )
  }
  
  const renderActivityItem = (item: ActivityItem) => {
    const config = activityConfig[item.type]
    const Icon = config.icon
    const isExpanded = expandedItem === item.id
    
    return (
      <div
        key={item.id}
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border transition-all duration-200',
          'hover:bg-gray-50 dark:hover:bg-gray-800',
          'border-gray-200 dark:border-gray-700',
          onItemClick && 'cursor-pointer'
        )}
        onClick={() => onItemClick?.(item)}
      >
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0',
          config.bg
        )}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {item.title}
            </h4>
            
            <div className="flex items-center gap-2">
              {item.severity && (
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  severityConfig[item.severity].bg,
                  severityConfig[item.severity].color
                )}>
                  {item.severity}
                </span>
              )}
              
              {item.status && (
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  statusConfig[item.status].bg,
                  statusConfig[item.status].color
                )}>
                  {item.status}
                </span>
              )}
              
              {showTimestamp && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(item.timestamp)}
                </span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {showUserInfo && item.user && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{item.user.name}</span>
                </div>
              )}
              
              {item.target && (
                <div className="flex items-center gap-1">
                  <Server className="h-3 w-3" />
                  <span>{item.target.name}</span>
                </div>
              )}
            </div>
            
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpandedItem(isExpanded ? null : item.id)
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
          
          {isExpanded && item.metadata && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(item.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  if (loading && activities.length === 0) {
    return (
      <div className={cn('space-y-4 animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
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
          Error Loading Activity Feed
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
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Activity Feed
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredActivities.length} items
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
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
      {showFilterPanel && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Types:</span>
            {Object.entries(activityConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type as ActivityType)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                  selectedTypes.includes(type as ActivityType)
                    ? `${config.color} ${config.bg}`
                    : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
          
          {/* Severity Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Severity:</span>
            {Object.entries(severityConfig).map(([severity, config]) => (
              <button
                key={severity}
                onClick={() => toggleSeverityFilter(severity)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                  selectedSeverity.includes(severity)
                    ? `${config.color} ${config.bg}`
                    : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No activities found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {activities.length === 0 ? 'No recent activity to display.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map(renderActivityItem)}
        </div>
      )}
      
      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Load More
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed