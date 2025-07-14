'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  description?: string
}

export interface SelectDropdownProps {
  options: SelectOption[]
  value?: string | number | string[] | number[]
  onChange?: (value: string | number | string[] | number[]) => void
  placeholder?: string
  label?: string
  error?: string
  help?: string
  disabled?: boolean
  required?: boolean
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
  name?: string
  maxHeight?: number
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  help,
  disabled = false,
  required = false,
  multiple = false,
  searchable = false,
  clearable = false,
  size = 'md',
  className,
  id,
  name,
  maxHeight = 200,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const selectedValues = multiple
    ? Array.isArray(value) ? value : []
    : value
  
  const sizes = {
    sm: {
      trigger: 'px-2 py-1 text-sm',
      option: 'px-2 py-1 text-sm',
      search: 'px-2 py-1 text-sm',
    },
    md: {
      trigger: 'px-3 py-2 text-base',
      option: 'px-3 py-2 text-base',
      search: 'px-3 py-2 text-base',
    },
    lg: {
      trigger: 'px-4 py-3 text-lg',
      option: 'px-4 py-3 text-lg',
      search: 'px-4 py-3 text-lg',
    },
  }
  
  const getDisplayValue = () => {
    if (multiple && Array.isArray(selectedValues)) {
      if (selectedValues.length === 0) return placeholder
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0])
        return option?.label || selectedValues[0]
      }
      return `${selectedValues.length} items selected`
    }
    
    if (selectedValues !== undefined && selectedValues !== null) {
      const option = options.find(opt => opt.value === selectedValues)
      return option?.label || selectedValues
    }
    
    return placeholder
  }
  
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen && searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 0)
      }
    }
  }
  
  const handleSelect = (optionValue: string | number) => {
    if (multiple) {
      const currentValues = Array.isArray(selectedValues) ? selectedValues : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]
      onChange?.(newValues)
    } else {
      onChange?.(optionValue)
      setIsOpen(false)
    }
  }
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(multiple ? [] : '')
    setSearchTerm('')
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        if (isOpen && focusedIndex >= 0) {
          handleSelect(filteredOptions[focusedIndex].value)
        } else {
          handleToggle()
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : prev)
        }
        break
      case 'Space':
        if (!searchable) {
          e.preventDefault()
          handleToggle()
        }
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
    if (!isOpen) {
      setSearchTerm('')
      setFocusedIndex(-1)
    }
  }, [isOpen])
  
  const isSelected = (optionValue: string | number) => {
    if (multiple) {
      return Array.isArray(selectedValues) && selectedValues.includes(optionValue)
    }
    return selectedValues === optionValue
  }
  
  const showClear = clearable && (
    (multiple && Array.isArray(selectedValues) && selectedValues.length > 0) ||
    (!multiple && selectedValues !== undefined && selectedValues !== null && selectedValues !== '')
  )
  
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
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between',
            'border border-gray-300 dark:border-gray-600 rounded-lg',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-colors duration-200',
            sizes[size].trigger,
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
          )}
        >
          <span className={cn(
            'truncate',
            !selectedValues && 'text-gray-500 dark:text-gray-400'
          )}>
            {getDisplayValue()}
          </span>
          
          <div className="flex items-center gap-1 ml-2">
            {showClear && (
              <X
                className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={handleClear}
              />
            )}
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </button>
        
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 w-full mt-1 bg-white dark:bg-gray-800',
              'border border-gray-300 dark:border-gray-600 rounded-lg',
              'shadow-lg max-h-60 overflow-auto'
            )}
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className={cn(
                    'w-full bg-transparent border-none outline-none',
                    'text-gray-900 dark:text-white',
                    'placeholder:text-gray-400',
                    sizes[size].search
                  )}
                />
              </div>
            )}
            
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={cn(
                    'cursor-pointer flex items-center justify-between',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'text-gray-900 dark:text-white',
                    sizes[size].option,
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    focusedIndex === index && 'bg-gray-100 dark:bg-gray-700',
                    isSelected(option.value) && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                >
                  <div className="flex-1">
                    <div className="truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {option.description}
                      </div>
                    )}
                  </div>
                  
                  {isSelected(option.value) && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 ml-2" />
                  )}
                </div>
              ))
            )}
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

export default SelectDropdown