/**
 * Page de démonstration du système de notifications temps réel WakeDock
 */
import React, { useState, useEffect } from 'react';
import {
    Bell,
    Send,
    Zap,
    Settings,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    Info,
    Shield,
    Server,
    Activity,
    Users,
    Clock,
    X
} from 'lucide-react';
import { useNotifications, CreateNotificationRequest } from '../lib/hooks/useNotificationApi';
import { ToastContainer } from '../lib/components/ToastNotification';
import { NotificationCenter } from '../lib/components/NotificationCenter';
import { NotificationPreferencesPanel } from '../lib/components/NotificationPreferences';

// Données de démonstration
const demoNotifications: Omit<CreateNotificationRequest, 'title' | 'message'>[] = [
    {
        type: 'info',
        priority: 'normal',
        data: { service: 'wakedock-backend', version: '0.5.4' }
    },
    {
        type: 'success',
        priority: 'normal',
        data: { container: 'web-app', action: 'deployed' }
    },
    {
        type: 'warning',
        priority: 'high',
        data: { metric: 'cpu_usage', value: 85, threshold: 80 }
    },
    {
        type: 'error',
        priority: 'urgent',
        data: { service: 'database', error: 'connection_timeout' }
    },
    {
        type: 'security',
        priority: 'high',
        data: { event: 'failed_login_attempt', ip: '192.168.1.100', count: 5 }
    },
    {
        type: 'deployment',
        priority: 'normal',
        data: { pipeline: 'frontend-build', status: 'completed', duration: '2m 34s' }
    },
    {
        type: 'monitoring',
        priority: 'normal',
        data: { alert: 'high_memory_usage', service: 'redis', value: '90%' }
    },
    {
        type: 'system',
        priority: 'low',
        data: { maintenance: 'scheduled', start_time: '2024-01-20T02:00:00Z' }
    }
];

const demoMessages = {
    info: [
        "Nouvelle version de l'API disponible",
        "Synchronisation des données terminée",
        "Rapport mensuel généré avec succès"
    ],
    success: [
        "Déploiement réussi en production",
        "Sauvegarde automatique effectuée",
        "Configuration mise à jour avec succès"
    ],
    warning: [
        "Utilisation CPU élevée détectée",
        "Espace disque faible sur le serveur",
        "Connexions simultanées proches de la limite"
    ],
    error: [
        "Échec de connexion à la base de données",
        "Service indisponible temporairement",
        "Erreur lors du traitement des données"
    ],
    security: [
        "Tentatives de connexion suspectes détectées",
        "Certificat SSL arrivant à expiration",
        "Activité anormale sur le compte admin"
    ],
    deployment: [
        "Pipeline CI/CD en cours d'exécution",
        "Déploiement automatique programmé",
        "Tests d'intégration terminés"
    ],
    monitoring: [
        "Alerte de surveillance déclenchée",
        "Métriques système hors seuil",
        "Service de monitoring redémarré"
    ],
    system: [
        "Maintenance programmée ce week-end",
        "Mise à jour de sécurité installée",
        "Nettoyage automatique des logs effectué"
    ]
};

interface NotificationStats {
    sent: number;
    received: number;
    errors: number;
}

