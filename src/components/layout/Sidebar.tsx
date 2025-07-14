'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  Gauge,
  Timer,
  Stopwatch,
  Alarm,
  Hourglass,
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Rainbow,
  Sunrise,
  Sunset,
  Mountain,
  Tree,
  Flower,
  Leaf,
  Bug,
  Fish,
  Bird,
  Dog,
  Cat,
  Rabbit,
  Turtle,
  Octopus,
  Crab,
  Snail,
  Butterfly,
  Bee,
  Spider,
  Worm,
  Ant,
  Ladybug,
  Dragonfly,
  Cricket,
  Grasshopper,
  Fly,
  Mosquito,
  Scorpion,
  Snake,
  Lizard,
  Frog,
  Crocodile,
  Shark,
  Whale,
  Dolphin,
  Penguin,
  Eagle,
  Owl,
  Peacock,
  Swan,
  Duck,
  Chicken,
  Rooster,
  Turkey,
  Pig,
  Cow,
  Horse,
  Sheep,
  Goat,
  Deer,
  Elephant,
  Lion,
  Tiger,
  Bear,
  Wolf,
  Fox,
  Squirrel,
  Hedgehog,
  Rat,
  Mouse as MouseIcon,
  Hamster,
  GuineaPig,
  Ferret,
  Chinchilla,
  Gerbil,
  Otter,
  Badger,
  Raccoon,
  Skunk,
  Opossum,
  Kangaroo,
  Koala,
  Panda,
  Sloth,
  Monkey,
  Gorilla,
  Orangutan,
  Chimpanzee,
  Lemur,
  Meerkat,
  Prairie,
  Camel,
  Llama,
  Alpaca,
  Giraffe,
  Zebra,
  Rhinoceros,
  Hippopotamus,
  Warthog,
  Boar,
  Bison,
  Buffalo,
  Yak,
  Oxen,
  Bull,
  Calf,
  Lamb,
  Kid,
  Piglet,
  Foal,
  Colt,
  Filly,
  Puppy,
  Kitten,
  Chick,
  Duckling,
  Gosling,
  Cygnet,
  Eaglet,
  Owlet,
  Fawn,
  Cub,
  Pup,
  Kit,
  Joey,
  Calf2,
  Lamb2,
  Kid2,
  Piglet2,
  Foal2,
  Colt2,
  Filly2,
  Puppy2,
  Kitten2,
  Chick2,
  Duckling2,
  Gosling2,
  Cygnet2,
  Eaglet2,
  Owlet2,
  Fawn2,
  Cub2,
  Pup2,
  Kit2,
  Joey2
} from 'lucide-react'

export interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  badge?: string | number
  active?: boolean
  expanded?: boolean
  children?: SidebarItem[]
  divider?: boolean
  disabled?: boolean
  onClick?: () => void
  permission?: string
}

export interface SidebarSection {
  id: string
  title?: string
  items: SidebarItem[]
  collapsible?: boolean
  collapsed?: boolean
}

export interface SidebarProps {
  sections: SidebarSection[]
  collapsed?: boolean
  collapsible?: boolean
  width?: number
  collapsedWidth?: number
  position?: 'left' | 'right'
  variant?: 'default' | 'compact' | 'floating'
  showIcons?: boolean
  showBadges?: boolean
  showTooltips?: boolean
  resizable?: boolean
  user?: {
    name: string
    avatar?: string
    role: string
  }
  footer?: React.ReactNode
  onItemClick?: (item: SidebarItem) => void
  onToggleCollapse?: () => void
  onSectionToggle?: (sectionId: string) => void
  onResize?: (width: number) => void
  className?: string
}

const defaultSections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/', active: true },
      { id: 'services', label: 'Services', icon: <Server className="h-4 w-4" />, href: '/services', badge: 12 },
      { id: 'monitoring', label: 'Monitoring', icon: <Activity className="h-4 w-4" />, href: '/monitoring' },
    ]
  },
  {
    id: 'management',
    title: 'Management',
    items: [
      { id: 'containers', label: 'Containers', icon: <Container className="h-4 w-4" />, href: '/containers' },
      { id: 'networks', label: 'Networks', icon: <Network className="h-4 w-4" />, href: '/networks' },
      { id: 'volumes', label: 'Volumes', icon: <HardDrive className="h-4 w-4" />, href: '/volumes' },
    ]
  },
  {
    id: 'system',
    title: 'System',
    items: [
      { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" />, href: '/users' },
      { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, href: '/settings' },
      { id: 'help', label: 'Help', icon: <HelpCircle className="h-4 w-4" />, href: '/help' },
    ]
  }
]

