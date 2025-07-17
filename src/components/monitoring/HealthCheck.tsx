'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Settings,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Zap,
  Database,
  Server,
  Globe,
  Wifi,
  Shield,
  Lock,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Eye,
  EyeOff,
  Play,
  Pause,
  AlertCircle,
  Info,
  Calendar,
  Target,
  CheckCircle2,
  Timer,
  BarChart3,
  PieChart,
  List,
  Grid3x3,
  User,
  Wrench,
  Bug,
  ArrowRight,
  ExternalLink,
  Copy,
  Download,
  MoreHorizontal
} from 'lucide-react'

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
export type CheckCategory = 'system' | 'database' | 'api' | 'cache' | 'storage' | 'network' | 'security' | 'custom'
export type CheckType = 'http' | 'tcp' | 'ping' | 'sql' | 'redis' | 'elasticsearch' | 'custom'

export interface HealthCheckResult {
  id: string
  name: string
  description: string
  category: CheckCategory
  type: CheckType
  status: HealthStatus
  responseTime: number
  lastChecked: string
  nextCheck: string
  interval: number
  timeout: number
  endpoint?: string
  details?: {
    message?: string
    error?: string
    metrics?: Record<string, any>
    metadata?: Record<string, any>
  }
  history?: {
    timestamp: string
    status: HealthStatus
    responseTime: number
  }[]
  tags?: string[]
  dependencies?: string[]
  critical?: boolean
  enabled?: boolean
}

export interface HealthCheckConfig {
  id: string
  name: string
  description: string
  category: CheckCategory
  type: CheckType
  endpoint: string
  interval: number
  timeout: number
  retries: number
  critical: boolean
  enabled: boolean
  headers?: Record<string, string>
  expectedStatus?: number
  expectedResponse?: string
  tags?: string[]
}

export interface HealthCheckProps {
  checks: HealthCheckResult[]
  configs?: HealthCheckConfig[]
  loading?: boolean
  error?: string
  overallStatus?: HealthStatus
  autoRefresh?: boolean
  refreshInterval?: number
  showHistory?: boolean
  showConfig?: boolean
  onRefresh?: () => void
  onRunCheck?: (checkId: string) => void
  onToggleCheck?: (checkId: string) => void
  onUpdateConfig?: (config: HealthCheckConfig) => void
  onCheckClick?: (check: HealthCheckResult) => void
  onExport?: () => void
  className?: string
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    label: 'Healthy',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
  },
  degraded: {
    icon: AlertTriangle,
    label: 'Degraded',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  unhealthy: {
    icon: XCircle,
    label: 'Unhealthy',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
  },
  unknown: {
    icon: AlertCircle,
    label: 'Unknown',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800',
  },
}

