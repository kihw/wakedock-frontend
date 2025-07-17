'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { 
  BarChart3, 
  LineChart, 
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
  Target,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Server,
  MemoryStick,
  Gauge,
  PieChart,
  AreaChart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointer
} from 'lucide-react'

export type GraphType = 'line' | 'area' | 'bar' | 'stacked' | 'scatter' | 'histogram'
export type TimeRange = '1m' | '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d'
export type MetricType = 'cpu' | 'memory' | 'disk' | 'network' | 'latency' | 'throughput' | 'errors' | 'custom'
export type AggregationType = 'avg' | 'max' | 'min' | 'sum' | 'count' | 'p95' | 'p99'

export interface PerformanceDataPoint {
  timestamp: number
  value: number
  label?: string
  metadata?: Record<string, any>
}

export interface PerformanceMetric {
  id: string
  name: string
  type: MetricType
  unit: string
  color: string
  data: PerformanceDataPoint[]
  aggregation: AggregationType
  threshold?: {
    warning: number
    critical: number
  }
  yAxisId?: string
  visible?: boolean
}

export interface GraphConfig {
  type: GraphType
  title: string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  showThresholds?: boolean
  showAnnotations?: boolean
  animate?: boolean
  stacked?: boolean
  smoothCurve?: boolean
  fillArea?: boolean
  showPoints?: boolean
  pointSize?: number
  lineWidth?: number
  gridOpacity?: number
  yAxisCount?: number
  zoomEnabled?: boolean
  panEnabled?: boolean
  brushEnabled?: boolean
}

export interface PerformanceGraphProps {
  metrics: PerformanceMetric[]
  config: GraphConfig
  timeRange?: TimeRange
  loading?: boolean
  error?: string
  realtime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  onRefresh?: () => void
  onTimeRangeChange?: (range: TimeRange) => void
  onConfigChange?: (config: Partial<GraphConfig>) => void
  onMetricToggle?: (metricId: string) => void
  onExport?: (format: 'png' | 'svg' | 'csv') => void
  onZoom?: (startTime: number, endTime: number) => void
  onAnnotationClick?: (annotation: any) => void
  className?: string
}

const timeRangeLabels = {
  '1m': '1 Minute',
  '5m': '5 Minutes',
  '15m': '15 Minutes',
  '1h': '1 Hour',
  '6h': '6 Hours',
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
}

const graphTypeIcons = {
  line: LineChart,
  area: AreaChart,
  bar: BarChart3,
  stacked: Layers,
  scatter: Grid3x3,
  histogram: BarChart3,
}

const metricTypeIcons = {
  cpu: Cpu,
  memory: MemoryStick,
  disk: HardDrive,
  network: Wifi,
  latency: Clock,
  throughput: Zap,
  errors: AlertTriangle,
  custom: Activity,
}

const aggregationLabels = {
  avg: 'Average',
  max: 'Maximum',
  min: 'Minimum',
  sum: 'Sum',
  count: 'Count',
  p95: '95th Percentile',
  p99: '99th Percentile',
}

