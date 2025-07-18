'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { 
  FileText, 
  Filter, 
  Search, 
  Download, 
  RefreshCw, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Info, 
  XCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Settings,
  Trash2,
  Play,
  Pause,
  Terminal,
  Server,
  Activity
} from 'lucide-react'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type LogSource = 'system' | 'application' | 'security' | 'network' | 'database'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: LogSource
  service?: string
  message: string
  metadata?: Record<string, any>
  tags?: string[]
  correlationId?: string
  userId?: string
  ip?: string
  userAgent?: string
}

export interface LogsTableProps {
  logs: LogEntry[]
  loading?: boolean
  error?: string
  totalCount?: number
  pageSize?: number
  currentPage?: number
  hasMore?: boolean
  realtime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  onRefresh?: () => void
  onLoadMore?: () => void
  onPageChange?: (page: number) => void
  onLogClick?: (log: LogEntry) => void
  onExport?: () => void
  onClearLogs?: () => void
  onToggleRealtime?: (enabled: boolean) => void
  className?: string
}

const levelConfig = {
  debug: {
    icon: Info,
    label: 'Debug',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
    priority: 1,
  },
  info: {
    icon: Info,
    label: 'Info',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    priority: 2,
  },
  warn: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    priority: 3,
  },
  error: {
    icon: XCircle,
    label: 'Error',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    priority: 4,
  },
  fatal: {
    icon: XCircle,
    label: 'Fatal',
    color: 'text-red-800 dark:text-red-300',
    bg: 'bg-red-100 dark:bg-red-900/40',
    priority: 5,
  },
}

const sourceConfig = {
  system: {
    icon: Server,
    label: 'System',
    color: 'text-blue-600 dark:text-blue-400',
  },
  application: {
    icon: Terminal,
    label: 'Application',
    color: 'text-green-600 dark:text-green-400',
  },
  security: {
    icon: AlertTriangle,
    label: 'Security',
    color: 'text-red-600 dark:text-red-400',
  },
  network: {
    icon: Activity,
    label: 'Network',
    color: 'text-purple-600 dark:text-purple-400',
  },
  database: {
    icon: FileText,
    label: 'Database',
    color: 'text-orange-600 dark:text-orange-400',
  },
}