export default function NotificationDemo() {
    const userId = 'demo-user-123'; // ID utilisateur de démo
    const {
        notifications,
        preferences,
        stats,
        unreadCount,
        isLoading,
        error,
        wsConnected,
        wsError,
        loadNotifications,
        sendNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences
    } = useNotifications(userId);

    const [showPreferences, setShowPreferences] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [demoStats, setDemoStats] = useState<NotificationStats>({ sent: 0, received: 0, errors: 0 });
    const [toastNotifications, setToastNotifications] = useState<any[]>([]);
    const [autoDemo, setAutoDemo] = useState(false);

    // Statistiques temps réel
    useEffect(() => {
        setDemoStats(prev => ({
            ...prev,
            received: notifications.length
        }));
    }, [notifications]);

    // Démonstration automatique
    useEffect(() => {
        if (!autoDemo) return;

        const interval = setInterval(() => {
            sendRandomNotification();
        }, 5000); // Une notification toutes les 5 secondes

        return () => clearInterval(interval);
    }, [autoDemo]);

    // Gestion des toasts
    useEffect(() => {
        // Ajoute les nouvelles notifications aux toasts
        const recentNotifications = notifications.filter((n: any) =>
            new Date().getTime() - new Date(n.created_at).getTime() < 10000 // 10 secondes
        );
        setToastNotifications(recentNotifications.slice(0, 3)); // Max 3 toasts
    }, [notifications]);

    const sendRandomNotification = async () => {
        try {
            const template = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
            if (!template) return;

            const messages = demoMessages[template.type as keyof typeof demoMessages];
            if (!messages) return;

            const message = messages[Math.floor(Math.random() * messages.length)];
            if (!message) return;

            const notification: CreateNotificationRequest = {
                ...template,
                title: `${template.type.charAt(0).toUpperCase() + template.type.slice(1)} - ${template.priority}`,
                message,
                expires_in_minutes: Math.random() > 0.5 ? 60 : undefined,
                action_url: Math.random() > 0.7 ? 'https://github.com/wakedock/wakedock' : undefined,
                action_label: Math.random() > 0.7 ? 'Voir les détails' : undefined
            };

            await sendNotification(notification);
            setDemoStats(prev => ({ ...prev, sent: prev.sent + 1 }));
        } catch (error) {
            console.error('Erreur envoi notification demo:', error);
            setDemoStats(prev => ({ ...prev, errors: prev.errors + 1 }));
        }
    };

    const sendBroadcastDemo = async () => {
        try {
            const notification: CreateNotificationRequest = {
                type: 'system',
                priority: 'normal',
                title: 'Notification Broadcast de Démonstration',
                message: 'Ceci est un message diffusé à tous les utilisateurs connectés pour démontrer le système de broadcast.',
                data: {
                    broadcast: true,
                    timestamp: new Date().toISOString(),
                    demo_mode: true
                }
            };

            await sendNotification(notification);
            setDemoStats(prev => ({ ...prev, sent: prev.sent + 1 }));
        } catch (error) {
            console.error('Erreur broadcast demo:', error);
            setDemoStats(prev => ({ ...prev, errors: prev.errors + 1 }));
        }
    };

    const removeToast = (id: string) => {
        setToastNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markToastAsRead = (id: string) => {
        markAsRead(id);
        removeToast(id);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* En-tête */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Bell className="w-8 h-8 text-blue-500" />
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Démonstration Notifications WakeDock
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Système de notifications temps réel v0.5.4
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Statut WebSocket */}
                            <div className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-gray-600 dark:text-gray-400">
                                    {wsConnected ? 'Connecté' : 'Déconnecté'}
                                </span>
                            </div>

                            {/* Centre de notifications */}
                            <NotificationCenter
                                notifications={notifications}
                                unreadCount={unreadCount}
                                preferences={preferences}
                                isLoading={isLoading}
                                onMarkAsRead={markAsRead}
                                onMarkAllAsRead={markAllAsRead}
                                onDeleteNotification={deleteNotification}
                                onUpdatePreferences={updatePreferences}
                                onLoadMore={() => loadNotifications(100)}
                            />

                            {/* Bouton préférences */}
                            <button
                                onClick={() => setShowPreferences(!showPreferences)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Préférences"
                            >
                                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>

                            {/* Bouton statistiques */}
                            <button
                                onClick={() => setShowStats(!showStats)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Statistiques"
                            >
                                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel de contrôle */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Contrôles de Démonstration
                            </h2>

                            <div className="space-y-4">
                                {/* Démonstration automatique */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-blue-500" />
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            Demo automatique
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setAutoDemo(!autoDemo)}
                                        className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${autoDemo
                                                ? 'bg-blue-500 dark:bg-blue-600'
                                                : 'bg-gray-300 dark:bg-gray-600'
                                            }
                    `}
                                    >
                                        <div
                                            className={`
                        absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                        ${autoDemo ? 'translate-x-6' : 'translate-x-0.5'}
                      `}
                                        />
                                    </button>
                                </div>

                                {/* Actions manuelles */}
                                <div className="space-y-3">
                                    <button
                                        onClick={sendRandomNotification}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 
                             bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        Envoyer notification aléatoire
                                    </button>

                                    <button
                                        onClick={sendBroadcastDemo}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 
                             bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <Users className="w-4 h-4" />
                                        Envoyer broadcast
                                    </button>

                                    <button
                                        onClick={markAllAsRead}
                                        disabled={unreadCount === 0}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 
                             bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Marquer tout comme lu
                                    </button>
                                </div>

                                {/* Statistiques rapides */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        Statistiques
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {demoStats.sent}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                Envoyées
                                            </div>
                                        </div>
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {demoStats.received}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                Reçues
                                            </div>
                                        </div>
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                                {unreadCount}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                Non lues
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Types de notifications */}
                        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Types de notifications
                            </h3>
                            <div className="space-y-2">
                                {Object.entries({
                                    info: { icon: Info, label: 'Information', color: 'text-blue-500' },
                                    success: { icon: CheckCircle, label: 'Succès', color: 'text-green-500' },
                                    warning: { icon: AlertTriangle, label: 'Avertissement', color: 'text-yellow-500' },
                                    error: { icon: AlertTriangle, label: 'Erreur', color: 'text-red-500' },
                                    security: { icon: Shield, label: 'Sécurité', color: 'text-purple-500' },
                                    deployment: { icon: Server, label: 'Déploiement', color: 'text-indigo-500' },
                                    monitoring: { icon: Activity, label: 'Monitoring', color: 'text-teal-500' },
                                    system: { icon: Server, label: 'Système', color: 'text-gray-500' }
                                }).map(([type, config]) => (
                                    <div key={type} className="flex items-center gap-2 text-sm">
                                        <config.icon className={`w-4 h-4 ${config.color}`} />
                                        <span className="text-gray-700 dark:text-gray-300">{config.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Zone principale */}
                    <div className="lg:col-span-2">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-medium">Erreur:</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        {wsError && (
                            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-medium">WebSocket:</span>
                                    {wsError}
                                </div>
                            </div>
                        )}

                        {/* Préférences */}
                        {showPreferences && (
                            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <NotificationPreferencesPanel
                                    preferences={preferences}
                                    onUpdatePreferences={updatePreferences}
                                    onClose={() => setShowPreferences(false)}
                                />
                            </div>
                        )}

                        {/* Statistiques détaillées */}
                        {showStats && stats && (
                            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Statistiques détaillées
                                    </h3>
                                    <button
                                        onClick={() => setShowStats(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {stats.total_notifications}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {stats.unread_notifications}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Non lues</div>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {stats.recent_notifications}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">24h</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {Object.keys(stats.notifications_by_type).length}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Types</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Guide de démonstration
                            </h3>

                            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                                rounded-full flex items-center justify-center font-bold text-xs">
                                        1
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 dark:text-gray-100">Notifications temps réel:</strong>
                                        <span className="ml-1">
                                            Activez la "Demo automatique" pour recevoir des notifications aléatoirement toutes les 5 secondes.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                                rounded-full flex items-center justify-center font-bold text-xs">
                                        2
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 dark:text-gray-100">Centre de notifications:</strong>
                                        <span className="ml-1">
                                            Cliquez sur l'icône de cloche en haut à droite pour ouvrir le centre de notifications.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                                rounded-full flex items-center justify-center font-bold text-xs">
                                        3
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 dark:text-gray-100">Toasts notifications:</strong>
                                        <span className="ml-1">
                                            Les nouvelles notifications apparaissent automatiquement en tant que toasts en haut à droite.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                                rounded-full flex items-center justify-center font-bold text-xs">
                                        4
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 dark:text-gray-100">Préférences:</strong>
                                        <span className="ml-1">
                                            Configurez vos préférences de notifications via l'icône d'engrenage.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Toasts notifications */}
            <ToastContainer
                notifications={toastNotifications}
                onClose={removeToast}
                onMarkAsRead={markToastAsRead}
                position="top-right"
                maxToasts={3}
                autoClose={true}
                autoCloseDelay={6000}
            />
        </div>
    );
}
