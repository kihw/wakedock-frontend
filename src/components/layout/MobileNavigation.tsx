'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { 
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Home,
  Server,
  Activity,
  Database,
  Shield,
  Users,
  Settings,
  HelpCircle,
  FileText,
  BarChart3,
  Bell,
  Search,
  Package,
  Container,
  Network,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Lock,
  User,
  Calendar,
  Mail,
  Phone,
  MessageCircle,
  Bookmark,
  Star,
  Heart,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Check,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  Compass,
  Target,
  Flag,
  Tag,
  Filter,
  SortAsc,
  Grid3x3,
  List,
  PieChart,
  LineChart,
  TrendingUp,
  Zap,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Maximize2,
  Minimize2,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Layers,
  Box,
  Folder,
  File,
  Image,
  Music,
  Video,
  Code,
  Terminal,
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
  Camera,
  Mic,
  Webcam,
  Router,
  Modem,
  Ethernet,
  Bluetooth,
  Usb,
  Cloud,
  CloudUpload,
  CloudDownload,
  Thermometer,
  Droplet,
  Wind,
  Snowflake,
  Flame,
  Lightbulb,
  Battery,
  Power,
  PowerOff,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  LogOut,
  Sun,
  Moon
} from 'lucide-react'

export interface MobileNavigationItem {
  id: string
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string | number
  active?: boolean
  disabled?: boolean
  external?: boolean
  children?: MobileNavigationItem[]
  permission?: string
  onClick?: () => void
}

export interface MobileNavigationSection {
  id: string
  title?: string
  items: MobileNavigationItem[]
}

export interface MobileNavigationProps {
  sections: MobileNavigationSection[]
  isOpen: boolean
  position?: 'left' | 'right' | 'bottom' | 'full'
  variant?: 'overlay' | 'push' | 'slide'
  showHeader?: boolean
  showFooter?: boolean
  showIcons?: boolean
  showBadges?: boolean
  showSearch?: boolean
  currentPath?: string
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  logo?: React.ReactNode
  footer?: React.ReactNode
  onItemClick?: (item: MobileNavigationItem) => void
  onClose?: () => void
  onSearch?: (query: string) => void
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void
  onThemeToggle?: () => void
  className?: string
}

