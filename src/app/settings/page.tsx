'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useToastStore } from '@/lib/stores/toast-store';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Database, 
  Server, 
  Monitor,
  Bell,
  Globe,
  Palette,
  Moon,
  Sun,
  Mail,
  AlertTriangle,
  Check
} from 'lucide-react';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const settingsSections: SettingsSection[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'monitoring', label: 'Monitoring', icon: Monitor },
  { id: 'system', label: 'System', icon: Server }
];

function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General settings
    siteName: 'WakeDock',
    siteDescription: 'Docker Container Management Platform',
    timezone: 'UTC',
    language: 'en',
    
    // Appearance settings
    theme: 'system',
    primaryColor: 'blue',
    compactMode: false,
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    maintenanceAlerts: true,
    serviceStatusAlerts: true,
    
    // Security settings
    sessionTimeout: 30,
    requireStrongPasswords: true,
    twoFactorAuth: false,
    loginAttempts: 5,
    
    // Database settings
    backupInterval: 24,
    autoCleanup: true,
    retentionDays: 30,
    
    // Monitoring settings
    refreshInterval: 30,
    alertThresholds: {
      cpu: 80,
      memory: 85,
      disk: 90
    },
    
    // System settings
    logLevel: 'info',
    debugMode: false,
    maintenanceMode: false
  });

  const { success: showSuccess, error: showError } = useToastStore();

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Settings', 'Settings saved successfully');
    } catch (error) {
      showError('Settings Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Name
        </label>
        <input
          type="text"
          value={settings.siteName}
          onChange={(e) => handleSettingChange('siteName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleSettingChange('theme', value)}
              className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
                settings.theme === value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Primary Color
        </label>
        <div className="grid grid-cols-6 gap-2">
          {['blue', 'green', 'purple', 'red', 'yellow', 'indigo'].map((color) => (
            <button
              key={color}
              onClick={() => handleSettingChange('primaryColor', color)}
              className={`w-8 h-8 rounded-full border-2 ${
                settings.primaryColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: `var(--color-${color}-500)` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Compact Mode
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Reduce spacing and padding throughout the interface
          </p>
        </div>
        <button
          onClick={() => handleSettingChange('compactMode', !settings.compactMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.compactMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.compactMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {[
        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
        { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
        { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'Get notified about system maintenance' },
        { key: 'serviceStatusAlerts', label: 'Service Status Alerts', description: 'Get notified when services change status' }
      ].map(({ key, label, description }) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
          <button
            onClick={() => handleSettingChange(key, !settings[key as keyof typeof settings])}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings[key as keyof typeof settings] ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
          min="5"
          max="1440"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {[
        { key: 'requireStrongPasswords', label: 'Require Strong Passwords', description: 'Enforce password complexity requirements' },
        { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Enable 2FA for additional security' }
      ].map(({ key, label, description }) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
          <button
            onClick={() => handleSettingChange(key, !settings[key as keyof typeof settings])}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings[key as keyof typeof settings] ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return (
          <div className="text-center py-8">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {settingsSections.find(s => s.id === activeSection)?.label} Settings
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Configuration options for this section are coming soon.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your WakeDock instance
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {settingsSections.find(s => s.id === activeSection)?.label} Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Configure your {settingsSections.find(s => s.id === activeSection)?.label.toLowerCase()} preferences
              </p>
            </div>
            
            {renderCurrentSection()}
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Settings - WakeDock',
  description: 'Configure your WakeDock instance',
};

export default function SettingsPageWrapper() {
  return (
    <DashboardLayout>
      <SettingsPage />
    </DashboardLayout>
  );
}