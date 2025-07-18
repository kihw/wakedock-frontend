'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalItems?: number
    itemsPerPage?: number
    showFirstLast?: boolean
    showPrevNext?: boolean
    showInfo?: boolean
    maxVisiblePages?: number
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    showFirstLast = true,
    showPrevNext = true,
    showInfo = true,
    maxVisiblePages = 5,
    className,
    size = 'md',
}) => {
    // Calculate visible page range
    const getVisiblePages = () => {
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const half = Math.floor(maxVisiblePages / 2)
        let start = Math.max(1, currentPage - half)
        let end = Math.min(totalPages, start + maxVisiblePages - 1)

        // Adjust start if we're at the end
        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1)
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }

    const visiblePages = getVisiblePages()
    const isFirstPage = currentPage === 1
    const isLastPage = currentPage === totalPages

    // Calculate info text
    const getInfoText = () => {
        if (!totalItems || !itemsPerPage) return ''

        const start = (currentPage - 1) * itemsPerPage + 1
        const end = Math.min(currentPage * itemsPerPage, totalItems)

        return `${start}-${end} sur ${totalItems} éléments`
    }

    const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'

    const PageButton: React.FC<{
        page: number
        isActive?: boolean
        isDisabled?: boolean
        onClick: () => void
        children: React.ReactNode
    }> = ({ page, isActive, isDisabled, onClick, children }) => (
        <motion.button
            onClick={onClick}
            disabled={isDisabled}
            className={cn(
                'relative inline-flex items-center justify-center transition-all duration-200',
                'border border-gray-300 dark:border-gray-600',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                {
                    // Size variants
                    'px-3 py-2 text-sm': size === 'sm',
                    'px-4 py-2 text-base': size === 'md',
                    'px-5 py-3 text-lg': size === 'lg',

                    // Active state
                    'bg-primary-600 text-white border-primary-600 hover:bg-primary-700': isActive,
                    'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300': !isActive,

                    // First/last page styling
                    'rounded-l-lg': page === 1 || children === '‹' || children === '«',
                    'rounded-r-lg': page === totalPages || children === '›' || children === '»',
                    '-ml-px': page !== 1 && children !== '‹' && children !== '«',
                }
            )}
            whileHover={{ scale: isDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
        >
            {children}
        </motion.button>
    )

    if (totalPages <= 1) return null

    return (
        <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
            {/* Info text */}
            {showInfo && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    {getInfoText()}
                </div>
            )}

            {/* Pagination buttons */}
            <div className="flex items-center">
                {/* First page */}
                {showFirstLast && totalPages > maxVisiblePages && (
                    <PageButton
                        page={1}
                        isDisabled={isFirstPage}
                        onClick={() => onPageChange(1)}
                    >
                        «
                    </PageButton>
                )}

                {/* Previous page */}
                {showPrevNext && (
                    <PageButton
                        page={currentPage - 1}
                        isDisabled={isFirstPage}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        ‹
                    </PageButton>
                )}

                {/* Page numbers */}
                {visiblePages.map((page) => (
                    <PageButton
                        key={page}
                        page={page}
                        isActive={page === currentPage}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </PageButton>
                ))}

                {/* Next page */}
                {showPrevNext && (
                    <PageButton
                        page={currentPage + 1}
                        isDisabled={isLastPage}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        ›
                    </PageButton>
                )}

                {/* Last page */}
                {showFirstLast && totalPages > maxVisiblePages && (
                    <PageButton
                        page={totalPages}
                        isDisabled={isLastPage}
                        onClick={() => onPageChange(totalPages)}
                    >
                        »
                    </PageButton>
                )}
            </div>
        </div>
    )
}

export { Pagination }
