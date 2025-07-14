'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Container,
  Heart,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ArrowUp,
  Sun,
  Moon,
  Monitor,
  Zap,
  Shield,
  Code,
  Book,
  HelpCircle,
  MessageCircle,
  FileText,
  Download,
  Star,
  Users,
  Clock,
  Activity,
  TrendingUp,
  Award,
  Target,
  Cpu,
  Server,
  Database,
  Network,
  Settings,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Bookmark,
  Tag,
  Link,
  Share,
  Copy,
  Rss,
  Youtube,
  Instagram,
  Facebook,
  Slack,
  Discord,
  Telegram,
  WhatsApp,
  Bell,
  Calendar,
  Cloud,
  CloudUpload,
  CloudDownload,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  Refresh,
  Power,
  PowerOff,
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
  Search,
  Filter,
  SortAsc,
  Grid3x3,
  List,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

export interface FooterLink {
  label: string
  href: string
  external?: boolean
  icon?: React.ReactNode
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface SocialLink {
  platform: 'github' | 'twitter' | 'linkedin' | 'discord' | 'slack' | 'youtube' | 'instagram' | 'facebook' | 'telegram' | 'whatsapp' | 'rss'
  href: string
  label?: string
}

export interface FooterProps {
  sections?: FooterSection[]
  socialLinks?: SocialLink[]
  showLogo?: boolean
  showVersion?: boolean
  showStatus?: boolean
  showThemeToggle?: boolean
  showBackToTop?: boolean
  logo?: React.ReactNode
  companyName?: string
  version?: string
  description?: string
  copyright?: string
  status?: {
    label: string
    color: 'green' | 'yellow' | 'red'
    url?: string
  }
  contact?: {
    email?: string
    phone?: string
    address?: string
  }
  variant?: 'default' | 'minimal' | 'detailed' | 'compact'
  theme?: 'light' | 'dark' | 'system'
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void
  onLinkClick?: (href: string) => void
  className?: string
}

const defaultSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Documentation', href: '/docs', icon: <Book className="h-4 w-4" /> },
      { label: 'API Reference', href: '/api', icon: <Code className="h-4 w-4" /> },
      { label: 'Changelog', href: '/changelog', icon: <FileText className="h-4 w-4" /> },
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Getting Started', href: '/getting-started', icon: <Zap className="h-4 w-4" /> },
      { label: 'Tutorials', href: '/tutorials', icon: <Book className="h-4 w-4" /> },
      { label: 'Community', href: '/community', icon: <Users className="h-4 w-4" /> },
      { label: 'Blog', href: '/blog', icon: <FileText className="h-4 w-4" /> },
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help', icon: <HelpCircle className="h-4 w-4" /> },
      { label: 'Contact Us', href: '/contact', icon: <MessageCircle className="h-4 w-4" /> },
      { label: 'Status Page', href: '/status', icon: <Activity className="h-4 w-4" /> },
      { label: 'Report Issue', href: '/issues', icon: <AlertTriangle className="h-4 w-4" /> },
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ]
  }
]

const socialIcons = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  discord: MessageCircle,
  slack: Slack,
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  telegram: Telegram,
  whatsapp: WhatsApp,
  rss: Rss,
}

