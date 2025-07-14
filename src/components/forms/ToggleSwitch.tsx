'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ToggleSwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
  name?: string
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md',
  className,
  id,
  name,
}) => {
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false)
  
  const value = isControlled ? checked : internalChecked
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked
    if (!isControlled) {
      setInternalChecked(newChecked)
    }
    onChange?.(newChecked)
  }
  
  const sizes = {
    sm: {
      toggle: 'w-8 h-4',
      slider: 'h-3 w-3',
      translate: 'translate-x-4',
    },
    md: {
      toggle: 'w-11 h-6',
      slider: 'h-5 w-5',
      translate: 'translate-x-5',
    },
    lg: {
      toggle: 'w-14 h-7',
      slider: 'h-6 w-6',
      translate: 'translate-x-7',
    },
  }
  
  const currentSize = sizes[size]
  
  const toggleElement = (
    <label
      htmlFor={id}
      className={cn(
        'relative inline-flex items-center cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        className="sr-only peer"
        checked={value}
        onChange={handleChange}
        disabled={disabled}
      />
      <div
        className={cn(
          'relative rounded-full transition-colors duration-200',
          'bg-gray-300 dark:bg-gray-700',
          'peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500',
          'peer-focus:outline-none peer-focus:ring-4',
          'peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800',
          currentSize.toggle
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 left-0.5 bg-white rounded-full',
            'transition-transform duration-200',
            'peer-checked:' + currentSize.translate,
            currentSize.slider
          )}
        />
      </div>
    </label>
  )
  
  if (!label && !description) {
    return toggleElement
  }
  
  return (
    <div className="flex items-start gap-3">
      {toggleElement}
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium text-gray-900 dark:text-white',
              disabled && 'opacity-50 cursor-not-allowed',
              !disabled && 'cursor-pointer'
            )}
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// Simplified toggle for inline use
export const SimpleToggle: React.FC<Omit<ToggleSwitchProps, 'label' | 'description'>> = (props) => (
  <ToggleSwitch {...props} />
)