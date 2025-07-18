'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useServiceController } from '@/controllers/hooks/useServiceController'
import { useToast } from '@/controllers/hooks/useToast'
import { Search } from '@/views/molecules/Search'
import Filters, { FilterGroup, FilterState } from '@/views/molecules/Filters'
import { ServiceCard } from '@/views/molecules/ServiceCard'
import { Button } from '@/views/atoms/Button'
import { Badge } from '@/views/atoms/Badge'
import { Card } from '@/views/atoms/Card'
import { cn } from '@/lib/utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface ServiceViewMode {
  view: 'grid' | 'list' | 'table'
  sortBy: 'name' | 'status' | 'created' | 'updated'
  sortOrder: 'asc' | 'desc'
}

const ServicesPage: React.FC = () => {
  const { services, isLoading, error, startService, stopService, refreshServices } = useServiceController()
  const { addToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [viewMode, setViewMode] = useState<ServiceViewMode>({
    view: 'grid',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Filter groups configuration
  const filterGroups: FilterGroup[] = [
    {
      id: 'status',
      label: 'Statut',
      type: 'multiselect',
      options: [
        { value: 'running', label: 'En cours', color: 'green', count: services?.filter(s => s.status === 'running').length },
        { value: 'stopped', label: 'Arrêté', color: 'gray', count: services?.filter(s => s.status === 'stopped').length },
        { value: 'error', label: 'Erreur', color: 'red', count: services?.filter(s => s.status === 'error').length },
        { value: 'starting', label: 'Démarrage', color: 'yellow', count: services?.filter(s => s.status === 'starting').length },
      ]
    },
    {
      id: 'type',
      label: 'Type',
      type: 'multiselect',
      options: [
        { value: 'web', label: 'Web', count: services?.filter(s => s.docker_image?.includes('web')).length },
        { value: 'database', label: 'Base de données', count: services?.filter(s => s.docker_image?.includes('postgres')).length },
        { value: 'cache', label: 'Cache', count: services?.filter(s => s.docker_image?.includes('redis')).length },
        { value: 'worker', label: 'Worker', count: services?.filter(s => s.docker_image?.includes('worker')).length },
      ]
    },
    {
      id: 'cpu',
      label: 'CPU Usage',
      type: 'range',
      min: 0,
      max: 100,
      step: 5,
      placeholder: 'Filtrer par utilisation CPU'
    },
    {
      id: 'memory',
      label: 'Memory Usage',
      type: 'range',
      min: 0,
      max: 100,
      step: 5,
      placeholder: 'Filtrer par utilisation mémoire'
    },
    {
      id: 'autoStart',
      label: 'Auto-démarrage',
      type: 'boolean',
      placeholder: 'Services avec auto-démarrage'
    },
    {
      id: 'hasHealthCheck',
      label: 'Health Check',
      type: 'boolean',
      placeholder: 'Services avec monitoring santé'
    }
  ]

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!services) return []

    const suggestions: Array<{ value: string; label: string }> = []
    services.forEach(service => {
      suggestions.push({ value: service.name, label: service.name })
      suggestions.push({ value: service.status, label: service.status })
      if (service.subdomain) suggestions.push({ value: service.subdomain, label: service.subdomain })
      if (service.docker_image) suggestions.push({ value: service.docker_image, label: service.docker_image })
    })

    return suggestions
  }, [services])

  // Filter and search services
  const filteredServices = useMemo(() => {
    if (!services) return []

    return services.filter(service => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          service.name.toLowerCase().includes(query) ||
          service.subdomain?.toLowerCase().includes(query) ||
          service.docker_image?.toLowerCase().includes(query) ||
          service.status.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status?.length > 0) {
        if (!filters.status.includes(service.status)) return false
      }

      // Type filter (based on docker image)
      if (filters.type?.length > 0) {
        const imageType = service.docker_image?.toLowerCase() || ''
        const matchesType = filters.type.some(type => imageType.includes(type))
        if (!matchesType) return false
      }

      // CPU filter
      if (filters.cpu?.min !== undefined || filters.cpu?.max !== undefined) {
        const cpu = service.resources?.cpu || 0
        if (filters.cpu.min !== undefined && cpu < filters.cpu.min) return false
        if (filters.cpu.max !== undefined && cpu > filters.cpu.max) return false
      }

      // Memory filter
      if (filters.memory?.min !== undefined || filters.memory?.max !== undefined) {
        const memory = service.resources?.memory || 0
        if (filters.memory.min !== undefined && memory < filters.memory.min) return false
        if (filters.memory.max !== undefined && memory > filters.memory.max) return false
      }

      // Boolean filters - skip these for now as they're not in the Service interface
      // if (filters.autoStart && !service.autoStart) return false
      // if (filters.hasHealthCheck && !service.healthCheck) return false

      return true
    })
  }, [services, searchQuery, filters])

  // Sort services
  const sortedServices = useMemo(() => {
    return [...filteredServices].sort((a, b) => {
      let aValue, bValue

      switch (viewMode.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'created':
          aValue = new Date(a.created_at || 0).getTime()
          bValue = new Date(b.created_at || 0).getTime()
          break
        case 'updated':
          aValue = new Date(a.updated_at || 0).getTime()
          bValue = new Date(b.updated_at || 0).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return viewMode.sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return viewMode.sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredServices, viewMode])

  // Service actions
  const handleServiceAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      switch (action) {
        case 'start':
          await startService(serviceId)
          addToast('Service démarré avec succès', 'success')
          break
        case 'stop':
          await stopService(serviceId)
          addToast('Service arrêté avec succès', 'success')
          break
        case 'restart':
          await stopService(serviceId)
          await startService(serviceId)
          addToast('Service redémarré avec succès', 'success')
          break
      }
    } catch (error) {
      addToast(`Erreur lors de ${action}: ${error}`, 'error')
    }
  }

  // Bulk actions
  const handleBulkAction = async (action: 'start' | 'stop') => {
    const promises = selectedServices.map(serviceId =>
      handleServiceAction(serviceId, action)
    )

    await Promise.all(promises)
    setSelectedServices([])
  }

  // Statistics
  const stats = useMemo(() => {
    if (!services) return { total: 0, running: 0, stopped: 0, error: 0 }

    return {
      total: services.length,
      running: services.filter(s => s.status === 'running').length,
      stopped: services.filter(s => s.status === 'stopped').length,
      error: services.filter(s => s.status === 'error').length
    }
  }, [services])

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Impossible de charger les services.
          </p>
          <Button onClick={refreshServices} variant="secondary" size="sm">
            Réessayer
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Services
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez et surveillez vos services Docker
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={refreshServices}
            variant="outline"
            size="sm"
            loading={isLoading}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </Button>

          <Button variant="primary" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau service
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En cours</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.running}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Arrêtés</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.stopped}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Erreurs</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.error}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher des services..."
            suggestions={searchSuggestions}
            className="w-full"
          />
        </div>

        <div className="lg:col-span-1">
          <Filters
            groups={filterGroups}
            onFiltersChange={setFilters}
            initialFilters={filters}
            variant="compact"
            className="w-full"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <Filters
        groups={filterGroups}
        onFiltersChange={setFilters}
        initialFilters={filters}
        collapsible={true}
        className="w-full"
      />

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(prev => ({ ...prev, view: 'grid' }))}
              className={cn(
                'p-2 rounded-lg',
                viewMode.view === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode(prev => ({ ...prev, view: 'list' }))}
              className={cn(
                'p-2 rounded-lg',
                viewMode.view === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Trier par:</span>
            <select
              value={viewMode.sortBy}
              onChange={(e) => setViewMode(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="text-sm border rounded-lg px-2 py-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <option value="name">Nom</option>
              <option value="status">Statut</option>
              <option value="created">Date création</option>
              <option value="updated">Dernière mise à jour</option>
            </select>

            <button
              onClick={() => setViewMode(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <svg className={cn('w-4 h-4', viewMode.sortOrder === 'desc' && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sortedServices.length} service{sortedServices.length > 1 ? 's' : ''}
          </span>

          {selectedServices.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="primary">
                {selectedServices.length} sélectionné{selectedServices.length > 1 ? 's' : ''}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('start')}
              >
                Démarrer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('stop')}
              >
                Arrêter
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card className="h-48 bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : sortedServices.length > 0 ? (
        <motion.div
          layout
          className={cn(
            'grid gap-6',
            viewMode.view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}
        >
          {sortedServices.map((service, index) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ServiceCard
                service={service}
                onStart={() => handleServiceAction(service.id, 'start')}
                onStop={() => handleServiceAction(service.id, 'stop')}
                onRestart={() => handleServiceAction(service.id, 'restart')}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucun service trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Aucun service ne correspond à vos critères de recherche'
              : 'Vous n\'avez pas encore créé de service'
            }
          </p>
          <div className="flex items-center justify-center gap-2">
            {(searchQuery || Object.keys(filters).length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setFilters({})
                }}
              >
                Effacer les filtres
              </Button>
            )}
            <Button variant="primary" size="sm">
              Créer un service
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default ServicesPage
