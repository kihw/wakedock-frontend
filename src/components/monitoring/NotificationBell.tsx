'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  Bell, 
  BellRing, 
  BellOff, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings, 
  Filter,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Slack,
  Activity,
  Server,
  Database,
  Shield,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Target,
  Bug,
  User,
  Globe,
  Calendar,
  ArrowRight,
  ExternalLink,
  Download,
  RefreshCw,
  Pause,
  Play,
  RotateCcw,
  Archive,
  Star,
  StarOff
} from 'lucide-react'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'
export type NotificationCategory = 'system' | 'security' | 'performance' | 'deployment' | 'user' | 'maintenance'
export type NotificationStatus = 'unread' | 'read' | 'archived'
export type NotificationAction = 'acknowledge' | 'resolve' | 'ignore' | 'escalate'

export interface NotificationItem {
  id: string
  title: string
  message: string
  category: NotificationCategory
  priority: NotificationPriority
  status: NotificationStatus
  timestamp: string
  source: string
  actionUrl?: string
  metadata?: Record<string, any>
  actions?: {
    type: NotificationAction
    label: string
    url?: string
  }[]
  tags?: string[]
  userId?: string
  groupId?: string
  expiresAt?: string
  starred?: boolean
}

export interface NotificationSettings {
  sound: boolean
  desktop: boolean
  email: boolean
  sms: boolean
  slack: boolean
  categories: Record<NotificationCategory, boolean>
  priorities: Record<NotificationPriority, boolean>
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  batchDelay: number
  maxNotifications: number
}

export interface NotificationBellProps {
  notifications: NotificationItem[]
  settings: NotificationSettings
  unreadCount?: number
  loading?: boolean
  error?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showBadge?: boolean
  showPreview?: boolean
  maxPreviewItems?: number
  onNotificationClick?: (notification: NotificationItem) => void
  onNotificationAction?: (notificationId: string, action: NotificationAction) => void
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
  onClearAll?: () => void
  onSettingsChange?: (settings: Partial<NotificationSettings>) => void
  onRefresh?: () => void
  className?: string
}

const priorityConfig = {
  low: {
    icon: Info,
    label: 'Low',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    pulse: false,
  },
  medium: {
    icon: Bell,
    label: 'Medium',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    pulse: false,
  },
  high: {
    icon: AlertTriangle,
    label: 'High',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    pulse: true,
  },
  critical: {
    icon: XCircle,
    label: 'Critical',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
    pulse: true,
  },
}

