/**
 * Composant de recherche globale SPA
 * Permet de rechercher rapidement dans toute l'application
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSPA } from '@/controllers/hooks/useSPA'
import { useSPAStore } from '@/store/spaStore'

interface SearchResult {
    id: string
    title: string
    description: string
    url: string
    type: 'page' | 'service' | 'user' | 'log' | 'action'
    icon?: string
    badge?: string
}

interface GlobalSearchProps {
    isOpen: boolean
    onClose: () => void
}

// Données de recherche simulées
const searchData: SearchResult[] = [
    {
        id: '1',
        title: 'Dashboard',
        description: 'Vue d\'ensemble des services et métriques',
        url: '/dashboard',
        type: 'page',
        icon: '🏠'
    },
    {
        id: '2',
        title: 'Services',
        description: 'Gestion des services Docker',
        url: '/services',
        type: 'page',
        icon: '🐳'
    },
    {
        id: '3',
        title: 'Monitoring temps réel',
        description: 'Surveillance en temps réel des services',
        url: '/realtime-monitoring',
        type: 'page',
        icon: '📊'
    },
    {
        id: '4',
        title: 'Utilisateurs',
        description: 'Gestion des utilisateurs et permissions',
        url: '/users',
        type: 'page',
        icon: '👥'
    },
    {
        id: '5',
        title: 'Logs',
        description: 'Consultation des logs système',
        url: '/logs',
        type: 'page',
        icon: '📄'
    },
    {
        id: '6',
        title: 'Paramètres',
        description: 'Configuration de l\'application',
        url: '/settings',
        type: 'page',
        icon: '⚙️'
    },
    {
        id: '7',
        title: 'Créer un service',
        description: 'Ajouter un nouveau service',
        url: '/services/create',
        type: 'action',
        icon: '➕'
    },
    {
        id: '8',
        title: 'Redémarrer tous les services',
        description: 'Redémarrer tous les services actifs',
        url: '/services?action=restart-all',
        type: 'action',
        icon: '🔄'
    }
]

// Composant pour un résultat de recherche
const SearchResultItem: React.FC<{
    result: SearchResult
    isSelected: boolean
    onClick: () => void
}> = ({ result, isSelected, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
        flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
        ${isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
      `}
            onClick={onClick}
        >
            {/* Icône */}
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                {result.icon ? (
                    <span className="text-lg">{result.icon}</span>
                ) : (
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                )}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {result.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {result.description}
                </p>
            </div>

            {/* Badge */}
            {result.badge && (
                <div className="flex-shrink-0 ml-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {result.badge}
                    </span>
                </div>
            )}

            {/* Type */}
            <div className="flex-shrink-0 ml-3">
                <span className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
          ${result.type === 'page'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : result.type === 'action'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }
        `}>
                    {result.type}
                </span>
            </div>
        </motion.div>
    )
}

// Composant principal de recherche globale
export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)
    const { navigateToPage } = useSPA()

    // Fonction de recherche
    const searchFunction = (searchQuery: string): SearchResult[] => {
        if (!searchQuery.trim()) return []

        const query = searchQuery.toLowerCase()
        return searchData.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        )
    }

    // Effet de recherche avec debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        setIsLoading(true)
        const debounceTimer = setTimeout(() => {
            const searchResults = searchFunction(query)
            setResults(searchResults)
            setSelectedIndex(0)
            setIsLoading(false)
        }, 300)

        return () => clearTimeout(debounceTimer)
    }, [query])

    // Focus sur l'input quand la modal s'ouvre
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // Gestion des raccourcis clavier
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault()
                    setSelectedIndex(prev =>
                        prev < results.length - 1 ? prev + 1 : 0
                    )
                    break
                case 'ArrowUp':
                    event.preventDefault()
                    setSelectedIndex(prev =>
                        prev > 0 ? prev - 1 : results.length - 1
                    )
                    break
                case 'Enter':
                    event.preventDefault()
                    if (results[selectedIndex]) {
                        handleResultClick(results[selectedIndex])
                    }
                    break
                case 'Escape':
                    event.preventDefault()
                    onClose()
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, results, selectedIndex, onClose])

    // Gestion du clic sur un résultat
    const handleResultClick = (result: SearchResult) => {
        navigateToPage(result.url)
        onClose()
        setQuery('')
    }

    // Gestion du clic sur l'overlay
    const handleOverlayClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
                onClick={handleOverlayClick}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header de recherche */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Rechercher dans WakeDock..."
                                className="block w-full pl-10 pr-4 py-3 text-lg border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                            />
                            {isLoading && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Résultats de recherche */}
                    <div className="max-h-96 overflow-y-auto">
                        {query.trim() && !isLoading && results.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-gray-400 dark:text-gray-500 mb-2">
                                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    Aucun résultat trouvé pour "{query}"
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Essayez avec des termes différents
                                </p>
                            </div>
                        )}

                        {!query.trim() && (
                            <div className="p-8 text-center">
                                <div className="text-gray-400 dark:text-gray-500 mb-2">
                                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    Recherche rapide
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Tapez pour rechercher des pages, services, actions...
                                </p>
                            </div>
                        )}

                        {results.length > 0 && (
                            <div className="p-2">
                                {results.map((result, index) => (
                                    <SearchResultItem
                                        key={result.id}
                                        result={result}
                                        isSelected={index === selectedIndex}
                                        onClick={() => handleResultClick(result)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer avec raccourcis */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                    <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                                    <span className="ml-1">Naviguer</span>
                                </span>
                                <span className="flex items-center">
                                    <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↵</kbd>
                                    <span className="ml-1">Ouvrir</span>
                                </span>
                                <span className="flex items-center">
                                    <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">Esc</kbd>
                                    <span className="ml-1">Fermer</span>
                                </span>
                            </div>
                            <div className="text-xs">
                                Ctrl+K pour ouvrir
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

// Hook pour gérer la recherche globale
export const useGlobalSearch = () => {
    const [isOpen, setIsOpen] = useState(false)

    const openSearch = () => setIsOpen(true)
    const closeSearch = () => setIsOpen(false)

    // Gestion du raccourci Ctrl+K
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault()
                openSearch()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return {
        isOpen,
        openSearch,
        closeSearch
    }
}

export default GlobalSearch
