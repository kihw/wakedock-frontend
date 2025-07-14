'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Plus, 
  Play, 
  Square, 
  RotateCcw, 
  Download, 
  Upload, 
  Settings, 
  Terminal, 
  Database, 
  Network, 
  Shield, 
  Monitor, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Zap,
  Server,
  Container,
  Image,
  Volume,
  Code,
  Archive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react'

export interface QuickAction {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  shortcut?: string
  category: 'services' | 'system' | 'monitoring' | 'admin' | 'tools'
  disabled?: boolean
  loading?: boolean
  badge?: {
    text: string
    color: string
  }
}

export interface QuickActionsProps {
  actions?: QuickAction[]
  onActionClick?: (actionId: string) => void
  loading?: boolean
  variant?: 'grid' | 'list' | 'compact'
  showCategories?: boolean
  maxActions?: number
  className?: string
}

const defaultActions: QuickAction[] = [
  // Services
  {
    id: 'create-service',
    label: 'Create Service',
    description: 'Deploy a new container service',
    icon: Plus,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40',
    shortcut: 'Ctrl+N',
    category: 'services',
  },
  {
    id: 'start-all',
    label: 'Start All',
    description: 'Start all stopped services',
    icon: Play,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40',
    category: 'services',
  },
  {
    id: 'stop-all',
    label: 'Stop All',
    description: 'Stop all running services',
    icon: Square,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40',
    category: 'services',
  },
  {
    id: 'restart-all',
    label: 'Restart All',
    description: 'Restart all services',
    icon: RotateCcw,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40',
    category: 'services',
  },
  
  // System
  {
    id: 'system-info',
    label: 'System Info',
    description: 'View system information',
    icon: Monitor,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40',
    category: 'system',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    description: 'Open system terminal',
    icon: Terminal,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/40',
    shortcut: 'Ctrl+`',
    category: 'system',
  },
  {
    id: 'logs',
    label: 'System Logs',
    description: 'View system logs',
    icon: FileText,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
    category: 'system',
  },
  {
    id: 'cleanup',
    label: 'Cleanup',
    description: 'Clean unused containers and images',
    icon: Trash2,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40',
    category: 'system',
  },
  
  // Monitoring
  {
    id: 'metrics',
    label: 'Metrics',
    description: 'View system metrics',
    icon: BarChart3,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40',
    category: 'monitoring',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    description: 'View system alerts',
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
    category: 'monitoring',
    badge: {
      text: '3',
      color: 'bg-red-500 text-white',
    },
  },
  {
    id: 'activity',
    label: 'Activity',
    description: 'View recent activity',
    icon: Activity,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40',
    category: 'monitoring',
  },
  {
    id: 'health-check',
    label: 'Health Check',
    description: 'Run system health check',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40',
    category: 'monitoring',
  },
  
  // Admin
  {
    id: 'users',
    label: 'Users',
    description: 'Manage users',
    icon: Users,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40',
    category: 'admin',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'System settings',
    icon: Settings,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/40',
    shortcut: 'Ctrl+,',
    category: 'admin',
  },
  {
    id: 'backup',
    label: 'Backup',
    description: 'Create system backup',
    icon: Archive,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40',
    category: 'admin',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Security settings',
    icon: Shield,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40',
    category: 'admin',
  },
  
  // Tools
  {
    id: 'docker-compose',
    label: 'Docker Compose',
    description: 'Deploy compose stack',
    icon: Code,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40',
    category: 'tools',
  },
  {
    id: 'network',
    label: 'Networks',
    description: 'Manage networks',
    icon: Network,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40',
    category: 'tools',
  },
  {
    id: 'volumes',
    label: 'Volumes',
    description: 'Manage volumes',
    icon: Database,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
    category: 'tools',
  },
  {
    id: 'images',
    label: 'Images',
    description: 'Manage images',
    icon: Image,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40',
    category: 'tools',
  },
]

