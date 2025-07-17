'use client'

import React, { useState } from 'react'
import { cn } from '../../lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, item: T, index: number) => React.ReactNode
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  empty?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  sticky?: boolean
  className?: string
  onRowClick?: (item: T, index: number) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string, order: 'asc' | 'desc') => void
}

export const Table = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  empty,
  size = 'md',
  striped = false,
  hoverable = false,
  bordered = false,
  sticky = false,
  className,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}: TableProps<T>) => {
  const [internalSortBy, setInternalSortBy] = useState<string>('')
  const [internalSortOrder, setInternalSortOrder] = useState<'asc' | 'desc'>('asc')
  
  const currentSortBy = sortBy || internalSortBy
  const currentSortOrder = sortOrder || internalSortOrder
  
  const sizes = {
    sm: {
      table: 'text-sm',
      cell: 'px-2 py-1',
      header: 'px-2 py-2',
    },
    md: {
      table: 'text-base',
      cell: 'px-3 py-2',
      header: 'px-3 py-3',
    },
    lg: {
      table: 'text-lg',
      cell: 'px-4 py-3',
      header: 'px-4 py-4',
    },
  }
  
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  
  const handleSort = (column: string) => {
    if (onSort) {
      const newOrder = currentSortBy === column && currentSortOrder === 'asc' ? 'desc' : 'asc'
      onSort(column, newOrder)
    } else {
      const newOrder = currentSortBy === column && currentSortOrder === 'asc' ? 'desc' : 'asc'
      setInternalSortBy(column)
      setInternalSortOrder(newOrder)
    }
  }
  
  const getSortIcon = (column: string) => {
    if (currentSortBy !== column) {
      return <ChevronsUpDown className="h-4 w-4" />
    }
    return currentSortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }
  
  const getCellValue = (item: T, column: TableColumn<T>) => {
    return item[column.key]
  }
  
  const renderCell = (item: T, column: TableColumn<T>, index: number) => {
    const value = getCellValue(item, column)
    
    if (column.render) {
      return column.render(value, item, index)
    }
    
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>
    }
    
    return String(value)
  }
  
  const sortedData = React.useMemo(() => {
    if (!currentSortBy) return data
    
    return [...data].sort((a, b) => {
      const aValue = getCellValue(a, columns.find(col => col.key === currentSortBy)!)
      const bValue = getCellValue(b, columns.find(col => col.key === currentSortBy)!)
      
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return currentSortOrder === 'asc' ? result : -result
    })
  }, [data, currentSortBy, currentSortOrder, columns])
  
  if (loading) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <table className={cn('w-full border-collapse', sizes[size].table)}>
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'font-medium text-gray-900 dark:text-white',
                    'border-b border-gray-200 dark:border-gray-600',
                    sizes[size].header,
                    alignments[column.align || 'left'],
                    bordered && 'border-r border-gray-200 dark:border-gray-600',
                    sticky && 'sticky top-0 z-10'
                  )}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="animate-pulse">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'border-b border-gray-200 dark:border-gray-600',
                      sizes[size].cell,
                      bordered && 'border-r border-gray-200 dark:border-gray-600'
                    )}
                  >
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  if (data.length === 0) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <table className={cn('w-full border-collapse', sizes[size].table)}>
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'font-medium text-gray-900 dark:text-white',
                    'border-b border-gray-200 dark:border-gray-600',
                    sizes[size].header,
                    alignments[column.align || 'left'],
                    bordered && 'border-r border-gray-200 dark:border-gray-600',
                    sticky && 'sticky top-0 z-10'
                  )}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={columns.length}
                className={cn(
                  'text-center py-12 text-gray-500 dark:text-gray-400',
                  sizes[size].cell
                )}
              >
                {empty || 'No data available'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
  
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className={cn('w-full border-collapse', sizes[size].table)}>
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'font-medium text-gray-900 dark:text-white',
                  'border-b border-gray-200 dark:border-gray-600',
                  sizes[size].header,
                  alignments[column.align || 'left'],
                  bordered && 'border-r border-gray-200 dark:border-gray-600',
                  sticky && 'sticky top-0 z-10',
                  column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600'
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr
              key={index}
              className={cn(
                'text-gray-900 dark:text-white',
                striped && index % 2 === 0 && 'bg-gray-50 dark:bg-gray-800',
                hoverable && 'hover:bg-gray-100 dark:hover:bg-gray-700',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'border-b border-gray-200 dark:border-gray-600',
                    sizes[size].cell,
                    alignments[column.align || 'left'],
                    bordered && 'border-r border-gray-200 dark:border-gray-600'
                  )}
                >
                  {renderCell(item, column, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table