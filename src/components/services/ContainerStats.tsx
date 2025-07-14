'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  Cpu, 
  HardDrive, 
  Network, 
  Activity, 
  Clock, 
  Database,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react'

export interface ContainerResource {
  cpu: {
    usage: number
    limit?: number
    cores?: number
  }
  memory: {
    usage: number
    limit?: number
    cache?: number
    swap?: number
  }
  network: {
    rx: number
    tx: number
    rxRate?: number
    txRate?: number
  }
  disk: {
    read: number
    write: number
    readRate?: number
    writeRate?: number
  }
  processes?: number
  uptime?: number
  restarts?: number
}

export interface ContainerStatsProps {
  containerId: string
  containerName: string
  stats: ContainerResource
  historical?: Array<{
    timestamp: number
    stats: ContainerResource
  }>
  refreshInterval?: number
  loading?: boolean
  error?: string
  variant?: 'compact' | 'detailed' | 'minimal'
  showTrends?: boolean
  onRefresh?: () => void
  className?: string
}

export const ContainerStats: React.FC<ContainerStatsProps> = ({
  containerId,
  containerName,
  stats,
  historical = [],
  refreshInterval = 5000,
  loading = false,
  error,
  variant = 'detailed',
  showTrends = false,
  onRefresh,
  className,
}) => {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  
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
    if (seconds < 60) return `${Math.floor(seconds)}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }
  
  const getUsageColor = (usage: number, limit?: number) => {
    const percentage = limit ? (usage / limit) * 100 : usage
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400'
    return 'text-green-600 dark:text-green-400'
  }
  
  const getUsageBarColor = (usage: number, limit?: number) => {
    const percentage = limit ? (usage / limit) * 100 : usage
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    if (percentage >= 50) return 'bg-blue-500'
    return 'bg-green-500'
  }
  
  const getTrend = (metric: keyof ContainerResource) => {
    if (historical.length < 2) return null
    
    const current = historical[historical.length - 1]?.stats
    const previous = historical[historical.length - 2]?.stats
    
    if (!current || !previous) return null
    
    let currentValue: number
    let previousValue: number
    
    switch (metric) {
      case 'cpu':
        currentValue = current.cpu.usage
        previousValue = previous.cpu.usage
        break
      case 'memory':
        currentValue = current.memory.usage
        previousValue = previous.memory.usage
        break
      case 'network':
        currentValue = current.network.rx + current.network.tx
        previousValue = previous.network.rx + previous.network.tx
        break
      case 'disk':
        currentValue = current.disk.read + current.disk.write
        previousValue = previous.disk.read + previous.disk.write
        break
      default:
        return null
    }
    
    const change = currentValue - previousValue
    const percentage = previousValue > 0 ? (change / previousValue) * 100 : 0
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs(percentage),
      value: Math.abs(change),
    }
  }
  
  const renderTrendIcon = (trend: ReturnType<typeof getTrend>) => {
    if (!trend || !showTrends) return null
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />
      default:
        return null
    }
  }
  
  const renderProgressBar = (usage: number, limit?: number, label?: string) => {
    const percentage = limit ? Math.min((usage / limit) * 100, 100) : Math.min(usage, 100)
    
    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {limit ? `${formatBytes(usage)} / ${formatBytes(limit)}` : `${usage.toFixed(1)}%`}
            </span>
          </div>
        )}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              getUsageBarColor(usage, limit)
            )}
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
    trend?: ReturnType<typeof getTrend>
  ) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
        </div>
        {renderTrendIcon(trend)}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      )}
    </div>
  )
  
  if (loading) {
    return (
      <div className={cn('space-y-4 animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
          Error Loading Stats
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
  
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-4 text-sm', className)}>
        <div className="flex items-center gap-1">
          <Cpu className="h-4 w-4 text-blue-500" />
          <span className={getUsageColor(stats.cpu.usage)}>{stats.cpu.usage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <HardDrive className="h-4 w-4 text-green-500" />
          <span className={getUsageColor(stats.memory.usage, stats.memory.limit)}>
            {formatBytes(stats.memory.usage)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Network className="h-4 w-4 text-purple-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {formatRate((stats.network.rxRate || 0) + (stats.network.txRate || 0))}
          </span>
        </div>
      </div>
    )
  }
  
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Container Stats
          </h3>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          {renderProgressBar(stats.cpu.usage, 100, 'CPU')}
          {renderProgressBar(stats.memory.usage, stats.memory.limit, 'Memory')}
        </div>
      </div>
    )
  }
  
  // Detailed variant
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Container Statistics
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {containerName} • Last updated {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              autoRefresh
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          <Cpu className="h-5 w-5 text-blue-500" />,
          'CPU Usage',
          `${stats.cpu.usage.toFixed(1)}%`,
          stats.cpu.cores ? `${stats.cpu.cores} cores` : undefined,
          getTrend('cpu')
        )}
        
        {renderMetricCard(
          <HardDrive className="h-5 w-5 text-green-500" />,
          'Memory',
          formatBytes(stats.memory.usage),
          stats.memory.limit ? `of ${formatBytes(stats.memory.limit)}` : undefined,
          getTrend('memory')
        )}
        
        {renderMetricCard(
          <Network className="h-5 w-5 text-purple-500" />,
          'Network I/O',
          formatRate((stats.network.rxRate || 0) + (stats.network.txRate || 0)),
          `↓ ${formatRate(stats.network.rxRate || 0)} ↑ ${formatRate(stats.network.txRate || 0)}`,
          getTrend('network')
        )}
        
        {renderMetricCard(
          <Database className="h-5 w-5 text-orange-500" />,
          'Disk I/O',
          formatRate((stats.disk.readRate || 0) + (stats.disk.writeRate || 0)),
          `Read: ${formatRate(stats.disk.readRate || 0)} Write: ${formatRate(stats.disk.writeRate || 0)}`,
          getTrend('disk')
        )}
      </div>
      
      {/* Detailed Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Resource Usage</h4>
          {renderProgressBar(stats.cpu.usage, 100, 'CPU')}
          {renderProgressBar(stats.memory.usage, stats.memory.limit, 'Memory')}
          {stats.memory.cache && renderProgressBar(stats.memory.cache, stats.memory.limit, 'Cache')}
          {stats.memory.swap && renderProgressBar(stats.memory.swap, stats.memory.limit, 'Swap')}
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Additional Info</h4>
          <div className="space-y-2">
            {stats.uptime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Uptime: {formatUptime(stats.uptime)}
                </span>
              </div>
            )}
            {stats.processes && (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Processes: {stats.processes}
                </span>
              </div>
            )}
            {stats.restarts !== undefined && (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Restarts: {stats.restarts}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContainerStats