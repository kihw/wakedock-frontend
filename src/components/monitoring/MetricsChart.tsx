'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Zap,
  Target
} from 'lucide-react'

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut'
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d'
export type MetricType = 'cpu' | 'memory' | 'disk' | 'network' | 'custom'

export interface DataPoint {
  timestamp: number
  value: number
  label?: string
  color?: string
}

export interface MetricSeries {
  id: string
  name: string
  type: MetricType
  data: DataPoint[]
  color: string
  unit: string
  yAxisId?: string
}

export interface ChartConfig {
  type: ChartType
  title: string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  animate?: boolean
  stacked?: boolean
  showPoints?: boolean
  smoothLine?: boolean
  fillArea?: boolean
}

export interface MetricsChartProps {
  series: MetricSeries[]
  config: ChartConfig
  timeRange?: TimeRange
  loading?: boolean
  error?: string
  realtime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  onRefresh?: () => void
  onTimeRangeChange?: (range: TimeRange) => void
  onConfigChange?: (config: Partial<ChartConfig>) => void
  onExport?: () => void
  className?: string
}

const timeRangeLabels = {
  '1h': '1 Hour',
  '6h': '6 Hours',
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
}

const chartTypeIcons = {
  line: LineChart,
  bar: BarChart3,
  area: Activity,
  pie: PieChart,
  donut: PieChart,
}

