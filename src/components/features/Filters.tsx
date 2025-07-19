'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/views/atoms/Button'
import { Badge } from '@/views/atoms/Badge'
import { Input } from '@/views/atoms/Input'
import { Card } from '@/views/atoms/Card'
import { cn } from '@/lib/utils'

export interface FilterOption {
    value: string
    label: string
    count?: number
    color?: string
    icon?: React.ReactNode
}

export interface FilterGroup {
    id: string
    label: string
    type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean'
    options?: FilterOption[]
    placeholder?: string
    min?: number
    max?: number
    step?: number
    defaultValue?: any
}

export interface FilterState {
    [key: string]: any
}

export interface FiltersProps {
    groups: FilterGroup[]
    onFiltersChange: (filters: FilterState) => void
    initialFilters?: FilterState
    className?: string
    showActiveCount?: boolean
    showClearAll?: boolean
    collapsible?: boolean
    variant?: 'default' | 'compact' | 'sidebar'
}

const Filters: React.FC<FiltersProps> = ({
    groups,
    onFiltersChange,
    initialFilters = {},
    className,
    showActiveCount = true,
    showClearAll = true,
    collapsible = false,
    variant = 'default'
}) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters)
    const [isExpanded, setIsExpanded] = useState(!collapsible)
    const [searchTerm, setSearchTerm] = useState('')

    // Filter groups by search term
    const filteredGroups = searchTerm
        ? groups.filter(group =>
            group.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.options?.some(option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : groups

    // Count active filters
    const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
        if (value === null || value === undefined || value === '') return false
        if (Array.isArray(value)) return value.length > 0
        return true
    }).length

    // Update filters
    const updateFilter = useCallback((groupId: string, value: any) => {
        setFilters(prev => {
            const newFilters = { ...prev, [groupId]: value }
            onFiltersChange(newFilters)
            return newFilters
        })
    }, [onFiltersChange])

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setFilters({})
        onFiltersChange({})
    }, [onFiltersChange])

    // Clear specific filter
    const clearFilter = useCallback((groupId: string) => {
        setFilters(prev => {
            const newFilters = { ...prev }
            delete newFilters[groupId]
            onFiltersChange(newFilters)
            return newFilters
        })
    }, [onFiltersChange])

    // Render filter control based on type
    const renderFilterControl = (group: FilterGroup) => {
        const value = filters[group.id]

        switch (group.type) {
            case 'select':
                return (
                    <div className="space-y-2">
                        {group.options?.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateFilter(group.id, option.value)}
                                className={cn(
                                    'w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors',
                                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                                    value === option.value && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {option.icon}
                                    <span className="text-sm">{option.label}</span>
                                </div>
                                {option.count && (
                                    <Badge variant="secondary" className="text-xs">
                                        {option.count}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                )

            case 'multiselect':
                return (
                    <div className="space-y-2">
                        {group.options?.map((option) => {
                            const isSelected = Array.isArray(value) && value.includes(option.value)
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        const currentValues = Array.isArray(value) ? value : []
                                        const newValues = isSelected
                                            ? currentValues.filter(v => v !== option.value)
                                            : [...currentValues, option.value]
                                        updateFilter(group.id, newValues)
                                    }}
                                    className={cn(
                                        'w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors',
                                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                                        isSelected && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            'w-4 h-4 rounded border-2 flex items-center justify-center',
                                            isSelected
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                        )}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        {option.icon}
                                        <span className="text-sm">{option.label}</span>
                                    </div>
                                    {option.count && (
                                        <Badge variant="secondary" className="text-xs">
                                            {option.count}
                                        </Badge>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )

            case 'range':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={value?.min || ''}
                                onChange={(e) => updateFilter(group.id, {
                                    ...value,
                                    min: e.target.value ? parseInt(e.target.value) : undefined
                                })}
                                min={group.min}
                                max={group.max}
                                step={group.step}
                                className="flex-1"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={value?.max || ''}
                                onChange={(e) => updateFilter(group.id, {
                                    ...value,
                                    max: e.target.value ? parseInt(e.target.value) : undefined
                                })}
                                min={group.min}
                                max={group.max}
                                step={group.step}
                                className="flex-1"
                            />
                        </div>
                        {group.min !== undefined && group.max !== undefined && (
                            <div className="px-1">
                                <input
                                    type="range"
                                    min={group.min}
                                    max={group.max}
                                    step={group.step || 1}
                                    value={value?.min || group.min}
                                    onChange={(e) => updateFilter(group.id, {
                                        ...value,
                                        min: parseInt(e.target.value)
                                    })}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                )

            case 'date':
                return (
                    <div className="space-y-2">
                        <Input
                            type="date"
                            placeholder="Date de début"
                            value={value?.start || ''}
                            onChange={(e) => updateFilter(group.id, {
                                ...value,
                                start: e.target.value
                            })}
                        />
                        <Input
                            type="date"
                            placeholder="Date de fin"
                            value={value?.end || ''}
                            onChange={(e) => updateFilter(group.id, {
                                ...value,
                                end: e.target.value
                            })}
                        />
                    </div>
                )

            case 'boolean':
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => updateFilter(group.id, !value)}
                            className={cn(
                                'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                                value
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            )}
                        >
                            {value && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {group.placeholder || 'Activer'}
                        </span>
                    </div>
                )

            default:
                return null
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: {
            opacity: 1,
            height: 'auto',
            transition: {
                duration: 0.3,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    }

    if (variant === 'compact') {
        return (
            <div className={cn('flex flex-wrap items-center gap-2', className)}>
                {activeFiltersCount > 0 && (
                    <Badge variant="primary" className="text-xs">
                        {activeFiltersCount} filtres actifs
                    </Badge>
                )}

                {Object.entries(filters).map(([key, value]) => {
                    const group = groups.find(g => g.id === key)
                    if (!group || !value) return null

                    let displayValue = value
                    if (Array.isArray(value)) {
                        displayValue = `${value.length} sélectionnés`
                    } else if (typeof value === 'object') {
                        displayValue = Object.entries(value).filter(([_, v]) => v).map(([k, v]) => v).join('-')
                    }

                    return (
                        <Badge
                            key={key}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => clearFilter(key)}
                        >
                            {group.label}: {displayValue}
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Badge>
                    )
                })}

                {showClearAll && activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                    >
                        Tout effacer
                    </Button>
                )}
            </div>
        )
    }

    return (
        <Card className={cn('p-4', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Filtres
                    </h3>
                    {showActiveCount && activeFiltersCount > 0 && (
                        <Badge variant="primary" className="text-xs">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {showClearAll && activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="text-xs"
                        >
                            Tout effacer
                        </Button>
                    )}

                    {collapsible && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <svg
                                className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </Button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="space-y-4"
                    >
                        {/* Search */}
                        {groups.length > 5 && (
                            <motion.div variants={itemVariants}>
                                <Input
                                    placeholder="Rechercher des filtres..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </motion.div>
                        )}

                        {/* Filter Groups */}
                        {filteredGroups.map((group) => (
                            <motion.div
                                key={group.id}
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {group.label}
                                    </label>
                                    {filters[group.id] && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => clearFilter(group.id)}
                                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </Button>
                                    )}
                                </div>

                                {renderFilterControl(group)}
                            </motion.div>
                        ))}

                        {filteredGroups.length === 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="text-center py-8 text-gray-500 dark:text-gray-400"
                            >
                                <p>Aucun filtre trouvé</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}

export default Filters
