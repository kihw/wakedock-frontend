/**
 * Interface de préférences pour les notifications WakeDock
 */
import React, { useState, useEffect } from 'react';
import {
    Bell,
    Mail,
    Smartphone,
    Globe,
    Clock,
    Filter,
    Save,
    RotateCcw,
    Check,
    X
} from 'lucide-react';
import { NotificationPreferences } from '../hooks/useNotificationApi';

interface NotificationPreferencesProps {
    preferences: NotificationPreferences | null;
    onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
    onClose?: () => void;
    className?: string;
}

interface PreferenceToggleProps {
    icon: React.ElementType;
    label: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

interface TimePickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

function PreferenceToggle({ icon: Icon, label, description, enabled, onChange }: PreferenceToggleProps) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>

            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {label}
                    </h4>

                    <button
                        onClick={() => onChange(!enabled)}
                        className={`
              relative w-12 h-6 rounded-full transition-colors
              ${enabled
                                ? 'bg-blue-500 dark:bg-blue-600'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }
            `}
                    >
                        <div
                            className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                ${enabled ? 'translate-x-6' : 'translate-x-0.5'}
              `}
                        />
                    </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                </p>
            </div>
        </div>
    );
}

function TimePicker({ label, value, onChange }: TimePickerProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <input
                type="time"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

export function NotificationPreferencesPanel({
    preferences,
    onUpdatePreferences,
    onClose,
    className = ''
}: NotificationPreferencesProps) {
    const [localPreferences, setLocalPreferences] = useState<Partial<NotificationPreferences>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Types de notifications disponibles
    const notificationTypes = [
        { value: 'info', label: 'Informations', description: 'Notifications générales et informatives' },
        { value: 'warning', label: 'Avertissements', description: 'Alertes et avertissements importants' },
        { value: 'error', label: 'Erreurs', description: 'Notifications d\'erreurs critiques' },
        { value: 'success', label: 'Succès', description: 'Confirmations d\'actions réussies' },
        { value: 'system', label: 'Système', description: 'Notifications système et maintenance' },
        { value: 'security', label: 'Sécurité', description: 'Alertes de sécurité et audit' },
        { value: 'deployment', label: 'Déploiement', description: 'Notifications de déploiement et CI/CD' },
        { value: 'monitoring', label: 'Monitoring', description: 'Alertes de surveillance et métriques' },
    ];

    // Niveaux de priorité disponibles
    const priorityLevels = [
        { value: 'low', label: 'Faible', description: 'Notifications peu importantes' },
        { value: 'normal', label: 'Normale', description: 'Notifications standard' },
        { value: 'high', label: 'Élevée', description: 'Notifications importantes' },
        { value: 'urgent', label: 'Urgente', description: 'Notifications critiques et urgentes' },
    ];

    // Initialise les préférences locales
    useEffect(() => {
        if (preferences) {
            setLocalPreferences(preferences);
        }
    }, [preferences]);

    // Détecte les changements
    useEffect(() => {
        if (preferences) {
            const changed = Object.keys(localPreferences).some(key => {
                const localValue = localPreferences[key as keyof NotificationPreferences];
                const originalValue = preferences[key as keyof NotificationPreferences];
                return JSON.stringify(localValue) !== JSON.stringify(originalValue);
            });
            setHasChanges(changed);
        }
    }, [localPreferences, preferences]);

    const updateLocalPreference = <K extends keyof NotificationPreferences>(
        key: K,
        value: NotificationPreferences[K]
    ) => {
        setLocalPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveMessage(null);

            await onUpdatePreferences(localPreferences);

            setSaveMessage({ type: 'success', text: 'Préférences sauvegardées avec succès!' });
            setHasChanges(false);

            // Efface le message après 3 secondes
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            setSaveMessage({
                type: 'error',
                text: 'Erreur lors de la sauvegarde des préférences'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (preferences) {
            setLocalPreferences(preferences);
            setHasChanges(false);
        }
    };

    const toggleNotificationType = (type: string) => {
        const currentTypes = localPreferences.notification_types || [];
        const newTypes = currentTypes.includes(type)
            ? currentTypes.filter(t => t !== type)
            : [...currentTypes, type];

        updateLocalPreference('notification_types', newTypes);
    };

    const togglePriorityFilter = (priority: string) => {
        const currentPriorities = localPreferences.priority_filter || [];
        const newPriorities = currentPriorities.includes(priority)
            ? currentPriorities.filter(p => p !== priority)
            : [...currentPriorities, priority];

        updateLocalPreference('priority_filter', newPriorities);
    };

    if (!preferences) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Chargement des préférences...</p>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Préférences de notifications
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Personnalisez vos notifications pour une expérience optimale
                    </p>
                </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Message de sauvegarde */}
            {saveMessage && (
                <div className={`
          p-3 rounded-lg flex items-center gap-2
          ${saveMessage.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }
        `}>
                    {saveMessage.type === 'success' ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <X className="w-4 h-4" />
                    )}
                    <span className="text-sm">{saveMessage.text}</span>
                </div>
            )}

            {/* Canaux de notification */}
            <section>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Canaux de notification
                </h3>

                <div className="space-y-4">
                    <PreferenceToggle
                        icon={Mail}
                        label="Notifications par email"
                        description="Recevez les notifications importantes par email"
                        enabled={localPreferences.email_enabled ?? true}
                        onChange={(enabled) => updateLocalPreference('email_enabled', enabled)}
                    />

                    <PreferenceToggle
                        icon={Smartphone}
                        label="Notifications push"
                        description="Notifications push sur votre navigateur ou appareil mobile"
                        enabled={localPreferences.push_enabled ?? true}
                        onChange={(enabled) => updateLocalPreference('push_enabled', enabled)}
                    />

                    <PreferenceToggle
                        icon={Globe}
                        label="Notifications WebSocket"
                        description="Notifications temps réel dans l'interface web"
                        enabled={localPreferences.websocket_enabled ?? true}
                        onChange={(enabled) => updateLocalPreference('websocket_enabled', enabled)}
                    />
                </div>
            </section>

            {/* Heures de silence */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Heures de silence
                    </h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Définissez une période pendant laquelle les notifications non urgentes seront silencieuses
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TimePicker
                        label="Début"
                        value={localPreferences.quiet_hours_start || ''}
                        onChange={(value) => updateLocalPreference('quiet_hours_start', value)}
                    />

                    <TimePicker
                        label="Fin"
                        value={localPreferences.quiet_hours_end || ''}
                        onChange={(value) => updateLocalPreference('quiet_hours_end', value)}
                    />
                </div>
            </section>

            {/* Types de notifications */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Types de notifications
                    </h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Choisissez les types de notifications que vous souhaitez recevoir
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {notificationTypes.map(type => (
                        <label
                            key={type.value}
                            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700
                       hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={(localPreferences.notification_types || []).includes(type.value)}
                                onChange={() => toggleNotificationType(type.value)}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />

                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {type.label}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {type.description}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </section>

            {/* Niveaux de priorité */}
            <section>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Niveaux de priorité
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Sélectionnez les niveaux de priorité que vous souhaitez recevoir
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {priorityLevels.map(priority => (
                        <label
                            key={priority.value}
                            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700
                       hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={(localPreferences.priority_filter || []).includes(priority.value)}
                                onChange={() => togglePriorityFilter(priority.value)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />

                            <div className="text-sm">
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {priority.label}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </section>

            {/* Options avancées */}
            <section>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Options avancées
                </h3>

                <div className="space-y-4">
                    <PreferenceToggle
                        icon={Filter}
                        label="Grouper les notifications similaires"
                        description="Regroupe automatiquement les notifications du même type"
                        enabled={localPreferences.group_similar ?? true}
                        onChange={(enabled) => updateLocalPreference('group_similar', enabled)}
                    />

                    <PreferenceToggle
                        icon={Check}
                        label="Marquer automatiquement comme lu"
                        description="Marque les notifications comme lues après affichage"
                        enabled={localPreferences.auto_mark_read ?? false}
                        onChange={(enabled) => updateLocalPreference('auto_mark_read', enabled)}
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nombre maximum de notifications conservées
                        </label>
                        <input
                            type="number"
                            min="10"
                            max="1000"
                            value={localPreferences.max_notifications || 100}
                            onChange={(e) => updateLocalPreference('max_notifications', parseInt(e.target.value) || 100)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Les anciennes notifications seront automatiquement supprimées
                        </p>
                    </div>
                </div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400
                   hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50
                   disabled:cursor-not-allowed transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                </button>

                <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg
                   hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
                >
                    {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </div>
        </div>
    );
}

export default NotificationPreferencesPanel;
