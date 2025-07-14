'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  Cpu, 
  HardDrive, 
  Network, 
  Activity, 
  Server, 
  Database,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

export interface SystemResource {
  cpu: {
    usage: number
    cores: number
    load: number[]
    temperature?: number
  }
  memory: {
    total: number
    used: number
    free: number
    cached: number
    buffers: number
    swap: {
      total: number
      used: number
    }
  }
  disk: {
    total: number
    used: number
    free: number
    readRate: number
    writeRate: number
    iops: number
  }
  network: {
    interfaces: Array<{
      name: string
      rxBytes: number
      txBytes: number
      rxRate: number
      txRate: number
      status: 'up' | 'down'
    }>
  }
  uptime: number
  loadAverage: number[]
  processes: {
    total: number
    running: number
    sleeping: number
    zombie: number
  }
}

export interface SystemMetricsProps {
  metrics: SystemResource
  historical?: Array<{
    timestamp: number
    metrics: SystemResource
  }>
  loading?: boolean
  error?: string
  refreshInterval?: number
  autoRefresh?: boolean
  onRefresh?: () => void
  variant?: 'cards' | 'compact' | 'detailed'
  showCharts?: boolean
  className?: string
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({
  metrics,
  historical = [],
  loading = false,
  error,
  refreshInterval = 5000,
  autoRefresh = true,
  onRefresh,
  variant = 'cards',
  showCharts = false,
  className,
}) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return
    
    const interval = setInterval(() => {
      onRefresh()
      setLastUpdate(Date.now())
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh, refreshInterval])
  
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
  
  const getHealthStatus = (usage: number, critical = 90, warning = 70) => {
    if (usage >= critical) return { status: 'critical', color: 'text-red-600 dark:text-red-400', icon: XCircle }
    if (usage >= warning) return { status: 'warning', color: 'text-yellow-600 dark:text-yellow-400', icon: AlertTriangle }
    return { status: 'healthy', color: 'text-green-600 dark:text-green-400', icon: CheckCircle }
  }
  
  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500'
    if (usage >= 70) return 'bg-yellow-500'
    if (usage >= 50) return 'bg-blue-500'
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
  
