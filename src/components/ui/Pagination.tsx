'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 7,
  size = 'md',
  className,
  disabled = false,
}) => {
  const sizes = {
    sm: {
      button: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      button: 'px-3 py-2 text-sm',
      icon: 'h-4 w-4',
    },
    lg: {
      button: 'px-4 py-3 text-base',
      icon: 'h-5 w-5',
    },
  }
  
  const getVisiblePages = () => {
    const delta = Math.floor(maxVisiblePages / 2)
    const range = []
    const rangeWithDots = []
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }
    
    rangeWithDots.push(...range)
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages)
      }
    }
    
    return rangeWithDots
  }
  
  const handlePageClick = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) return
    onPageChange(page)
  }
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageClick(currentPage - 1)
    }
  }
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageClick(currentPage + 1)
    }
  }
  
  const baseButtonStyles = cn(
    'inline-flex items-center justify-center font-medium',
    'border border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    'hover:bg-gray-50 dark:hover:bg-gray-700',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizes[size].button
  )
  
  const activeButtonStyles = cn(
    'bg-blue-600 text-white border-blue-600',
    'hover:bg-blue-700 hover:border-blue-700',
    'dark:bg-blue-600 dark:border-blue-600',
    'dark:hover:bg-blue-700 dark:hover:border-blue-700'
  )
  
  if (totalPages <= 1) {
    return null
  }
  
  const visiblePages = getVisiblePages()
  
  return (
    <nav className={cn('flex items-center justify-center space-x-1', className)} aria-label="Pagination">
      {/* First Page Button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageClick(1)}
          disabled={disabled || currentPage === 1}
          className={cn(
            baseButtonStyles,
            'rounded-l-lg',
            currentPage === 1 && 'cursor-not-allowed opacity-50'
          )}
          aria-label="First page"
        >
          ««
        </button>
      )}
      
      {/* Previous Button */}
      {showPrevNext && (
        <button
          onClick={handlePrevious}
          disabled={disabled || currentPage === 1}
          className={cn(
            baseButtonStyles,
            !showFirstLast && 'rounded-l-lg',
            currentPage === 1 && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className={sizes[size].icon} />
        </button>
      )}
      
      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={cn(
                'inline-flex items-center justify-center',
                'text-gray-500 dark:text-gray-400',
                sizes[size].button
              )}
            >
              <MoreHorizontal className={sizes[size].icon} />
            </span>
          )
        }
        
        const pageNumber = page as number
        const isActive = pageNumber === currentPage
        
        return (
          <button
            key={pageNumber}
            onClick={() => handlePageClick(pageNumber)}
            disabled={disabled}
            className={cn(
              baseButtonStyles,
              isActive && activeButtonStyles
            )}
            aria-label={`Page ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        )
      })}
      
      {/* Next Button */}
      {showPrevNext && (
        <button
          onClick={handleNext}
          disabled={disabled || currentPage === totalPages}
          className={cn(
            baseButtonStyles,
            !showFirstLast && 'rounded-r-lg',
            currentPage === totalPages && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Next page"
        >
          <ChevronRight className={sizes[size].icon} />
        </button>
      )}
      
      {/* Last Page Button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={disabled || currentPage === totalPages}
          className={cn(
            baseButtonStyles,
            'rounded-r-lg',
            currentPage === totalPages && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Last page"
        >
          »»
        </button>
      )}
    </nav>
  )
}

// Pagination Info Component
export interface PaginationInfoProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  className?: string
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  
  return (
    <div className={cn('text-sm text-gray-500 dark:text-gray-400', className)}>
      Showing {startItem} to {endItem} of {totalItems} results
    </div>
  )
}

// Combined Pagination with Info
export interface PaginationWithInfoProps extends PaginationProps {
  totalItems: number
  itemsPerPage: number
  showInfo?: boolean
  infoPosition?: 'top' | 'bottom' | 'left' | 'right'
}

export const PaginationWithInfo: React.FC<PaginationWithInfoProps> = ({
  totalItems,
  itemsPerPage,
  showInfo = true,
  infoPosition = 'left',
  ...paginationProps
}) => {
  const info = showInfo ? (
    <PaginationInfo
      currentPage={paginationProps.currentPage}
      totalPages={paginationProps.totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
    />
  ) : null
  
  if (infoPosition === 'top') {
    return (
      <div className="space-y-4">
        {info}
        <Pagination {...paginationProps} />
      </div>
    )
  }
  
  if (infoPosition === 'bottom') {
    return (
      <div className="space-y-4">
        <Pagination {...paginationProps} />
        {info}
      </div>
    )
  }
  
  if (infoPosition === 'left') {
    return (
      <div className="flex items-center justify-between">
        {info}
        <Pagination {...paginationProps} />
      </div>
    )
  }
  
  if (infoPosition === 'right') {
    return (
      <div className="flex items-center justify-between">
        <Pagination {...paginationProps} />
        {info}
      </div>
    )
  }
  
  return <Pagination {...paginationProps} />
}

export default Pagination