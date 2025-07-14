'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronDown,
  ChevronRight,
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
  X,
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
  ArrowDown
} from 'lucide-react'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: React.ReactNode
  description?: string
  badge?: string | number
  active?: boolean
  disabled?: boolean
  external?: boolean
  children?: NavigationItem[]
  permission?: string
  onClick?: () => void
}

export interface NavigationSection {
  id: string
  title?: string
  items: NavigationItem[]
}

export interface MainNavigationProps {
  sections: NavigationSection[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  showIcons?: boolean
  showBadges?: boolean
  showDescriptions?: boolean
  allowDropdowns?: boolean
  stickyTop?: number
  currentPath?: string
  onItemClick?: (item: NavigationItem) => void
  onActiveChange?: (itemId: string) => void
  className?: string
}

const defaultSections: NavigationSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: <Home className="h-4 w-4" />,
        description: 'Overview and statistics',
        active: true
      },
      {
        id: 'services',
        label: 'Services',
        href: '/services',
        icon: <Server className="h-4 w-4" />,
        description: 'Manage Docker services',
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
          },
          {
            id: 'services-templates',
            label: 'Templates',
            href: '/services/templates',
            icon: <Package className="h-4 w-4" />
          }
        ]
      },
      {
        id: 'monitoring',
        label: 'Monitoring',
        href: '/monitoring',
        icon: <Activity className="h-4 w-4" />,
        description: 'System monitoring and alerts',
        children: [
          {
            id: 'monitoring-overview',
            label: 'Overview',
            href: '/monitoring',
            icon: <BarChart3 className="h-4 w-4" />
          },
          {
            id: 'monitoring-metrics',
            label: 'Metrics',
            href: '/monitoring/metrics',
            icon: <LineChart className="h-4 w-4" />
          },
          {
            id: 'monitoring-logs',
            label: 'Logs',
            href: '/monitoring/logs',
            icon: <FileText className="h-4 w-4" />
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
        icon: <Database className="h-4 w-4" />,
        description: 'Containers, networks, and volumes',
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
          },
          {
            id: 'images',
            label: 'Images',
            href: '/images',
            icon: <Package className="h-4 w-4" />
          }
        ]
      },
      {
        id: 'security',
        label: 'Security',
        href: '/security',
        icon: <Shield className="h-4 w-4" />,
        description: 'Security and access control'
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: <Settings className="h-4 w-4" />,
        description: 'Application settings'
      }
    ]
  }
]

export const MainNavigation: React.FC<MainNavigationProps> = ({
  sections = defaultSections,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  showIcons = true,
  showBadges = true,
  showDescriptions = false,
  allowDropdowns = true,
  stickyTop,
  currentPath,
  onItemClick,
  onActiveChange,
  className,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isSticky, setIsSticky] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  
  const sizeClasses = {
    sm: {
      item: 'px-2 py-1 text-sm',
      icon: 'h-3 w-3',
      badge: 'px-1.5 py-0.5 text-xs'
    },
    md: {
      item: 'px-3 py-2 text-sm',
      icon: 'h-4 w-4',
      badge: 'px-2 py-0.5 text-xs'
    },
    lg: {
      item: 'px-4 py-3 text-base',
      icon: 'h-5 w-5',
      badge: 'px-2 py-1 text-sm'
    }
  }
  
  const variantClasses = {
    default: {
      container: 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
      item: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg',
      active: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      dropdown: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg'
    },
    pills: {
      container: 'bg-gray-50 dark:bg-gray-900/50',
      item: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-full',
      active: 'text-white bg-blue-600 dark:bg-blue-500',
      dropdown: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg'
    },
    underline: {
      container: 'border-b border-gray-200 dark:border-gray-800',
      item: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600',
      active: 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400',
      dropdown: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg'
    },
    minimal: {
      container: '',
      item: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
      active: 'text-blue-600 dark:text-blue-400',
      dropdown: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg'
    }
  }
  
  const currentVariant = variantClasses[variant]
  const currentSize = sizeClasses[size]
  
  // Handle sticky behavior
  useEffect(() => {
    if (stickyTop === undefined) return
    
    const handleScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect()
        setIsSticky(rect.top <= stickyTop)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [stickyTop])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideDropdown = Object.values(dropdownRefs.current).some(ref =>
        ref?.contains(target)
      )
      
      if (!isInsideDropdown) {
        setActiveDropdown(null)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const isItemActive = (item: NavigationItem): boolean => {
    if (item.active) return true
    if (currentPath) {
      return item.href === currentPath || 
             (item.children?.some(child => child.href === currentPath))
    }
    return false
  }
  
  const handleItemClick = (item: NavigationItem, event?: React.MouseEvent) => {
    if (item.disabled) return
    
    if (item.children && item.children.length > 0 && allowDropdowns) {
      event?.preventDefault()
      setActiveDropdown(activeDropdown === item.id ? null : item.id)
    } else {
      setActiveDropdown(null)
      onItemClick?.(item)
      item.onClick?.()
      
      if (isItemActive(item)) {
        onActiveChange?.(item.id)
      }
    }
  }
  
  const handleItemMouseEnter = (item: NavigationItem) => {
    setHoveredItem(item.id)
    if (item.children && item.children.length > 0 && allowDropdowns && orientation === 'horizontal') {
      setActiveDropdown(item.id)
    }
  }
  
  const handleItemMouseLeave = () => {
    setHoveredItem(null)
    // Don't close dropdown immediately to allow mouse movement to dropdown
    setTimeout(() => {
      if (hoveredItem === null) {
        setActiveDropdown(null)
      }
    }, 150)
  }
  
  const renderDropdown = (item: NavigationItem) => {
    if (!item.children || item.children.length === 0 || !allowDropdowns) return null
    
    const isOpen = activeDropdown === item.id
    
    return (
      <div
        ref={el => dropdownRefs.current[item.id] = el}
        className={cn(
          'absolute z-50 min-w-48 py-1 transition-all duration-200',
          currentVariant.dropdown,
          orientation === 'horizontal' ? 'top-full left-0 mt-1' : 'left-full top-0 ml-1',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={handleItemMouseLeave}
      >
        {item.children.map(child => (
          <div key={child.id}>
            <button
              onClick={(e) => handleItemClick(child, e)}
              disabled={child.disabled}
              className={cn(
                'flex items-center gap-3 w-full text-left transition-colors',
                currentSize.item,
                child.disabled
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : isItemActive(child)
                  ? currentVariant.active
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {showIcons && child.icon && (
                <span className={cn('flex-shrink-0', currentSize.icon)}>
                  {child.icon}
                </span>
              )}
              
              <span className="flex-1 truncate">
                {child.label}
              </span>
              
              {showBadges && child.badge && (
                <span className={cn(
                  'ml-auto font-medium rounded-full',
                  currentSize.badge,
                  isItemActive(child)
                    ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                )}>
                  {child.badge}
                </span>
              )}
              
              {child.external && (
                <ExternalLink className="h-3 w-3 text-gray-400" />
              )}
            </button>
          </div>
        ))}
      </div>
    )
  }
  
  const renderItem = (item: NavigationItem) => {
    const isActive = isItemActive(item)
    const hasDropdown = item.children && item.children.length > 0 && allowDropdowns
    
    return (
      <div
        key={item.id}
        className="relative"
        onMouseEnter={() => handleItemMouseEnter(item)}
        onMouseLeave={handleItemMouseLeave}
      >
        <button
          onClick={(e) => handleItemClick(item, e)}
          disabled={item.disabled}
          className={cn(
            'flex items-center gap-2 font-medium transition-all duration-200 relative',
            currentSize.item,
            item.disabled
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : isActive
              ? currentVariant.active
              : currentVariant.item,
            orientation === 'vertical' && 'w-full justify-start',
            variant === 'underline' && orientation === 'horizontal' && 'pb-3'
          )}
          title={showDescriptions ? item.description : undefined}
        >
          {showIcons && item.icon && (
            <span className="flex-shrink-0">
              {item.icon}
            </span>
          )}
          
          <span className="truncate">
            {item.label}
          </span>
          
          {showBadges && item.badge && (
            <span className={cn(
              'ml-1 font-medium rounded-full',
              currentSize.badge,
              isActive
                ? variant === 'pills'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            )}>
              {item.badge}
            </span>
          )}
          
          {hasDropdown && (
            <ChevronDown className={cn(
              'h-3 w-3 transition-transform duration-200',
              activeDropdown === item.id && 'rotate-180',
              orientation === 'vertical' && 'ml-auto'
            )} />
          )}
          
          {item.external && (
            <ExternalLink className="h-3 w-3 text-gray-400" />
          )}
        </button>
        
        {renderDropdown(item)}
      </div>
    )
  }
  
  const renderSection = (section: NavigationSection) => {
    return (
      <div key={section.id} className={cn(
        orientation === 'horizontal' ? 'flex items-center space-x-1' : 'space-y-1'
      )}>
        {section.title && orientation === 'vertical' && (
          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {section.title}
          </h3>
        )}
        
        {section.items.map(renderItem)}
      </div>
    )
  }
  
  return (
    <nav
      ref={navRef}
      className={cn(
        'transition-all duration-200',
        currentVariant.container,
        orientation === 'horizontal' ? 'px-4 py-2' : 'py-4',
        stickyTop !== undefined && `sticky top-${stickyTop} z-40`,
        isSticky && 'shadow-sm',
        className
      )}
    >
      <div className={cn(
        orientation === 'horizontal'
          ? 'flex items-center space-x-6'
          : 'space-y-6'
      )}>
        {sections.map(renderSection)}
      </div>
      
      {/* Descriptions tooltip for horizontal layout */}
      {showDescriptions && orientation === 'horizontal' && hoveredItem && (
        <div className="absolute z-50 px-3 py-2 mt-2 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded shadow-lg pointer-events-none">
          {sections
            .flatMap(s => s.items)
            .find(item => item.id === hoveredItem)?.description}
        </div>
      )}
    </nav>
  )
}

export default MainNavigation