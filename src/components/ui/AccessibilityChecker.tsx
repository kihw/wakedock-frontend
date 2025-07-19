'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface AccessibilityIssue {
    id: string
    type: 'error' | 'warning' | 'info'
    message: string
    element: string
    suggestion: string
    severity: 'high' | 'medium' | 'low'
}

export const AccessibilityChecker = () => {
    const [issues, setIssues] = useState<AccessibilityIssue[]>([])
    const [isScanning, setIsScanning] = useState(false)
    const [score, setScore] = useState<number>(0)
    const [isVisible, setIsVisible] = useState(false)

    const scanForAccessibilityIssues = async () => {
        setIsScanning(true)
        const foundIssues: AccessibilityIssue[] = []

        try {
            // Check for missing alt text
            const images = document.querySelectorAll('img')
            images.forEach((img, index) => {
                if (!img.alt) {
                    foundIssues.push({
                        id: `img-alt-${index}`,
                        type: 'error',
                        message: 'Image missing alt text',
                        element: `<img src="${img.src}">`,
                        suggestion: 'Add descriptive alt text for screen readers',
                        severity: 'high'
                    })
                }
            })

            // Check for missing form labels
            const inputs = document.querySelectorAll('input, textarea, select')
            inputs.forEach((input, index) => {
                const hasLabel = input.getAttribute('aria-label') ||
                    input.getAttribute('aria-labelledby') ||
                    document.querySelector(`label[for="${input.id}"]`)

                if (!hasLabel) {
                    foundIssues.push({
                        id: `input-label-${index}`,
                        type: 'error',
                        message: 'Form control missing label',
                        element: `<${input.tagName.toLowerCase()}>`,
                        suggestion: 'Add aria-label or associate with a label element',
                        severity: 'high'
                    })
                }
            })

            // Check for low contrast
            const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div')
            textElements.forEach((element, index) => {
                if (element.textContent?.trim()) {
                    const styles = window.getComputedStyle(element)
                    const color = styles.color
                    const backgroundColor = styles.backgroundColor

                    // Simple contrast check (in production, use a proper contrast ratio calculator)
                    if (color === 'rgb(128, 128, 128)' || backgroundColor === color) {
                        foundIssues.push({
                            id: `contrast-${index}`,
                            type: 'warning',
                            message: 'Potential low contrast text',
                            element: `<${element.tagName.toLowerCase()}>`,
                            suggestion: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text)',
                            severity: 'medium'
                        })
                    }
                }
            })

            // Check for missing heading structure
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
            if (headings.length > 0) {
                const h1Count = document.querySelectorAll('h1').length
                if (h1Count === 0) {
                    foundIssues.push({
                        id: 'missing-h1',
                        type: 'error',
                        message: 'Page missing main heading (h1)',
                        element: '<h1>',
                        suggestion: 'Add a main heading (h1) to the page',
                        severity: 'high'
                    })
                } else if (h1Count > 1) {
                    foundIssues.push({
                        id: 'multiple-h1',
                        type: 'warning',
                        message: 'Multiple h1 headings found',
                        element: '<h1>',
                        suggestion: 'Use only one h1 per page',
                        severity: 'medium'
                    })
                }
            }

            // Check for missing focus indicators
            const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]')
            focusableElements.forEach((element, index) => {
                const styles = window.getComputedStyle(element, ':focus')
                const outline = styles.outline
                const boxShadow = styles.boxShadow

                if (outline === 'none' && boxShadow === 'none') {
                    foundIssues.push({
                        id: `focus-${index}`,
                        type: 'warning',
                        message: 'Element may be missing focus indicator',
                        element: `<${element.tagName.toLowerCase()}>`,
                        suggestion: 'Add visible focus indicators for keyboard navigation',
                        severity: 'medium'
                    })
                }
            })

            // Check for missing ARIA landmarks
            const landmarks = document.querySelectorAll('[role="main"], [role="banner"], [role="navigation"], [role="contentinfo"], main, header, nav, footer')
            if (landmarks.length === 0) {
                foundIssues.push({
                    id: 'missing-landmarks',
                    type: 'info',
                    message: 'Consider adding ARIA landmarks',
                    element: '<main>, <header>, <nav>, <footer>',
                    suggestion: 'Use semantic HTML elements or ARIA roles for better screen reader navigation',
                    severity: 'low'
                })
            }

            // Check for missing skip links
            const skipLinks = document.querySelectorAll('a[href="#main"], a[href="#content"]')
            if (skipLinks.length === 0) {
                foundIssues.push({
                    id: 'missing-skip-link',
                    type: 'info',
                    message: 'Consider adding skip link',
                    element: '<a href="#main">',
                    suggestion: 'Add skip link to main content for keyboard users',
                    severity: 'low'
                })
            }

            // Calculate accessibility score
            const errorCount = foundIssues.filter(issue => issue.type === 'error').length
            const warningCount = foundIssues.filter(issue => issue.type === 'warning').length
            const infoCount = foundIssues.filter(issue => issue.type === 'info').length

            const maxScore = 100
            const penalties = (errorCount * 20) + (warningCount * 10) + (infoCount * 5)
            const calculatedScore = Math.max(0, maxScore - penalties)

            setScore(calculatedScore)
            setIssues(foundIssues)
        } catch (error) {
            console.error('Accessibility scan failed:', error)
        } finally {
            setIsScanning(false)
        }
    }

    useEffect(() => {
        // Only show in development
        if (process.env.NODE_ENV === 'development') {
            setIsVisible(true)
        }
    }, [])

    const getIssueIcon = (type: AccessibilityIssue['type']) => {
        switch (type) {
            case 'error': return <XCircle className="w-4 h-4 text-red-500" />
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
            case 'info': return <Info className="w-4 h-4 text-blue-500" />
            default: return <Info className="w-4 h-4 text-gray-500" />
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600'
        if (score >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreIcon = (score: number) => {
        if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-500" />
        if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-500" />
        return <XCircle className="w-5 h-5 text-red-500" />
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
            <Card className="p-4 shadow-lg border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Accessibility Scanner</h3>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={scanForAccessibilityIssues}
                        disabled={isScanning}
                    >
                        {isScanning ? 'Scanning...' : 'Scan Page'}
                    </Button>
                </div>

                {issues.length > 0 && (
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            {getScoreIcon(score)}
                            <span className={`font-bold ${getScoreColor(score)}`}>
                                Score: {score}/100
                            </span>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {issues.slice(0, 5).map((issue) => (
                                <div key={issue.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-xs">
                                    {getIssueIcon(issue.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">{issue.message}</p>
                                        <p className="text-gray-600 truncate">{issue.element}</p>
                                        <p className="text-gray-500 text-[10px] mt-1">{issue.suggestion}</p>
                                    </div>
                                </div>
                            ))}

                            {issues.length > 5 && (
                                <p className="text-xs text-gray-500 text-center">
                                    +{issues.length - 5} more issues
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="text-xs text-gray-500 text-center">
                    Development Tool - Not shown in production
                </div>
            </Card>
        </div>
    )
}

// Hook for accessibility checking
export const useAccessibilityCheck = () => {
    const [issues, setIssues] = useState<AccessibilityIssue[]>([])
    const [score, setScore] = useState<number>(100)

    const runAccessibilityCheck = async () => {
        // This would run the same checks as the component above
        // Return results for programmatic use
        return {
            issues,
            score,
            passed: score >= 90,
            warnings: issues.filter(i => i.type === 'warning').length,
            errors: issues.filter(i => i.type === 'error').length
        }
    }

    return {
        runAccessibilityCheck,
        issues,
        score
    }
}

// Accessibility testing utilities
export const AccessibilityUtils = {
    // Check if element has proper ARIA attributes
    hasProperAria: (element: HTMLElement) => {
        const role = element.getAttribute('role')
        const ariaLabel = element.getAttribute('aria-label')
        const ariaLabelledBy = element.getAttribute('aria-labelledby')

        return !!(role || ariaLabel || ariaLabelledBy)
    },

    // Check if element is keyboard accessible
    isKeyboardAccessible: (element: HTMLElement) => {
        const tabIndex = element.getAttribute('tabindex')
        const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())

        return isInteractive || (tabIndex !== null && tabIndex !== '-1')
    },

    // Check color contrast (simplified)
    hasGoodContrast: (element: HTMLElement) => {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor

        // This is a simplified check - in production, use a proper contrast ratio library
        return color !== backgroundColor && color !== 'rgba(0, 0, 0, 0)'
    }
}
