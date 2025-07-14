'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Bell,
  BellOff,
  Radio,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Gauge,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Search,
  Download,
  Upload,
  Server,
  Database,
  Network,
  Cpu,
  HardDrive,
  MemoryStick,
  Container,
  Globe,
  Shield,
  Target,
  User,
  Calendar,
  MapPin,
  Layers,
  Grid3x3,
  List,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  X,
  Plus,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Share,
  Bookmark,
  Star,
  Heart,
  MessageCircle,
  Mail,
  Phone,
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  Headphones,
  Speaker,
  Keyboard,
  Mouse,
  Printer,
  Gamepad2,
  Joystick,
  Webcam,
  Microchip,
  HardDriveIcon,
  MemoryStickIcon,
  CpuIcon,
  MonitorIcon,
  ServerIcon,
  DatabaseIcon,
  NetworkIcon,
  WifiIcon,
  BluetoothIcon,
  UsbIcon,
  EthernetIcon,
  RouterIcon,
  ModemIcon,
  SatelliteIcon,
  AntennaIcon,
  TowerIcon,
  CloudIcon,
  SunIcon,
  MoonIcon,
  StarIcon,
  FlameIcon,
  DropletIcon,
  SnowflakeIcon,
  ThermometerIcon,
  WindIcon,
  EyeIcon,
  EarIcon,
  BrainIcon,
  HeartIcon,
  LungsIcon,
  KidneysIcon,
  LiverIcon,
  StomachIcon,
  BoneIcon,
  BloodIcon,
  PillIcon,
  SyringeIcon,
  StethoscopeIcon,
  BandageIcon,
  ClipboardIcon,
  FileTextIcon,
  FolderIcon,
  ArchiveIcon,
  PackageIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BarChartIcon,
  PieChartIcon,
  LineChartIcon,
  AreaChartIcon,
  ScatterChartIcon,
  RadarChartIcon,
  TreemapIcon,
  HeatmapIcon,
  GanttChartIcon,
  FlowchartIcon,
  MindmapIcon,
  DiagramIcon,
  BlueprintIcon,
  SchematicIcon,
  CircuitIcon,
  TransistorIcon,
  CapacitorIcon,
  ResistorIcon,
  InductorIcon,
  DiodeIcon,
  LedIcon,
  SwitchIcon,
  RelayIcon,
  MotorIcon,
  GeneratorIcon,
  BatteryIcon,
  SolarPanelIcon,
  WindTurbineIcon,
  HydroelectricIcon,
  NuclearIcon,
  CoalIcon,
  OilIcon,
  GasIcon,
  FuelIcon,
  ElectricIcon,
  HybridIcon,
  BiofuelIcon,
  HydrogenIcon,
  EthanolIcon,
  MethanolIcon,
  PropaneIcon,
  ButaneIcon,
  AcetyleneIcon,
  AmmoniaIcon,
  ChlorineIcon,
  FluorineIcon,
  HeliumIcon,
  NeonIcon,
  ArgonIcon,
  KryptonIcon,
  XenonIcon,
  RadonIcon,
  HydrogenIcon2,
  LithiumIcon,
  BerylliumIcon,
  BoronIcon,
  CarbonIcon,
  NitrogenIcon,
  OxygenIcon,
  SodiumIcon,
  MagnesiumIcon,
  AluminumIcon,
  SiliconIcon,
  PhosphorusIcon,
  SulfurIcon,
  PotassiumIcon,
  CalciumIcon,
  IronIcon,
  CopperIcon,
  ZincIcon,
  SilverIcon,
  TinIcon,
  GoldIcon,
  MercuryIcon,
  LeadIcon,
  UraniumIcon,
  PlutoniukIcon
} from 'lucide-react'

export type UpdateType = 'metric' | 'log' | 'alert' | 'event' | 'notification' | 'status'
export type UpdatePriority = 'low' | 'medium' | 'high' | 'critical'
export type UpdateCategory = 'system' | 'application' | 'security' | 'performance' | 'user' | 'network' | 'storage'

