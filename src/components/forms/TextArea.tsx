'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  error?: string
  help?: string
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  autoResize?: boolean
  maxLength?: number
  showCount?: boolean
  placeholder?: string
  className?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      help,
      required = false,
      size = 'md',
      resize = 'vertical',
      autoResize = false,
      maxLength,
      showCount = false,
      placeholder,
      className,
      value,
      onChange,
      onInput,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value || '')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    
    // Use internal ref if no ref is provided
    const finalRef = ref || textareaRef
    
    const sizes = {
      sm: {
        textarea: 'px-2 py-1 text-sm min-h-[60px]',
        label: 'text-sm',
        help: 'text-xs',
      },
      md: {
        textarea: 'px-3 py-2 text-base min-h-[80px]',
        label: 'text-sm',
        help: 'text-sm',
      },
      lg: {
        textarea: 'px-4 py-3 text-lg min-h-[100px]',
        label: 'text-base',
        help: 'text-base',
      },
    }
    
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }
    
    const currentValue = value !== undefined ? value : internalValue
    const characterCount = String(currentValue).length
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      
      // Respect maxLength if set
      if (maxLength && newValue.length > maxLength) {
        return
      }
      
      if (value === undefined) {
        setInternalValue(newValue)
      }
      
      onChange?.(e)
    }
    
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const textarea = e.currentTarget
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
      
      onInput?.(e)
    }
    
    const adjustHeight = () => {
      if (autoResize && finalRef && 'current' in finalRef && finalRef.current) {
        const textarea = finalRef.current
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }
    
    useEffect(() => {
      adjustHeight()
    }, [currentValue, autoResize])
    
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])
    
    const isOverLimit = maxLength && characterCount > maxLength
    
    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block font-medium text-gray-700 dark:text-gray-300 mb-1',
              sizes[size].label
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={finalRef}
            id={id}
            value={currentValue}
            onChange={handleChange}
            onInput={handleInput}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={cn(
              'w-full border border-gray-300 dark:border-gray-600 rounded-lg',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700',
              sizes[size].textarea,
              !autoResize && resizeClasses[resize],
              autoResize && 'resize-none overflow-hidden',
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
              isOverLimit && 'border-red-500 focus:ring-red-500 focus:border-red-500'
            )}
            {...props}
          />
          
          {showCount && (maxLength || currentValue) && (
            <div className="absolute bottom-2 right-2 pointer-events-none">
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700',
                  isOverLimit
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {maxLength ? `${characterCount}/${maxLength}` : characterCount}
              </span>
            </div>
          )}
        </div>
        
        {error && (
          <p className={cn('mt-1 text-red-600 dark:text-red-400', sizes[size].help)}>
            {error}
          </p>
        )}
        
        {help && !error && (
          <p className={cn('mt-1 text-gray-500 dark:text-gray-400', sizes[size].help)}>
            {help}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export default TextArea