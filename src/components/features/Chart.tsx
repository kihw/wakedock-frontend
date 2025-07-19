'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ChartDataPoint {
    label: string
    value: number
    color?: string
}

export interface ChartProps {
    data: ChartDataPoint[]
    title?: string
    type?: 'line' | 'bar' | 'pie' | 'area'
    width?: number
    height?: number
    className?: string
    showGrid?: boolean
    showLegend?: boolean
    showLabels?: boolean
    animated?: boolean
    colors?: string[]
}

const Chart: React.FC<ChartProps> = ({
    data,
    title,
    type = 'line',
    width = 400,
    height = 300,
    className,
    showGrid = true,
    showLegend = true,
    showLabels = true,
    animated = true,
    colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
}) => {
    const [animationProgress, setAnimationProgress] = useState(0)

    useEffect(() => {
        if (animated) {
            const startTime = Date.now()
            const duration = 1000

            const animate = () => {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                setAnimationProgress(progress)

                if (progress < 1) {
                    requestAnimationFrame(animate)
                }
            }

            requestAnimationFrame(animate)
        } else {
            setAnimationProgress(1)
        }
    }, [animated, data])

    const maxValue = useMemo(() => {
        if (!data || data.length === 0) return 100
        return Math.max(...data.map(d => d.value))
    }, [data])

    const minValue = useMemo(() => {
        if (!data || data.length === 0) return 0
        return Math.min(...data.map(d => d.value))
    }, [data])

    const getColor = (index: number) => {
        return data[index]?.color || colors[index % colors.length]
    }

    const renderLineChart = () => {
        if (!data || data.length === 0) {
            return (
                <svg width={width} height={height}>
                    <text x={width / 2} y={height / 2} textAnchor="middle" fill="currentColor" className="text-sm opacity-50">
                        No data available
                    </text>
                </svg>
            )
        }

        const padding = 40
        const chartWidth = width - padding * 2
        const chartHeight = height - padding * 2

        const points = data.map((point, index) => {
            const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth
            const y = padding + (1 - (point.value - minValue) / Math.max(maxValue - minValue, 1)) * chartHeight
            return { x, y, ...point }
        })

        const pathD = points.reduce((path, point, index) => {
            const command = index === 0 ? 'M' : 'L'
            return `${path} ${command} ${point.x} ${point.y}`
        }, '')

        const areaPathD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`

        return (
            <svg width={width} height={height} className="overflow-visible">
                {/* Grid */}
                {showGrid && (
                    <g className="opacity-20">
                        {[...Array(5)].map((_, i) => (
                            <line
                                key={`grid-${i}`}
                                x1={padding}
                                y1={padding + (i / 4) * chartHeight}
                                x2={width - padding}
                                y2={padding + (i / 4) * chartHeight}
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                        ))}
                    </g>
                )}

                {/* Area */}
                {type === 'area' && (
                    <motion.path
                        d={areaPathD}
                        fill={`url(#gradient-${0})`}
                        fillOpacity="0.3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: animationProgress }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                )}

                {/* Line */}
                <motion.path
                    d={pathD}
                    fill="none"
                    stroke={getColor(0)}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: animationProgress }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                />

                {/* Points */}
                {points.map((point, index) => (
                    <motion.circle
                        key={`point-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill={getColor(0)}
                        stroke="white"
                        strokeWidth="2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: animationProgress,
                            opacity: animationProgress
                        }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: 'easeOut'
                        }}
                    />
                ))}

                {/* Labels */}
                {showLabels && points.map((point, index) => (
                    <motion.text
                        key={`label-${index}`}
                        x={point.x}
                        y={height - padding + 20}
                        textAnchor="middle"
                        className="text-xs text-gray-600 dark:text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: animationProgress }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        {point.label}
                    </motion.text>
                ))}

                {/* Gradient Definition */}
                <defs>
                    <linearGradient id={`gradient-${0}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={getColor(0)} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={getColor(0)} stopOpacity="0.1" />
                    </linearGradient>
                </defs>
            </svg>
        )
    }

    const renderBarChart = () => {
        if (!data || data.length === 0) {
            return (
                <svg width={width} height={height}>
                    <text x={width / 2} y={height / 2} textAnchor="middle" fill="currentColor" className="text-sm opacity-50">
                        No data available
                    </text>
                </svg>
            )
        }

        const padding = 40
        const chartWidth = width - padding * 2
        const chartHeight = height - padding * 2
        const barWidth = chartWidth / data.length * 0.8

        return (
            <svg width={width} height={height} className="overflow-visible">
                {/* Grid */}
                {showGrid && (
                    <g className="opacity-20">
                        {[...Array(5)].map((_, i) => (
                            <line
                                key={`grid-${i}`}
                                x1={padding}
                                y1={padding + (i / 4) * chartHeight}
                                x2={width - padding}
                                y2={padding + (i / 4) * chartHeight}
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                        ))}
                    </g>
                )}

                {/* Bars */}
                {data.map((point, index) => {
                    const barHeight = (point.value / maxValue) * chartHeight * animationProgress
                    const x = padding + (index / data.length) * chartWidth + (chartWidth / data.length - barWidth) / 2
                    const y = height - padding - barHeight

                    return (
                        <g key={`bar-${index}`}>
                            <motion.rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={getColor(index)}
                                rx="4"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: animationProgress }}
                                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                                style={{ transformOrigin: 'bottom' }}
                            />
                            {showLabels && (
                                <motion.text
                                    x={x + barWidth / 2}
                                    y={height - padding + 20}
                                    textAnchor="middle"
                                    className="text-xs text-gray-600 dark:text-gray-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: animationProgress }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                >
                                    {point.label}
                                </motion.text>
                            )}
                        </g>
                    )
                })}
            </svg>
        )
    }

    const renderPieChart = () => {
        if (!data || data.length === 0) {
            return (
                <svg width={width} height={height}>
                    <text x={width / 2} y={height / 2} textAnchor="middle" fill="currentColor" className="text-sm opacity-50">
                        No data available
                    </text>
                </svg>
            )
        }

        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) / 2 - 20

        const total = data.reduce((sum, point) => sum + point.value, 0)
        if (total === 0) {
            return (
                <svg width={width} height={height}>
                    <text x={width / 2} y={height / 2} textAnchor="middle" fill="currentColor" className="text-sm opacity-50">
                        No data available
                    </text>
                </svg>
            )
        }

        let currentAngle = -90 // Start from top

        return (
            <svg width={width} height={height} className="overflow-visible">
                {data.map((point, index) => {
                    const angle = (point.value / total) * 360
                    const startAngle = currentAngle
                    const endAngle = currentAngle + angle * animationProgress

                    const startAngleRad = (startAngle * Math.PI) / 180
                    const endAngleRad = (endAngle * Math.PI) / 180

                    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

                    const x1 = centerX + radius * Math.cos(startAngleRad)
                    const y1 = centerY + radius * Math.sin(startAngleRad)
                    const x2 = centerX + radius * Math.cos(endAngleRad)
                    const y2 = centerY + radius * Math.sin(endAngleRad)

                    const pathD = [
                        `M ${centerX} ${centerY}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ')

                    currentAngle += angle

                    return (
                        <motion.path
                            key={`pie-${index}`}
                            d={pathD}
                            fill={getColor(index)}
                            stroke="white"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: index * 0.1,
                                ease: 'easeOut'
                            }}
                        />
                    )
                })}
            </svg>
        )
    }

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return renderBarChart()
            case 'pie':
                return renderPieChart()
            case 'area':
                return renderLineChart()
            case 'line':
            default:
                return renderLineChart()
        }
    }

    return (
        <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-6', className)}>
            {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {title}
                </h3>
            )}

            <div className="flex items-center justify-center">
                {renderChart()}
            </div>

            {showLegend && type === 'pie' && (
                <div className="mt-4 flex flex-wrap gap-4 justify-center">
                    {data.map((point, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getColor(index) }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {point.label}: {point.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export { Chart }
