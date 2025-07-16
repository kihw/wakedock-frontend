import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Bell, Plus, Settings, Download, Upload, RefreshCw,
    AlertTriangle, Info, XCircle, CheckCircle, Clock,
    Mail, MessageSquare, Webhook, Send, Trash2, Edit3,
    Filter, Search, Calendar, BarChart3, TrendingUp,
    ExternalLink, Zap, Volume2, VolumeX, Eye, EyeOff, TestTube
} from 'lucide-react';

// Types pour les alertes
interface AlertRule {
    rule_id: string;
    name: string;
    description: string;
    enabled: boolean;
    metric_type: string;
    threshold_value: number;
    comparison_operator: string;
    duration_minutes: number;
    container_filters?: Record<string, string>;
    service_filters?: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    notification_targets: string[];
    escalation_enabled: boolean;
    escalation_delay_minutes: number;
    escalation_targets?: Record<string, string[]>;
    suppression_enabled: boolean;
    suppression_duration_minutes: number;
    grouping_keys?: string[];
    created_at: string;
    updated_at: string;
}

interface NotificationTarget {
    target_id: string;
    channel: 'email' | 'webhook' | 'slack' | 'discord' | 'teams' | 'telegram';
    name: string;
    enabled: boolean;
    has_email_config: boolean;
    has_webhook_config: boolean;
    has_slack_config: boolean;
    has_discord_config: boolean;
    has_teams_config: boolean;
    has_telegram_config: boolean;
}

interface AlertInstance {
    alert_id: string;
    rule_id: string;
    rule_name: string;
    container_id: string;
    container_name: string;
    service_name?: string;
    metric_type: string;
    current_value: number;
    threshold_value: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    state: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
    triggered_at: string;
    acknowledged_at?: string;
    resolved_at?: string;
    acknowledged_by?: string;
    escalation_level: 'level_1' | 'level_2' | 'level_3';
    escalated_at?: string;
    last_notification_at?: string;
    notifications_sent_count: number;
    group_key?: string;
    similar_alerts_count: number;
}

interface AlertStats {
    total_alerts: number;
    active_alerts: number;
    acknowledged_alerts: number;
    resolved_alerts: number;
    alerts_by_severity: Record<string, number>;
    alerts_by_state: Record<string, number>;
    alerts_by_rule: Record<string, number>;
    top_triggered_rules: Array<{ rule_name: string; count: number }>;
    most_affected_containers: Array<{ container_name: string; count: number }>;
    escalated_alerts: number;
    suppressed_alerts: number;
}

const AlertsManagementDashboard: React.FC = () => {
    // État principal
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Données des alertes
    const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
    const [notificationTargets, setNotificationTargets] = useState<NotificationTarget[]>([]);
    const [activeAlerts, setActiveAlerts] = useState<AlertInstance[]>([]);
    const [alertsHistory, setAlertsHistory] = useState<AlertInstance[]>([]);
    const [alertStats, setAlertStats] = useState<AlertStats | null>(null);

    // États des formulaires
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [showTargetForm, setShowTargetForm] = useState(false);
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
    const [editingTarget, setEditingTarget] = useState<NotificationTarget | null>(null);

    // Filtres et recherche
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string[]>([]);
    const [stateFilter, setStateFilter] = useState<string[]>([]);
    const [ruleFilter, setRuleFilter] = useState('');

    // Configuration temps réel
    const [realTimeEnabled, setRealTimeEnabled] = useState(true);
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(30000); // 30 secondes
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Chargement initial des données
    useEffect(() => {
        loadInitialData();
    }, []);

    // Configuration du rafraîchissement automatique
    useEffect(() => {
        if (realTimeEnabled) {
            intervalRef.current = setInterval(() => {
                refreshData();
            }, autoRefreshInterval);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [realTimeEnabled, autoRefreshInterval]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadAlertRules(),
                loadNotificationTargets(),
                loadActiveAlerts(),
                loadAlertsHistory(),
                loadAlertStats()
            ]);
        } catch (err) {
            setError(`Erreur chargement données: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        try {
            if (activeTab === 'overview' || activeTab === 'active') {
                await loadActiveAlerts();
                await loadAlertStats();
            }
            if (activeTab === 'history') {
                await loadAlertsHistory();
            }
        } catch (err) {
            console.error('Erreur rafraîchissement:', err);
        }
    };

    const loadAlertRules = async () => {
        try {
            const response = await fetch('/api/v1/alerts/rules');
            if (!response.ok) throw new Error('Erreur chargement règles');
            const rules = await response.json();
            setAlertRules(rules);
        } catch (err) {
            throw new Error(`Erreur chargement règles: ${err}`);
        }
    };

    const loadNotificationTargets = async () => {
        try {
            const response = await fetch('/api/v1/alerts/targets');
            if (!response.ok) throw new Error('Erreur chargement cibles');
            const targets = await response.json();
            setNotificationTargets(targets);
        } catch (err) {
            throw new Error(`Erreur chargement cibles: ${err}`);
        }
    };

    const loadActiveAlerts = async () => {
        try {
            const response = await fetch('/api/v1/alerts/active');
            if (!response.ok) throw new Error('Erreur chargement alertes actives');
            const alerts = await response.json();
            setActiveAlerts(alerts);
        } catch (err) {
            throw new Error(`Erreur chargement alertes actives: ${err}`);
        }
    };

    const loadAlertsHistory = async () => {
        try {
            const response = await fetch('/api/v1/alerts/history?days=7');
            if (!response.ok) throw new Error('Erreur chargement historique');
            const history = await response.json();
            setAlertsHistory(history);
        } catch (err) {
            throw new Error(`Erreur chargement historique: ${err}`);
        }
    };

    const loadAlertStats = async () => {
        try {
            const response = await fetch('/api/v1/alerts/stats?days=30');
            if (!response.ok) throw new Error('Erreur chargement statistiques');
            const stats = await response.json();
            setAlertStats(stats);
        } catch (err) {
            throw new Error(`Erreur chargement statistiques: ${err}`);
        }
    };

    const acknowledgeAlert = async (alertId: string) => {
        try {
            const response = await fetch(`/api/v1/alerts/acknowledge/${alertId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ acknowledged_by: 'user' })
            });

            if (!response.ok) throw new Error('Erreur acquittement');
            await loadActiveAlerts();
        } catch (err) {
            setError(`Erreur acquittement: ${err}`);
        }
    };

    const testNotificationTarget = async (targetId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/alerts/targets/${targetId}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test_message: 'Test de notification WakeDock' })
            });

            if (!response.ok) throw new Error('Erreur test notification');
            const result = await response.json();

            if (result.success) {
                alert('Notification envoyée avec succès !');
            } else {
                alert(`Échec envoi notification: ${result.message}`);
            }
        } catch (err) {
            setError(`Erreur test notification: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const exportAlerts = async (format: 'json' | 'csv') => {
        try {
            const response = await fetch('/api/v1/alerts/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    format,
                    include_resolved: true,
                    date_range_days: 30
                })
            });

            if (!response.ok) throw new Error('Erreur export');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wakedock_alerts_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(`Erreur export: ${err}`);
        }
    };

    // Utilitaires pour le filtrage
    const getFilteredAlerts = (alerts: AlertInstance[]) => {
        return alerts.filter(alert => {
            const matchesSearch = searchTerm === '' ||
                alert.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.container_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (alert.service_name && alert.service_name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesSeverity = severityFilter.length === 0 || severityFilter.includes(alert.severity);
            const matchesState = stateFilter.length === 0 || stateFilter.includes(alert.state);
            const matchesRule = ruleFilter === '' || alert.rule_id === ruleFilter;

            return matchesSearch && matchesSeverity && matchesState && matchesRule;
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'text-blue-600 bg-blue-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case 'active': return 'text-red-600 bg-red-100';
            case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
            case 'resolved': return 'text-green-600 bg-green-100';
            case 'suppressed': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStateIcon = (state: string) => {
        switch (state) {
            case 'active': return <AlertTriangle className="w-4 h-4" />;
            case 'acknowledged': return <Info className="w-4 h-4" />;
            case 'resolved': return <CheckCircle className="w-4 h-4" />;
            case 'suppressed': return <VolumeX className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'email': return <Mail className="w-4 h-4" />;
            case 'slack': return <MessageSquare className="w-4 h-4" />;
            case 'webhook': return <Webhook className="w-4 h-4" />;
            case 'discord': return <MessageSquare className="w-4 h-4" />;
            case 'teams': return <MessageSquare className="w-4 h-4" />;
            case 'telegram': return <Send className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('fr-FR');
    };

    const formatDuration = (start: string, end?: string) => {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date();
        const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60);

        if (duration < 60) return `${duration}m`;
        if (duration < 1440) return `${Math.floor(duration / 60)}h${duration % 60}m`;
        return `${Math.floor(duration / 1440)}j${Math.floor((duration % 1440) / 60)}h`;
    };

    // Rendu des onglets
    const renderTabButton = (id: string, label: string, icon: React.ReactNode, badge?: number) => (
        <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            {icon}
            <span>{label}</span>
            {badge !== undefined && (
                <span className={`px-2 py-1 text-xs rounded-full ${activeTab === id
                        ? 'bg-white text-blue-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                    {badge}
                </span>
            )}
        </button>
    );

    // Rendu de la vue d'ensemble
    const renderOverview = () => (
        <div className="space-y-6">
            {/* Statistiques globales */}
            {alertStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Alertes Actives</p>
                                <p className="text-3xl font-bold text-red-600">{alertStats.active_alerts}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Alertes (30j)</p>
                                <p className="text-3xl font-bold text-blue-600">{alertStats.total_alerts}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Alertes Acquittées</p>
                                <p className="text-3xl font-bold text-yellow-600">{alertStats.acknowledged_alerts}</p>
                            </div>
                            <Info className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Alertes Résolues</p>
                                <p className="text-3xl font-bold text-green-600">{alertStats.resolved_alerts}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>
            )}

            {/* Répartition par sévérité */}
            {alertStats && (
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold mb-4">Répartition par Sévérité</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(alertStats.alerts_by_severity).map(([severity, count]) => (
                            <div key={severity} className={`p-4 rounded-lg ${getSeverityColor(severity)}`}>
                                <p className="text-lg font-bold">{count}</p>
                                <p className="text-sm capitalize">{severity}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Règles les plus déclenchées */}
            {alertStats && alertStats.top_triggered_rules.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold mb-4">Règles les Plus Déclenchées</h3>
                    <div className="space-y-3">
                        {alertStats.top_triggered_rules.slice(0, 5).map((rule) => (
                            <div key={rule.rule_name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span className="font-medium">{rule.rule_name}</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                                    {rule.count} alertes
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alertes actives récentes */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Alertes Actives Récentes</h3>
                    <button
                        onClick={() => setActiveTab('active')}
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                        <span>Voir toutes</span>
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>

                {activeAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.alert_id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded ${getSeverityColor(alert.severity)}`}>
                                {getStateIcon(alert.state)}
                            </div>
                            <div>
                                <p className="font-medium">{alert.rule_name}</p>
                                <p className="text-sm text-gray-600">
                                    {alert.container_name} • {formatDateTime(alert.triggered_at)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                            </span>
                            {alert.state === 'active' && (
                                <button
                                    onClick={() => acknowledgeAlert(alert.alert_id)}
                                    className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded text-sm hover:bg-yellow-200"
                                >
                                    Acquitter
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {activeAlerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                        <p>Aucune alerte active</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Rendu des alertes actives
    const renderActiveAlerts = () => {
        const filteredAlerts = getFilteredAlerts(activeAlerts);

        return (
            <div className="space-y-6">
                {/* Filtres et actions */}
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher dans les alertes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <select
                            value={ruleFilter}
                            onChange={(e) => setRuleFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Toutes les règles</option>
                            {alertRules.map((rule) => (
                                <option key={rule.rule_id} value={rule.rule_id}>
                                    {rule.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={refreshData}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Actualiser</span>
                        </button>
                    </div>
                </div>

                {/* Liste des alertes */}
                <div className="bg-white rounded-lg shadow border overflow-hidden">
                    {filteredAlerts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Alerte
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Conteneur
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Métrique
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sévérité
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            État
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Durée
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredAlerts.map((alert) => (
                                        <tr key={alert.alert_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{alert.rule_name}</p>
                                                    <p className="text-sm text-gray-500">{alert.rule_id}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium">{alert.container_name}</p>
                                                    {alert.service_name && (
                                                        <p className="text-sm text-gray-500">{alert.service_name}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium">{alert.metric_type}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {alert.current_value} / {alert.threshold_value}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                                    {alert.severity.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStateColor(alert.state)}`}>
                                                    {getStateIcon(alert.state)}
                                                    <span>{alert.state.toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDuration(alert.triggered_at, alert.resolved_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    {alert.state === 'active' && (
                                                        <button
                                                            onClick={() => acknowledgeAlert(alert.alert_id)}
                                                            className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded text-sm hover:bg-yellow-200"
                                                        >
                                                            Acquitter
                                                        </button>
                                                    )}
                                                    <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200">
                                                        Détails
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte active</h3>
                            <p className="text-gray-500">Tous vos conteneurs fonctionnent normalement.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Rendu des règles d'alertes
    const renderAlertRules = () => (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Règles d'Alertes</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowRuleForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouvelle Règle</span>
                    </button>
                </div>
            </div>

            {/* Liste des règles */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                {alertRules.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Règle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Métrique
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Seuil
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sévérité
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        État
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Notifications
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {alertRules.map((rule) => (
                                    <tr key={rule.rule_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{rule.name}</p>
                                                <p className="text-sm text-gray-500">{rule.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{rule.metric_type}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">
                                                {rule.comparison_operator} {rule.threshold_value}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Pendant {rule.duration_minutes}min
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                                                {rule.severity.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${rule.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {rule.enabled ? 'ACTIVÉE' : 'DÉSACTIVÉE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-1">
                                                {rule.notification_targets.slice(0, 3).map((targetId) => {
                                                    const target = notificationTargets.find(t => t.target_id === targetId);
                                                    return target ? (
                                                        <div key={targetId} className="p-1 bg-gray-100 rounded">
                                                            {getChannelIcon(target.channel)}
                                                        </div>
                                                    ) : null;
                                                })}
                                                {rule.notification_targets.length > 3 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{rule.notification_targets.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setEditingRule(rule)}
                                                    className="p-2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune règle d'alerte</h3>
                        <p className="text-gray-500 mb-4">Créez votre première règle d'alerte pour surveiller vos conteneurs.</p>
                        <button
                            onClick={() => setShowRuleForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Créer une règle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // Rendu des cibles de notification
    const renderNotificationTargets = () => (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Cibles de Notification</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowTargetForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouvelle Cible</span>
                    </button>
                </div>
            </div>

            {/* Liste des cibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notificationTargets.map((target) => (
                    <div key={target.target_id} className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded">
                                    {getChannelIcon(target.channel)}
                                </div>
                                <div>
                                    <h3 className="font-medium">{target.name}</h3>
                                    <p className="text-sm text-gray-500 capitalize">{target.channel}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${target.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {target.enabled ? 'ACTIVÉE' : 'DÉSACTIVÉE'}
                            </span>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => testNotificationTarget(target.target_id)}
                                disabled={loading}
                                className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm flex items-center justify-center space-x-1"
                            >
                                <TestTube className="w-4 h-4" />
                                <span>Tester</span>
                            </button>
                            <button
                                onClick={() => setEditingTarget(target)}
                                className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {notificationTargets.length === 0 && (
                <div className="bg-white p-12 rounded-lg shadow border text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune cible de notification</h3>
                    <p className="text-gray-500 mb-4">Configurez vos canaux de notification pour recevoir des alertes.</p>
                    <button
                        onClick={() => setShowTargetForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Ajouter une cible
                    </button>
                </div>
            )}
        </div>
    );

    // Rendu principal
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                        <Bell className="w-8 h-8 text-blue-600" />
                        <span>Alertes et Notifications</span>
                    </h1>
                    <p className="text-gray-600">Surveillez et gérez les alertes de vos conteneurs</p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Contrôle temps réel */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                            className={`p-2 rounded ${realTimeEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {realTimeEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>
                        <span className="text-sm text-gray-600">
                            {realTimeEnabled ? 'Temps réel activé' : 'Temps réel désactivé'}
                        </span>
                    </div>

                    {/* Export */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => exportAlerts('json')}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center space-x-1"
                        >
                            <Download className="w-4 h-4" />
                            <span>JSON</span>
                        </button>
                        <button
                            onClick={() => exportAlerts('csv')}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center space-x-1"
                        >
                            <Download className="w-4 h-4" />
                            <span>CSV</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-600 hover:text-red-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation des onglets */}
            <div className="flex flex-wrap gap-2">
                {renderTabButton('overview', 'Vue d\'ensemble', <BarChart3 className="w-4 h-4" />)}
                {renderTabButton('active', 'Alertes Actives', <AlertTriangle className="w-4 h-4" />, activeAlerts.length)}
                {renderTabButton('rules', 'Règles', <Settings className="w-4 h-4" />, alertRules.length)}
                {renderTabButton('targets', 'Notifications', <Bell className="w-4 h-4" />, notificationTargets.length)}
                {renderTabButton('history', 'Historique', <Calendar className="w-4 h-4" />)}
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'active' && renderActiveAlerts()}
            {activeTab === 'rules' && renderAlertRules()}
            {activeTab === 'targets' && renderNotificationTargets()}
            {activeTab === 'history' && (
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold mb-4">Historique des Alertes</h3>
                    <p className="text-gray-500">Implémentation de l'historique en cours...</p>
                </div>
            )}
        </div>
    );
};

export default AlertsManagementDashboard;