export interface RealTimeUpdate {
  id: string
  type: UpdateType
  category: UpdateCategory
  priority: UpdatePriority
  title: string
  message: string
  timestamp: number
  source: string
  data?: any
  metadata?: Record<string, any>
  tags?: string[]
  userId?: string
  sessionId?: string
  correlationId?: string
  expiresAt?: number
  persistent?: boolean
  actionable?: boolean
  acknowledged?: boolean
}

export interface ConnectionStatus {
  connected: boolean
  reconnecting: boolean
  lastConnected?: number
  lastDisconnected?: number
  latency?: number
  reconnectAttempts?: number
  maxReconnectAttempts?: number
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor'
  protocol?: 'websocket' | 'sse' | 'polling'
  endpoint?: string
}

export interface RealTimeConfig {
  enabled: boolean
  autoReconnect: boolean
  reconnectDelay: number
  maxReconnectAttempts: number
  bufferSize: number
  batchSize: number
  batchDelay: number
  filters: {
    types: UpdateType[]
    categories: UpdateCategory[]
    priorities: UpdatePriority[]
    sources: string[]
  }
  notifications: {
    sound: boolean
    desktop: boolean
    toast: boolean
  }
  display: {
    showTimestamp: boolean
    showSource: boolean
    showMetadata: boolean
    maxVisible: number
    autoScroll: boolean
    compactMode: boolean
  }
}

export interface RealTimeUpdatesProps {
  updates: RealTimeUpdate[]
  connectionStatus: ConnectionStatus
  config: RealTimeConfig
  loading?: boolean
  error?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onReconnect?: () => void
  onUpdateClick?: (update: RealTimeUpdate) => void
  onUpdateAction?: (updateId: string, action: string) => void
  onConfigChange?: (config: Partial<RealTimeConfig>) => void
  onClearUpdates?: () => void
  onExportUpdates?: () => void
  className?: string
}

