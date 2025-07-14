'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  showValue?: boolean
  showPercentage?: boolean
  label?: string
  animated?: boolean
  striped?: boolean
  className?: string
  barClassName?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  showPercentage = false,
  label,
  animated = false,
  striped = false,
  className,
  barClassName,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), max)
  const percentage = (clampedValue / max) * 100
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }
  
  const variants = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    info: 'bg-cyan-600',
  }
  
  const formatValue = () => {
    if (showPercentage) {
      return `${Math.round(percentage)}%`
    }
    if (showValue) {
      return `${clampedValue}/${max}`
    }
    return null
  }
  
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {(showValue || showPercentage) && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatValue()}
            </span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizes[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            variants[variant],
            striped && 'bg-stripes',
            animated && 'animate-pulse',
            barClassName
          )}
          style={{
            width: `${percentage}%`,
            backgroundImage: striped
              ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)'
              : undefined,
            backgroundSize: striped ? '1rem 1rem' : undefined,
          }}
        />
      </div>
    </div>
  )
}

// Circular Progress Component
export interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  showValue?: boolean
  showPercentage?: boolean
  label?: string
  className?: string
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showValue = false,
  showPercentage = false,
  label,
  className,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), max)
  const percentage = (clampedValue / max) * 100
  
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  const variants = {
    default: 'stroke-blue-600',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-600',
    info: 'stroke-cyan-600',
  }
  
  const formatValue = () => {
    if (showPercentage) {
      return `${Math.round(percentage)}%`
    }
    if (showValue) {
      return `${clampedValue}/${max}`
    }
    return null
  }
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', variants[variant])}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {(showValue || showPercentage) && (
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatValue()}
          </span>
        )}
        {label && (
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

// Multi-step Progress Component
export interface Step {
  label: string
  description?: string
  completed: boolean
}

export interface StepProgressProps {
  steps: Step[]
  currentStep?: number
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep = 0,
  orientation = 'horizontal',
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: {
      step: 'w-6 h-6 text-xs',
      line: 'h-0.5',
      text: 'text-xs',
    },
    md: {
      step: 'w-8 h-8 text-sm',
      line: 'h-1',
      text: 'text-sm',
    },
    lg: {
      step: 'w-10 h-10 text-base',
      line: 'h-1.5',
      text: 'text-base',
    },
  }
  
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col space-y-4', className)}>
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 font-medium',
                  sizes[size].step,
                  step.completed
                    ? 'bg-green-600 border-green-600 text-white'
                    : index === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'
                )}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 bg-gray-300 dark:bg-gray-600 mt-2',
                    'h-8',
                    step.completed && 'bg-green-600'
                  )}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'font-medium text-gray-900 dark:text-white',
                  sizes[size].text
                )}
              >
                {step.label}
              </h3>
              {step.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={cn('flex items-center space-x-4', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex items-center justify-center rounded-full border-2 font-medium',
                sizes[size].step,
                step.completed
                  ? 'bg-green-600 border-green-600 text-white'
                  : index === currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'
              )}
            >
              {step.completed ? '✓' : index + 1}
            </div>
            <div className="mt-2 text-center">
              <h3
                className={cn(
                  'font-medium text-gray-900 dark:text-white',
                  sizes[size].text
                )}
              >
                {step.label}
              </h3>
              {step.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 bg-gray-300 dark:bg-gray-600',
                sizes[size].line,
                step.completed && 'bg-green-600'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default ProgressBar