export const LogsTable: React.FC<LogsTableProps> = ({
  logs,
  loading = false,
  error,
  totalCount,
  pageSize = 50,
  currentPage = 1,
  hasMore = false,
  realtime = false,
  autoRefresh = false,
  refreshInterval = 5000,
  onRefresh,
  onLoadMore,
  onPageChange,
  onLogClick,
  onExport,
  onClearLogs,
  onToggleRealtime,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<LogLevel[]>([])
  const [selectedSource, setSelectedSource] = useState<LogSource[]>([])
  const [selectedService, setSelectedService] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'timestamp' | 'level' | 'source'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedLogs, setExpandedLogs] = useState<string[]>([])
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])
  
  const services = useMemo(() => {
    const serviceSet = new Set(logs.map(log => log.service).filter(Boolean))
    return Array.from(serviceSet) as string[]
  }, [logs])
  
  const filteredLogs = useMemo(() => {
    let filtered = logs
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.correlationId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply level filter
    if (selectedLevel.length > 0) {
      filtered = filtered.filter(log => selectedLevel.includes(log.level))
    }
    
    // Apply source filter
    if (selectedSource.length > 0) {
      filtered = filtered.filter(log => selectedSource.includes(log.source))
    }
    
    // Apply service filter
    if (selectedService.length > 0) {
      filtered = filtered.filter(log => log.service && selectedService.includes(log.service))
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
        case 'level':
          aValue = levelConfig[a.level].priority
          bValue = levelConfig[b.level].priority
          break
        case 'source':
          aValue = a.source
          bValue = b.source
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
  }, [logs, searchQuery, selectedLevel, selectedSource, selectedService, sortBy, sortOrder])
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      // fractionalSecondDigits: 3,
    })
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }
  
  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    )
  }
  
  const toggleLogSelection = (logId: string) => {
    setSelectedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    )
  }
  
  const selectAllLogs = () => {
    setSelectedLogs(filteredLogs.map(log => log.id))
  }
  
  const clearSelection = () => {
    setSelectedLogs([])
  }
  
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }
  
  const renderLogRow = (log: LogEntry) => {
    const levelConf = levelConfig[log.level]
    const sourceConf = sourceConfig[log.source]
    const LevelIcon = levelConf.icon
    const SourceIcon = sourceConf.icon
    const isExpanded = expandedLogs.includes(log.id)
    const isSelected = selectedLogs.includes(log.id)
    
    return (
      <div key={log.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div
          className={cn(
            'flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
            isSelected && 'bg-blue-50 dark:bg-blue-900/20',
            onLogClick && 'cursor-pointer'
          )}
          onClick={() => onLogClick?.(log)}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                toggleLogSelection(log.id)
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLogExpansion(log.id)
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {formatTimestamp(log.timestamp)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', levelConf.bg, levelConf.color)}>
              <LevelIcon className="h-3 w-3" />
              {levelConf.label}
            </div>
            
            <div className={cn('flex items-center gap-1 text-xs', sourceConf.color)}>
              <SourceIcon className="h-3 w-3" />
              {sourceConf.label}
            </div>
            
            {log.service && (
              <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                {log.service}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 dark:text-white truncate">
              {log.message}
            </div>
            
            {log.tags && log.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {log.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs text-gray-600 dark:text-gray-400">
                    {tag}
                  </span>
                ))}
                {log.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{log.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(log.message)
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Copy message"
            >
              <Copy className="h-4 w-4 text-gray-400" />
            </button>
            
            {log.correlationId && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(log.correlationId!)
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Copy correlation ID"
              >
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                <div className="space-y-2 text-sm">
                  {log.correlationId && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Correlation ID:</span>
                      <span className="ml-2 font-mono text-gray-900 dark:text-white">{log.correlationId}</span>
                    </div>
                  )}
                  {log.userId && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">User ID:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{log.userId}</span>
                    </div>
                  )}
                  {log.ip && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">IP Address:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{log.ip}</span>
                    </div>
                  )}
                  {log.userAgent && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">User Agent:</span>
                      <span className="ml-2 text-gray-900 dark:text-white truncate">{log.userAgent}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Metadata</h4>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Full Message</h4>
              <div className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                {log.message}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  if (loading && logs.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse', className)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Logs
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
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Logs
          </h3>
          
          {totalCount !== undefined && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredLogs.length} of {totalCount}
            </span>
          )}
          
          {realtime && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {selectedLogs.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedLogs.length} selected
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
          
          {onToggleRealtime && (
            <button
              onClick={() => onToggleRealtime(!realtime)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                realtime
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              )}
            >
              {realtime ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {realtime ? 'Pause' : 'Resume'}
            </button>
          )}
          
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          
          {onClearLogs && (
            <button
              onClick={onClearLogs}
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Level Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Level:</span>
              {Object.entries(levelConfig).map(([level, config]) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(prev => 
                    prev.includes(level as LogLevel) 
                      ? prev.filter(l => l !== level)
                      : [...prev, level as LogLevel]
                  )}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    selectedLevel.includes(level as LogLevel)
                      ? `${config.color} ${config.bg}`
                      : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
            
            {/* Source Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Source:</span>
              {Object.entries(sourceConfig).map(([source, config]) => (
                <button
                  key={source}
                  onClick={() => setSelectedSource(prev => 
                    prev.includes(source as LogSource) 
                      ? prev.filter(s => s !== source)
                      : [...prev, source as LogSource]
                  )}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    selectedSource.includes(source as LogSource)
                      ? `${config.color} bg-gray-100 dark:bg-gray-700`
                      : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
            
            {/* Service Filter */}
            {services.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Service:</span>
                {services.map(service => (
                  <button
                    key={service}
                    onClick={() => setSelectedService(prev => 
                      prev.includes(service) 
                        ? prev.filter(s => s !== service)
                        : [...prev, service]
                    )}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                      selectedService.includes(service)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                    )}
                  >
                    {service}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Table Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
            onChange={(e) => e.target.checked ? selectAllLogs() : clearSelection()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSort('timestamp')}
            className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Clock className="h-4 w-4" />
            Timestamp
            {sortBy === 'timestamp' && (
              sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            )}
          </button>
          
          <button
            onClick={() => handleSort('level')}
            className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <AlertTriangle className="h-4 w-4" />
            Level
            {sortBy === 'level' && (
              sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            )}
          </button>
          
          <button
            onClick={() => handleSort('source')}
            className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Server className="h-4 w-4" />
            Source
            {sortBy === 'source' && (
              sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
      
      {/* Logs List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No logs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div>
            {filteredLogs.map(renderLogRow)}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {(hasMore || onPageChange) && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredLogs.length} logs
          </div>
          
          <div className="flex items-center gap-2">
            {onPageChange && (
              <>
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage}
                </span>
                
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={!hasMore}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </>
            )}
            
            {onLoadMore && hasMore && (
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LogsTable