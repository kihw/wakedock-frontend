import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
  timestamp: Date;
}

interface ToastState {
  // State
  toasts: Toast[];

  // Actions
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (title: string, message?: string, options?: Partial<Toast>) => string;
  error: (title: string, message?: string, options?: Partial<Toast>) => string;
  warning: (title: string, message?: string, options?: Partial<Toast>) => string;
  info: (title: string, message?: string, options?: Partial<Toast>) => string;
}

export const useToastStore = create<ToastState>((set, get) => ({
  // Initial state
  toasts: [],

  // Add a toast
  addToast: (toastData) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      ...toastData,
      id,
      timestamp: new Date(),
      duration: toastData.duration ?? (toastData.type === 'error' ? 0 : 5000), // Errors stay until dismissed
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove toast after duration (if not persistent and has duration)
    if (toast.duration && toast.duration > 0 && !toast.persistent) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration);
    }

    return id;
  },

  // Remove a toast
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  // Clear all toasts
  clearAll: () => {
    set({ toasts: [] });
  },

  // Convenience methods
  success: (title, message, options = {}) => {
    return get().addToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  },

  error: (title, message, options = {}) => {
    return get().addToast({
      type: 'error',
      title,
      message,
      duration: 0, // Errors stay until dismissed
      ...options,
    });
  },

  warning: (title, message, options = {}) => {
    return get().addToast({
      type: 'warning',
      title,
      message,
      ...options,
    });
  },

  info: (title, message, options = {}) => {
    return get().addToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  },
}));