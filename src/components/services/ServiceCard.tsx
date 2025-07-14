'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Square, 
  Pause, 
  MoreVertical, 
  ExternalLink, 
  Settings, 
  FileText, 
  Trash2,
  Clock,
  HardDrive,
  Cpu,
  Activity
} from 'lucide-react'

export interface Service {
  id: string
  name: string
  subdomain?: string
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error'
  docker_image?: string
  docker_compose?: string
  ports?: string[]
  last_accessed?: string
  resource_usage?: {
    cpu: number
    memory: number
  }
  url?: string
  description?: string
}

export interface ServiceCardProps {
  service: Service
  onConfigure?: (service: Service) => void
  onLogs?: (service: Service) => void
  onSleep?: (service: Service) => void
  onWake?: (service: Service) => void
  onDelete?: (service: Service) => void
  onVisit?: (service: Service) => void
  className?: string
  loading?: boolean
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onConfigure,
  onLogs,
  onSleep,
  onWake,
  onDelete,
  onVisit,
  className,
  loading = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const statusConfig = {
    running: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
      icon: Play,
      label: 'Running',
    },
    stopped: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/20',
      icon: Square,
      label: 'Stopped',
    },
    starting: {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      icon: Play,
      label: 'Starting',
    },
    stopping: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: Pause,
      label: 'Stopping',
    },
    error: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/20',
      icon: Square,
      label: 'Error',
    },
  }
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
  
  const formatLastAccessed = (date: string) => {
    if (!date) return 'Never'
    const now = new Date()
    const accessed = new Date(date)
    const diffMs = now.getTime() - accessed.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return 'Recently'
    }
  }
  
  const getResourceStatus = (value: number) => {
    if (value >= 90) return 'danger'
    if (value >= 70) return 'warning'
    if (value >= 50) return 'info'
    return 'success'
  }
  
  const getServiceIcon = () => {
    switch (service.status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-600" />
      case 'stopped':
        return <Square className="h-4 w-4 text-red-600" />
      case 'starting':
        return <Play className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'stopping':
        return <Pause className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <Square className="h-4 w-4 text-red-600" />
      default:
        return <Square className="h-4 w-4 text-gray-600" />
    }
  }
  
  const canWake = service.status === 'stopped' || service.status === 'error'
  const canSleep = service.status === 'running'
  const canVisit = service.status === 'running' && (service.url || service.subdomain)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  if (loading) {
    return (
      <div className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse',
        className
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            <div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>
          <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
        
        <div className="flex gap-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
      </div>
    )
  }
  
  const config = statusConfig[service.status]
  const StatusIcon = config.icon
  
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
      'hover:shadow-md transition-all duration-200',
      'overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {getServiceIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {service.name}
              </h3>
              {service.subdomain && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {service.subdomain}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              config.bg,
              config.color
            )}>
              {config.label}
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    {onConfigure && (
                      <button
                        onClick={() => {
                          onConfigure(service)
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4" />
                        Configure
                      </button>
                    )}
                    {onLogs && (
                      <button
                        onClick={() => {
                          onLogs(service)
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FileText className="h-4 w-4" />
                        View Logs
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(service)
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Service Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Type:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {service.docker_compose ? 'Compose' : 'Image'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Source:</span>
            <span className="ml-2 text-gray-900 dark:text-white truncate">
              {service.docker_image || service.docker_compose || '-'}
            </span>
          </div>
          {service.ports && service.ports.length > 0 && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Ports:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {service.ports.join(', ')}
              </span>
            </div>
          )}
          {service.last_accessed && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Last Access:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {formatLastAccessed(service.last_accessed)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Resource Usage */}
      {service.resource_usage && (
        <div className="px-6 pb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">CPU</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {service.resource_usage.cpu}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  getResourceStatus(service.resource_usage.cpu) === 'danger' && 'bg-red-500',
                  getResourceStatus(service.resource_usage.cpu) === 'warning' && 'bg-yellow-500',
                  getResourceStatus(service.resource_usage.cpu) === 'info' && 'bg-blue-500',
                  getResourceStatus(service.resource_usage.cpu) === 'success' && 'bg-green-500'
                )}
                style={{ width: `${service.resource_usage.cpu}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Memory</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {service.resource_usage.memory}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  getResourceStatus(service.resource_usage.memory) === 'danger' && 'bg-red-500',
                  getResourceStatus(service.resource_usage.memory) === 'warning' && 'bg-yellow-500',
                  getResourceStatus(service.resource_usage.memory) === 'info' && 'bg-blue-500',
                  getResourceStatus(service.resource_usage.memory) === 'success' && 'bg-green-500'
                )}
                style={{ width: `${service.resource_usage.memory}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex gap-2">
          {canWake && onWake && (
            <button
              onClick={() => onWake(service)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
              Wake
            </button>
          )}
          
          {canSleep && onSleep && (
            <button
              onClick={() => onSleep(service)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Square className="h-4 w-4" />
              Sleep
            </button>
          )}
          
          {onConfigure && (
            <button
              onClick={() => onConfigure(service)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              Manage
            </button>
          )}
          
          {canVisit && onVisit && (
            <button
              onClick={() => onVisit(service)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Visit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceCard