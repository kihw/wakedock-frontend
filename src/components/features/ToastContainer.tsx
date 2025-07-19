'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useToast, Toast } from '@/controllers/hooks/useToast'

interface ToastItemProps {
    toast: Toast
    onClose: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            case 'error':
                return (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            case 'warning':
                return (
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.86-.833-2.63 0L3.224 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                )
            case 'info':
            default:
                return (
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
        }
    }

    const getToastClasses = () => {
        const base = 'relative flex items-start p-4 rounded-lg shadow-lg backdrop-blur-sm border max-w-sm'

        switch (toast.type) {
            case 'success':
                return cn(base, 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800')
            case 'error':
                return cn(base, 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800')
            case 'warning':
                return cn(base, 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800')
            case 'info':
            default:
                return cn(base, 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={getToastClasses()}
        >
            <div className="flex-shrink-0 pt-0.5">
                {getIcon()}
            </div>

            <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {toast.message}
                </p>

                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        className="mt-2 text-sm underline text-current hover:no-underline"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            {!toast.persistent && (
                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={() => onClose(toast.id)}
                        className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <span className="sr-only">Fermer</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}
        </motion.div>
    )
}

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast()

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={removeToast}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}

export { ToastContainer, ToastItem }
