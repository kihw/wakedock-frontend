'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    variant?: 'default' | 'centered' | 'drawer'
    closeOnOverlayClick?: boolean
    closeOnEscape?: boolean
    showCloseButton?: boolean
    className?: string
    overlayClassName?: string
    contentClassName?: string
    persistent?: boolean
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    variant = 'default',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    className,
    overlayClassName,
    contentClassName,
    persistent = false,
}) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape && !persistent) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            // Store previous focus
            previousFocusRef.current = document.activeElement as HTMLElement
            // Prevent body scroll
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            if (isOpen) {
                document.body.style.overflow = 'unset'
            }
        }
    }, [isOpen, closeOnEscape, onClose, persistent])

    // Restore focus when modal closes
    useEffect(() => {
        if (!isOpen && previousFocusRef.current) {
            previousFocusRef.current.focus()
        }
    }, [isOpen])

    // Focus management
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            const firstFocusableElement = focusableElements[0] as HTMLElement
            const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement

            const handleTabKeyPress = (e: KeyboardEvent) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusableElement) {
                            lastFocusableElement?.focus()
                            e.preventDefault()
                        }
                    } else {
                        if (document.activeElement === lastFocusableElement) {
                            firstFocusableElement?.focus()
                            e.preventDefault()
                        }
                    }
                }
            }

            modalRef.current.addEventListener('keydown', handleTabKeyPress)
            firstFocusableElement?.focus()

            return () => {
                modalRef.current?.removeEventListener('keydown', handleTabKeyPress)
            }
        }
    }, [isOpen])

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && closeOnOverlayClick && !persistent) {
            onClose()
        }
    }

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'max-w-sm'
            case 'md':
                return 'max-w-md'
            case 'lg':
                return 'max-w-lg'
            case 'xl':
                return 'max-w-xl'
            case 'full':
                return 'max-w-full mx-4'
            default:
                return 'max-w-md'
        }
    }

    const getVariantClasses = () => {
        switch (variant) {
            case 'centered':
                return 'flex items-center justify-center min-h-screen p-4'
            case 'drawer':
                return 'flex items-start justify-end min-h-screen'
            default:
                return 'flex items-center justify-center min-h-screen p-4'
        }
    }

    const getContentVariantClasses = () => {
        switch (variant) {
            case 'drawer':
                return 'h-full w-full max-w-md rounded-l-2xl'
            default:
                return 'w-full rounded-2xl'
        }
    }

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    }

    const contentVariants = {
        hidden: {
            opacity: 0,
            scale: variant === 'drawer' ? 1 : 0.95,
            x: variant === 'drawer' ? 300 : 0,
            y: variant === 'drawer' ? 0 : 10
        },
        visible: {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            scale: variant === 'drawer' ? 1 : 0.95,
            x: variant === 'drawer' ? 300 : 0,
            y: variant === 'drawer' ? 0 : 10,
            transition: {
                duration: 0.2,
                ease: 'easeInOut'
            }
        }
    }

    if (!isOpen) return null

    const modalContent = (
        <AnimatePresence mode="wait">
            <motion.div
                className={cn(
                    'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
                    getVariantClasses(),
                    overlayClassName
                )}
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={handleOverlayClick}
                aria-modal="true"
                role="dialog"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                <motion.div
                    ref={modalRef}
                    className={cn(
                        'relative bg-white dark:bg-gray-900 shadow-2xl',
                        'border border-gray-200 dark:border-gray-700',
                        getSizeClasses(),
                        getContentVariantClasses(),
                        'max-h-[90vh] overflow-hidden',
                        contentClassName
                    )}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            {title && (
                                <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <motion.button
                                    onClick={onClose}
                                    disabled={persistent}
                                    className={cn(
                                        'p-2 rounded-lg transition-colors duration-200',
                                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                                        'focus:outline-none focus:ring-2 focus:ring-primary-500',
                                        'disabled:opacity-50 disabled:cursor-not-allowed'
                                    )}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Close modal"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </motion.button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className={cn(
                        'p-6 overflow-y-auto',
                        variant === 'drawer' ? 'h-full' : 'max-h-[70vh]',
                        className
                    )}>
                        {children}
                    </div>

                    {/* Glassmorphism effect */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl"
                        aria-hidden="true"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )

    // Render modal in portal
    return typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null
}

export { Modal }

// Hook for modal state management
export const useModal = (initialState = false) => {
    const [isOpen, setIsOpen] = React.useState(initialState)

    const openModal = React.useCallback(() => setIsOpen(true), [])
    const closeModal = React.useCallback(() => setIsOpen(false), [])
    const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), [])

    return {
        isOpen,
        openModal,
        closeModal,
        toggleModal,
        setIsOpen
    }
}