const defaultSections: MobileNavigationSection[] = [
  {
    id: 'main',
    title: 'Main Menu',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: <Home className="h-5 w-5" />,
        active: true
      },
      {
        id: 'services',
        label: 'Services',
        href: '/services',
        icon: <Server className="h-5 w-5" />,
        badge: 12,
        children: [
          {
            id: 'services-list',
            label: 'All Services',
            href: '/services',
            icon: <List className="h-4 w-4" />
          },
          {
            id: 'services-create',
            label: 'Create Service',
            href: '/services/create',
            icon: <Plus className="h-4 w-4" />
          }
        ]
      },
      {
        id: 'monitoring',
        label: 'Monitoring',
        href: '/monitoring',
        icon: <Activity className="h-5 w-5" />,
        children: [
          {
            id: 'monitoring-overview',
            label: 'Overview',
            href: '/monitoring',
            icon: <BarChart3 className="h-4 w-4" />
          },
          {
            id: 'monitoring-alerts',
            label: 'Alerts',
            href: '/monitoring/alerts',
            icon: <Bell className="h-4 w-4" />,
            badge: 3
          }
        ]
      },
      {
        id: 'infrastructure',
        label: 'Infrastructure',
        href: '/infrastructure',
        icon: <Database className="h-5 w-5" />,
        children: [
          {
            id: 'containers',
            label: 'Containers',
            href: '/containers',
            icon: <Container className="h-4 w-4" />
          },
          {
            id: 'networks',
            label: 'Networks',
            href: '/networks',
            icon: <Network className="h-4 w-4" />
          },
          {
            id: 'volumes',
            label: 'Volumes',
            href: '/volumes',
            icon: <HardDrive className="h-4 w-4" />
          }
        ]
      }
    ]
  },
  {
    id: 'secondary',
    title: 'Other',
    items: [
      {
        id: 'security',
        label: 'Security',
        href: '/security',
        icon: <Shield className="h-5 w-5" />
      },
      {
        id: 'users',
        label: 'Users',
        href: '/users',
        icon: <Users className="h-5 w-5" />
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: <Settings className="h-5 w-5" />
      },
      {
        id: 'help',
        label: 'Help',
        href: '/help',
        icon: <HelpCircle className="h-5 w-5" />
      }
    ]
  }
]

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  sections = defaultSections,
  isOpen,
  position = 'left',
  variant = 'overlay',
  showHeader = true,
  showFooter = true,
  showIcons = true,
  showBadges = true,
  showSearch = true,
  currentPath,
  user,
  logo,
  footer,
  onItemClick,
  onClose,
  onSearch,
  onUserAction,
  onThemeToggle,
  className,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])
  
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose?.()
    }, 300)
  }
  
  const handleItemClick = (item: MobileNavigationItem) => {
    if (item.disabled) return
    
    if (item.children && item.children.length > 0) {
      handleItemToggle(item.id)
    } else {
      onItemClick?.(item)
      item.onClick?.()
      handleClose()
    }
  }
  
  const handleItemToggle = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim())
      setSearchQuery('')
      handleClose()
    }
  }
  
  const isItemActive = (item: MobileNavigationItem): boolean => {
    if (item.active) return true
    if (currentPath) {
      return item.href === currentPath || 
             (item.children?.some(child => child.href === currentPath))
    }
    return false
  }
  
  const getContainerClasses = () => {
    const baseClasses = 'fixed z-50 bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out'
    
    switch (position) {
      case 'left':
        return cn(
          baseClasses,
          'top-0 left-0 h-full w-80 max-w-[85vw] border-r border-gray-200 dark:border-gray-800',
          isOpen && !isClosing ? 'translate-x-0' : '-translate-x-full'
        )
      case 'right':
        return cn(
          baseClasses,
          'top-0 right-0 h-full w-80 max-w-[85vw] border-l border-gray-200 dark:border-gray-800',
          isOpen && !isClosing ? 'translate-x-0' : 'translate-x-full'
        )
      case 'bottom':
        return cn(
          baseClasses,
          'bottom-0 left-0 right-0 max-h-[85vh] border-t border-gray-200 dark:border-gray-800 rounded-t-xl',
          isOpen && !isClosing ? 'translate-y-0' : 'translate-y-full'
        )
      case 'full':
        return cn(
          baseClasses,
          'inset-0',
          isOpen && !isClosing ? 'translate-x-0' : '-translate-x-full'
        )
      default:
        return baseClasses
    }
  }
  
  const renderHeader = () => {
    if (!showHeader) return null
    
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {logo || (
            <div className="flex items-center gap-2">
              <Container className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                WakeDock
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    )
  }
  
  const renderSearch = () => {
    if (!showSearch) return null
    
    return (
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </form>
      </div>
    )
  }
  
  const renderItem = (item: MobileNavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const isActive = isItemActive(item)
    
    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            'flex items-center gap-3 w-full text-left transition-colors',
            level === 0 ? 'px-4 py-3' : `pl-${8 + level * 4} pr-4 py-2`,
            item.disabled
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : isActive
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          {showIcons && item.icon && (
            <div className="flex-shrink-0">
              {item.icon}
            </div>
          )}
          
          <span className="flex-1 truncate font-medium">
            {item.label}
          </span>
          
          {showBadges && item.badge && (
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              isActive
                ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            )}>
              {item.badge}
            </span>
          )}
          
          {hasChildren && (
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )} />
          )}
          
          {item.external && (
            <ExternalLink className="h-4 w-4 text-gray-400" />
          )}
        </button>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="bg-gray-50 dark:bg-gray-800/50">
            {item.children?.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  const renderSection = (section: MobileNavigationSection) => {
    return (
      <div key={section.id} className="mb-6">
        {section.title && (
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {section.title}
            </h3>
          </div>
        )}
        
        <nav className="space-y-1">
          {section.items.map(item => renderItem(item))}
        </nav>
      </div>
    )
  }
  
  const renderUser = () => {
    if (!user) return null
    
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
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
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {user.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {user.email}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {user.role}
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <button
            onClick={() => {
              onUserAction?.('profile')
              handleClose()
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <User className="h-4 w-4" />
            Profile
          </button>
          
          <button
            onClick={() => {
              onUserAction?.('settings')
              handleClose()
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          
          {onThemeToggle && (
            <button
              onClick={() => {
                onThemeToggle()
                handleClose()
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
              Theme
            </button>
          )}
          
          <button
            onClick={() => {
              onUserAction?.('logout')
              handleClose()
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    )
  }
  
  const renderFooter = () => {
    if (!showFooter) return null
    
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {footer || (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            WakeDock v1.0.0
          </div>
        )}
      </div>
    )
  }
  
  if (!isOpen && !isClosing) return null
  
  return (
    <>
      {/* Backdrop */}
      {variant === 'overlay' && (
        <div
          className={cn(
            'fixed inset-0 bg-black transition-opacity duration-300 z-40',
            isOpen && !isClosing ? 'opacity-50' : 'opacity-0'
          )}
          onClick={handleClose}
        />
      )}
      
      {/* Navigation */}
      <div
        ref={navRef}
        className={cn(getContainerClasses(), className)}
      >
        <div className="flex flex-col h-full">
          {renderHeader()}
          {renderSearch()}
          
          <div className="flex-1 overflow-y-auto py-4">
            {sections.map(renderSection)}
          </div>
          
          {renderUser()}
          {renderFooter()}
        </div>
      </div>
    </>
  )
}

export default MobileNavigation