const updateTypeConfig = {
  metric: {
    icon: BarChart3,
    label: 'Metric',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
  },
  log: {
    icon: FileTextIcon,
    label: 'Log',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
  },
  alert: {
    icon: AlertTriangle,
    label: 'Alert',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
  event: {
    icon: Zap,
    label: 'Event',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  notification: {
    icon: Bell,
    label: 'Notification',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
  },
  status: {
    icon: CheckCircle,
    label: 'Status',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
  },
}

const priorityConfig = {
  low: {
    icon: Minus,
    label: 'Low',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
  },
  medium: {
    icon: Info,
    label: 'Medium',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
  },
  high: {
    icon: AlertTriangle,
    label: 'High',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
  },
  critical: {
    icon: XCircle,
    label: 'Critical',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
}

const categoryConfig = {
  system: {
    icon: Server,
    label: 'System',
    color: 'text-blue-600 dark:text-blue-400',
  },
  application: {
    icon: Globe,
    label: 'Application',
    color: 'text-green-600 dark:text-green-400',
  },
  security: {
    icon: Shield,
    label: 'Security',
    color: 'text-red-600 dark:text-red-400',
  },
  performance: {
    icon: TrendingUp,
    label: 'Performance',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  user: {
    icon: User,
    label: 'User',
    color: 'text-purple-600 dark:text-purple-400',
  },
  network: {
    icon: Network,
    label: 'Network',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  storage: {
    icon: HardDrive,
    label: 'Storage',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
}

const connectionQualityConfig = {
  excellent: {
    icon: SignalHigh,
    label: 'Excellent',
    color: 'text-green-500',
  },
  good: {
    icon: SignalMedium,
    label: 'Good',
    color: 'text-blue-500',
  },
  fair: {
    icon: SignalLow,
    label: 'Fair',
    color: 'text-yellow-500',
  },
  poor: {
    icon: Signal,
    label: 'Poor',
    color: 'text-red-500',
  },
}

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  updates,
  connectionStatus,
  config,
  loading = false,
  error,
  onConnect,
  onDisconnect,
  onReconnect,
  onUpdateClick,
  onUpdateAction,
  onConfigChange,
  onClearUpdates,
  onExportUpdates,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(config.display.autoScroll)
  const updatesRef = useRef<HTMLDivElement>(null)
  const [playSound, setPlaySound] = useState(config.notifications.sound)
  
  const filteredUpdates = updates.filter(update => {
    // Apply config filters
    if (config.filters.types.length > 0 && !config.filters.types.includes(update.type)) return false
    if (config.filters.categories.length > 0 && !config.filters.categories.includes(update.category)) return false
    if (config.filters.priorities.length > 0 && !config.filters.priorities.includes(update.priority)) return false
    if (config.filters.sources.length > 0 && !config.filters.sources.includes(update.source)) return false
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        update.title.toLowerCase().includes(query) ||
        update.message.toLowerCase().includes(query) ||
        update.source.toLowerCase().includes(query) ||
        update.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return true
  })
  
  const visibleUpdates = config.display.maxVisible > 0 
    ? filteredUpdates.slice(0, config.display.maxVisible)
    : filteredUpdates
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }
  
  const getConnectionIcon = () => {
    if (connectionStatus.reconnecting) return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
    if (!connectionStatus.connected) return <WifiOff className="h-4 w-4 text-red-500" />
    
    const quality = connectionStatus.connectionQuality || 'good'
    const qualityConfig = connectionQualityConfig[quality]
    const QualityIcon = qualityConfig.icon
    
    return <QualityIcon className={cn('h-4 w-4', qualityConfig.color)} />
  }
  
  const renderUpdate = (update: RealTimeUpdate) => {
    const typeConf = updateTypeConfig[update.type]
    const priorityConf = priorityConfig[update.priority]
    const categoryConf = categoryConfig[update.category]
    const TypeIcon = typeConf.icon
    const PriorityIcon = priorityConf.icon
    const CategoryIcon = categoryConf.icon
    const isSelected = selectedUpdate === update.id
    
    return (
      <div
        key={update.id}
        className={cn(
          'flex items-start gap-3 p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
          config.display.compactMode && 'p-2',
          isSelected && 'bg-blue-50 dark:bg-blue-900/20',
          update.priority === 'critical' && 'border-l-4 border-red-500',
          update.priority === 'high' && 'border-l-4 border-orange-500',
          'cursor-pointer'
        )}
        onClick={() => {
          setSelectedUpdate(isSelected ? null : update.id)
          onUpdateClick?.(update)
        }}
      >
        <div className="flex items-center gap-1 mt-1">
          <TypeIcon className={cn('h-4 w-4', typeConf.color)} />
          <PriorityIcon className={cn('h-3 w-3', priorityConf.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CategoryIcon className={cn('h-3 w-3', categoryConf.color)} />
            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {update.title}
            </h4>
            
            {update.persistent && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
            
            {update.actionable && (
              <Target className="h-3 w-3 text-blue-500" />
            )}
          </div>
          
          <p className={cn(
            'text-sm text-gray-600 dark:text-gray-400 mb-2',
            config.display.compactMode ? 'line-clamp-1' : 'line-clamp-2'
          )}>
            {update.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {config.display.showTimestamp && (
                <span>{formatTimestamp(update.timestamp)}</span>
              )}
              
              {config.display.showSource && (
                <span>From: {update.source}</span>
              )}
              
              <span className={cn('px-2 py-1 rounded-full', typeConf.bg, typeConf.color)}>
                {typeConf.label}
              </span>
            </div>
            
            {update.actionable && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateAction?.(update.id, 'acknowledge')
                  }}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Acknowledge
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateAction?.(update.id, 'dismiss')
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          
          {update.tags && update.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {update.tags.map((tag, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {config.display.showMetadata && update.metadata && Object.keys(update.metadata).length > 0 && isSelected && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
              <div className="font-medium text-gray-900 dark:text-white mb-1">Metadata:</div>
              <pre className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {JSON.stringify(update.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  const renderConnectionStatus = () => {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {getConnectionIcon()}
        
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className={cn(
              'font-medium',
              connectionStatus.connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {connectionStatus.connected ? 'Connected' : connectionStatus.reconnecting ? 'Reconnecting...' : 'Disconnected'}
            </span>
            
            {connectionStatus.protocol && (
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                {connectionStatus.protocol}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {connectionStatus.latency && (
              <span>Latency: {connectionStatus.latency}ms</span>
            )}
            
            {connectionStatus.reconnectAttempts !== undefined && connectionStatus.maxReconnectAttempts && (
              <span>
                Attempts: {connectionStatus.reconnectAttempts}/{connectionStatus.maxReconnectAttempts}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPlaySound(!playSound)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title={playSound ? 'Mute sounds' : 'Enable sounds'}
          >
            {playSound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
          >
            {autoScroll ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          
          {connectionStatus.connected ? (
            <button
              onClick={onDisconnect}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              title="Disconnect"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={connectionStatus.reconnecting ? onReconnect : onConnect}
              className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
              title={connectionStatus.reconnecting ? 'Force reconnect' : 'Connect'}
            >
              {connectionStatus.reconnecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    )
  }
  
  const renderControls = () => {
    return (
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Real-time Updates
          </h3>
          
          {config.enabled && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 pl-7 pr-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          {onExportUpdates && (
            <button
              onClick={onExportUpdates}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          
          {onClearUpdates && (
            <button
              onClick={onClearUpdates}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    )
  }
  
  const renderSettings = () => {
    if (!showSettings) return null
    
    return (
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Settings</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">Enable updates</label>
            <button
              onClick={() => onConfigChange?.({ enabled: !config.enabled })}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                config.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span className={cn(
                'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                config.enabled ? 'translate-x-5' : 'translate-x-1'
              )} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">Auto-reconnect</label>
            <button
              onClick={() => onConfigChange?.({ autoReconnect: !config.autoReconnect })}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                config.autoReconnect ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span className={cn(
                'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                config.autoReconnect ? 'translate-x-5' : 'translate-x-1'
              )} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">Sound notifications</label>
            <button
              onClick={() => onConfigChange?.({ notifications: { ...config.notifications, sound: !config.notifications.sound } })}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                config.notifications.sound ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span className={cn(
                'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                config.notifications.sound ? 'translate-x-5' : 'translate-x-1'
              )} />
            </button>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Max visible updates</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={config.display.maxVisible}
              onChange={(e) => onConfigChange?.({ 
                display: { 
                  ...config.display, 
                  maxVisible: parseInt(e.target.value) || 0 
                } 
              })}
              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Update types</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(updateTypeConfig).map(([type, typeConf]) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.filters.types.includes(type as UpdateType)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...config.filters.types, type as UpdateType]
                        : config.filters.types.filter(t => t !== type)
                      onConfigChange?.({ filters: { ...config.filters, types: newTypes } })
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{typeConf.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Auto-scroll to bottom when new updates arrive
  useEffect(() => {
    if (autoScroll && updatesRef.current) {
      updatesRef.current.scrollTop = updatesRef.current.scrollHeight
    }
  }, [updates, autoScroll])
  
  if (loading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse', className)}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded mt-1" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6', className)}>
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Updates
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          {onConnect && (
            <button
              onClick={onConnect}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
      isExpanded && 'fixed inset-4 z-50 shadow-2xl',
      className
    )}>
      {renderConnectionStatus()}
      {renderControls()}
      {renderSettings()}
      
      <div 
        ref={updatesRef}
        className={cn(
          'overflow-y-auto',
          isExpanded ? 'max-h-[calc(100vh-200px)]' : 'max-h-96'
        )}
      >
        {visibleUpdates.length === 0 ? (
          <div className="p-8 text-center">
            <Radio className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {updates.length === 0 ? 'No updates yet' : 'No updates match your filters'}
            </p>
            {!config.enabled && (
              <button
                onClick={() => onConfigChange?.({ enabled: true })}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Enable real-time updates
              </button>
            )}
          </div>
        ) : (
          <div>
            {visibleUpdates.map(renderUpdate)}
          </div>
        )}
      </div>
      
      {/* Stats footer */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {visibleUpdates.length} of {updates.length} updates
            {config.display.maxVisible > 0 && updates.length > config.display.maxVisible && ' (limited)'}
          </span>
          
          <div className="flex items-center gap-3">
            <span>Buffer: {updates.length}/{config.bufferSize}</span>
            {connectionStatus.latency && (
              <span>Latency: {connectionStatus.latency}ms</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealTimeUpdates