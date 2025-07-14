'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  Download, 
  Search, 
  Filter, 
  RefreshCw,
  Trash2,
  Settings,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
  Terminal
} from 'lucide-react'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  source?: string
  metadata?: Record<string, any>
}

export interface LogViewerProps {
  containerId: string
  containerName: string
  logs: LogEntry[]
  loading?: boolean
  error?: string
  streaming?: boolean
  maxLines?: number
  showTimestamp?: boolean
  showLevel?: boolean
  showSource?: boolean
  autoScroll?: boolean
  searchQuery?: string
  levelFilter?: LogLevel[]
  onStreamToggle?: (streaming: boolean) => void
  onClear?: () => void
  onDownload?: () => void
  onSearch?: (query: string) => void
  onLevelFilter?: (levels: LogLevel[]) => void
  onRefresh?: () => void
  className?: string
}

const logLevelConfig = {
  debug: {
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: Info,
    priority: 0,
  },
  info: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: Info,
    priority: 1,
  },
  warn: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: AlertTriangle,
    priority: 2,
  },
  error: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: XCircle,
    priority: 3,
  },
  fatal: {
    color: 'text-red-800 dark:text-red-300',
    bg: 'bg-red-100 dark:bg-red-900/40',
    icon: XCircle,
    priority: 4,
  },
}

export const LogViewer: React.FC<LogViewerProps> = ({
  containerId,
  containerName,
  logs,
  loading = false,
  error,
  streaming = false,
  maxLines = 1000,
  showTimestamp = true,
  showLevel = true,
  showSource = false,
  autoScroll = true,
  searchQuery = '',
  levelFilter = [],
  onStreamToggle,
  onClear,
  onDownload,
  onSearch,
  onLevelFilter,
  onRefresh,
  className,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState(searchQuery)
  const [internalLevelFilter, setInternalLevelFilter] = useState<LogLevel[]>(levelFilter)
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [fontSize, setFontSize] = useState(12)
  const [wordWrap, setWordWrap] = useState(false)
  
  const logContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  
  const filteredLogs = useMemo(() => {
    let filtered = logs
    
    // Apply search filter
    if (internalSearchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(internalSearchQuery.toLowerCase()) ||
        log.source?.toLowerCase().includes(internalSearchQuery.toLowerCase())
      )
    }
    
    // Apply level filter
    if (internalLevelFilter.length > 0) {
      filtered = filtered.filter(log => internalLevelFilter.includes(log.level))
    }
    
    // Limit to maxLines
    if (filtered.length > maxLines) {
      filtered = filtered.slice(-maxLines)
    }
    
    return filtered
  }, [logs, internalSearchQuery, internalLevelFilter, maxLines])
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }
  
  const formatLevel = (level: LogLevel) => {
    return level.toUpperCase().padEnd(5)
  }
  
  const handleSearch = (query: string) => {
    setInternalSearchQuery(query)
    onSearch?.(query)
  }
  
  const handleLevelFilter = (levels: LogLevel[]) => {
    setInternalLevelFilter(levels)
    onLevelFilter?.(levels)
  }
  
  const toggleLevelFilter = (level: LogLevel) => {
    const newFilter = internalLevelFilter.includes(level)
      ? internalLevelFilter.filter(l => l !== level)
      : [...internalLevelFilter, level]
    
    handleLevelFilter(newFilter)
  }
  
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const scrollToTop = () => {
    logContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const downloadLogs = () => {
    const logText = filteredLogs.map(log => {
      const timestamp = showTimestamp ? formatTimestamp(log.timestamp) : ''
      const level = showLevel ? formatLevel(log.level) : ''
      const source = showSource && log.source ? `[${log.source}]` : ''
      const parts = [timestamp, level, source, log.message].filter(Boolean)
      return parts.join(' ')
    }).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${containerName}-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  useEffect(() => {
    if (autoScroll && !selectedEntry) {
      scrollToBottom()
    }
  }, [filteredLogs, autoScroll, selectedEntry])
  
  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
    )
  }
  
  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-gray-900', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {containerName} Logs
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredLogs.length} entries
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {onStreamToggle && (
            <button
              onClick={() => onStreamToggle(!streaming)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                streaming
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              )}
            >
              {streaming ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {streaming ? 'Pause' : 'Stream'}
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
          </button>
          
          {onDownload && (
            <button
              onClick={onDownload || downloadLogs}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          
          {onClear && (
            <button
              onClick={onClear}
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
                value={internalSearchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Level Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Levels:</span>
              {Object.entries(logLevelConfig).map(([level, config]) => (
                <button
                  key={level}
                  onClick={() => toggleLevelFilter(level as LogLevel)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    internalLevelFilter.includes(level as LogLevel)
                      ? `${config.color} ${config.bg}`
                      : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
            
            {/* Display Options */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Word wrap</span>
              </label>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Font size:</span>
                <input
                  type="range"
                  min="10"
                  max="16"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">{fontSize}px</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Log Content */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={logContainerRef}
          className="h-full overflow-y-auto bg-gray-900 text-gray-100 font-mono"
          style={{ fontSize: `${fontSize}px` }}
        >
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading logs...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">No logs found</div>
            </div>
          ) : (
            <div className="p-4">
              {filteredLogs.map((log) => {
                const config = logLevelConfig[log.level]
                const LevelIcon = config.icon
                
                return (
                  <div
                    key={log.id}
                    className={cn(
                      'flex items-start gap-2 py-1 hover:bg-gray-800 cursor-pointer transition-colors',
                      selectedEntry?.id === log.id && 'bg-gray-800',
                      wordWrap ? 'flex-wrap' : 'whitespace-nowrap'
                    )}
                    onClick={() => setSelectedEntry(selectedEntry?.id === log.id ? null : log)}
                  >
                    {showTimestamp && (
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    )}
                    
                    {showLevel && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <LevelIcon className={cn('h-3 w-3', config.color)} />
                        <span className={cn('text-xs font-medium', config.color)}>
                          {formatLevel(log.level)}
                        </span>
                      </div>
                    )}
                    
                    {showSource && log.source && (
                      <span className="text-blue-400 text-xs flex-shrink-0">
                        [{log.source}]
                      </span>
                    )}
                    
                    <span className={cn('flex-1', wordWrap ? 'break-words' : 'truncate')}>
                      {log.message}
                    </span>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={scrollToTop}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          
          <button
            onClick={scrollToBottom}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {streaming && (
            <span className="inline-flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </span>
          )}
        </div>
      </div>
      
      {/* Selected Entry Details */}
      {selectedEntry && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Log Details</h4>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Timestamp:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(selectedEntry.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div>
                <span className="text-gray-500 dark:text-gray-400">Level:</span>
                <span className={cn('ml-2 font-medium', logLevelConfig[selectedEntry.level].color)}>
                  {selectedEntry.level.toUpperCase()}
                </span>
              </div>
              
              {selectedEntry.source && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Source:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedEntry.source}</span>
                </div>
              )}
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Message:</span>
              <pre className="mt-1 text-gray-900 dark:text-white bg-white dark:bg-gray-900 p-2 rounded text-sm overflow-x-auto">
                {selectedEntry.message}
              </pre>
            </div>
            
            {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Metadata:</span>
                <pre className="mt-1 text-gray-900 dark:text-white bg-white dark:bg-gray-900 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(selectedEntry.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LogViewer