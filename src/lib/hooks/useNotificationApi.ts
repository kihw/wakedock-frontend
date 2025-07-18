/**
 * Hook et client API pour les notifications temps réel WakeDock
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Types pour les notifications
export interface NotificationData {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'system' | 'security' | 'deployment' | 'monitoring';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    title: string;
    message: string;
    data?: Record<string, any>;
    channel?: string;
    created_at: string;
    read_at?: string;
    expires_at?: string;
    action_url?: string;
    action_label?: string;
    is_read: boolean;
    is_expired: boolean;
}

export interface NotificationPreferences {
    email_enabled: boolean;
    push_enabled: boolean;
    websocket_enabled: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    notification_types: string[];
    priority_filter: string[];
    group_similar: boolean;
    max_notifications: number;
    auto_mark_read: boolean;
}

export interface NotificationStats {
    total_notifications: number;
    unread_notifications: number;
    notifications_by_type: Record<string, number>;
    notifications_by_priority: Record<string, number>;
    recent_notifications: number;
}

export interface CreateNotificationRequest {
    type: string;
    priority?: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    user_id?: string;
    channel?: string;
    expires_in_minutes?: number;
    action_url?: string;
    action_label?: string;
}

// Client API pour les notifications
class NotificationApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string = '/api/v1') {
        this.baseUrl = baseUrl;
    }

    setAuthToken(token: string) {
        this.token = token;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}/notifications${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // Récupérer les notifications
    async getNotifications(limit: number = 50, unreadOnly: boolean = false): Promise<NotificationData[]> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            unread_only: unreadOnly.toString(),
        });
        return this.request<NotificationData[]>(`/?${params}`);
    }

    // Envoyer une notification
    async sendNotification(notification: CreateNotificationRequest): Promise<{ success: boolean; notification_id: string }> {
        return this.request('/send', {
            method: 'POST',
            body: JSON.stringify(notification),
        });
    }

    // Broadcast notification
    async broadcastNotification(
        notification: CreateNotificationRequest,
        userIds?: string[]
    ): Promise<{ success: boolean; notification_id: string; sent_count: number }> {
        return this.request('/broadcast', {
            method: 'POST',
            body: JSON.stringify({ ...notification, user_ids: userIds }),
        });
    }

    // Marquer comme lu
    async markAsRead(notificationId: string): Promise<{ success: boolean }> {
        return this.request(`/${notificationId}/read`, {
            method: 'PATCH',
        });
    }

    // Marquer tout comme lu
    async markAllAsRead(): Promise<{ success: boolean; count: number }> {
        return this.request('/read-all', {
            method: 'PATCH',
        });
    }

    // Supprimer notification
    async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
        return this.request(`/${notificationId}`, {
            method: 'DELETE',
        });
    }

    // Récupérer les préférences
    async getPreferences(): Promise<NotificationPreferences> {
        return this.request<NotificationPreferences>('/preferences');
    }

    // Mettre à jour les préférences
    async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<{ success: boolean }> {
        return this.request('/preferences', {
            method: 'PATCH',
            body: JSON.stringify(preferences),
        });
    }

    // Récupérer les statistiques
    async getStats(): Promise<NotificationStats> {
        return this.request<NotificationStats>('/stats');
    }
}

// Hook pour les notifications WebSocket
export function useNotificationWebSocket(userId: string, channel: string = 'default') {
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/api/v1/notifications/ws/${userId}?channel=${channel}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connecté');
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttempts.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'notification') {
                        const notification = message.data as NotificationData;
                        setNotifications(prev => [notification, ...prev]);
                    } else if (message.type === 'pong') {
                        // Réponse au ping
                    }
                } catch (error) {
                    console.error('Erreur parsing message WebSocket:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket fermé:', event.code, event.reason);
                setIsConnected(false);

                // Tentative de reconnexion automatique
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Backoff exponentiel
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttempts.current++;
                        connect();
                    }, delay);
                } else {
                    setConnectionError('Connexion WebSocket échouée après plusieurs tentatives');
                }
            };

            ws.onerror = (error) => {
                console.error('Erreur WebSocket:', error);
                setConnectionError('Erreur de connexion WebSocket');
            };

        } catch (error) {
            console.error('Erreur création WebSocket:', error);
            setConnectionError('Impossible de créer la connexion WebSocket');
        }
    }, [userId, channel]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((message: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    const markAsRead = useCallback((notificationId: string) => {
        sendMessage({
            type: 'mark_read',
            notification_id: notificationId
        });

        // Met à jour localement
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId
                    ? { ...n, is_read: true, read_at: new Date().toISOString() }
                    : n
            )
        );
    }, [sendMessage]);

    const markAllAsRead = useCallback(() => {
        sendMessage({ type: 'mark_all_read' });

        // Met à jour localement
        setNotifications(prev =>
            prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
    }, [sendMessage]);

    // Ping périodique pour maintenir la connexion
    useEffect(() => {
        const pingInterval = setInterval(() => {
            if (isConnected) {
                sendMessage({ type: 'ping' });
            }
        }, 30000); // Ping toutes les 30 secondes

        return () => clearInterval(pingInterval);
    }, [isConnected, sendMessage]);

    // Connexion automatique au montage
    useEffect(() => {
        connect();
        return disconnect;
    }, [connect, disconnect]);

    return {
        isConnected,
        notifications,
        connectionError,
        connect,
        disconnect,
        markAsRead,
        markAllAsRead,
        clearNotifications: () => setNotifications([])
    };
}

// Hook principal pour les notifications
export function useNotifications(userId: string) {
    const [apiClient] = useState(() => new NotificationApiClient());
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // WebSocket pour les notifications temps réel
    const {
        isConnected: wsConnected,
        notifications: wsNotifications,
        connectionError: wsError,
        markAsRead: wsMarkAsRead,
        markAllAsRead: wsMarkAllAsRead,
        clearNotifications: clearWsNotifications
    } = useNotificationWebSocket(userId);

    // Charge les notifications initiales
    const loadNotifications = useCallback(async (limit: number = 50, unreadOnly: boolean = false) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await apiClient.getNotifications(limit, unreadOnly);
            setNotifications(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
            setIsLoading(false);
        }
    }, [apiClient]);

    // Charge les préférences
    const loadPreferences = useCallback(async () => {
        try {
            const data = await apiClient.getPreferences();
            setPreferences(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des préférences');
        }
    }, [apiClient]);

    // Charge les statistiques
    const loadStats = useCallback(async () => {
        try {
            const data = await apiClient.getStats();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
        }
    }, [apiClient]);

    // Envoie une notification
    const sendNotification = useCallback(async (notification: CreateNotificationRequest) => {
        try {
            setError(null);
            return await apiClient.sendNotification(notification);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
            throw err;
        }
    }, [apiClient]);

    // Marque comme lu (API + WebSocket)
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await apiClient.markAsRead(notificationId);
            wsMarkAsRead(notificationId);

            // Met à jour les notifications locales
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, is_read: true, read_at: new Date().toISOString() }
                        : n
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du marquage');
        }
    }, [apiClient, wsMarkAsRead]);

    // Marque tout comme lu
    const markAllAsRead = useCallback(async () => {
        try {
            await apiClient.markAllAsRead();
            wsMarkAllAsRead();

            // Met à jour les notifications locales
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du marquage');
        }
    }, [apiClient, wsMarkAllAsRead]);

    // Supprime une notification
    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            await apiClient.deleteNotification(notificationId);

            // Supprime localement
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        }
    }, [apiClient]);

    // Met à jour les préférences
    const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
        try {
            await apiClient.updatePreferences(newPreferences);
            setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
        }
    }, [apiClient]);

    // Combine les notifications WebSocket avec les notifications chargées
    const allNotifications = useMemo(() => {
        const wsIds = new Set(wsNotifications.map(n => n.id));
        const filteredExisting = notifications.filter(n => !wsIds.has(n.id));
        return [...wsNotifications, ...filteredExisting].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [notifications, wsNotifications]);

    // Compte les notifications non lues
    const unreadCount = useMemo(() =>
        allNotifications.filter(n => !n.is_read).length,
        [allNotifications]
    );

    // Chargement initial
    useEffect(() => {
        loadNotifications();
        loadPreferences();
        loadStats();
    }, [loadNotifications, loadPreferences, loadStats]);

    return {
        // Données
        notifications: allNotifications,
        preferences,
        stats,
        unreadCount,

        // État
        isLoading,
        error,
        wsConnected,
        wsError,

        // Actions
        loadNotifications,
        loadPreferences,
        loadStats,
        sendNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        clearNotifications: clearWsNotifications,

        // Client API
        apiClient
    };
}

export default NotificationApiClient;
