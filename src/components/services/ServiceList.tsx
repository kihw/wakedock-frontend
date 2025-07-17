'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { Search, Filter, Grid, List, Plus, RefreshCw } from 'lucide-react'
import { ServiceCard, Service } from './ServiceCard'

export interface ServiceListProps {
  services: Service[]
  loading?: boolean
  error?: string
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  onServiceAction?: (action: string, service: Service) => void
  onRefresh?: () => void
  onCreateService?: () => void
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  loading = false,
  error,
  viewMode = 'grid',
  onViewModeChange,
  onServiceAction,
  onRefresh,
  onCreateService,
  searchPlaceholder = 'Search services...',
  emptyMessage = 'No services found',
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastAccessed'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  const filteredServices = useMemo(() => {
    let filtered = services
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.docker_image?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.docker_compose?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => service.status === statusFilter)
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'lastAccessed':
          aValue = a.last_accessed ? new Date(a.last_accessed).getTime() : 0
          bValue = b.last_accessed ? new Date(b.last_accessed).getTime() : 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    
    return filtered
  }, [services, searchTerm, statusFilter, sortBy, sortOrder])
  
  const statusCounts = useMemo(() => {
    const counts = {
      all: services.length,
      running: 0,
      stopped: 0,
      starting: 0,
      stopping: 0,
      error: 0,
    }
    
    services.forEach(service => {
      if (service.status in counts) {
        counts[service.status as keyof typeof counts]++
      }
    })
    
    return counts
  }, [services])
  
  const handleServiceAction = (action: string, service: Service) => {
    onServiceAction?.(action, service)
  }
  
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }
  
  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-red-600 dark:text-red-400 mb-4">
          <span className="text-lg font-medium">Error loading services</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Services
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredServices.length} of {services.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} />
            </button>
          )}
          
          {onViewModeChange && (
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {onCreateService && (
            <button
              onClick={onCreateService}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Service
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status ({statusCounts.all})</option>
          <option value="running">Running ({statusCounts.running})</option>
          <option value="stopped">Stopped ({statusCounts.stopped})</option>
          <option value="starting">Starting ({statusCounts.starting})</option>
          <option value="stopping">Stopping ({statusCounts.stopping})</option>
          <option value="error">Error ({statusCounts.error})</option>
        </select>
        
        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-')
            setSortBy(field as typeof sortBy)
            setSortOrder(order as typeof sortOrder)
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="status-asc">Status (A-Z)</option>
          <option value="status-desc">Status (Z-A)</option>
          <option value="lastAccessed-desc">Recently Accessed</option>
          <option value="lastAccessed-asc">Least Accessed</option>
        </select>
      </div>
      
      {/* Service List */}
      {loading && services.length === 0 ? (
        <div className={cn(
          'grid gap-6',
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        )}>
          {Array.from({ length: 6 }).map((_, index) => (
            <ServiceCard key={index} service={{} as Service} loading />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Filter className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{emptyMessage}</p>
          </div>
          {searchTerm || statusFilter !== 'all' ? (
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
          ) : null}
          {onCreateService && (
            <button
              onClick={onCreateService}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first service
            </button>
          )}
        </div>
      ) : (
        <div className={cn(
          'grid gap-6',
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        )}>
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onConfigure={() => handleServiceAction('configure', service)}
              onLogs={() => handleServiceAction('logs', service)}
              onSleep={() => handleServiceAction('sleep', service)}
              onWake={() => handleServiceAction('wake', service)}
              onDelete={() => handleServiceAction('delete', service)}
              onVisit={() => handleServiceAction('visit', service)}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ServiceList