'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/controllers/hooks/useTheme'
import { useToast } from '@/controllers/hooks/useToast'
import FileUpload from '@/views/molecules/FileUpload'
import { Button } from '@/views/atoms/Button'
import { Card } from '@/views/atoms/Card'
import { Badge } from '@/views/atoms/Badge'
import { Input } from '@/views/atoms/Input'
import { cn } from '@/lib/utils'

interface SettingsSection {
    id: string
    title: string
    description: string
    icon: React.ReactNode
}

const AdvancedSettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme()
    const { addToast } = useToast()
    const [activeSection, setActiveSection] = useState<string>('general')
    const [settings, setSettings] = useState({
        general: {
            siteName: 'WakeDock',
            adminEmail: 'admin@wakedock.com',
            timezone: 'Europe/Paris',
            language: 'fr',
            autoRefresh: true,
            refreshInterval: 5000,
        },
        appearance: {
            theme: theme,
            compactMode: false,
            animations: true,
            showTooltips: true,
            dateFormat: 'dd/MM/yyyy',
            timeFormat: '24h',
        },
        notifications: {
            emailNotifications: true,
            pushNotifications: true,
            soundEnabled: true,
            serviceAlerts: true,
            systemUpdates: true,
            securityAlerts: true,
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordPolicy: 'medium',
            loginAttempts: 5,
            requireHttps: true,
        },
        backup: {
            autoBackup: true,
            backupInterval: 'daily',
            retentionDays: 30,
            includeServices: true,
            includeConfigs: true,
        },
        integrations: {
            webhookUrl: '',
            slackEnabled: false,
            discordEnabled: false,
            telegramEnabled: false,
        }
    })

    const sections: SettingsSection[] = [
        {
            id: 'general',
            title: 'Général',
            description: 'Configuration générale de l\'application',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            id: 'appearance',
            title: 'Apparence',
            description: 'Thème et personnalisation visuelle',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
            )
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Préférences de notification',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17h5l-5 5v-5zM12 3v12m0 0l-3-3m3 3l3-3" />
                </svg>
            )
        },
        {
            id: 'security',
            title: 'Sécurité',
            description: 'Authentification et sécurité',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            id: 'backup',
            title: 'Sauvegarde',
            description: 'Configuration des sauvegardes',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
            )
        },
        {
            id: 'integrations',
            title: 'Intégrations',
            description: 'API et services externes',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            )
        }
    ]

    const handleSave = () => {
        // Simulate API call
        addToast('Paramètres sauvegardés avec succès', 'success')
    }

    const handleReset = () => {
        // Reset to defaults
        addToast('Paramètres réinitialisés', 'info')
    }

    const handleFileUpload = (files: File[]) => {
        files.forEach(file => {
            addToast(`Fichier "${file.name}" uploadé avec succès`, 'success')
        })
    }

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom du site
                    </label>
                    <Input
                        value={settings.general.siteName}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, siteName: e.target.value }
                        }))}
                        placeholder="Nom de votre site"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email administrateur
                    </label>
                    <Input
                        type="email"
                        value={settings.general.adminEmail}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, adminEmail: e.target.value }
                        }))}
                        placeholder="admin@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fuseau horaire
                    </label>
                    <select
                        value={settings.general.timezone}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, timezone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                        <option value="UTC">UTC</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Langue
                    </label>
                    <select
                        value={settings.general.language}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, language: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">Actualisation automatique</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Actualiser automatiquement les données
                        </p>
                    </div>
                    <button
                        onClick={() => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, autoRefresh: !prev.general.autoRefresh }
                        }))}
                        className={cn(
                            'relative inline-flex h-6 w-11 rounded-full transition-colors',
                            settings.general.autoRefresh ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        )}
                    >
                        <span className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            settings.general.autoRefresh ? 'translate-x-6' : 'translate-x-1',
                            'mt-1'
                        )} />
                    </button>
                </div>

                {settings.general.autoRefresh && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Intervalle d'actualisation (ms)
                        </label>
                        <Input
                            type="number"
                            value={settings.general.refreshInterval}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                general: { ...prev.general, refreshInterval: parseInt(e.target.value) }
                            }))}
                            min="1000"
                            max="60000"
                            step="1000"
                        />
                    </div>
                )}
            </div>
        </div>
    )

    const renderAppearanceSettings = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Thème
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['light', 'dark', 'system'].map((themeOption) => (
                        <button
                            key={themeOption}
                            onClick={() => {
                                setTheme(themeOption as any)
                                setSettings(prev => ({
                                    ...prev,
                                    appearance: { ...prev.appearance, theme: themeOption as any }
                                }))
                            }}
                            className={cn(
                                'p-4 border-2 rounded-lg text-left transition-all',
                                theme === themeOption
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'w-4 h-4 rounded-full border-2',
                                    theme === themeOption ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'
                                )} />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {themeOption === 'light' ? 'Clair' :
                                            themeOption === 'dark' ? 'Sombre' : 'Système'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {themeOption === 'light' ? 'Thème clair' :
                                            themeOption === 'dark' ? 'Thème sombre' : 'Suit les préférences système'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { key: 'compactMode', label: 'Mode compact', description: 'Interface plus dense' },
                    { key: 'animations', label: 'Animations', description: 'Activer les animations' },
                    { key: 'showTooltips', label: 'Info-bulles', description: 'Afficher les info-bulles' },
                ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                        </div>
                        <button
                            onClick={() => setSettings(prev => ({
                                ...prev,
                                appearance: {
                                    ...prev.appearance,
                                    [setting.key]: !prev.appearance[setting.key as keyof typeof prev.appearance]
                                }
                            }))}
                            className={cn(
                                'relative inline-flex h-6 w-11 rounded-full transition-colors',
                                settings.appearance[setting.key as keyof typeof settings.appearance]
                                    ? 'bg-blue-600'
                                    : 'bg-gray-200 dark:bg-gray-700'
                            )}
                        >
                            <span className={cn(
                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1',
                                settings.appearance[setting.key as keyof typeof settings.appearance]
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                            )} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )

    const renderBackupSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Configuration des sauvegardes
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Sauvegarde automatique</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Créer des sauvegardes automatiquement
                            </p>
                        </div>
                        <button
                            onClick={() => setSettings(prev => ({
                                ...prev,
                                backup: { ...prev.backup, autoBackup: !prev.backup.autoBackup }
                            }))}
                            className={cn(
                                'relative inline-flex h-6 w-11 rounded-full transition-colors',
                                settings.backup.autoBackup ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            )}
                        >
                            <span className={cn(
                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1',
                                settings.backup.autoBackup ? 'translate-x-6' : 'translate-x-1'
                            )} />
                        </button>
                    </div>

                    {settings.backup.autoBackup && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fréquence
                                </label>
                                <select
                                    value={settings.backup.backupInterval}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        backup: { ...prev.backup, backupInterval: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="hourly">Toutes les heures</option>
                                    <option value="daily">Quotidienne</option>
                                    <option value="weekly">Hebdomadaire</option>
                                    <option value="monthly">Mensuelle</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rétention (jours)
                                </label>
                                <Input
                                    type="number"
                                    value={settings.backup.retentionDays}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        backup: { ...prev.backup, retentionDays: parseInt(e.target.value) }
                                    }))}
                                    min="1"
                                    max="365"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Importer/Exporter
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Importer une sauvegarde
                        </label>
                        <FileUpload
                            onFilesChange={handleFileUpload}
                            accept=".json,.zip,.tar.gz"
                            maxFiles={1}
                            maxSize={50 * 1024 * 1024} // 50MB
                            allowedTypes={['application/json', 'application/zip', 'application/gzip']}
                            placeholder="Sélectionnez un fichier de sauvegarde"
                            variant="dropzone"
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            Exporter configuration
                        </Button>
                        <Button variant="outline">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            Sauvegarde complète
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'general':
                return renderGeneralSettings()
            case 'appearance':
                return renderAppearanceSettings()
            case 'backup':
                return renderBackupSettings()
            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            Section en cours de développement
                        </p>
                    </div>
                )
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Paramètres Avancés
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Configurez votre environnement WakeDock
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="space-y-2">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
                                    activeSection === section.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                )}
                            >
                                {section.icon}
                                <div>
                                    <p className="font-medium">{section.title}</p>
                                    <p className="text-xs opacity-75">{section.description}</p>
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <Card className="p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {sections.find(s => s.id === activeSection)?.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {sections.find(s => s.id === activeSection)?.description}
                            </p>
                        </div>

                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderActiveSection()}
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" onClick={handleReset}>
                                Réinitialiser
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                Sauvegarder
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AdvancedSettingsPage
