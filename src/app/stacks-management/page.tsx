'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useServiceController } from '@/controllers/hooks/useServiceController'
import { useToast } from '@/controllers/hooks/useToast'
import { Search, SearchSuggestion, SearchFilter } from '@/views/molecules/Search'
import { Button } from '@/views/atoms/Button'
import { Badge } from '@/views/atoms/Badge'
import { Card } from '@/views/atoms/Card'
import { Modal, useModal } from '@/views/atoms/Modal'
import { Input } from '@/views/atoms/Input'
import { Table, TableColumn } from '@/views/atoms/Table'
import { Pagination } from '@/views/atoms/Pagination'
import { Service } from '@/models/domain/service'
import { cn } from '@/lib/utils'

interface Stack {
    id: string
    name: string
    services: Service[]
    status: 'running' | 'stopped' | 'partial' | 'error'
    created_at: string
    updated_at: string
}

interface StackFilters {
    status?: string
    search?: string
    serviceCount?: 'all' | 'empty' | 'single' | 'multiple'
}

const Stacks: React.FC = () => {
    const { services, isLoading, error, refreshServices } = useServiceController()
    const { addToast } = useToast()
    const [filters, setFilters] = useState<StackFilters>({})
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedStacks, setSelectedStacks] = useState<Set<string>>(new Set())
    const [sortColumn, setSortColumn] = useState<keyof Stack>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const { isOpen: isCreateModalOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal()
    const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal()

    // Mock stacks data based on services
    const stacks: Stack[] = useMemo(() => {
        if (!services) return []

        const stacksMap = new Map<string, Stack>()

        services.forEach(service => {
            const stackId = service.stack_id || 'default'
            const stackName = stackId === 'default' ? 'Services par défaut' : `Stack ${stackId}`

            if (!stacksMap.has(stackId)) {
                stacksMap.set(stackId, {
                    id: stackId,
                    name: stackName,
                    services: [],
                    status: 'stopped',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            }

            const stack = stacksMap.get(stackId)!
            stack.services.push(service)

            // Determine stack status
            const runningServices = stack.services.filter(s => s.status === 'running').length
            const totalServices = stack.services.length

            if (runningServices === 0) {
                stack.status = 'stopped'
            } else if (runningServices === totalServices) {
                stack.status = 'running'
            } else {
                stack.status = 'partial'
            }
        })

        return Array.from(stacksMap.values())
    }, [services])

    // Filter stacks
    const filteredStacks = useMemo(() => {
        return stacks.filter(stack => {
            if (filters.status && stack.status !== filters.status) return false
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                return stack.name.toLowerCase().includes(searchLower)
            }
            if (filters.serviceCount) {
                switch (filters.serviceCount) {
                    case 'empty':
                        return stack.services.length === 0
                    case 'single':
                        return stack.services.length === 1
                    case 'multiple':
                        return stack.services.length > 1
                    default:
                        return true
                }
            }
            return true
        })
    }, [stacks, filters])

    // Sort stacks
    const sortedStacks = useMemo(() => {
        return [...filteredStacks].sort((a, b) => {
            const aValue = a[sortColumn]
            const bValue = b[sortColumn]

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
    }, [filteredStacks, sortColumn, sortDirection])

    // Paginate stacks
    const paginatedStacks = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return sortedStacks.slice(startIndex, startIndex + pageSize)
    }, [sortedStacks, currentPage, pageSize])

    const totalPages = Math.ceil(sortedStacks.length / pageSize)

    // Search suggestions
    const searchSuggestions: SearchSuggestion[] = useMemo(() => {
        return stacks.map(stack => ({
            id: `stack-${stack.id}`,
            label: stack.name,
            type: 'stack' as const,
            description: `${stack.services.length} services`
        })).slice(0, 10)
    }, [stacks])

    // Search filters
    const searchFilters: SearchFilter[] = [
        {
            id: 'status',
            label: 'Statut',
            type: 'select',
            options: [
                { value: 'running', label: 'En cours' },
                { value: 'stopped', label: 'Arrêté' },
                { value: 'partial', label: 'Partiel' },
                { value: 'error', label: 'Erreur' }
            ]
        },
        {
            id: 'serviceCount',
            label: 'Nombre de services',
            type: 'select',
            options: [
                { value: 'empty', label: 'Aucun service' },
                { value: 'single', label: 'Un service' },
                { value: 'multiple', label: 'Plusieurs services' }
            ]
        }
    ]

    const handleSearch = (query: string, searchFilters: Record<string, any>) => {
        setFilters(prev => ({
            ...prev,
            search: query,
            status: searchFilters.status,
            serviceCount: searchFilters.serviceCount
        }))
        setCurrentPage(1)
    }

    const handleSort = (column: keyof Stack, direction: 'asc' | 'desc') => {
        setSortColumn(column)
        setSortDirection(direction)
    }

    const handleStackAction = async (stackId: string, action: 'start' | 'stop' | 'restart') => {
        const stack = stacks.find(s => s.id === stackId)
        if (!stack) return

        try {
            const promises = stack.services.map(service => {
                switch (action) {
                    case 'start':
                        return fetch(`/api/services/${service.id}/start`, { method: 'POST' })
                    case 'stop':
                        return fetch(`/api/services/${service.id}/stop`, { method: 'POST' })
                    case 'restart':
                        return fetch(`/api/services/${service.id}/restart`, { method: 'POST' })
                    default:
                        return Promise.resolve()
                }
            })

            await Promise.all(promises)
            addToast(`Stack ${action} avec succès`, 'success')
            refreshServices()
        } catch (error) {
            addToast(`Erreur lors de l'action: ${error}`, 'error')
        }
    }

    const getStatusBadge = (status: Stack['status']) => {
        switch (status) {
            case 'running':
                return <Badge variant="success">En cours</Badge>
            case 'stopped':
                return <Badge variant="secondary">Arrêté</Badge>
            case 'partial':
                return <Badge variant="warning">Partiel</Badge>
            case 'error':
                return <Badge variant="error">Erreur</Badge>
            default:
                return <Badge variant="secondary">Inconnu</Badge>
        }
    }

    // Table columns
    const tableColumns: TableColumn<Stack>[] = [
        {
            key: 'name',
            label: 'Nom',
            sortable: true,
            render: (value, stack) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                            {stack.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {stack.services.length} services
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            sortable: true,
            render: (value, stack) => getStatusBadge(stack.status)
        },
        {
            key: 'services',
            label: 'Services',
            render: (value, stack) => (
                <div className="flex flex-wrap gap-1">
                    {stack.services.slice(0, 3).map(service => (
                        <Badge key={service.id} variant="secondary" className="text-xs">
                            {service.name}
                        </Badge>
                    ))}
                    {stack.services.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                            +{stack.services.length - 3}
                        </Badge>
                    )}
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Créé le',
            sortable: true,
            render: (value) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(value).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (value, stack) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStackAction(stack.id, 'start')}
                        disabled={stack.status === 'running'}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStackAction(stack.id, 'stop')}
                        disabled={stack.status === 'stopped'}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStackAction(stack.id, 'restart')}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </Button>
                </div>
            )
        }
    ]

    if (error) {
        return (
            <div className="p-6">
                <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                        Erreur de chargement
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Impossible de charger les stacks.
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Stacks
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez vos groupes de services et orchestration
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
                    <Button onClick={openCreateModal} variant="primary" size="sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nouvelle Stack
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="p-6">
                <Search
                    placeholder="Rechercher des stacks..."
                    suggestions={searchSuggestions}
                    filters={searchFilters}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    size="md"
                />
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Stacks</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stacks.length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Actives</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {stacks.filter(s => s.status === 'running').length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Arrêtées</p>
                            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                {stacks.filter(s => s.status === 'stopped').length}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Partielles</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {stacks.filter(s => s.status === 'partial').length}
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.86-.833-2.63 0L3.224 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Stacks Table */}
            <Card className="overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Stacks ({filteredStacks.length})
                        </h2>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Page {currentPage} sur {totalPages}
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="p-6">
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                                ))}
                            </div>
                        </div>
                    ) : paginatedStacks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Aucune stack trouvée
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Essayez de modifier vos filtres ou créez une nouvelle stack.
                            </p>
                            <Button onClick={openCreateModal} variant="primary">
                                Créer une stack
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Table
                                data={paginatedStacks}
                                columns={tableColumns}
                                onSort={handleSort}
                                sortColumn={sortColumn}
                                sortDirection={sortDirection}
                                selectable={true}
                                selectedRows={selectedStacks}
                                onRowSelect={(id, selected) => {
                                    const newSelected = new Set(selectedStacks)
                                    if (selected) {
                                        newSelected.add(id.toString())
                                    } else {
                                        newSelected.delete(id.toString())
                                    }
                                    setSelectedStacks(newSelected)
                                }}
                                onSelectAll={(selected) => {
                                    if (selected) {
                                        setSelectedStacks(new Set(paginatedStacks.map(s => s.id)))
                                    } else {
                                        setSelectedStacks(new Set())
                                    }
                                }}
                                getRowId={(stack) => stack.id}
                                variant="striped"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredStacks.length}
                        itemsPerPage={pageSize}
                    />
                </div>
            )}

            {/* Create Stack Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                title="Créer une nouvelle stack"
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        label="Nom de la stack"
                        placeholder="ma-stack"
                        helperText="Le nom de la stack (lettres, chiffres, tirets)"
                    />
                    <Input
                        label="Description"
                        placeholder="Description de la stack"
                        helperText="Une description optionnelle"
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={closeCreateModal}>
                            Annuler
                        </Button>
                        <Button variant="primary">
                            Créer la stack
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Stacks
