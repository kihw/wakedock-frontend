// Toast Hook - Enhanced notifications
'use client';

import { useState, useCallback } from 'react';
import { ToastState, ToastAction } from '@/models/ui/interface';

interface ToastOptions {
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    actions?: ToastAction[];
    persistent?: boolean;
}

interface ToastContextType {
    toasts: ToastState[];
    toast: (options: ToastOptions) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
}

let toastCount = 0;
let toastListeners: ((toasts: ToastState[]) => void)[] = [];
let toastList: ToastState[] = [];

const generateId = () => `toast-${++toastCount}`;

const notify = () => {
    toastListeners.forEach(listener => listener(toastList));
};

const addToast = (options: ToastOptions): string => {
    const id = generateId();
    const toast: ToastState = {
        id,
        type: options.variant || 'info',
        title: options.title,
        message: options.description,
        duration: options.duration || 5000,
        actions: options.actions,
        persistent: options.persistent || false,
    };

    toastList.push(toast);
    notify();

    // Auto-dismiss non-persistent toasts
    if (!toast.persistent && toast.duration > 0) {
        setTimeout(() => {
            removeToast(id);
        }, toast.duration);
    }

    return id;
};

const removeToast = (id: string) => {
    toastList = toastList.filter(toast => toast.id !== id);
    notify();
};

const removeAllToasts = () => {
    toastList = [];
    notify();
};

export const toast = (options: ToastOptions): string => {
    return addToast(options);
};

toast.success = (title: string, description?: string) => {
    return addToast({ title, description, variant: 'success' });
};

toast.error = (title: string, description?: string) => {
    return addToast({ title, description, variant: 'error' });
};

toast.warning = (title: string, description?: string) => {
    return addToast({ title, description, variant: 'warning' });
};

toast.info = (title: string, description?: string) => {
    return addToast({ title, description, variant: 'info' });
};

toast.dismiss = (id: string) => {
    removeToast(id);
};

toast.dismissAll = () => {
    removeAllToasts();
};

export const useToast = (): ToastContextType => {
    const [toasts, setToasts] = useState<ToastState[]>(toastList);

    const subscribe = useCallback((listener: (toasts: ToastState[]) => void) => {
        toastListeners.push(listener);
        return () => {
            toastListeners = toastListeners.filter(l => l !== listener);
        };
    }, []);

    const dismiss = useCallback((id: string) => {
        removeToast(id);
    }, []);

    const dismissAll = useCallback(() => {
        removeAllToasts();
    }, []);

    // Subscribe to toast changes
    useState(() => {
        const unsubscribe = subscribe(setToasts);
        return unsubscribe;
    });

    return {
        toasts,
        toast: addToast,
        dismiss,
        dismissAll,
    };
};