export const Sidebar: React.FC<SidebarProps> = ({
  sections = defaultSections,
  collapsed = false,
  collapsible = true,
  width = 256,
  collapsedWidth = 64,
  position = 'left',
  variant = 'default',
  showIcons = true,
  showBadges = true,
  showTooltips = true,
  resizable = false,
  user,
  footer,
  onItemClick,
  onToggleCollapse,
  onSectionToggle,
  onResize,
  className,
}) => {
  const [localCollapsed, setLocalCollapsed] = useState(collapsed)
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.filter(s => !s.collapsed).map(s => s.id)
  )
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [currentWidth, setCurrentWidth] = useState(width)
  const [isResizing, setIsResizing] = useState(false)
  
  const isCollapsed = localCollapsed
  const sidebarWidth = isCollapsed ? collapsedWidth : currentWidth
  
  useEffect(() => {
    setLocalCollapsed(collapsed)
  }, [collapsed])
  
  const handleToggleCollapse = () => {
    const newCollapsed = !localCollapsed
    setLocalCollapsed(newCollapsed)
    onToggleCollapse?.()
  }
  
  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
    onSectionToggle?.(sectionId)
  }
  
  const handleItemToggle = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }
  
  const handleItemClick = (item: SidebarItem) => {
    if (item.disabled) return
    
    if (item.children && item.children.length > 0) {
      handleItemToggle(item.id)
    } else {
      onItemClick?.(item)
      item.onClick?.()
    }
  }
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable || isCollapsed) return
    
    e.preventDefault()
    setIsResizing(true)
    
    const startX = e.clientX
    const startWidth = currentWidth
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = position === 'left' ? e.clientX - startX : startX - e.clientX
      const newWidth = Math.max(200, Math.min(500, startWidth + deltaX))
      setCurrentWidth(newWidth)
      onResize?.(newWidth)
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  const renderItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const isActive = item.active
    
    return (
      <div key={item.id}>
        {item.divider && (
          <hr className="my-2 border-gray-200 dark:border-gray-700" />
        )}
        
        <div
          className={cn(
            'group relative flex items-center gap-3 rounded-lg transition-all duration-200 cursor-pointer',
            level === 0 ? 'px-3 py-2 mx-2' : `pl-${6 + level * 4} pr-3 py-1.5 mx-2`,
            isActive
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
              : item.disabled
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
            isCollapsed && level === 0 && 'justify-center px-2',
            variant === 'compact' && 'py-1',
            variant === 'floating' && 'mx-3 rounded-xl'
          )}
          onClick={() => handleItemClick(item)}
          title={isCollapsed && showTooltips ? item.label : undefined}
        >
          {showIcons && item.icon && (
            <div className="flex-shrink-0">
              {item.icon}
            </div>
          )}
          
          {!isCollapsed && (
            <>
              <span className="flex-1 truncate text-sm font-medium">
                {item.label}
              </span>
              
              {showBadges && item.badge && (
                <span className={cn(
                  'ml-auto px-2 py-0.5 text-xs font-medium rounded-full',
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
            </>
          )}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && showTooltips && (
            <div className={cn(
              'absolute z-50 px-2 py-1 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              position === 'left' ? 'left-full ml-2' : 'right-full mr-2',
              'top-1/2 -translate-y-1/2'
            )}>
              {item.label}
              {item.badge && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1">
            {item.children?.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  const renderSection = (section: SidebarSection) => {
    const isExpanded = expandedSections.includes(section.id)
    
    return (
      <div key={section.id} className="mb-4">
        {section.title && !isCollapsed && (
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {section.title}
            </h3>
            
            {section.collapsible && (
              <button
                onClick={() => handleSectionToggle(section.id)}
                className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              >
                <ChevronDown className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )} />
              </button>
            )}
          </div>
        )}
        
        {(isExpanded || !section.collapsible) && (
          <nav className="space-y-1">
            {section.items.map(item => renderItem(item))}
          </nav>
        )}
      </div>
    )
  }
  
  const renderUser = () => {
    if (!user || isCollapsed) return null
    
    return (
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
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
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.role}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div
      className={cn(
        'flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
        variant === 'floating' && 'bg-gray-50 dark:bg-gray-950 border-0',
        className
      )}
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      {collapsible && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Menu
            </h2>
          )}
          
          <button
            onClick={handleToggleCollapse}
            className={cn(
              'p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors',
              isCollapsed && 'mx-auto'
            )}
          >
            {position === 'left' ? (
              isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            ) : (
              isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {sections.map(renderSection)}
      </div>
      
      {/* User */}
      {renderUser()}
      
      {/* Footer */}
      {footer && !isCollapsed && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
      
      {/* Resize handle */}
      {resizable && !isCollapsed && (
        <div
          className={cn(
            'absolute top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 transition-colors group',
            position === 'left' ? 'right-0' : 'left-0',
            isResizing && 'bg-blue-500'
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-8 bg-gray-300 dark:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1" />
        </div>
      )}
    </div>
  )
}

export default Sidebar