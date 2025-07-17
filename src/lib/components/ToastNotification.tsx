/**
 * Composant Toast pour les notifications temps réel WakeDock
 */
import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Info, Shield, Server, Activity } from 'lucide-react';
import { NotificationData } from '../hooks/useNotificationApi';

interface ToastNotificationProps {
    notification: NotificationData;
    onClose: () => void;
    onMarkAsRead: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
    className?: string;
}

interface ToastContainerProps {
    notifications: NotificationData[];
    onClose: (id: string) => void;
    onMarkAsRead: (id: string) => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    maxToasts?: number;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

// Map des icônes par type de notification
const NotificationIcons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertTriangle,
    success: CheckCircle,
    system: Server,
    security: Shield,
    deployment: Server,
    monitoring: Activity,
};

// Map des couleurs par type de notification
const NotificationColors = {
    info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-500 dark:text-blue-400',
        text: 'text-blue-900 dark:text-blue-100',
    },
    warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-500 dark:text-yellow-400',
        text: 'text-yellow-900 dark:text-yellow-100',
    },
    error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-500 dark:text-red-400',
        text: 'text-red-900 dark:text-red-100',
    },
    success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-500 dark:text-green-400',
        text: 'text-green-900 dark:text-green-100',
    },
    system: {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800',
        icon: 'text-gray-500 dark:text-gray-400',
        text: 'text-gray-900 dark:text-gray-100',
    },
    security: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'text-purple-500 dark:text-purple-400',
        text: 'text-purple-900 dark:text-purple-100',
    },
    deployment: {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: 'text-indigo-500 dark:text-indigo-400',
        text: 'text-indigo-900 dark:text-indigo-100',
    },
    monitoring: {
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        border: 'border-teal-200 dark:border-teal-800',
        icon: 'text-teal-500 dark:text-teal-400',
        text: 'text-teal-900 dark:text-teal-100',
    },
};

// Map des priorités avec leurs styles
const PriorityStyles = {
    low: 'opacity-80',
    normal: '',
    high: 'ring-2 ring-orange-200 dark:ring-orange-800',
    urgent: 'ring-2 ring-red-300 dark:ring-red-700 animate-pulse',
};

export function ToastNotification({
    notification,
    onClose,
    onMarkAsRead,
    autoClose = true,
    autoCloseDelay = 5000,
    className = ''
}: ToastNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const IconComponent = NotificationIcons[notification.type as keyof typeof NotificationIcons] || Bell;
    const colors = NotificationColors[notification.type as keyof typeof NotificationColors] || NotificationColors.info;
    const priorityStyle = PriorityStyles[notification.priority as keyof typeof PriorityStyles] || '';

    // Animation d'entrée
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Auto-close pour les notifications non urgentes
    useEffect(() => {
        if (autoClose && notification.priority !== 'urgent') {
            const timer = setTimeout(() => {
                handleClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDelay, notification.priority]);

    const handleClose = useCallback(() => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose();
        }, 300); // Durée de l'animation de sortie
    }, [onClose]);

    const handleMarkAsRead = useCallback(() => {
        if (!notification.is_read) {
            onMarkAsRead();
        }
    }, [notification.is_read, onMarkAsRead]);

    const handleActionClick = useCallback(() => {
        if (notification.action_url) {
            window.open(notification.action_url, '_blank');
            handleMarkAsRead();
        }
    }, [notification.action_url, handleMarkAsRead]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div
            className={`
        fixed z-50 max-w-sm w-full transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${className}
      `}
        >
            <div
                className={`
          relative p-4 rounded-lg border shadow-lg backdrop-blur-sm
          ${colors.bg} ${colors.border} ${colors.text}
          ${priorityStyle}
          ${!notification.is_read ? 'ring-1 ring-blue-300 dark:ring-blue-700' : ''}
        `}
                onClick={handleMarkAsRead}
            >
                {/* Indicateur de priorité urgente */}
                {notification.priority === 'urgent' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}

                {/* En-tête avec icône et bouton fermer */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                            {notification.type}
                        </span>
                        {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs opacity-60">
                            {formatTime(notification.created_at)}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                            }}
                            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4 opacity-60" />
                        </button>
                    </div>
                </div>

                {/* Contenu */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm leading-tight">
                        {notification.title}
                    </h4>

                    <p className="text-sm opacity-90 leading-relaxed">
                        {notification.message}
                    </p>

                    {/* Données contextuelles */}
                    {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="mt-3 p-2 rounded bg-black/5 dark:bg-white/5">
                            <details className="text-xs">
                                <summary className="cursor-pointer opacity-70 hover:opacity-100">
                                    Détails
                                </summary>
                                <pre className="mt-2 text-xs font-mono opacity-60 overflow-x-auto">
                                    {JSON.stringify(notification.data, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    {/* Bouton d'action */}
                    {notification.action_url && notification.action_label && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick();
                            }}
                            className="mt-3 px-3 py-1.5 text-xs font-medium rounded
                       bg-blue-500 text-white hover:bg-blue-600
                       dark:bg-blue-600 dark:hover:bg-blue-700
                       transition-colors"
                        >
                            {notification.action_label}
                        </button>
                    )}

                    {/* Indicateur d'expiration */}
                    {notification.expires_at && (
                        <div className="flex items-center gap-1 text-xs opacity-50 mt-2">
                            <div className="w-1 h-1 bg-current rounded-full" />
                            <span>
                                Expire le {new Date(notification.expires_at).toLocaleString('fr-FR')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Barre de progression pour auto-close */}
                {autoClose && notification.priority !== 'urgent' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-lg overflow-hidden">
                        <div
                            className="h-full bg-blue-500 dark:bg-blue-400 transition-all ease-linear"
                            style={{
                                animation: `toast-progress ${autoCloseDelay}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}

export function ToastContainer({
    notifications,
    onClose,
    onMarkAsRead,
    position = 'top-right',
    maxToasts = 5,
    autoClose = true,
    autoCloseDelay = 5000
}: ToastContainerProps) {
    // Limite le nombre de toasts affichés
    const visibleNotifications = notifications.slice(0, maxToasts);

    // Calcule la position du container
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    };

    if (visibleNotifications.length === 0) {
        return null;
    }

    return (
        <div className={`fixed z-50 ${positionClasses[position]} space-y-3`}>
            {visibleNotifications.map((notification, index) => (
                <ToastNotification
                    key={notification.id}
                    notification={notification}
                    onClose={() => onClose(notification.id)}
                    onMarkAsRead={() => onMarkAsRead(notification.id)}
                    autoClose={autoClose}
                    autoCloseDelay={autoCloseDelay}
                    className={`
            transition-all duration-300 ease-out
            ${index > 0 ? 'transform scale-95 opacity-80' : ''}
          `}
                />
            ))}

            {/* Indicateur si plus de notifications */}
            {notifications.length > maxToasts && (
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg 
                         bg-gray-100 dark:bg-gray-800 text-sm font-medium
                         text-gray-600 dark:text-gray-400">
                        <Bell className="w-4 h-4" />
                        <span>+{notifications.length - maxToasts} autres notifications</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ToastNotification;