export const Footer: React.FC<FooterProps> = ({
  sections = defaultSections,
  socialLinks = [],
  showLogo = true,
  showVersion = true,
  showStatus = true,
  showThemeToggle = true,
  showBackToTop = true,
  logo,
  companyName = 'WakeDock',
  version = '1.0.0',
  description = 'Modern Docker container management platform',
  copyright,
  status = { label: 'All systems operational', color: 'green' },
  contact,
  variant = 'default',
  theme = 'system',
  onThemeChange,
  onLinkClick,
  className,
}) => {
  const [currentTheme, setCurrentTheme] = useState(theme)
  
  const handleThemeToggle = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light'
    setCurrentTheme(nextTheme)
    onThemeChange?.(nextTheme)
  }
  
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleLinkClick = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      onLinkClick?.(href)
    }
  }
  
  const renderLogo = () => {
    if (!showLogo) return null
    
    return (
      <div className="flex items-center gap-3 mb-4">
        {logo || (
          <div className="flex items-center gap-2">
            <Container className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {companyName}
            </span>
          </div>
        )}
      </div>
    )
  }
  
  const renderStatus = () => {
    if (!showStatus || !status) return null
    
    const statusColors = {
      green: 'text-green-600 dark:text-green-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      red: 'text-red-600 dark:text-red-400',
    }
    
    return (
      <div className="flex items-center gap-2 mb-4">
        <div className={cn(
          'w-2 h-2 rounded-full',
          status.color === 'green' ? 'bg-green-500' :
          status.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
        )} />
        {status.url ? (
          <button
            onClick={() => handleLinkClick(status.url!, true)}
            className={cn('text-sm hover:underline', statusColors[status.color])}
          >
            {status.label}
          </button>
        ) : (
          <span className={cn('text-sm', statusColors[status.color])}>
            {status.label}
          </span>
        )}
      </div>
    )
  }
  
  const renderSocialLinks = () => {
    if (socialLinks.length === 0) return null
    
    return (
      <div className="flex items-center gap-4 mb-6">
        {socialLinks.map((social, index) => {
          const Icon = socialIcons[social.platform]
          return (
            <button
              key={index}
              onClick={() => handleLinkClick(social.href, true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={social.label || social.platform}
            >
              <Icon className="h-5 w-5" />
            </button>
          )
        })}
      </div>
    )
  }
  
  const renderSection = (section: FooterSection) => {
    return (
      <div key={section.title} className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          {section.title}
        </h3>
        <ul className="space-y-3">
          {section.links.map((link, index) => (
            <li key={index}>
              <button
                onClick={() => handleLinkClick(link.href, link.external)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
              >
                {link.icon && (
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {link.icon}
                  </span>
                )}
                {link.label}
                {link.external && (
                  <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  
  const renderContact = () => {
    if (!contact) return null
    
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Contact
        </h3>
        <div className="space-y-3">
          {contact.email && (
            <button
              onClick={() => handleLinkClick(`mailto:${contact.email}`, true)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              {contact.email}
            </button>
          )}
          {contact.phone && (
            <button
              onClick={() => handleLinkClick(`tel:${contact.phone}`, true)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
              {contact.phone}
            </button>
          )}
          {contact.address && (
            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{contact.address}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  const renderControls = () => {
    const controls = []
    
    if (showThemeToggle) {
      controls.push(
        <button
          key="theme"
          onClick={handleThemeToggle}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
    
    if (showBackToTop) {
      controls.push(
        <button
          key="back-to-top"
          onClick={handleBackToTop}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )
    }
    
    if (controls.length === 0) return null
    
    return (
      <div className="flex items-center gap-2">
        {controls}
      </div>
    )
  }
  
  const renderMinimalFooter = () => {
    return (
      <footer className={cn('bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800', className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {renderLogo()}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {copyright || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {renderSocialLinks()}
              {renderControls()}
            </div>
          </div>
        </div>
      </footer>
    )
  }
  
  const renderCompactFooter = () => {
    return (
      <footer className={cn('bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800', className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              {renderLogo()}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {description}
                </p>
              )}
              {renderStatus()}
              {renderSocialLinks()}
            </div>
            
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {sections.slice(0, 3).map(renderSection)}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {copyright || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
              {showVersion && version && (
                <span className="ml-4">v{version}</span>
              )}
            </div>
            {renderControls()}
          </div>
        </div>
      </footer>
    )
  }
  
  const renderDetailedFooter = () => {
    return (
      <footer className={cn('bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800', className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            <div className="lg:col-span-2">
              {renderLogo()}
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {description}
                </p>
              )}
              {renderStatus()}
              {renderSocialLinks()}
            </div>
            
            {sections.map(renderSection)}
            
            {contact && (
              <div className="lg:col-span-1">
                {renderContact()}
              </div>
            )}
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {copyright || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
                {showVersion && version && (
                  <span className="ml-4">v{version}</span>
                )}
              </div>
              {renderControls()}
            </div>
          </div>
        </div>
      </footer>
    )
  }
  
  const renderDefaultFooter = () => {
    return (
      <footer className={cn('bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800', className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-1">
              {renderLogo()}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {description}
                </p>
              )}
              {renderStatus()}
            </div>
            
            {sections.map(renderSection)}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {copyright || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
                </div>
                {showVersion && version && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    v{version}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {renderSocialLinks()}
                {renderControls()}
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  
  switch (variant) {
    case 'minimal':
      return renderMinimalFooter()
    case 'compact':
      return renderCompactFooter()
    case 'detailed':
      return renderDetailedFooter()
    default:
      return renderDefaultFooter()
  }
}

export default Footer