const categoryLabels = {
  services: 'Services',
  system: 'System',
  monitoring: 'Monitoring',
  admin: 'Administration',
  tools: 'Tools',
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions = defaultActions,
  onActionClick,
  loading = false,
  variant = 'grid',
  showCategories = true,
  maxActions = 20,
  className,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredActions = React.useMemo(() => {
    let filtered = actions
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(action => action.category === selectedCategory)
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(action =>
        action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply max actions limit
    if (maxActions > 0) {
      filtered = filtered.slice(0, maxActions)
    }
    
    return filtered
  }, [actions, selectedCategory, searchQuery, maxActions])
  
  const groupedActions = React.useMemo(() => {
    const groups: Record<string, QuickAction[]> = {}
    
    filteredActions.forEach(action => {
      if (!groups[action.category]) {
        groups[action.category] = []
      }
      groups[action.category].push(action)
    })
    
    return groups
  }, [filteredActions])
  
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(actions.map(action => action.category)))
    return cats.map(cat => ({ value: cat, label: categoryLabels[cat as keyof typeof categoryLabels] || cat }))
  }, [actions])
  
  const handleActionClick = (actionId: string) => {
    if (loading) return
    
    const action = actions.find(a => a.id === actionId)
    if (action?.disabled || action?.loading) return
    
    onActionClick?.(actionId)
  }
  
  const renderAction = (action: QuickAction, index: number) => {
    const Icon = action.icon
    
    if (variant === 'compact') {
      return (
        <button
          key={action.id}
          onClick={() => handleActionClick(action.id)}
          disabled={action.disabled || action.loading || loading}
          className={cn(
            'relative flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200',
            'text-left border border-gray-200 dark:border-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            action.bg
          )}
        >
          <div className="flex-shrink-0">
            {action.loading ? (
              <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <Icon className={cn('h-5 w-5', action.color)} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {action.label}
              </span>
              {action.badge && (
                <span className={cn(
                  'px-1.5 py-0.5 text-xs font-medium rounded-full',
                  action.badge.color
                )}>
                  {action.badge.text}
                </span>
              )}
            </div>
            {action.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {action.description}
              </p>
            )}
          </div>
          
          {action.shortcut && (
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {action.shortcut}
            </span>
          )}
        </button>
      )
    }
    
    if (variant === 'list') {
      return (
        <button
          key={action.id}
          onClick={() => handleActionClick(action.id)}
          disabled={action.disabled || action.loading || loading}
          className={cn(
            'relative flex items-center gap-4 w-full p-4 rounded-lg transition-all duration-200',
            'text-left border border-gray-200 dark:border-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            action.bg
          )}
        >
          <div className="flex-shrink-0">
            {action.loading ? (
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            ) : (
              <Icon className={cn('h-6 w-6', action.color)} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {action.label}
              </h3>
              {action.badge && (
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  action.badge.color
                )}>
                  {action.badge.text}
                </span>
              )}
            </div>
            {action.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            )}
          </div>
          
          {action.shortcut && (
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {action.shortcut}
            </span>
          )}
        </button>
      )
    }
    
    // Grid variant (default)
    return (
      <button
        key={action.id}
        onClick={() => handleActionClick(action.id)}
        disabled={action.disabled || action.loading || loading}
        className={cn(
          'relative flex flex-col items-center gap-3 p-6 rounded-lg transition-all duration-200',
          'text-center border border-gray-200 dark:border-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          action.bg
        )}
      >
        {action.badge && (
          <div className={cn(
            'absolute -top-2 -right-2 px-2 py-1 text-xs font-medium rounded-full',
            action.badge.color
          )}>
            {action.badge.text}
          </div>
        )}
        
        <div className="flex-shrink-0">
          {action.loading ? (
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <Icon className={cn('h-8 w-8', action.color)} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            {action.label}
          </h3>
          {action.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {action.description}
            </p>
          )}
        </div>
        
        {action.shortcut && (
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {action.shortcut}
          </span>
        )}
      </button>
    )
  }
  
  if (loading && actions.length === 0) {
    return (
      <div className={cn('space-y-4 animate-pulse', className)}>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
        <div className={cn(
          'grid gap-4',
          variant === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
        )}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-4 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Category Filter */}
          {showCategories && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      {/* Actions */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No actions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or category filter.
          </p>
        </div>
      ) : showCategories && selectedCategory === 'all' ? (
        // Grouped by category
        Object.entries(groupedActions).map(([category, categoryActions]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {categoryLabels[category as keyof typeof categoryLabels] || category}
            </h4>
            <div className={cn(
              'grid gap-4',
              variant === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
            )}>
              {categoryActions.map((action, index) => renderAction(action, index))}
            </div>
          </div>
        ))
      ) : (
        // Flat list
        <div className={cn(
          'grid gap-4',
          variant === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
        )}>
          {filteredActions.map((action, index) => renderAction(action, index))}
        </div>
      )}
    </div>
  )
}

export default QuickActions