import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Loader2 
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastConfig {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastProps {
  toast: ToastConfig;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.persistent]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(toast.id);
      toast.onClose?.();
    }, 300);
  };

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0" };
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle {...iconProps} className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info {...iconProps} className="w-5 h-5 text-blue-500" />;
      case 'loading':
        return <Loader2 {...iconProps} className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Info {...iconProps} className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastStyles = () => {
    const baseStyles = `
      relative flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm
      transform transition-all duration-300 ease-out
      max-w-md w-full
      ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : ''}
      ${isRemoving ? 'translate-x-full opacity-0' : ''}
    `;

    const positionStyles = toast.position?.includes('left') ? 
      `${!isVisible ? '-translate-x-full' : ''} ${isRemoving ? '-translate-x-full' : ''}` :
      `${!isVisible ? 'translate-x-full' : ''} ${isRemoving ? 'translate-x-full' : ''}`;

    const typeStyles = {
      success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      loading: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    };

    return `${baseStyles} ${positionStyles} ${typeStyles[toast.type]}`;
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {toast.title}
          </h4>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
          {toast.message}
        </p>
        
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.type !== 'loading' && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastConfig[];
  onClose: (id: string) => void;
  position?: ToastPosition;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onClose, 
  position = 'top-right' 
}) => {
  const getPositionStyles = () => {
    const baseStyles = `
      fixed z-[--z-index-toast] pointer-events-none
      flex flex-col gap-3 p-4
      max-h-screen overflow-hidden
    `;

    const positionMap: Record<ToastPosition, string> = {
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0',
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0',
      'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2'
    };

    return `${baseStyles} ${positionMap[position]}`;
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={getPositionStyles()}>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

// Toast Manager Hook
export const useToasts = () => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const addToast = (config: Omit<ToastConfig, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastConfig = {
      id,
      position: 'top-right',
      duration: 5000,
      ...config,
    };
    
    setToasts(prev => [...prev, toast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const updateToast = (id: string, updates: Partial<ToastConfig>) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  };

  // Convenience methods
  const success = (message: string, options?: Partial<ToastConfig>) => 
    addToast({ type: 'success', message, ...options });

  const error = (message: string, options?: Partial<ToastConfig>) => 
    addToast({ type: 'error', message, ...options });

  const warning = (message: string, options?: Partial<ToastConfig>) => 
    addToast({ type: 'warning', message, ...options });

  const info = (message: string, options?: Partial<ToastConfig>) => 
    addToast({ type: 'info', message, ...options });

  const loading = (message: string, options?: Partial<ToastConfig>) => 
    addToast({ type: 'loading', message, persistent: true, ...options });

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    updateToast,
    success,
    error,
    warning,
    info,
    loading,
  };
};

// Global Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
}

const ToastContext = React.createContext<ReturnType<typeof useToasts> | null>(null);

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'top-right' 
}) => {
  const toastManager = useToasts();

  return (
    <ToastContext.Provider value={toastManager}>
      {children}
      {createPortal(
        <ToastContainer 
          toasts={toastManager.toasts} 
          onClose={toastManager.removeToast}
          position={position}
        />,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast;