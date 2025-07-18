/**
 * Layout principal pour le comportement SPA
 * Gère les transitions de page et la navigation fluide
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { useSPA, usePageTransition } from '@/controllers/hooks/useSPA'

interface SPALayoutProps {
    children: React.ReactNode
    className?: string
}

// Variantes d'animation pour les transitions de page
const pageVariants = {
    initial: {
        opacity: 0,
        x: -20,
        scale: 0.98
    },
    in: {
        opacity: 1,
        x: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        x: 20,
        scale: 0.98
    }
}

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
}

// Composant pour les transitions de page
const PageTransition: React.FC<{ children: React.ReactNode; pageKey: string }> = ({
    children,
    pageKey
}) => {
    return (
        <motion.div
            key={pageKey}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    )
}

// Loader pour les transitions
const NavigationLoader: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
    if (!isVisible) return null

    return (
        <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 to-purple-500 origin-left"
        />
    )
}

// Composant principal SPA Layout
export const SPALayout: React.FC<SPALayoutProps> = ({ children, className = '' }) => {
    const router = useRouter()
    const { isNavigating, currentPage, handleLinkHover } = useSPA({
        enablePrefetch: true,
        transitionDuration: 400,
        enablePageTransitions: true
    })
    const { transitionState } = usePageTransition()

    // Gestion du scroll au changement de page
    useEffect(() => {
        const handleRouteChange = () => {
            // Scroll vers le haut lors du changement de page
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }

        router.events.on('routeChangeComplete', handleRouteChange)
        return () => router.events.off('routeChangeComplete', handleRouteChange)
    }, [router])

    // Gestion des liens pour le prefetch
    useEffect(() => {
        const handleLinkMouseEnter = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            const link = target.closest('a[href]') as HTMLAnchorElement

            if (link && link.href.startsWith(window.location.origin)) {
                const url = new URL(link.href).pathname
                handleLinkHover(url)
            }
        }

        document.addEventListener('mouseover', handleLinkMouseEnter)
        return () => document.removeEventListener('mouseover', handleLinkMouseEnter)
    }, [handleLinkHover])

    return (
        <div className={`spa-layout ${className}`}>
            {/* Loader de navigation */}
            <NavigationLoader isVisible={isNavigating} />

            {/* Conteneur principal avec transitions */}
            <AnimatePresence mode="wait" initial={false}>
                <PageTransition pageKey={currentPage}>
                    <div className="spa-content">
                        {children}
                    </div>
                </PageTransition>
            </AnimatePresence>

            {/* Indicateur de chargement global */}
            {isNavigating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 flex items-center justify-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                </motion.div>
            )}
        </div>
    )
}

// Hook pour les liens SPA
export const useSPALink = () => {
    const { navigateToPage, prefetchRoute } = useSPA()

    const createSPALink = (href: string, options: { prefetch?: boolean } = {}) => {
        return {
            href,
            onClick: (e: React.MouseEvent) => {
                e.preventDefault()
                navigateToPage(href)
            },
            onMouseEnter: options.prefetch ? () => prefetchRoute(href) : undefined
        }
    }

    return { createSPALink, navigateToPage }
}

// Composant Link SPA personnalisé
interface SPALinkProps {
    href: string
    children: React.ReactNode
    className?: string
    prefetch?: boolean
    external?: boolean
}

export const SPALink: React.FC<SPALinkProps> = ({
    href,
    children,
    className = '',
    prefetch = true,
    external = false
}) => {
    const { createSPALink } = useSPALink()

    // Liens externes
    if (external || href.startsWith('http')) {
        return (
            <a
                href={href}
                className={className}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        )
    }

    // Liens internes SPA
    const linkProps = createSPALink(href, { prefetch })

    return (
        <a
            {...linkProps}
            className={`spa-link ${className}`}
        >
            {children}
        </a>
    )
}

// Composant pour les breadcrumbs SPA
interface BreadcrumbItem {
    label: string
    href: string
    current?: boolean
}

interface SPABreadcrumbsProps {
    items: BreadcrumbItem[]
    className?: string
}

export const SPABreadcrumbs: React.FC<SPABreadcrumbsProps> = ({ items, className = '' }) => {
    return (
        <nav className={`spa-breadcrumbs ${className}`} aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => (
                    <li key={item.href} className="flex items-center">
                        {index > 0 && (
                            <svg
                                className="w-4 h-4 mx-2 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        {item.current ? (
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {item.label}
                            </span>
                        ) : (
                            <SPALink
                                href={item.href}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                {item.label}
                            </SPALink>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}

// Export des types
export type { SPALayoutProps, SPALinkProps, BreadcrumbItem }
