'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { 
  Cpu, 
  HardDrive, 
  Network, 
  Database, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Monitor,
  Server,
  Thermometer,
  Gauge,
  Settings,
  Info,
  Filter,
  Download,
  Maximize2,
  Minimize2
} from 'lucide-react'

export interface ResourceMetrics {
  cpu: {
    usage: number
    cores: number
    frequency: number
    temperature?: number
    processes: number
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
    readOps: number
    writeOps: number
    utilization: number
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
      errors: number
      drops: number
    }>
    totalRx: number
    totalTx: number
    totalRxRate: number
    totalTxRate: number
  }
  load: {
    avg1: number
    avg5: number
    avg15: number
  }
  uptime: number
  timestamp: number
}

export interface ResourceUsageProps {
  metrics: ResourceMetrics
  historical?: Array<{
    timestamp: number
    metrics: ResourceMetrics
  }>
  loading?: boolean
  error?: string
  refreshInterval?: number
  autoRefresh?: boolean
  showTrends?: boolean
  showDetails?: boolean
  variant?: 'overview' | 'detailed' | 'compact'
  alertThresholds?: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  onRefresh?: () => void
  onExport?: () => void
  onToggleDetails?: (show: boolean) => void
  className?: string
}

const defaultThresholds = {
  cpu: 80,
  memory: 85,
  disk: 90,
  network: 1000, // MB/s
}