const categoryConfig = {
  system: {
    icon: Server,
    label: 'System',
    color: 'text-blue-600 dark:text-blue-400',
  },
  security: {
    icon: Shield,
    label: 'Security',
    color: 'text-red-600 dark:text-red-400',
  },
  performance: {
    icon: Activity,
    label: 'Performance',
    color: 'text-green-600 dark:text-green-400',
  },
  deployment: {
    icon: Target,
    label: 'Deployment',
    color: 'text-purple-600 dark:text-purple-400',
  },
  user: {
    icon: User,
    label: 'User',
    color: 'text-gray-600 dark:text-gray-400',
  },
  maintenance: {
    icon: Settings,
    label: 'Maintenance',
    color: 'text-orange-600 dark:text-orange-400',
  },
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  settings,
  unreadCount = 0,
  loading = false,
  error,
  position = 'top-right',
  showBadge = true,
  showPreview = true,
  maxPreviewItems = 5,
  onNotificationClick,
  onNotificationAction,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSettingsChange,
  onRefresh,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState<{
    category: NotificationCategory | 'all'
    priority: NotificationPriority | 'all'
    status: NotificationStatus | 'all'
  }>({
    category: 'all',
    priority: 'all',
    status: 'all',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  
  const unreadNotifications = notifications.filter(n => n.status === 'unread')
  const hasHighPriority = unreadNotifications.some(n => n.priority === 'high' || n.priority === 'critical')
  const hasCritical = unreadNotifications.some(n => n.priority === 'critical')
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter.category !== 'all' && notification.category !== filter.category) return false
    if (filter.priority !== 'all' && notification.priority !== filter.priority) return false
    if (filter.status !== 'all' && notification.status !== filter.status) return false
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
  }
  
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }
  
  const handleBulkAction = (action: NotificationAction) => {
    selectedNotifications.forEach(id => {
      onNotificationAction?.(id, action)
    })
    setSelectedNotifications([])
  }
  
  const renderNotificationItem = (notification: NotificationItem) => {
    const priorityConf = priorityConfig[notification.priority]
    const categoryConf = categoryConfig[notification.category]
    const PriorityIcon = priorityConf.icon
    const CategoryIcon = categoryConf.icon
    const isSelected = selectedNotifications.includes(notification.id)
    
    return (
      <div
        key={notification.id}
        className={cn(
          'p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
          notification.status === 'unread' && 'bg-blue-50 dark:bg-blue-900/10',
          isSelected && 'bg-blue-100 dark:bg-blue-900/20',
          'cursor-pointer'
        )}
        onClick={() => {
          onNotificationClick?.(notification)
          onMarkAsRead?.(notification.id)
        }}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              toggleNotificationSelection(notification.id)
            }}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1">
                <CategoryIcon className={cn('h-4 w-4', categoryConf.color)} />
                <PriorityIcon className={cn('h-4 w-4', priorityConf.color)} />
              </div>
              
              <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {notification.title}
              </h4>
              
              {notification.starred && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              
              {notification.status === 'unread' && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTimestamp(notification.timestamp)}</span>
                <span>{categoryConf.label}</span>
                <span>From: {notification.source}</span>
              </div>
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex items-center gap-1">
                  {notification.actions.slice(0, 2).map((action, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        onNotificationAction?.(notification.id, action.type)
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {notification.tags && notification.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {notification.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {notification.actionUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (notification.actionUrl) {
                    window.open(notification.actionUrl, '_blank')
                  }
                }}
                className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                title="Open link"
              >
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNotificationAction?.(notification.id, 'ignore')
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              title="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const renderSettings = () => {
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notification Settings</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">Sound notifications</label>
            <button
              onClick={() => onSettingsChange?.({ sound: !settings.sound })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.sound ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settings.sound ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">Desktop notifications</label>
            <button
              onClick={() => onSettingsChange?.({ desktop: !settings.desktop })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.desktop ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settings.desktop ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">Email notifications</label>
            <button
              onClick={() => onSettingsChange?.({ email: !settings.email })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.email ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settings.email ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryConfig).map(([category, config]) => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.categories[category as NotificationCategory]}
                    onChange={(e) => onSettingsChange?.({
                      categories: {
                        ...settings.categories,
                        [category]: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{config.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const positionClasses = {
    'top-left': 'top-14 left-0',
    'top-right': 'top-14 right-0',
    'bottom-left': 'bottom-14 left-0',
    'bottom-right': 'bottom-14 right-0',
  }
  
  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors',
          hasCritical && 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
          hasHighPriority && !hasCritical && 'text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300'
        )}
      >
        {settings.sound ? (
          <BellRing className={cn('h-5 w-5', hasHighPriority && priorityConfig.high.pulse && 'animate-pulse')} />
        ) : (
          <BellOff className="h-5 w-5" />
        )}
        
        {/* Badge */}
        {showBadge && unreadCount > 0 && (
          <span className={cn(
            'absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-medium flex items-center justify-center',
            hasCritical ? 'bg-red-500 text-white' : 'bg-blue-500 text-white',
            hasHighPriority && 'animate-pulse'
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          'absolute z-50 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg',
          positionClasses[position]
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-1 mr-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedNotifications.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('acknowledge')}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mark Read
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
              
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                </button>
              )}
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filter.priority}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value as NotificationPriority | 'all' }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Priority</option>
                {Object.entries(priorityConfig).map(([priority, config]) => (
                  <option key={priority} value={priority}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Action Bar */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedNotifications(filteredNotifications.map(n => n.id))
                    } else {
                      setSelectedNotifications([])
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Select All</span>
              </div>
              
              <div className="flex items-center gap-2">
                {onMarkAllAsRead && unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mark All Read
                  </button>
                )}
                
                {onClearAll && (
                  <button
                    onClick={onClearAll}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-8 text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
              </div>
            )}
            
            {error && (
              <div className="p-8 text-center">
                <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            {!loading && !error && filteredNotifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {notifications.length === 0 ? 'No notifications' : 'No notifications match your filters'}
                </p>
              </div>
            )}
            
            {!loading && !error && filteredNotifications.length > 0 && (
              <div>
                {filteredNotifications.slice(0, showPreview ? maxPreviewItems : undefined).map(renderNotificationItem)}
                
                {showPreview && filteredNotifications.length > maxPreviewItems && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View all {filteredNotifications.length} notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Settings */}
          {showSettings && renderSettings()}
        </div>
      )}
    </div>
  )
}

export default NotificationBell