const metricColors = {
  cpu: '#3B82F6',
  memory: '#10B981',
  disk: '#8B5CF6',
  network: '#F59E0B',
  custom: '#6B7280',
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  series,
  config,
  timeRange = '24h',
  loading = false,
  error,
  realtime = false,
  autoRefresh = false,
  refreshInterval = 30000,
  onRefresh,
  onTimeRangeChange,
  onConfigChange,
  onExport,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState<string[]>(series.map(s => s.id))
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)
  
  const formatValue = (value: number, unit: string) => {
    if (unit === 'bytes') {
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(value) / Math.log(1024))
      return `${(value / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
    }
    
    if (unit === 'percent') {
      return `${value.toFixed(1)}%`
    }
    
    if (unit === 'seconds') {
      if (value < 60) return `${value.toFixed(1)}s`
      if (value < 3600) return `${(value / 60).toFixed(1)}m`
      return `${(value / 3600).toFixed(1)}h`
    }
    
    return `${value.toFixed(1)} ${unit}`
  }
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 24) {
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  const getLatestValue = (seriesData: DataPoint[]) => {
    return seriesData.length > 0 ? seriesData[seriesData.length - 1].value : 0
  }
  
  const getTrend = (seriesData: DataPoint[]) => {
    if (seriesData.length < 2) return null
    
    const current = seriesData[seriesData.length - 1].value
    const previous = seriesData[seriesData.length - 2].value
    
    if (current > previous) return { direction: 'up', percentage: ((current - previous) / previous) * 100 }
    if (current < previous) return { direction: 'down', percentage: ((previous - current) / previous) * 100 }
    return { direction: 'stable', percentage: 0 }
  }
  
  const filteredSeries = useMemo(() => {
    return series.filter(s => selectedSeries.includes(s.id))
  }, [series, selectedSeries])
  
  const toggleSeries = (seriesId: string) => {
    setSelectedSeries(prev => 
      prev.includes(seriesId) 
        ? prev.filter(id => id !== seriesId)
        : [...prev, seriesId]
    )
  }
  
  const renderTooltip = (point: DataPoint, series: MetricSeries) => {
    if (!hoveredPoint) return null
    
    return (
      <div className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 pointer-events-none">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {series.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimestamp(point.timestamp)}
        </div>
        <div className="text-sm font-semibold" style={{ color: series.color }}>
          {formatValue(point.value, series.unit)}
        </div>
      </div>
    )
  }
  
  const renderSimpleChart = () => {
    if (filteredSeries.length === 0) return null
    
    const primarySeries = filteredSeries[0]
    const data = primarySeries.data
    
    if (data.length === 0) return null
    
    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))
    const range = maxValue - minValue || 1
    
    return (
      <div className="relative h-32">
        <svg width="100%" height="100%" className="overflow-visible">
          {config.showGrid && (
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" opacity="0.5"/>
              </pattern>
            </defs>
          )}
          
          {config.showGrid && (
            <rect width="100%" height="100%" fill="url(#grid)" />
          )}
          
          {config.type === 'line' && (
            <g>
              {config.fillArea && (
                <path
                  d={`M ${data.map((point, index) => 
                    `${(index / (data.length - 1)) * 100}% ${100 - ((point.value - minValue) / range) * 100}%`
                  ).join(' L ')} L 100% 100% L 0% 100% Z`}
                  fill={primarySeries.color}
                  fillOpacity="0.2"
                />
              )}
              
              <path
                d={`M ${data.map((point, index) => 
                  `${(index / (data.length - 1)) * 100}% ${100 - ((point.value - minValue) / range) * 100}%`
                ).join(' L ')}`}
                fill="none"
                stroke={primarySeries.color}
                strokeWidth="2"
                className={config.smoothLine ? 'transition-all duration-300' : ''}
              />
              
              {config.showPoints && data.map((point, index) => (
                <circle
                  key={index}
                  cx={`${(index / (data.length - 1)) * 100}%`}
                  cy={`${100 - ((point.value - minValue) / range) * 100}%`}
                  r="3"
                  fill={primarySeries.color}
                  stroke="white"
                  strokeWidth="1"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </g>
          )}
          
          {config.type === 'bar' && (
            <g>
              {data.map((point, index) => (
                <rect
                  key={index}
                  x={`${(index / data.length) * 100}%`}
                  y={`${100 - ((point.value - minValue) / range) * 100}%`}
                  width={`${80 / data.length}%`}
                  height={`${((point.value - minValue) / range) * 100}%`}
                  fill={primarySeries.color}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </g>
          )}
          
          {config.type === 'area' && (
            <g>
              <path
                d={`M ${data.map((point, index) => 
                  `${(index / (data.length - 1)) * 100}% ${100 - ((point.value - minValue) / range) * 100}%`
                ).join(' L ')} L 100% 100% L 0% 100% Z`}
                fill={primarySeries.color}
                fillOpacity="0.6"
              />
              
              <path
                d={`M ${data.map((point, index) => 
                  `${(index / (data.length - 1)) * 100}% ${100 - ((point.value - minValue) / range) * 100}%`
                ).join(' L ')}`}
                fill="none"
                stroke={primarySeries.color}
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
        
        {hoveredPoint && renderTooltip(hoveredPoint, primarySeries)}
      </div>
    )
  }
  
  const renderPieChart = () => {
    if (filteredSeries.length === 0) return null
    
    const data = filteredSeries.map(series => ({
      name: series.name,
      value: getLatestValue(series.data),
      color: series.color,
      unit: series.unit,
    }))
    
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const radius = 60
    const centerX = 80
    const centerY = 80
    
    let currentAngle = 0
    
    return (
      <div className="relative h-40">
        <svg width="160" height="160" className="mx-auto">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const angle = (item.value / total) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
            
            const largeArcFlag = angle > 180 ? 1 : 0
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ')
            
            currentAngle += angle
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onMouseEnter={() => setHoveredPoint({ timestamp: Date.now(), value: item.value })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            )
          })}
          
          {config.type === 'donut' && (
            <circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.6}
              fill="white"
              className="dark:fill-gray-800"
            />
          )}
        </svg>
      </div>
    )
  }
  
  const renderChart = () => {
    if (config.type === 'pie' || config.type === 'donut') {
      return renderPieChart()
    }
    
    return renderSimpleChart()
  }
  
  const renderLegend = () => {
    if (!config.showLegend) return null
    
    return (
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {filteredSeries.map(series => {
          const trend = getTrend(series.data)
          const latestValue = getLatestValue(series.data)
          
          return (
            <div
              key={series.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleSeries(series.id)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {series.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatValue(latestValue, series.unit)}
              </span>
              {trend && (
                <div className="flex items-center gap-1">
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : trend.direction === 'down' ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-400">
                    {trend.percentage.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        </div>
        <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="flex gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
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
            Error Loading Chart
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
  
  const ChartIcon = chartTypeIcons[config.type]
  
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
      isExpanded && 'col-span-2 row-span-2',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ChartIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {config.title}
          </h3>
          
          {realtime && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onTimeRangeChange && (
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {Object.entries(timeRangeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          {onExport && (
            <button
              onClick={onExport}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
          )}
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chart Type
              </label>
              <select
                value={config.type}
                onChange={(e) => onConfigChange?.({ type: e.target.value as ChartType })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="area">Area</option>
                <option value="pie">Pie</option>
                <option value="donut">Donut</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showLegend}
                  onChange={(e) => onConfigChange?.({ showLegend: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Legend</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={(e) => onConfigChange?.({ showGrid: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Grid</span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Chart */}
      <div className="relative" style={{ height: config.height || 'auto' }}>
        {renderChart()}
      </div>
      
      {/* Legend */}
      {renderLegend()}
      
      {/* Series Toggle */}
      <div className="mt-4 flex flex-wrap gap-2">
        {series.map(s => (
          <button
            key={s.id}
            onClick={() => toggleSeries(s.id)}
            className={cn(
              'px-2 py-1 text-xs rounded-full transition-colors',
              selectedSeries.includes(s.id)
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            )}
          >
            <div className="flex items-center gap-1">
              {selectedSeries.includes(s.id) ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              {s.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MetricsChart