  const renderProgressBar = (value: number, max: number, label: string, showPercentage = true) => {
    const percentage = Math.min((value / max) * 100, 100)
    
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {showPercentage ? `${percentage.toFixed(1)}%` : `${formatBytes(value)} / ${formatBytes(max)}`}
          </span>
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
    status?: 'healthy' | 'warning' | 'critical'
  ) => {
    const statusConfig = status ? getHealthStatus(0) : null
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="h-3 w-3 text-green-500" />
              ) : null}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {trend.percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        
        {subtitle && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </div>
        )}
        
        {statusConfig && (
          <div className={cn('flex items-center gap-1 mt-2', statusConfig.color)}>
            <statusConfig.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{statusConfig.status}</span>
          </div>
        )}
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className={cn('space-y-6 animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
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
          Error Loading System Metrics
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
  const networkTotal = metrics.network.interfaces.reduce((total, iface) => total + iface.rxRate + iface.txRate, 0)
  
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Metrics</h3>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {renderProgressBar(cpuUsage, 100, 'CPU Usage')}
            {renderProgressBar(metrics.memory.used, metrics.memory.total, 'Memory Usage', false)}
          </div>
          
          <div className="space-y-3">
            {renderProgressBar(metrics.disk.used, metrics.disk.total, 'Disk Usage', false)}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Network I/O</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatRate(networkTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">System Metrics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Uptime: {formatUptime(metrics.uptime)}
            </span>
          </div>
          
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          <Cpu className="h-5 w-5 text-blue-500" />,
          'CPU Usage',
          `${cpuUsage.toFixed(1)}%`,
          `${metrics.cpu.cores} cores • Load: ${metrics.cpu.load[0]?.toFixed(2)}`,
          getTrend(cpuUsage, historical[historical.length - 2]?.metrics.cpu.usage || 0)
        )}
        
        {renderMetricCard(
          <HardDrive className="h-5 w-5 text-green-500" />,
          'Memory Usage',
          formatBytes(metrics.memory.used),
          `${memoryUsage.toFixed(1)}% of ${formatBytes(metrics.memory.total)}`,
          getTrend(memoryUsage, historical[historical.length - 2]?.metrics ? 
            (historical[historical.length - 2].metrics.memory.used / historical[historical.length - 2].metrics.memory.total) * 100 : 0
          )
        )}
        
        {renderMetricCard(
          <Database className="h-5 w-5 text-purple-500" />,
          'Disk Usage',
          formatBytes(metrics.disk.used),
          `${diskUsage.toFixed(1)}% of ${formatBytes(metrics.disk.total)}`,
          getTrend(diskUsage, historical[historical.length - 2]?.metrics ? 
            (historical[historical.length - 2].metrics.disk.used / historical[historical.length - 2].metrics.disk.total) * 100 : 0
          )
        )}
        
        {renderMetricCard(
          <Network className="h-5 w-5 text-orange-500" />,
          'Network I/O',
          formatRate(networkTotal),
          `${metrics.network.interfaces.length} interfaces`,
          getTrend(networkTotal, historical[historical.length - 2]?.metrics ? 
            historical[historical.length - 2].metrics.network.interfaces.reduce((total, iface) => total + iface.rxRate + iface.txRate, 0) : 0
          )
        )}
        
        {renderMetricCard(
          <Activity className="h-5 w-5 text-red-500" />,
          'Load Average',
          metrics.loadAverage[0]?.toFixed(2) || '0.00',
          `1m: ${metrics.loadAverage[0]?.toFixed(2)} 5m: ${metrics.loadAverage[1]?.toFixed(2)} 15m: ${metrics.loadAverage[2]?.toFixed(2)}`
        )}
        
        {renderMetricCard(
          <Server className="h-5 w-5 text-cyan-500" />,
          'Processes',
          metrics.processes.total.toString(),
          `${metrics.processes.running} running, ${metrics.processes.sleeping} sleeping`
        )}
        
        {renderMetricCard(
          <Zap className="h-5 w-5 text-yellow-500" />,
          'Disk I/O',
          formatRate(metrics.disk.readRate + metrics.disk.writeRate),
          `Read: ${formatRate(metrics.disk.readRate)} Write: ${formatRate(metrics.disk.writeRate)}`
        )}
        
        {renderMetricCard(
          <BarChart3 className="h-5 w-5 text-indigo-500" />,
          'Swap Usage',
          formatBytes(metrics.memory.swap.used),
          `${((metrics.memory.swap.used / metrics.memory.swap.total) * 100).toFixed(1)}% of ${formatBytes(metrics.memory.swap.total)}`
        )}
      </div>
      
      {/* Detailed View */}
      {variant === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">CPU Details</h4>
            <div className="space-y-3">
              {renderProgressBar(cpuUsage, 100, 'CPU Usage')}
              {metrics.cpu.temperature && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metrics.cpu.temperature}°C
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cores</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {metrics.cpu.cores}
                </span>
              </div>
            </div>
          </div>
          
          {/* Memory Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Memory Details</h4>
            <div className="space-y-3">
              {renderProgressBar(metrics.memory.used, metrics.memory.total, 'Used Memory', false)}
              {renderProgressBar(metrics.memory.cached, metrics.memory.total, 'Cached Memory', false)}
              {renderProgressBar(metrics.memory.buffers, metrics.memory.total, 'Buffers', false)}
              {renderProgressBar(metrics.memory.swap.used, metrics.memory.swap.total, 'Swap Usage', false)}
            </div>
          </div>
          
          {/* Network Interfaces */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Network Interfaces</h4>
            <div className="space-y-3">
              {metrics.network.interfaces.map((iface, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      iface.status === 'up' ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {iface.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ↓ {formatRate(iface.rxRate)} ↑ {formatRate(iface.txRate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Disk I/O */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Disk I/O</h4>
            <div className="space-y-3">
              {renderProgressBar(metrics.disk.used, metrics.disk.total, 'Disk Usage', false)}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Read Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatRate(metrics.disk.readRate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Write Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatRate(metrics.disk.writeRate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">IOPS</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {metrics.disk.iops}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemMetrics