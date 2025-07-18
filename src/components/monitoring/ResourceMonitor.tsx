'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network,
  Zap,
  Server,
  Monitor,
  Gauge,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Settings,
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Target,
  Thermometer,
  Fan,
  Battery,
  Wifi,
  Database,
  Container,
  Layers,
  Play,
  Pause,
  Download,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Grid3x3,
  List,
  Search,
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

export type ResourceType = 'cpu' | 'memory' | 'disk' | 'network' | 'gpu' | 'container'
export type TimeRange = '1m' | '5m' | '15m' | '1h' | '6h' | '24h'
export type AlertLevel = 'info' | 'warning' | 'critical'

export interface ResourceMetrics {
  cpu: {
    usage: number
    cores: number
    frequency: number
    temperature?: number
    processes: number
    loadAverage: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    cached: number
    buffers: number
    available: number
    swapTotal: number
    swapUsed: number
  }
  disk: {
    total: number
    used: number
    free: number
    readRate: number
    writeRate: number
    iops: number
    mountPoints: Array<{
      path: string
      total: number
      used: number
      free: number
      filesystem: string
    }>
  }
  network: {
    interfaces: Array<{
      name: string
      rxBytes: number
      txBytes: number
      rxRate: number
      txRate: number
      rxPackets: number
      txPackets: number
      rxErrors: number
      txErrors: number
    }>
  }
  gpu?: {
    name: string
    usage: number
    memory: {
      total: number
      used: number
      free: number
    }
    temperature: number
    powerUsage: number
    fanSpeed: number
  }[]
  containers?: {
    total: number
    running: number
    stopped: number
    paused: number
    resources: Array<{
      id: string
      name: string
      status: string
      cpuUsage: number
      memoryUsage: number
      memoryLimit: number
      networkRx: number
      networkTx: number
      diskRead: number
      diskWrite: number
    }>
  }
  uptime: number
  timestamp: number
}

export interface ResourceAlert {
  id: string
  type: ResourceType
  level: AlertLevel
  message: string
  threshold: number
  currentValue: number
  timestamp: number
  acknowledged?: boolean
}

export interface ResourceThreshold {
  type: ResourceType
  metric: string
  warning: number
  critical: number
  enabled: boolean
}

export interface ResourceMonitorProps {
  metrics: ResourceMetrics
  history?: ResourceMetrics[]
  alerts?: ResourceAlert[]
  thresholds?: ResourceThreshold[]
  timeRange?: TimeRange
  loading?: boolean
  error?: string
  realtime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  onRefresh?: () => void
  onTimeRangeChange?: (range: TimeRange) => void
  onThresholdChange?: (threshold: ResourceThreshold) => void
  onAlertAcknowledge?: (alertId: string) => void
  onResourceClick?: (type: ResourceType) => void
  onExport?: () => void
  className?: string
}

const resourceConfig = {
  cpu: {
    icon: Cpu,
    label: 'CPU',
    color: 'text-blue-600 dark:text-blue-400',
    unit: '%',
  },
  memory: {
    icon: MemoryStick,
    label: 'Memory',
    color: 'text-green-600 dark:text-green-400',
    unit: 'bytes',
  },
  disk: {
    icon: HardDrive,
    label: 'Disk',
    color: 'text-purple-600 dark:text-purple-400',
    unit: 'bytes',
  },
  network: {
    icon: Network,
    label: 'Network',
    color: 'text-orange-600 dark:text-orange-400',
    unit: 'bytes/s',
  },
  gpu: {
    icon: Monitor,
    label: 'GPU',
    color: 'text-red-600 dark:text-red-400',
    unit: '%',
  },
  container: {
    icon: Container,
    label: 'Containers',
    color: 'text-cyan-600 dark:text-cyan-400',
    unit: 'count',
  },
}

const alertLevelConfig = {
  info: {
    icon: Info,
    label: 'Info',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  critical: {
    icon: XCircle,
    label: 'Critical',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
}

export const ResourceMonitor: React.FC<ResourceMonitorProps> = ({
  metrics,
  history = [],
  alerts = [],
  thresholds = [],
  timeRange = '1h',
  loading = false,
  error,
  realtime = false,
  autoRefresh = true,
  refreshInterval = 5000,
  onRefresh,
  onTimeRangeChange,
  onThresholdChange,
  onAlertAcknowledge,
  onResourceClick,
  onExport,
  className,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedResources, setSelectedResources] = useState<ResourceType[]>(['cpu', 'memory', 'disk', 'network'])
  const [showAlerts, setShowAlerts] = useState(true)
  const [showThresholds, setShowThresholds] = useState(false)
  const [expandedResource, setExpandedResource] = useState<ResourceType | null>(null)
  
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }
  
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }
  
  const getResourceTrend = (type: ResourceType, metric: string) => {
    if (history.length < 2) return null
    
    const recent = history.slice(-5)
    const getValue = (m: ResourceMetrics) => {
      switch (type) {
        case 'cpu':
          return m.cpu.usage
        case 'memory':
          return (m.memory.used / m.memory.total) * 100
        case 'disk':
          return (m.disk.used / m.disk.total) * 100
        case 'network':
          return m.network.interfaces.reduce((sum, iface) => sum + iface.rxRate + iface.txRate, 0)
        default:
          return 0
      }
    }
    
    const currentAvg = recent.reduce((sum, m) => sum + getValue(m), 0) / recent.length
    const previousAvg = history.slice(-10, -5).reduce((sum, m) => sum + getValue(m), 0) / Math.min(5, history.length - 5)
    
    if (currentAvg > previousAvg * 1.1) return 'up'
    if (currentAvg < previousAvg * 0.9) return 'down'
    return 'stable'
  }
  
  const getResourceStatus = (type: ResourceType, value: number) => {
    const threshold = thresholds.find(t => t.type === type)
    if (!threshold) return 'normal'
    
    if (value >= threshold.critical) return 'critical'
    if (value >= threshold.warning) return 'warning'
    return 'normal'
  }
  
  const renderResourceCard = (type: ResourceType) => {
    const config = resourceConfig[type]
    const Icon = config.icon
    const trend = getResourceTrend(type, 'usage')
    const isExpanded = expandedResource === type
    
    let primaryValue = 0
    let secondaryValue = ''
    let details: JSX.Element | null = null
    
    switch (type) {
      case 'cpu':
        primaryValue = metrics.cpu.usage
        secondaryValue = `${metrics.cpu.cores} cores`
        details = (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
              <span className="text-gray-900 dark:text-white">{metrics.cpu.frequency} MHz</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Processes:</span>
              <span className="text-gray-900 dark:text-white">{metrics.cpu.processes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Load Average:</span>
              <span className="text-gray-900 dark:text-white">{metrics.cpu.loadAverage.join(', ')}</span>
            </div>
            {metrics.cpu.temperature && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
                <span className="text-gray-900 dark:text-white">{metrics.cpu.temperature}°C</span>
              </div>
            )}
          </div>
        )
        break
        
      case 'memory':
        primaryValue = (metrics.memory.used / metrics.memory.total) * 100
        secondaryValue = `${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`
        details = (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Available:</span>
              <span className="text-gray-900 dark:text-white">{formatBytes(metrics.memory.available)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Cached:</span>
              <span className="text-gray-900 dark:text-white">{formatBytes(metrics.memory.cached)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Buffers:</span>
              <span className="text-gray-900 dark:text-white">{formatBytes(metrics.memory.buffers)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Swap:</span>
              <span className="text-gray-900 dark:text-white">{formatBytes(metrics.memory.swapUsed)} / {formatBytes(metrics.memory.swapTotal)}</span>
            </div>
          </div>
        )
        break
        
      case 'disk':
        primaryValue = (metrics.disk.used / metrics.disk.total) * 100
        secondaryValue = `${formatBytes(metrics.disk.used)} / ${formatBytes(metrics.disk.total)}`
        details = (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Read Rate:</span>
              <span className="text-gray-900 dark:text-white">{formatBytes(metrics.disk.readRate)}/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Write Rate:</span>
              <span className="text-gray-900 dark:text-white">{formatBytes(metrics.disk.writeRate)}/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">IOPS:</span>
              <span className="text-gray-900 dark:text-white">{metrics.disk.iops}</span>
            </div>
            {metrics.disk.mountPoints.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Mount Points:</div>
                <div className="space-y-1">
                  {metrics.disk.mountPoints.slice(0, 3).map((mount, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{mount.path}</span>
                      <span className="text-gray-900 dark:text-white">{((mount.used / mount.total) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
        break
        
      case 'network':
        const totalRx = metrics.network.interfaces.reduce((sum, iface) => sum + iface.rxRate, 0)
        const totalTx = metrics.network.interfaces.reduce((sum, iface) => sum + iface.txRate, 0)
        primaryValue = totalRx + totalTx
        secondaryValue = `↓ ${formatBytes(totalRx)}/s ↑ ${formatBytes(totalTx)}/s`
        details = (
          <div className="space-y-2">
            {metrics.network.interfaces.slice(0, 3).map((iface, index) => (
              <div key={index} className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{iface.name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">RX:</span>
                    <span className="ml-1 text-gray-900 dark:text-white">{formatBytes(iface.rxRate)}/s</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">TX:</span>
                    <span className="ml-1 text-gray-900 dark:text-white">{formatBytes(iface.txRate)}/s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
        break
        
      default:
        return null
    }
    
    const status = getResourceStatus(type, primaryValue)
    const statusColor = status === 'critical' ? 'text-red-500' : status === 'warning' ? 'text-yellow-500' : 'text-green-500'
    
    return (
      <div
        key={type}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
          'hover:shadow-md transition-all duration-200 cursor-pointer',
          status === 'critical' && 'border-red-300 dark:border-red-700',
          status === 'warning' && 'border-yellow-300 dark:border-yellow-700'
        )}
        onClick={() => {
          onResourceClick?.(type)
          setExpandedResource(isExpanded ? null : type)
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Icon className={cn('h-5 w-5', config.color)} />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{config.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{secondaryValue}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {trend && (
              <div className="flex items-center">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-400" />
                )}
              </div>
            )}
            
            <div className="text-right">
              <div className={cn('text-2xl font-bold', statusColor)}>
                {type === 'network' ? formatBytes(primaryValue) : `${primaryValue.toFixed(1)}%`}
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                status === 'critical' ? 'bg-red-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              )}
              style={{ width: `${type === 'network' ? Math.min(primaryValue / 1000000, 100) : Math.min(primaryValue, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Expanded details */}
        {isExpanded && details && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {details}
          </div>
        )}
      </div>
    )
  }
  
  const renderAlerts = () => {
    if (!showAlerts || alerts.length === 0) return null
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900 dark:text-white">Active Alerts</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{alerts.length}</span>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {alerts.map(alert => {
            const levelConf = alertLevelConfig[alert.level]
            const LevelIcon = levelConf.icon
            const resourceConf = resourceConfig[alert.type]
            const ResourceIcon = resourceConf.icon
            
            return (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border',
                  levelConf.bg,
                  alert.level === 'critical' ? 'border-red-300 dark:border-red-700' : 
                  alert.level === 'warning' ? 'border-yellow-300 dark:border-yellow-700' : 
                  'border-blue-300 dark:border-blue-700'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center gap-1">
                      <ResourceIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <LevelIcon className={cn('h-4 w-4', levelConf.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.message}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {alert.currentValue.toFixed(1)} / {alert.threshold.toFixed(1)} threshold
                      </div>
                    </div>
                  </div>
                  
                  {onAlertAcknowledge && !alert.acknowledged && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAlertAcknowledge(alert.id)
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  const renderContainers = () => {
    if (!metrics.containers || !selectedResources.includes('container')) return null
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Container className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Containers</h3>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {metrics.containers.running} / {metrics.containers.total} running
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.containers.running}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {metrics.containers.stopped}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Stopped</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {metrics.containers.paused}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Paused</div>
          </div>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {metrics.containers.resources.slice(0, 5).map(container => (
            <div key={container.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  container.status === 'running' ? 'bg-green-500' : 
                  container.status === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'
                )} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {container.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>CPU: {container.cpuUsage.toFixed(1)}%</span>
                <span>MEM: {formatBytes(container.memoryUsage)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className={cn('space-y-6 animate-pulse', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Resource Monitor
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
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Activity className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Resource Monitor
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              System uptime: {formatUptime(metrics.uptime)}
            </p>
          </div>
          
          {realtime && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={cn(
              'px-3 py-1 text-xs rounded-full transition-colors',
              showAlerts
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            )}
          >
            {showAlerts ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Alerts
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
      
      {/* Resource Cards */}
      <div className={cn(
        'grid gap-4',
        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'
      )}>
        {selectedResources.map(renderResourceCard)}
      </div>
      
      {/* Alerts and Containers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderAlerts()}
        {renderContainers()}
      </div>
      
      {/* Resource Toggle */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(resourceConfig).map(([type, config]) => {
          const Icon = config.icon
          const isSelected = selectedResources.includes(type as ResourceType)
          
          return (
            <button
              key={type}
              onClick={() => setSelectedResources(prev => 
                prev.includes(type as ResourceType)
                  ? prev.filter(r => r !== type)
                  : [...prev, type as ResourceType]
              )}
              className={cn(
                'flex items-center gap-2 px-3 py-1 text-sm rounded-full transition-colors',
                isSelected
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              )}
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ResourceMonitor