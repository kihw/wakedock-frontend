'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  error?: string
  help?: string
  disabled?: boolean
  required?: boolean
  minDate?: Date
  maxDate?: Date
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
  name?: string
  format?: 'short' | 'medium' | 'long'
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  error,
  help,
  disabled = false,
  required = false,
  minDate,
  maxDate,
  size = 'md',
  className,
  id,
  name,
  format = 'medium',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const sizes = {
    sm: {
      input: 'px-2 py-1 text-sm',
      calendar: 'p-2',
      cell: 'w-6 h-6 text-xs',
    },
    md: {
      input: 'px-3 py-2 text-base',
      calendar: 'p-3',
      cell: 'w-8 h-8 text-sm',
    },
    lg: {
      input: 'px-4 py-3 text-lg',
      calendar: 'p-4',
      cell: 'w-10 h-10 text-base',
    },
  }
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? 'numeric' : format === 'medium' ? 'short' : 'long',
      day: 'numeric',
    }
    
    return date.toLocaleDateString(undefined, options)
  }
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }
  
  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }
  
  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(date, today)
  }
  
  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return
    
    setSelectedDate(date)
    onChange?.(date)
    setIsOpen(false)
  }
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    
    switch (e.key) {
      case 'Enter':
      case 'Space':
        e.preventDefault()
        setIsOpen(!isOpen)
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  useEffect(() => {
    setSelectedDate(value)
    if (value) {
      setCurrentMonth(new Date(value))
    }
  }, [value])
  
  const days = getDaysInMonth(currentMonth)
  
  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between',
            'border border-gray-300 dark:border-gray-600 rounded-lg',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-colors duration-200',
            sizes[size].input,
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
          )}
        >
          <span className={cn(
            'truncate',
            !selectedDate && 'text-gray-500 dark:text-gray-400'
          )}>
            {formatDate(selectedDate) || placeholder}
          </span>
          
          <Calendar className="h-4 w-4 text-gray-400 ml-2" />
        </button>
        
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 mt-1 bg-white dark:bg-gray-800',
              'border border-gray-300 dark:border-gray-600 rounded-lg',
              'shadow-lg',
              sizes[size].calendar
            )}
          >
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePreviousMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(day => (
                <div
                  key={day}
                  className={cn(
                    'text-center text-xs font-medium text-gray-500 dark:text-gray-400',
                    sizes[size].cell
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => day && handleDateSelect(day)}
                  disabled={!day || isDateDisabled(day)}
                  className={cn(
                    'flex items-center justify-center rounded transition-colors',
                    sizes[size].cell,
                    !day && 'invisible',
                    day && !isDateDisabled(day) && 'hover:bg-gray-100 dark:hover:bg-gray-700',
                    day && isSameDay(day, selectedDate) && 'bg-blue-600 text-white hover:bg-blue-700',
                    day && isToday(day) && !isSameDay(day, selectedDate) && 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
                    day && isDateDisabled(day) && 'opacity-50 cursor-not-allowed text-gray-400',
                    day && !isDateDisabled(day) && !isSameDay(day, selectedDate) && 'text-gray-900 dark:text-white'
                  )}
                >
                  {day?.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {help && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{help}</p>
      )}
    </div>
  )
}

export default DatePicker