const categoryConfig = {
  system: {
    icon: Server,
    label: 'System',
    color: 'text-blue-600 dark:text-blue-400',
  },
  database: {
    icon: Database,
    label: 'Database',
    color: 'text-green-600 dark:text-green-400',
  },
  api: {
    icon: Globe,
    label: 'API',
    color: 'text-purple-600 dark:text-purple-400',
  },
  cache: {
    icon: Zap,
    label: 'Cache',
    color: 'text-orange-600 dark:text-orange-400',
  },
  storage: {
    icon: HardDrive,
    label: 'Storage',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  network: {
    icon: Network,
    label: 'Network',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  security: {
    icon: Shield,
    label: 'Security',
    color: 'text-red-600 dark:text-red-400',
  },
  custom: {
    icon: Wrench,
    label: 'Custom',
    color: 'text-gray-600 dark:text-gray-400',
  },
}

const typeConfig = {
  http: {
    icon: Globe,
    label: 'HTTP',
  },
  tcp: {
    icon: Network,
    label: 'TCP',
  },
  ping: {
    icon: Wifi,
    label: 'Ping',
  },
  sql: {
    icon: Database,
    label: 'SQL',
  },
  redis: {
    icon: Zap,
    label: 'Redis',
  },
  elasticsearch: {
    icon: Search,
    label: 'Elasticsearch',
  },
  custom: {
    icon: Wrench,
    label: 'Custom',
  },
}

export const HealthCheck: React.FC<HealthCheckProps> = ({
  checks,
  configs = [],
  loading = false,
  error,
  overallStatus = 'unknown',
  autoRefresh = true,
  refreshInterval = 30000,
  showHistory = false,
  showConfig = false,
  onRefresh,
  onRunCheck,
  onToggleCheck,
  onUpdateConfig,
  onCheckClick,
  onExport,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CheckCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<HealthStatus | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null)
  const [selectedChecks, setSelectedChecks] = useState<string[]>([])

  const filteredChecks = useMemo(() => {
    let filtered = checks

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(check =>
        check.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        check.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        check.endpoint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        check.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(check => check.category === selectedCategory)
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(check => check.status === selectedStatus)
    }

    // Sort by criticality and status
    filtered.sort((a, b) => {
      if (a.critical && !b.critical) return -1
      if (!a.critical && b.critical) return 1

      const statusOrder = { unhealthy: 0, degraded: 1, unknown: 2, healthy: 3 }
      return statusOrder[a.status] - statusOrder[b.status]
    })

    return filtered
  }, [checks, searchQuery, selectedCategory, selectedStatus])

  const healthStats = useMemo(() => {
    const stats = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length,
      unknown: checks.filter(c => c.status === 'unknown').length,
      critical: checks.filter(c => c.critical).length,
      avgResponseTime: 0,
    }

    if (checks.length > 0) {
      stats.avgResponseTime = checks.reduce((sum, c) => sum + c.responseTime, 0) / checks.length
    }

    return stats
  }, [checks])

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatLastChecked = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
  }

  const getStatusTrend = (history: { timestamp: string; status: HealthStatus; responseTime: number }[]) => {
    if (!history || history.length < 2) return null

    const recent = history.slice(-5)
    const healthyCount = recent.filter(h => h.status === 'healthy').length
    const totalCount = recent.length
    const healthyRatio = healthyCount / totalCount

    if (healthyRatio >= 0.8) return 'up'
    if (healthyRatio <= 0.4) return 'down'
    return 'stable'
  }

  const toggleCheckSelection = (checkId: string) => {
    setSelectedChecks(prev =>
      prev.includes(checkId)
        ? prev.filter(id => id !== checkId)
        : [...prev, checkId]
    )
  }

  const selectAllChecks = () => {
    setSelectedChecks(filteredChecks.map(check => check.id))
  }

  const clearSelection = () => {
    setSelectedChecks([])
  }

  const renderCheckCard = (check: HealthCheckResult) => {
    const statusConf = statusConfig[check.status]
    const categoryConf = categoryConfig[check.category]
    const typeConf = typeConfig[check.type]
    const StatusIcon = statusConf.icon
    const CategoryIcon = categoryConf.icon
    const TypeIcon = typeConf.icon
    const isExpanded = expandedCheck === check.id
    const isSelected = selectedChecks.includes(check.id)
    const trend = getStatusTrend(check.history)

    return (
      <div
        key={check.id}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200',
          statusConf.border,
          isSelected && 'ring-2 ring-blue-500',
          !check.enabled && 'opacity-60',
          'hover:shadow-md cursor-pointer'
        )}
        onClick={() => onCheckClick?.(check)}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation()
                  toggleCheckSelection(check.id)
                }}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CategoryIcon className={cn('h-4 w-4', categoryConf.color)} />
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {check.name}
                  </h3>
                  {check.critical && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                      Critical
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {check.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <TypeIcon className="h-3 w-3" />
                    <span>{typeConf.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatResponseTime(check.responseTime)}</span>
                  </div>

                  <span>Last: {formatLastChecked(check.lastChecked)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusConf.bg, statusConf.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusConf.label}
              </div>

              {trend && (
                <div className="flex items-center">
                  {trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : trend === 'down' ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              )}

              <div className="flex items-center gap-1">
                {onRunCheck && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRunCheck(check.id)
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    title="Run check now"
                  >
                    <Play className="h-3 w-3" />
                  </button>
                )}

                {onToggleCheck && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleCheck(check.id)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    title={check.enabled ? 'Disable check' : 'Enable check'}
                  >
                    {check.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedCheck(isExpanded ? null : check.id)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {check.endpoint && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {check.endpoint}
              </code>
            </div>
          )}

          {check.tags && check.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {check.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Configuration</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Interval:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{check.interval}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Timeout:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{check.timeout}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Next Check:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{formatLastChecked(check.nextCheck)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Status Details</h4>
                <div className="space-y-1 text-sm">
                  {check.details?.message && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Message:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{check.details.message}</span>
                    </div>
                  )}
                  {check.details?.error && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Error:</span>
                      <span className="ml-2 text-red-600 dark:text-red-400">{check.details.error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {check.details?.metrics && Object.keys(check.details.metrics).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Metrics</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(check.details.metrics).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showHistory && check.history && check.history.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent History</h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {check.history.slice(-5).map((entry, index) => {
                    const entryStatusConf = statusConfig[entry.status]
                    const EntryIcon = entryStatusConf.icon

                    return (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <EntryIcon className={cn('h-3 w-3', entryStatusConf.color)} />
                          <span className="text-gray-900 dark:text-white">{formatLastChecked(entry.timestamp)}</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatResponseTime(entry.responseTime)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('space-y-6 animate-pulse', className)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Health Checks
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

  const overallStatusConf = statusConfig[overallStatus]
  const OverallIcon = overallStatusConf.icon

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <OverallIcon className={cn('h-6 w-6', overallStatusConf.color)} />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Health Checks
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                System health monitoring and diagnostics
              </p>
            </div>
          </div>

          <div className={cn('px-3 py-1 rounded-full text-sm font-medium', overallStatusConf.bg, overallStatusConf.color)}>
            {overallStatusConf.label}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedChecks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedChecks.length} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
          </button>

          {onExport && (
            <button
              onClick={onExport}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthStats.healthy}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Healthy</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthStats.degraded}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Degraded</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthStats.unhealthy}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Unhealthy</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatResponseTime(healthStats.avgResponseTime)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search health checks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CheckCategory | 'all')}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryConfig).map(([category, config]) => (
                  <option key={category} value={category}>{config.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as HealthStatus | 'all')}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedChecks.length === filteredChecks.length && filteredChecks.length > 0}
            onChange={(e) => e.target.checked ? selectAllChecks() : clearSelection()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Select All</span>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredChecks.length} of {healthStats.total} checks
        </div>
      </div>

      {/* Health Checks */}
      {filteredChecks.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No health checks found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {checks.length === 0 ? 'No health checks configured.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        )}>
          {filteredChecks.map(renderCheckCard)}
        </div>
      )}
    </div>
  )
}

export default HealthCheck