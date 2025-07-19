'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '@/views/atoms/Input'
import { Button } from '@/views/atoms/Button'
import { Badge } from '@/views/atoms/Badge'

export interface SearchSuggestion {
    id: string
    label: string
    type: 'service' | 'stack' | 'container' | 'command'
    icon?: React.ReactNode
    description?: string
}

export interface SearchFilter {
    id: string
    label: string
    type: 'select' | 'multiselect' | 'date' | 'range'
    options?: { value: string; label: string }[]
    value?: any
}

export interface SearchProps {
    placeholder?: string
    suggestions?: SearchSuggestion[]
    filters?: SearchFilter[]
    onSearch?: (query: string, filters: Record<string, any>) => void
    onSuggestionClick?: (suggestion: SearchSuggestion) => void
    onFilterChange?: (filterId: string, value: any) => void
    className?: string
    size?: 'sm' | 'md' | 'lg'
    showFilters?: boolean
    showSuggestions?: boolean
    isLoading?: boolean
    debounceMs?: number
    recentSearches?: string[]
}

const Search: React.FC<SearchProps> = ({
    placeholder = 'Rechercher...',
    suggestions = [],
    filters = [],
    onSearch,
    onSuggestionClick,
    onFilterChange,
    className,
    size = 'md',
    showFilters = true,
    showSuggestions = true,
    isLoading = false,
    debounceMs = 300,
    recentSearches = [],
}) => {
    const [query, setQuery] = useState('')
    const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestionsList, setShowSuggestionsList] = useState(false)
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
    const [filterValues, setFilterValues] = useState<Record<string, any>>({})
    const [showFiltersPanel, setShowFiltersPanel] = useState(false)

    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<NodeJS.Timeout>()

    // Filter suggestions based on query
    useEffect(() => {
        if (!query.trim()) {
            setFilteredSuggestions([])
            return
        }

        const filtered = suggestions.filter(suggestion =>
            suggestion.label.toLowerCase().includes(query.toLowerCase()) ||
            suggestion.description?.toLowerCase().includes(query.toLowerCase())
        )

        setFilteredSuggestions(filtered.slice(0, 10))
    }, [query, suggestions])

    // Handle debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
            if (query.trim()) {
                onSearch?.(query, filterValues)
            }
        }, debounceMs)

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [query, filterValues, onSearch, debounceMs])

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestionsList(false)
                setActiveSuggestionIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)
        setShowSuggestionsList(showSuggestions && value.trim().length > 0)
        setActiveSuggestionIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestionsList) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setActiveSuggestionIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setActiveSuggestionIndex(prev =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (activeSuggestionIndex >= 0) {
                    handleSuggestionClick(filteredSuggestions[activeSuggestionIndex])
                } else {
                    onSearch?.(query, filterValues)
                }
                break
            case 'Escape':
                setShowSuggestionsList(false)
                setActiveSuggestionIndex(-1)
                inputRef.current?.blur()
                break
        }
    }

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.label)
        setShowSuggestionsList(false)
        setActiveSuggestionIndex(-1)
        onSuggestionClick?.(suggestion)
    }

    const handleFilterChange = (filterId: string, value: any) => {
        const newFilterValues = { ...filterValues, [filterId]: value }
        setFilterValues(newFilterValues)
        onFilterChange?.(filterId, value)
    }

    const getSuggestionIcon = (type: SearchSuggestion['type']) => {
        switch (type) {
            case 'service':
                return (
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                )
            case 'stack':
                return (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                )
            case 'container':
                return (
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                )
            case 'command':
                return (
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )
            default:
                return null
        }
    }

    const activeFilterCount = Object.values(filterValues).filter(Boolean).length

    return (
        <div ref={searchRef} className={cn('relative', className)}>
            {/* Search Input */}
            <div className="relative">
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestionsList(showSuggestions && query.trim().length > 0)}
                    placeholder={placeholder}
                    size={size}
                    leftIcon={
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    }
                    rightIcon={
                        isLoading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" />
                        ) : showFilters && filters.length > 0 ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                                className="relative"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                {activeFilterCount > 0 && (
                                    <Badge
                                        variant="primary"
                                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                                    >
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        ) : null
                    }
                />
            </div>

            {/* Suggestions */}
            <AnimatePresence>
                {showSuggestionsList && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto"
                    >
                        {filteredSuggestions.length > 0 ? (
                            <div className="p-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                                    Suggestions
                                </div>
                                {filteredSuggestions.map((suggestion, index) => (
                                    <motion.button
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className={cn(
                                            'w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-3',
                                            activeSuggestionIndex === index
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {suggestion.icon || getSuggestionIcon(suggestion.type)}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{suggestion.label}</div>
                                            {suggestion.description && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {suggestion.description}
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        ) : recentSearches.length > 0 ? (
                            <div className="p-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                                    Recherches récentes
                                </div>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={search}
                                        onClick={() => {
                                            setQuery(search)
                                            setShowSuggestionsList(false)
                                            onSearch?.(search, filterValues)
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="truncate">{search}</span>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFiltersPanel && filters.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                Filtres
                            </h3>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setFilterValues({})
                                    filters.forEach(filter => onFilterChange?.(filter.id, null))
                                }}
                            >
                                Réinitialiser
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {filters.map((filter) => (
                                <div key={filter.id} className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {filter.label}
                                    </label>
                                    {filter.type === 'select' && (
                                        <select
                                            value={filterValues[filter.id] || ''}
                                            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Tous</option>
                                            {filter.options?.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export { Search }