export const PerformanceGraph: React.FC<PerformanceGraphProps> = ({
  metrics,
  config,
  timeRange = '1h',
  loading = false,
  error,
  realtime = false,
  autoRefresh = false,
  refreshInterval = 30000,
  onRefresh,
  onTimeRangeChange,
  onConfigChange,
  onMetricToggle,
  onExport,
  onZoom,
  onAnnotationClick,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<{ metric: PerformanceMetric; point: PerformanceDataPoint } | null>(null)
  const [brushSelection, setBrushSelection] = useState<{ start: number; end: number } | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPlaying, setIsPlaying] = useState(realtime)
  const graphRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
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
    
    if (unit === 'milliseconds') {
      if (value < 1000) return `${value.toFixed(1)}ms`
      return `${(value / 1000).toFixed(1)}s`
    }
    
    if (unit === 'ops/sec') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ops/s`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K ops/s`
      return `${value.toFixed(1)} ops/s`
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
        second: '2-digit',
      })
    }
    
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  const visibleMetrics = useMemo(() => {
    return metrics.filter(m => m.visible !== false)
  }, [metrics])
  
  const getMetricStats = (metric: PerformanceMetric) => {
    if (metric.data.length === 0) return { current: 0, avg: 0, max: 0, min: 0, trend: null }
    
    const values = metric.data.map(d => d.value)
    const current = values[values.length - 1]
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    let trend = null
    if (values.length >= 2) {
      const recent = values.slice(-5).reduce((sum, val) => sum + val, 0) / Math.min(5, values.length)
      const previous = values.slice(-10, -5).reduce((sum, val) => sum + val, 0) / Math.min(5, values.length)
      
      if (recent > previous * 1.05) trend = 'up'
      else if (recent < previous * 0.95) trend = 'down'
      else trend = 'stable'
    }
    
    return { current, avg, max, min, trend }
  }
  
  const getYAxisDomain = (metrics: PerformanceMetric[]) => {
    const allValues = metrics.flatMap(m => m.data.map(d => d.value))
    if (allValues.length === 0) return { min: 0, max: 100 }
    
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.1
    
    return {
      min: Math.max(0, min - padding),
      max: max + padding,
    }
  }
  
  const getTimeAxisDomain = (metrics: PerformanceMetric[]) => {
    const allTimestamps = metrics.flatMap(m => m.data.map(d => d.timestamp))
    if (allTimestamps.length === 0) return { min: Date.now() - 3600000, max: Date.now() }
    
    return {
      min: Math.min(...allTimestamps),
      max: Math.max(...allTimestamps),
    }
  }
  
  const generatePath = (metric: PerformanceMetric, yDomain: { min: number; max: number }, timeDomain: { min: number; max: number }, width: number, height: number) => {
    if (metric.data.length === 0) return ''
    
    const points = metric.data.map(point => {
      const x = ((point.timestamp - timeDomain.min) / (timeDomain.max - timeDomain.min)) * width
      const y = height - ((point.value - yDomain.min) / (yDomain.max - yDomain.min)) * height
      return { x, y, point }
    })
    
    if (config.type === 'bar') {
      const barWidth = width / metric.data.length * 0.8
      return points.map(({ x, y }) => 
        `M ${x - barWidth/2} ${height} L ${x - barWidth/2} ${y} L ${x + barWidth/2} ${y} L ${x + barWidth/2} ${height} Z`
      ).join(' ')
    }
    
    if (config.type === 'area' || config.fillArea) {
      const linePath = points.map(({ x, y }, index) => 
        `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      ).join(' ')
      return `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    }
    
    return points.map(({ x, y }, index) => 
      `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    ).join(' ')
  }
  
  const renderGraph = () => {
    if (visibleMetrics.length === 0) return null
    
    const width = 800
    const height = 400
    const yDomain = getYAxisDomain(visibleMetrics)
    const timeDomain = getTimeAxisDomain(visibleMetrics)
    
    return (
      <div className="relative">
        <svg
          ref={graphRef}
          width="100%"
          height={config.height || height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Grid */}
          {config.showGrid && (
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path 
                  d="M 50 0 L 0 0 0 50" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  className="text-gray-200 dark:text-gray-700" 
                  opacity={config.gridOpacity || 0.3}
                />
              </pattern>
            </defs>
          )}
          
          {config.showGrid && (
            <rect width="100%" height="100%" fill="url(#grid)" />
          )}
          
          {/* Threshold lines */}
          {config.showThresholds && visibleMetrics.map(metric => {
            if (!metric.threshold) return null
            
            const warningY = height - ((metric.threshold.warning - yDomain.min) / (yDomain.max - yDomain.min)) * height
            const criticalY = height - ((metric.threshold.critical - yDomain.min) / (yDomain.max - yDomain.min)) * height
            
            return (
              <g key={`threshold-${metric.id}`}>
                <line
                  x1="0"
                  y1={warningY}
                  x2={width}
                  y2={warningY}
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.7"
                />
                <line
                  x1="0"
                  y1={criticalY}
                  x2={width}
                  y2={criticalY}
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.7"
                />
              </g>
            )
          })}
          
          {/* Metrics */}
          {visibleMetrics.map(metric => {
            const path = generatePath(metric, yDomain, timeDomain, width, height)
            
            return (
              <g key={metric.id}>
                <path
                  d={path}
                  fill={config.type === 'area' || config.fillArea ? metric.color : 'none'}
                  fillOpacity={config.type === 'area' || config.fillArea ? 0.3 : 0}
                  stroke={metric.color}
                  strokeWidth={config.lineWidth || 2}
                  className={config.animate ? 'transition-all duration-300' : ''}
                />
                
                {/* Data points */}
                {config.showPoints && metric.data.map((point, index) => {
                  const x = ((point.timestamp - timeDomain.min) / (timeDomain.max - timeDomain.min)) * width
                  const y = height - ((point.value - yDomain.min) / (yDomain.max - yDomain.min)) * height
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r={config.pointSize || 3}
                      fill={metric.color}
                      stroke="white"
                      strokeWidth="1"
                      className="cursor-pointer hover:r-4 transition-all"
                      onMouseEnter={() => setHoveredPoint({ metric, point })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  )
                })}
              </g>
            )
          })}
          
          {/* Brush selection */}
          {brushSelection && (
            <rect
              x={brushSelection.start}
              y={0}
              width={brushSelection.end - brushSelection.start}
              height={height}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth="1"
            />
          )}
        </svg>
        
        {/* Tooltip */}
        {hoveredPoint && config.showTooltip && (
          <div className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 pointer-events-none">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {hoveredPoint.metric.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(hoveredPoint.point.timestamp)}
            </div>
            <div className="text-sm font-semibold" style={{ color: hoveredPoint.metric.color }}>
              {formatValue(hoveredPoint.point.value, hoveredPoint.metric.unit)}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  const renderLegend = () => {
    if (!config.showLegend) return null
    
    return (
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {visibleMetrics.map(metric => {
          const stats = getMetricStats(metric)
          const MetricIcon = metricTypeIcons[metric.type]
          
          return (
            <div
              key={metric.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => onMetricToggle?.(metric.id)}
            >
              <MetricIcon className="h-4 w-4 text-gray-500" />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {metric.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatValue(stats.current, metric.unit)}
                  {stats.trend && (
                    <span className="ml-1">
                      {stats.trend === 'up' ? (
                        <TrendingUp className="inline h-3 w-3 text-green-500" />
                      ) : stats.trend === 'down' ? (
                        <TrendingDown className="inline h-3 w-3 text-red-500" />
                      ) : (
                        <Minus className="inline h-3 w-3 text-gray-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  
  const renderControls = () => {
    return (
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev * 1.5, 10))}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev / 1.5, 0.1))}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => {
            setZoomLevel(1)
            setPanOffset({ x: 0, y: 0 })
          }}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Zoom: {(zoomLevel * 100).toFixed(0)}%
        </div>
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
        <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
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
            Error Loading Performance Graph
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
  
  const GraphIcon = graphTypeIcons[config.type]
  
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
      isExpanded && 'col-span-2 row-span-2',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GraphIcon className="h-5 w-5 text-gray-500" />
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
              onClick={() => onExport('png')}
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
                Graph Type
              </label>
              <select
                value={config.type}
                onChange={(e) => onConfigChange?.({ type: e.target.value as GraphType })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="stacked">Stacked Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="histogram">Histogram</option>
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
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showThresholds}
                  onChange={(e) => onConfigChange?.({ showThresholds: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Thresholds</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showPoints}
                  onChange={(e) => onConfigChange?.({ showPoints: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Points</span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Graph */}
      <div ref={containerRef} className="relative" style={{ height: config.height || 'auto' }}>
        {renderGraph()}
      </div>
      
      {/* Legend */}
      {renderLegend()}
      
      {/* Controls */}
      {renderControls()}
      
      {/* Metrics Toggle */}
      <div className="mt-4 flex flex-wrap gap-2">
        {metrics.map(metric => {
          const MetricIcon = metricTypeIcons[metric.type]
          const isVisible = metric.visible !== false
          
          return (
            <button
              key={metric.id}
              onClick={() => onMetricToggle?.(metric.id)}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1',
                isVisible
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              )}
            >
              <MetricIcon className="h-3 w-3" />
              {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {metric.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PerformanceGraph