export const ResourceUsage: React.FC<ResourceUsageProps> = ({
  metrics,
  historical = [],
  loading = false,
  error,
  refreshInterval = 5000,
  autoRefresh = true,
  showTrends = true,
  showDetails = false,
  variant = 'overview',
  alertThresholds = defaultThresholds,
  onRefresh,
  onExport,
  onToggleDetails,
  className,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu')
  const [showAlerts, setShowAlerts] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(['cpu', 'memory'])
  
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }
  
  const formatRate = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s'
  }
  
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }
  
  const getAlertStatus = (value: number, threshold: number, type: 'percentage' | 'absolute' = 'percentage') => {
    const percentage = type === 'percentage' ? value : (value / threshold) * 100
    
    if (percentage >= 95) return { level: 'critical', color: 'text-red-600 dark:text-red-400', icon: XCircle }
    if (percentage >= threshold) return { level: 'warning', color: 'text-yellow-600 dark:text-yellow-400', icon: AlertTriangle }
    return { level: 'normal', color: 'text-green-600 dark:text-green-400', icon: CheckCircle }
  }
  
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    if (percentage >= 50) return 'bg-blue-500'
    return 'bg-green-500'
  }
  
  const getTrend = (current: number, previous: number) => {
    if (historical.length < 2) return null
    
    const change = current - previous
    const percentage = previous > 0 ? (change / previous) * 100 : 0
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs(percentage),
      value: Math.abs(change),
    }
  }
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }
  
  const renderProgressBar = (value: number, max: number, label: string, showValue = true) => {
    const percentage = Math.min((value / max) * 100, 100)
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {showValue && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatBytes(value)} / {formatBytes(max)} ({percentage.toFixed(1)}%)
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', getUsageColor(percentage))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
  
  const renderMetricCard = (
    icon: React.ReactNode,
    title: string,
    value: string,
    subtitle?: string,
    trend?: { direction: string; percentage: number },
    alert?: { level: string; color: string; icon: React.ComponentType<any> }
  ) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {trend && showTrends && (
            <div className="flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {trend.percentage.toFixed(1)}%
              </span>
            </div>
          )}
          
          {alert && showAlerts && (
            <div className={cn('flex items-center gap-1', alert.color)}>
              <alert.icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
      
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {value}
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  )
  
  const renderNetworkInterface = (iface: ResourceMetrics['network']['interfaces'][0]) => (
    <div key={iface.name} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="font-medium text-gray-900 dark:text-white">{iface.name}</span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>RX: {formatRate(iface.rxRate)}</span>
        <span>TX: {formatRate(iface.txRate)}</span>
        {iface.errors > 0 && (
          <span className="text-red-500">Errors: {iface.errors}</span>
        )}
      </div>
    </div>
  )
  
  if (loading) {
    return (
      <div className={cn('space-y-6 animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
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
          Error Loading Resource Usage
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
  
  const cpuUsage = metrics.cpu.usage
  const memoryUsage = (metrics.memory.used / metrics.memory.total) * 100
  const diskUsage = (metrics.disk.used / metrics.disk.total) * 100
  const networkUsage = metrics.network.totalRxRate + metrics.network.totalTxRate
  
  const cpuAlert = getAlertStatus(cpuUsage, alertThresholds.cpu)
  const memoryAlert = getAlertStatus(memoryUsage, alertThresholds.memory)
  const diskAlert = getAlertStatus(diskUsage, alertThresholds.disk)
  const networkAlert = getAlertStatus(networkUsage, alertThresholds.network * 1024 * 1024, 'absolute')
  
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Resource Usage</h3>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {cpuUsage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">CPU</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {memoryUsage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Memory</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {diskUsage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Disk</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatRate(networkUsage)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Network</div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resource Usage
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Uptime: {formatUptime(metrics.uptime)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              showAlerts
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            {showAlerts ? 'Hide Alerts' : 'Show Alerts'}
          </button>
          
          {onToggleDetails && (
            <button
              onClick={() => onToggleDetails(!showDetails)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {showDetails ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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
          
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard(
          <Cpu className="h-6 w-6 text-blue-500" />,
          'CPU Usage',
          `${cpuUsage.toFixed(1)}%`,
          `${metrics.cpu.cores} cores @ ${metrics.cpu.frequency}MHz`,
          getTrend(cpuUsage, historical[historical.length - 2]?.metrics.cpu.usage || 0),
          cpuAlert
        )}
        
        {renderMetricCard(
          <HardDrive className="h-6 w-6 text-green-500" />,
          'Memory Usage',
          `${memoryUsage.toFixed(1)}%`,
          `${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`,
          getTrend(memoryUsage, historical[historical.length - 2]?.metrics ? 
            (historical[historical.length - 2].metrics.memory.used / historical[historical.length - 2].metrics.memory.total) * 100 : 0
          ),
          memoryAlert
        )}
        
        {renderMetricCard(
          <Database className="h-6 w-6 text-purple-500" />,
          'Disk Usage',
          `${diskUsage.toFixed(1)}%`,
          `${formatBytes(metrics.disk.used)} / ${formatBytes(metrics.disk.total)}`,
          getTrend(diskUsage, historical[historical.length - 2]?.metrics ? 
            (historical[historical.length - 2].metrics.disk.used / historical[historical.length - 2].metrics.disk.total) * 100 : 0
          ),
          diskAlert
        )}
        
        {renderMetricCard(
          <Network className="h-6 w-6 text-orange-500" />,
          'Network I/O',
          formatRate(networkUsage),
          `${metrics.network.interfaces.length} interfaces`,
          getTrend(networkUsage, historical[historical.length - 2]?.metrics ? 
            historical[historical.length - 2].metrics.network.totalRxRate + historical[historical.length - 2].metrics.network.totalTxRate : 0
          ),
          networkAlert
        )}
      </div>
      
      {/* Detailed View */}
      {(variant === 'detailed' || showDetails) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">CPU Details</h4>
              <button
                onClick={() => toggleSection('cpu')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {expandedSections.includes('cpu') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
            
            {expandedSections.includes('cpu') && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.cpu.cores}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Cores</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.cpu.processes}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Processes</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Usage</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {cpuUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={cn('h-2 rounded-full transition-all duration-300', getUsageColor(cpuUsage))}
                      style={{ width: `${cpuUsage}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Load 1m:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {metrics.load.avg1.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Load 5m:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {metrics.load.avg5.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Load 15m:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {metrics.load.avg15.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {metrics.cpu.temperature && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metrics.cpu.temperature}°C
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Memory Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Memory Details</h4>
              <button
                onClick={() => toggleSection('memory')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {expandedSections.includes('memory') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
            
            {expandedSections.includes('memory') && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {renderProgressBar(metrics.memory.used, metrics.memory.total, 'Used Memory')}
                  {renderProgressBar(metrics.memory.cached, metrics.memory.total, 'Cached Memory')}
                  {renderProgressBar(metrics.memory.buffers, metrics.memory.total, 'Buffers')}
                  {renderProgressBar(metrics.memory.swapUsed, metrics.memory.swapTotal, 'Swap Usage')}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Available:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatBytes(metrics.memory.available)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Free:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatBytes(metrics.memory.free)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Disk Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Disk Details</h4>
              <button
                onClick={() => toggleSection('disk')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {expandedSections.includes('disk') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
            
            {expandedSections.includes('disk') && (
              <div className="space-y-4">
                {renderProgressBar(metrics.disk.used, metrics.disk.total, 'Disk Usage')}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Read Rate:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatRate(metrics.disk.readRate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Write Rate:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatRate(metrics.disk.writeRate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Read Ops:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {metrics.disk.readOps}/s
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Write Ops:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {metrics.disk.writeOps}/s
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Utilization</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metrics.disk.utilization.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Network Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Network Details</h4>
              <button
                onClick={() => toggleSection('network')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {expandedSections.includes('network') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
            
            {expandedSections.includes('network') && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total RX:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatRate(metrics.network.totalRxRate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total TX:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatRate(metrics.network.totalTxRate)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">Network Interfaces</h5>
                  <div className="space-y-2">
                    {metrics.network.interfaces.map(renderNetworkInterface)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourceUsage