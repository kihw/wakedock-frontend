'use client'

import React, { useState } from 'react'
import { cn } from '../../lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Home,
  Folder,
  File,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Share,
  Bookmark,
  Star,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Navigation,
  Compass,
  Target,
  Flag,
  Tag,
  Filter,
  Search,
  Grid3x3,
  List,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Activity,
  Server,
  Database,
  Network,
  Container,
  Package,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  User,
  Users,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Bell,
  Heart,
  Zap,
  Shield,
  Code,
  Terminal,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Monitor as Desktop,
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
  Cable as Modem,
  Cable as Ethernet,
  Bluetooth,
  Usb,
  Cloud,
  CloudUpload,
  CloudDownload,
  HardDrive,
  Cpu,
  MemoryStick,
  Battery,
  Power,
  PowerOff,
  Thermometer,
  Droplet,
  Wind,
  Snowflake,
  Flame,
  Lightbulb,
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Rainbow,
  Sunrise,
  Sunset
} from 'lucide-react'

export interface BreadcrumbItem {
  id: string
  label: string
  href: string
  icon?: React.ReactNode
  active?: boolean
  disabled?: boolean
  dropdown?: {
    items: Array<{
      id: string
      label: string
      href: string
      icon?: React.ReactNode
      description?: string
    }>
  }
  metadata?: {
    description?: string
    lastModified?: string
    size?: string
    type?: string
  }
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  variant?: 'default' | 'compact' | 'detailed' | 'pills'
  separator?: 'chevron' | 'slash' | 'arrow' | 'dot' | 'custom'
  customSeparator?: React.ReactNode
  showHome?: boolean
  showIcons?: boolean
  showMetadata?: boolean
  maxItems?: number
  expandable?: boolean
  collapsible?: boolean
  interactive?: boolean
  homeIcon?: React.ReactNode
  homeHref?: string
  onItemClick?: (item: BreadcrumbItem) => void
  onItemHover?: (item: BreadcrumbItem | null) => void
  onCopy?: (path: string) => void
  onShare?: (path: string) => void
  className?: string
}

const separatorIcons = {
  chevron: ChevronRight,
  slash: () => <span className="text-gray-400">/</span>,
  arrow: () => <span className="text-gray-400">→</span>,
  dot: () => <span className="text-gray-400">•</span>,
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  variant = 'default',
  separator = 'chevron',
  customSeparator,
  showHome = true,
  showIcons = true,
  showMetadata = false,
  maxItems = 5,
  expandable = true,
  collapsible = true,
  interactive = true,
  homeIcon = <Home className="h-4 w-4" />,
  homeHref = '/',
  onItemClick,
  onItemHover,
  onCopy,
  onShare,
  className,
}) => {
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleItems = collapsible && !isExpanded && items.length > maxItems
    ? [
      ...items.slice(0, 1),
      {
        id: 'more',
        label: '...',
        href: '#',
        dropdown: {
          items: items.slice(1, -1).map(item => ({
            id: item.id,
            label: item.label,
            href: item.href,
            icon: item.icon,
            description: item.metadata?.description
          }))
        }
      },
      ...items.slice(-1)
    ]
    : items

  const getSeparatorIcon = () => {
    if (customSeparator) return customSeparator
    if (separator === 'custom') return null

    const SeparatorComponent = separatorIcons[separator]
    return <SeparatorComponent className="h-4 w-4 text-gray-400" />
  }

  const getFullPath = () => {
    const path = items.map(item => item.label).join(' / ')
    return showHome ? `Home / ${path}` : path
  }

  const handleItemClick = (item: BreadcrumbItem, event?: React.MouseEvent) => {
    if (item.disabled) return

    if (item.id === 'more') {
      event?.preventDefault()
      setIsExpanded(true)
      return
    }

    if (item.dropdown) {
      event?.preventDefault()
      setExpandedDropdown(expandedDropdown === item.id ? null : item.id)
      return
    }

    onItemClick?.(item)
  }

  const handleItemHover = (item: BreadcrumbItem | null) => {
    setHoveredItem(item?.id || null)
    onItemHover?.(item)
  }

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation()
    const path = getFullPath()
    onCopy?.(path)
    navigator.clipboard.writeText(path)
  }

  const handleShare = (event: React.MouseEvent) => {
    event.stopPropagation()
    const path = getFullPath()
    onShare?.(path)
  }

  const renderDropdown = (item: BreadcrumbItem) => {
    if (!item.dropdown || !expandedDropdown || expandedDropdown !== item.id) return null

    return (
      <div className="absolute top-full left-0 mt-1 min-w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
        {item.dropdown.items.map((dropdownItem) => (
          <button
            key={dropdownItem.id}
            onClick={() => {
              handleItemClick({ ...dropdownItem, active: false, disabled: false })
              setExpandedDropdown(null)
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {dropdownItem.icon && (
              <span className="flex-shrink-0 text-gray-400">
                {dropdownItem.icon}
              </span>
            )}
            <div className="flex-1 text-left">
              <div className="font-medium">{dropdownItem.label}</div>
              {dropdownItem.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {dropdownItem.description}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    )
  }

  const renderMetadata = (item: BreadcrumbItem) => {
    if (!showMetadata || !item.metadata || !hoveredItem || hoveredItem !== item.id) return null

    return (
      <div className="absolute top-full left-0 mt-1 min-w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3">
        <div className="space-y-2">
          {item.metadata.description && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</div>
              <div className="text-sm text-gray-900 dark:text-white">{item.metadata.description}</div>
            </div>
          )}
          {item.metadata.type && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Type</div>
              <div className="text-sm text-gray-900 dark:text-white">{item.metadata.type}</div>
            </div>
          )}
          {item.metadata.lastModified && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Modified</div>
              <div className="text-sm text-gray-900 dark:text-white">{item.metadata.lastModified}</div>
            </div>
          )}
          {item.metadata.size && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Size</div>
              <div className="text-sm text-gray-900 dark:text-white">{item.metadata.size}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const isActive = item.active || isLast
    const hasDropdown = item.dropdown && item.dropdown.items.length > 0

    const baseClasses = cn(
      'inline-flex items-center gap-2 transition-colors relative',
      variant === 'pills' && 'px-3 py-1 rounded-full',
      variant === 'compact' && 'text-sm',
      variant === 'detailed' && 'px-2 py-1 rounded',
      item.disabled
        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
        : isActive
          ? 'text-gray-900 dark:text-white font-medium'
          : interactive
            ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer'
            : 'text-gray-600 dark:text-gray-400',
      interactive && !item.disabled && !isActive && variant === 'pills' && 'hover:bg-gray-100 dark:hover:bg-gray-800',
      interactive && !item.disabled && !isActive && variant === 'detailed' && 'hover:bg-gray-100 dark:hover:bg-gray-800',
      isActive && variant === 'pills' && 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    )

    return (
      <div key={item.id} className="relative">
        <button
          onClick={(e) => handleItemClick(item, e)}
          onMouseEnter={() => handleItemHover(item)}
          onMouseLeave={() => handleItemHover(null)}
          disabled={item.disabled}
          className={baseClasses}
          title={item.metadata?.description}
        >
          {showIcons && item.icon && (
            <span className="flex-shrink-0">
              {item.icon}
            </span>
          )}

          <span className={cn(
            'truncate',
            variant === 'compact' ? 'max-w-32' : 'max-w-48'
          )}>
            {item.label}
          </span>

          {hasDropdown && (
            <ChevronDown className={cn(
              'h-3 w-3 transition-transform duration-200',
              expandedDropdown === item.id && 'rotate-180'
            )} />
          )}
        </button>

        {renderDropdown(item)}
        {renderMetadata(item)}
      </div>
    )
  }

  const renderControls = () => {
    if (!interactive || (!onCopy && !onShare)) return null

    return (
      <div className="flex items-center gap-1 ml-2">
        {onCopy && (
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Copy path"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}

        {onShare && (
          <button
            onClick={handleShare}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Share path"
          >
            <Share className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setExpandedDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (items.length === 0) return null

  return (
    <nav
      className={cn(
        'flex items-center gap-1 text-sm',
        variant === 'detailed' && 'bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg',
        variant === 'compact' && 'text-xs',
        className
      )}
      aria-label="Breadcrumb"
    >
      {/* Home link */}
      {showHome && (
        <>
          <button
            onClick={() => onItemClick?.({ id: 'home', label: 'Home', href: homeHref, active: false, disabled: false })}
            className={cn(
              'inline-flex items-center gap-1 transition-colors',
              variant === 'pills' && 'px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
            title="Go to home"
          >
            {homeIcon}
            {variant === 'detailed' && <span>Home</span>}
          </button>

          {items.length > 0 && (
            <span className="flex-shrink-0">
              {getSeparatorIcon()}
            </span>
          )}
        </>
      )}

      {/* Breadcrumb items */}
      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1

        return (
          <React.Fragment key={item.id}>
            {renderItem(item, index, isLast)}

            {!isLast && (
              <span className="flex-shrink-0">
                {getSeparatorIcon()}
              </span>
            )}
          </React.Fragment>
        )
      })}

      {/* Controls */}
      {renderControls()}

      {/* Expand button for collapsed state */}
      {collapsible && !isExpanded && items.length > maxItems && (
        <button
          onClick={() => setIsExpanded(true)}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title="Show all items"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}

      {/* Collapse button for expanded state */}
      {collapsible && isExpanded && items.length > maxItems && (
        <button
          onClick={() => setIsExpanded(false)}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title="Collapse items"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  )
}

export default Breadcrumbs