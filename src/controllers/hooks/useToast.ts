'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
    persistent?: boolean
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastStore {
    toasts: Toast[]
    addToast: (message: string, type?: Toast['type'], options?: Partial<Toast>) => void
    removeToast: (id: string) => void
    clearAll: () => void
}

const useToastStore = create<ToastStore>()(
    subscribeWithSelector((set, get) => ({
        toasts: [],

        addToast: (message, type = 'info', options = {}) => {
            const id = Math.random().toString(36).substring(2, 9)
            const toast: Toast = {
                id,
                message,
                type,
                duration: options.duration ?? (type === 'error' ? 5000 : 3000),
                persistent: options.persistent ?? false,
                action: options.action,
            }

            set((state) => ({
                toasts: [...state.toasts, toast]
            }))

            // Auto-remove toast after duration
            if (!toast.persistent && toast.duration) {
                setTimeout(() => {
                    get().removeToast(id)
                }, toast.duration)
            }
        },

        removeToast: (id) => {
            set((state) => ({
                toasts: state.toasts.filter(toast => toast.id !== id)
            }))
        },

        clearAll: () => {
            set({ toasts: [] })
        }
    }))
)

export const useToast = () => {
    const { toasts, addToast, removeToast, clearAll } = useToastStore()

    return {
        toasts,
        addToast,
        removeToast,
        clearAll,
        // Convenience methods
        success: (message: string, options?: Partial<Toast>) => addToast(message, 'success', options),
        error: (message: string, options?: Partial<Toast>) => addToast(message, 'error', options),
        warning: (message: string, options?: Partial<Toast>) => addToast(message, 'warning', options),
        info: (message: string, options?: Partial<Toast>) => addToast(message, 'info', options),
    }
}
