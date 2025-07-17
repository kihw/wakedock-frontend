'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Command,
  Home,
  Server,
  Activity,
  Check,
  Database,
  Shield,
  Users,
  HelpCircle,
  ExternalLink,
  Bookmark,
  Star,
  History,
  Archive,
  Download,
  Upload,
  RefreshCw,
  Wifi,
  WifiOff,
  Zap,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  Share,
  Link,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Heart,
  MessageCircle,
  Mail,
  Phone,
  Video,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Compass,
  Target,
  Flag,
  Bookmark as BookmarkIcon,
  Tag,
  Filter,
  SortAsc,
  SortDesc,
  Grid3x3,
  List,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer,
  Hand,
  Crosshair,
  Focus,
  Scan,
  Layers,
  Package,
  Box,
  Container,
  Folder,
  File,
  FileText,
  Image,
  Music,
  Video as VideoIcon,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  MemoryStick,
  Bluetooth,
  Usb,
  Satellite,
  Antenna,
  Cloud,
  CloudUpload,
  CloudDownload,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudMoon,
  Thermometer,
  Droplet,
  Wind,
  Snowflake,
  Flame,
  Lightbulb,
  Battery,
  BatteryLow,
  Plug,
  Power,
  PowerOff
} from 'lucide-react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'maintenance'
export type UserRole = 'admin' | 'user' | 'viewer' | 'guest'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  permissions: string[]
  preferences: {
    theme: ThemeMode
    language: string
    timezone: string
    notifications: boolean
  }
  lastLogin?: string
  isOnline?: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  timestamp: string
  read: boolean
  actionUrl?: string
}

export interface SystemStatus {
  status: ConnectionStatus
  uptime: number
  version: string
  environment: 'development' | 'staging' | 'production'
  health: {
    api: boolean
    database: boolean
    cache: boolean
    storage: boolean
  }
  metrics: {
    activeUsers: number
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
  }
}

export interface HeaderProps {
  user?: UserProfile
  notifications?: Notification[]
  systemStatus?: SystemStatus
  showSearch?: boolean
  showNotifications?: boolean
  showUserMenu?: boolean
  showSystemStatus?: boolean
  showThemeToggle?: boolean
  mobileMenuOpen?: boolean
  searchPlaceholder?: string
  logo?: React.ReactNode
  navigation?: Array<{
    label: string
    href: string
    icon?: React.ReactNode
    active?: boolean
    badge?: string | number
    children?: Array<{
      label: string
      href: string
      icon?: React.ReactNode
    }>
  }>
  onMobileMenuToggle?: () => void
  onSearch?: (query: string) => void
  onNotificationClick?: (notification: Notification) => void
  onNotificationMarkAllRead?: () => void
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void
  onThemeChange?: (theme: ThemeMode) => void
  onNavigationClick?: (href: string) => void
  className?: string
}

const roleConfig = {
  admin: {
    label: 'Administrator',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
  user: {
    label: 'User',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
  },
  viewer: {
    label: 'Viewer',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
  },
  guest: {
    label: 'Guest',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
  },
}

const statusConfig = {
  connected: {
    icon: Wifi,
    label: 'Connected',
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/20',
  },
  disconnected: {
    icon: WifiOff,
    label: 'Disconnected',
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
  reconnecting: {
    icon: RefreshCw,
    label: 'Reconnecting',
    color: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  maintenance: {
    icon: Settings,
    label: 'Maintenance',
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
  },
}

export const Header: React.FC<HeaderProps> = ({
  user,
  notifications = [],
  systemStatus,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  showSystemStatus = true,
  showThemeToggle = true,
  mobileMenuOpen = false,
  searchPlaceholder = 'Search...',
  logo,
  navigation = [],
  onMobileMenuToggle,
  onSearch,
  onNotificationClick,
  onNotificationMarkAllRead,
  onUserAction,
  onThemeChange,
  onNavigationClick,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system')

  const unreadCount = notifications.filter(n => !n.read).length
  const statusConf = systemStatus ? statusConfig[systemStatus.status] : statusConfig.connected
  const StatusIcon = statusConf.icon

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatLastLogin = (timestamp: string) => {
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
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim())
      setSearchQuery('')
      setShowSearchInput(false)
    }
  }

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light'
    setCurrentTheme(nextTheme)
    onThemeChange?.(nextTheme)
  }

  const renderLogo = () => {
    return (
      <div className="flex items-center gap-3">
        {logo || (
          <div className="flex items-center gap-2">
            <Container className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              WakeDock
            </span>
          </div>
        )}
      </div>
    )
  }

  const renderNavigation = () => {
    if (navigation.length === 0) return null

    return (
      <nav className="hidden md:flex items-center space-x-1">
        {navigation.map((item, index) => (
          <div key={index} className="relative group">
            <button
              onClick={() => onNavigationClick?.(item.href)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                item.active
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {item.icon}
              {item.label}
              {item.badge && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
              {item.children && (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </button>

            {/* Dropdown for navigation items with children */}
            {item.children && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-1">
                  {item.children.map((child, childIndex) => (
                    <button
                      key={childIndex}
                      onClick={() => onNavigationClick?.(child.href)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      {child.icon}
                      {child.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    )
  }

  const renderSearch = () => {
    if (!showSearch) return null

    return (
      <div className="flex-1 max-w-lg mx-4">
        {showSearchInput ? (
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery) setShowSearchInput(false)
              }}
              autoFocus
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setShowSearchInput(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowSearchInput(true)}
            className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">{searchPlaceholder}</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 ml-auto px-2 py-1 text-xs font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </button>
        )}
      </div>
    )
  }

  const renderNotifications = () => {
    if (!showNotifications) return null

    return (
      <div className="relative">
        <button
          onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
          className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {showNotificationDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNotificationDropdown(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && onNotificationMarkAllRead && (
                  <button
                    onClick={onNotificationMarkAllRead}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                  </div>
                ) : (
                  <div>
                    {notifications.slice(0, 10).map(notification => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors',
                          !notification.read && 'bg-blue-50 dark:bg-blue-900/10'
                        )}
                        onClick={() => {
                          onNotificationClick?.(notification)
                          setShowNotificationDropdown(false)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-2',
                            notification.type === 'error' ? 'bg-red-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' :
                                notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          )} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {formatLastLogin(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  const renderSystemStatus = () => {
    if (!showSystemStatus || !systemStatus) return null

    return (
      <div className="relative">
        <button
          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            statusConf.bg,
            statusConf.color,
            'hover:opacity-80'
          )}
        >
          <StatusIcon className={cn('h-4 w-4', systemStatus.status === 'reconnecting' && 'animate-spin')} />
          <span className="hidden sm:inline">{statusConf.label}</span>
        </button>

        {showStatusDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowStatusDropdown(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">System Status</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Environment:</span>
                    <span className={cn(
                      'text-sm font-medium px-2 py-1 rounded',
                      systemStatus.environment === 'production' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        systemStatus.environment === 'staging' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    )}>
                      {systemStatus.environment}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Version:</span>
                    <span className="text-sm text-gray-900 dark:text-white font-mono">{systemStatus.version}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Uptime:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatUptime(systemStatus.uptime)}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Health Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(systemStatus.health).map(([service, healthy]) => (
                        <div key={service} className="flex items-center gap-2">
                          {healthy ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Active Users:</span>
                        <span className="text-xs text-gray-900 dark:text-white">{systemStatus.metrics.activeUsers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">CPU Usage:</span>
                        <span className="text-xs text-gray-900 dark:text-white">{systemStatus.metrics.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Memory:</span>
                        <span className="text-xs text-gray-900 dark:text-white">{systemStatus.metrics.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Disk:</span>
                        <span className="text-xs text-gray-900 dark:text-white">{systemStatus.metrics.diskUsage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  const renderThemeToggle = () => {
    if (!showThemeToggle) return null

    return (
      <button
        onClick={handleThemeToggle}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title={`Current theme: ${currentTheme}`}
      >
        {currentTheme === 'light' ? (
          <Sun className="h-5 w-5" />
        ) : currentTheme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Monitor className="h-5 w-5" />
        )}
      </button>
    )
  }

  const renderUserMenu = () => {
    if (!showUserMenu || !user) return null

    const roleConf = roleConfig[user.role]

    return (
      <div className="relative">
        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex items-center gap-3 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
          )}

          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </div>
            <div className={cn('text-xs', roleConf.color)}>
              {roleConf.label}
            </div>
          </div>

          <ChevronDown className="h-4 w-4 text-gray-400" />

          {user.isOnline && (
            <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
          )}
        </button>

        {showUserDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserDropdown(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </div>
                    <div className={cn('text-xs px-2 py-1 rounded-full inline-block mt-1', roleConf.bg, roleConf.color)}>
                      {roleConf.label}
                    </div>
                  </div>
                </div>

                {user.lastLogin && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Last login: {formatLastLogin(user.lastLogin)}
                  </div>
                )}
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    onUserAction?.('profile')
                    setShowUserDropdown(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <button
                  onClick={() => {
                    onUserAction?.('settings')
                    setShowUserDropdown(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>

                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                <button
                  onClick={() => {
                    onUserAction?.('logout')
                    setShowUserDropdown(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <header className={cn(
      'sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
      className
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            {renderLogo()}

            {/* Navigation */}
            {renderNavigation()}
          </div>

          {/* Center section */}
          {renderSearch()}

          {/* Right section */}
          <div className="flex items-center gap-2">
            {renderSystemStatus()}
            {renderThemeToggle()}
            {renderNotifications()}
            {renderUserMenu()}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header