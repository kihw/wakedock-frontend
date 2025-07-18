'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TableColumn<T> {
    key: keyof T | string
    label: string
    sortable?: boolean
    render?: (value: any, row: T, index: number) => React.ReactNode
    className?: string
    width?: string
}

export interface TableProps<T> {
    data: T[]
    columns: TableColumn<T>[]
    onRowClick?: (row: T, index: number) => void
    onSort?: (column: keyof T | string, direction: 'asc' | 'desc') => void
    sortColumn?: keyof T | string
    sortDirection?: 'asc' | 'desc'
    isLoading?: boolean
    loadingRows?: number
    emptyMessage?: string
    className?: string
    variant?: 'default' | 'bordered' | 'striped'
    size?: 'sm' | 'md' | 'lg'
    stickyHeader?: boolean
    selectable?: boolean
    selectedRows?: Set<string | number>
    onRowSelect?: (rowId: string | number, selected: boolean) => void
    onSelectAll?: (selected: boolean) => void
    getRowId?: (row: T, index: number) => string | number
}

function Table<T>({
    data,
    columns,
    onRowClick,
    onSort,
    sortColumn,
    sortDirection,
    isLoading = false,
    loadingRows = 5,
    emptyMessage = 'Aucune donnée disponible',
    className,
    variant = 'default',
    size = 'md',
    stickyHeader = false,
    selectable = false,
    selectedRows = new Set(),
    onRowSelect,
    onSelectAll,
    getRowId = (row: T, index: number) => index,
}: TableProps<T>) {
    const handleSort = (column: keyof T | string) => {
        if (!onSort) return

        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
        onSort(column, newDirection)
    }

    const handleRowSelect = (rowId: string | number, selected: boolean) => {
        onRowSelect?.(rowId, selected)
    }

    const handleSelectAll = (selected: boolean) => {
        onSelectAll?.(selected)
    }

    const isAllSelected = data.length > 0 && data.every((row, index) => selectedRows.has(getRowId(row, index)))
    const isSomeSelected = data.some((row, index) => selectedRows.has(getRowId(row, index)))

    const tableClasses = cn(
        'w-full border-separate border-spacing-0 overflow-hidden',
        {
            'border border-gray-200 dark:border-gray-700 rounded-lg': variant === 'bordered',
            'rounded-lg': variant !== 'bordered',
        },
        className
    )

    const headerClasses = cn(
        'bg-gray-50 dark:bg-gray-800/50 text-left',
        {
            'text-sm font-medium': size === 'sm',
            'text-base font-medium': size === 'md',
            'text-lg font-semibold': size === 'lg',
            'sticky top-0 z-10': stickyHeader,
        }
    )

    const cellClasses = cn(
        'text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700',
        {
            'px-3 py-2 text-sm': size === 'sm',
            'px-4 py-3 text-base': size === 'md',
            'px-6 py-4 text-lg': size === 'lg',
        }
    )

    const rowClasses = cn(
        'transition-colors duration-200',
        {
            'even:bg-gray-50 dark:even:bg-gray-800/30': variant === 'striped',
            'hover:bg-gray-50 dark:hover:bg-gray-800/50': onRowClick,
            'cursor-pointer': onRowClick,
        }
    )

    const LoadingRow = () => (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="animate-pulse"
        >
            {selectable && (
                <td className={cellClasses}>
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
            )}
            {columns.map((column, index) => (
                <td key={index} className={cellClasses}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </td>
            ))}
        </motion.tr>
    )

    const EmptyState = () => (
        <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">{emptyMessage}</p>
                </div>
            </td>
        </tr>
    )

    return (
        <div className="overflow-x-auto">
            <table className={tableClasses}>
                <thead className={headerClasses}>
                    <tr>
                        {selectable && (
                            <th className={cn(cellClasses, 'w-12')}>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={input => {
                                        if (input) input.indeterminate = isSomeSelected && !isAllSelected
                                    }}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                            </th>
                        )}
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={cn(
                                    cellClasses,
                                    column.className,
                                    {
                                        'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700': column.sortable,
                                    }
                                )}
                                style={{ width: column.width }}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{column.label}</span>
                                    {column.sortable && (
                                        <div className="flex flex-col">
                                            <motion.svg
                                                className={cn(
                                                    'w-3 h-3 -mb-1',
                                                    sortColumn === column.key && sortDirection === 'asc'
                                                        ? 'text-primary-600'
                                                        : 'text-gray-400'
                                                )}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                animate={{
                                                    scale: sortColumn === column.key && sortDirection === 'asc' ? 1.2 : 1,
                                                }}
                                            >
                                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                            </motion.svg>
                                            <motion.svg
                                                className={cn(
                                                    'w-3 h-3',
                                                    sortColumn === column.key && sortDirection === 'desc'
                                                        ? 'text-primary-600'
                                                        : 'text-gray-400'
                                                )}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                animate={{
                                                    scale: sortColumn === column.key && sortDirection === 'desc' ? 1.2 : 1,
                                                }}
                                            >
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </motion.svg>
                                        </div>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        Array.from({ length: loadingRows }).map((_, index) => (
                            <LoadingRow key={`loading-${index}`} />
                        ))
                    ) : data.length === 0 ? (
                        <EmptyState />
                    ) : (
                        data.map((row, index) => {
                            const rowId = getRowId(row, index)
                            const isSelected = selectedRows.has(rowId)

                            return (
                                <motion.tr
                                    key={rowId}
                                    className={cn(rowClasses, {
                                        'bg-primary-50 dark:bg-primary-900/20': isSelected,
                                    })}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onRowClick?.(row, index)}
                                >
                                    {selectable && (
                                        <td className={cellClasses}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                        </td>
                                    )}
                                    {columns.map((column, columnIndex) => {
                                        const value = typeof column.key === 'string'
                                            ? (row as any)[column.key]
                                            : row[column.key as keyof T]

                                        return (
                                            <td
                                                key={columnIndex}
                                                className={cn(cellClasses, column.className)}
                                            >
                                                {column.render ? column.render(value, row, index) : value}
                                            </td>
                                        )
                                    })}
                                </motion.tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}

export { Table }
