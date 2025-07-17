/**
 * Centre de notifications WakeDock
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Trash2,
    Settings,
    Filter,
    Search,
    MoreHorizontal,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Info,
    Shield,
    Server,
    Activity
} from 'lucide-react';
import { NotificationData, NotificationPreferences } from '../hooks/useNotificationApi';

interface NotificationCenterProps {
    notifications: NotificationData[];
    unreadCount: number;
    preferences: NotificationPreferences | null;
    isLoading: boolean;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDeleteNotification: (id: string) => void;
    onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void;
    onLoadMore?: () => void;
    className?: string;
}

interface NotificationItemProps {
    notification: NotificationData;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}

interface NotificationFilters {
    type: string[];
    priority: string[];
    read: 'all' | 'read' | 'unread';
    dateRange: 'all' | 'today' | 'week' | 'month';
}

// Map des icônes par type
const TypeIcons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertTriangle,
    success: CheckCircle,
    system: Server,
    security: Shield,
    deployment: Server,
    monitoring: Activity,
};

// Map des couleurs par type
const TypeColors = {
    info: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    warning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    error: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    success: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    system: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20',
    security: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    deployment: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    monitoring: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
};

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const IconComponent = TypeIcons[notification.type as keyof typeof TypeIcons] || Info;
    const colorClass = TypeColors[notification.type as keyof typeof TypeColors] || TypeColors.info;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) {
            const minutes = Math.floor(diffInMs / (1000 * 60));
            return `Il y a ${minutes} min`;
        } else if (diffInHours < 24) {
            return `Il y a ${Math.floor(diffInHours)}h`;
        } else if (diffInDays < 7) {
            return `Il y a ${Math.floor(diffInDays)} jour${Math.floor(diffInDays) > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    };

    const getPriorityBadge = (priority: string) => {
        const styles = {
            low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            normal: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
            urgent: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse',
        };

        return (
            <span className={`
        px-2 py-0.5 text-xs font-medium rounded-full uppercase tracking-wider
        ${styles[priority as keyof typeof styles] || styles.normal}
      `}>
                {priority}
            </span>
        );
    };

    return (
        <div
            className={`
        group relative p-4 border-b border-gray-100 dark:border-gray-800
        hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors
        ${!notification.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''}
      `}
        >
            <div className="flex items-start gap-3">
                {/* Icône et indicateur de lecture */}
                <div className="relative">
                    <div className={`
            p-2 rounded-lg ${colorClass}
          `}>
                        <IconComponent className="w-4 h-4" />
                    </div>
                    {!notification.is_read && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                </div>

                {/* Contenu principal */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            {/* En-tête */}
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                    {notification.title}
                                </h4>
                                {getPriorityBadge(notification.priority)}
                            </div>

                            {/* Message */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                                {notification.message}
                            </p>

                            {/* Métadonnées */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(notification.created_at)}
                                </span>
                                {notification.channel && notification.channel !== 'default' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                        {notification.channel}
                                    </span>
                                )}
                                {notification.expires_at && (
                                    <span className="text-orange-500">
                                        Expire le {new Date(notification.expires_at).toLocaleDateString('fr-FR')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.is_read && (
                                <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    title="Marquer comme lu"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}

                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Bouton d'action de la notification */}
                    {notification.action_url && notification.action_label && (
                        <button
                            onClick={() => window.open(notification.action_url, '_blank')}
                            className="mt-3 px-3 py-1.5 text-xs font-medium rounded
                       bg-blue-500 text-white hover:bg-blue-600
                       dark:bg-blue-600 dark:hover:bg-blue-700
                       transition-colors"
                        >
                            {notification.action_label}
                        </button>
                    )}

                    {/* Données contextuelles */}
                    {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="mt-3">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {showDetails ? 'Masquer les détails' : 'Voir les détails'}
                            </button>

                            {showDetails && (
                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                                        {JSON.stringify(notification.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Menu des actions */}
            {showActions && (
                <div className="absolute top-4 right-4 z-10 min-w-48 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <div className="p-1">
                        {!notification.is_read && (
                            <button
                                onClick={() => {
                                    onMarkAsRead(notification.id);
                                    setShowActions(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Marquer comme lu
                            </button>
                        )}

                        <button
                            onClick={() => {
                                onDelete(notification.id);
                                setShowActions(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay pour fermer le menu */}
            {showActions && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowActions(false)}
                />
            )}
        </div>
    );
}

export function NotificationCenter({
    notifications,
    unreadCount,
    preferences,
    isLoading,
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification,
    onUpdatePreferences,
    onLoadMore,
    className = ''
}: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<NotificationFilters>({
        type: [],
        priority: [],
        read: 'all',
        dateRange: 'all'
    });

    // Filtre les notifications selon les critères
    const filteredNotifications = useMemo(() => {
        return notifications.filter(notification => {
            // Filtre par recherche
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!notification.title.toLowerCase().includes(query) &&
                    !notification.message.toLowerCase().includes(query)) {
                    return false;
                }
            }

            // Filtre par type
            if (filters.type.length > 0 && !filters.type.includes(notification.type)) {
                return false;
            }

            // Filtre par priorité
            if (filters.priority.length > 0 && !filters.priority.includes(notification.priority)) {
                return false;
            }

            // Filtre par statut de lecture
            if (filters.read === 'read' && !notification.is_read) {
                return false;
            }
            if (filters.read === 'unread' && notification.is_read) {
                return false;
            }

            // Filtre par date
            if (filters.dateRange !== 'all') {
                const date = new Date(notification.created_at);
                const now = new Date();
                const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

                switch (filters.dateRange) {
                    case 'today':
                        if (diffInDays > 1) return false;
                        break;
                    case 'week':
                        if (diffInDays > 7) return false;
                        break;
                    case 'month':
                        if (diffInDays > 30) return false;
                        break;
                }
            }

            return true;
        });
    }, [notifications, searchQuery, filters]);

    // Types et priorités disponibles
    const availableTypes = useMemo(() =>
        Array.from(new Set(notifications.map(n => n.type))),
        [notifications]
    );

    const availablePriorities = useMemo(() =>
        Array.from(new Set(notifications.map(n => n.priority))),
        [notifications]
    );

    return (
        <div className={`relative ${className}`}>
            {/* Bouton de notification */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white 
                         text-xs font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                )}
            </button>

            {/* Panel du centre de notifications */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute top-12 right-0 z-50 w-96 max-h-[600px] bg-white dark:bg-gray-900
                         border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                        {/* En-tête */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400
                                 text-xs font-medium rounded-full">
                                        {unreadCount} non lues
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    title="Filtres"
                                >
                                    <Filter className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setShowPreferences(!showPreferences)}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    title="Préférences"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Barre de recherche */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher dans les notifications..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600
                           rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filtres */}
                        {showFilters && (
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <div className="space-y-3">
                                    {/* Filtre par statut */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Statut
                                        </label>
                                        <select
                                            value={filters.read}
                                            onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value as any }))}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600
                               rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="all">Toutes</option>
                                            <option value="unread">Non lues</option>
                                            <option value="read">Lues</option>
                                        </select>
                                    </div>

                                    {/* Filtre par type */}
                                    {availableTypes.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Types
                                            </label>
                                            <div className="flex flex-wrap gap-1">
                                                {availableTypes.map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setFilters(prev => ({
                                                                ...prev,
                                                                type: prev.type.includes(type)
                                                                    ? prev.type.filter(t => t !== type)
                                                                    : [...prev.type, type]
                                                            }));
                                                        }}
                                                        className={`
                              px-2 py-1 text-xs rounded transition-colors
                              ${filters.type.includes(type)
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                            }
                            `}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions globales */}
                        {unreadCount > 0 && (
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 
                           hover:underline"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Marquer tout comme lu
                                </button>
                            </div>
                        )}

                        {/* Liste des notifications */}
                        <div className="flex-1 overflow-y-auto max-h-96">
                            {isLoading ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                                    Chargement...
                                </div>
                            ) : filteredNotifications.length > 0 ? (
                                <>
                                    {filteredNotifications.map(notification => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={onMarkAsRead}
                                            onDelete={onDeleteNotification}
                                        />
                                    ))}

                                    {onLoadMore && (
                                        <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={onLoadMore}
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Charger plus
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">
                                        {searchQuery || filters.type.length > 0 || filters.read !== 'all'
                                            ? 'Aucune notification correspondante'
                                            : 'Aucune notification'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default NotificationCenter;
