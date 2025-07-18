import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/loading-spinner';
import { 
  Settings, 
  Shield, 
  Clock, 
  HardDrive, 
  Cpu, 
  Network, 
  Database,
  Key,
  Lock,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface GlobalSettings {
  enabled: boolean;
  auto_updates: boolean;
  security_mode: 'strict' | 'normal' | 'permissive';
  max_plugins: number;
  max_memory_per_plugin: number;
  max_cpu_per_plugin: number;
  network_access: boolean;
  file_system_access: 'none' | 'restricted' | 'full';
  database_access: boolean;
  log_level: 'debug' | 'info' | 'warning' | 'error';
  plugin_timeout: number;
  cache_size: number;
  backup_enabled: boolean;
  backup_interval: number;
  marketplace_url: string;
  allow_dev_mode: boolean;
  require_signatures: boolean;
  auto_cleanup: boolean;
  cleanup_interval: number;
}

interface SecurityPolicy {
  name: string;
  description: string;
  enabled: boolean;
  rules: string[];
}

interface PluginLimit {
  plugin_name: string;
  memory_limit: number;
  cpu_limit: number;
  network_enabled: boolean;
  file_access: string;
  api_rate_limit: number;
}

export const PluginSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<GlobalSettings>({
    enabled: true,
    auto_updates: false,
    security_mode: 'normal',
    max_plugins: 50,
    max_memory_per_plugin: 256,
    max_cpu_per_plugin: 25,
    network_access: false,
    file_system_access: 'restricted',
    database_access: false,
    log_level: 'info',
    plugin_timeout: 30,
    cache_size: 1024,
    backup_enabled: true,
    backup_interval: 24,
    marketplace_url: 'https://registry.wakedock.com',
    allow_dev_mode: false,
    require_signatures: true,
    auto_cleanup: true,
    cleanup_interval: 7,
  });
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [limits, setLimits] = useState<PluginLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [systemStatus, setSystemStatus] = useState({
    active_plugins: 0,
    memory_usage: 0,
    cpu_usage: 0,
    disk_usage: 0,
    network_requests: 0,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'resources', label: 'Resources', icon: Cpu },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Key },
  ];

  const securityModes = [
    { value: 'strict', label: 'Strict - Maximum security' },
    { value: 'normal', label: 'Normal - Balanced security' },
    { value: 'permissive', label: 'Permissive - Minimal restrictions' },
  ];

  const logLevels = [
    { value: 'debug', label: 'Debug' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
  ];

  const fileAccessModes = [
    { value: 'none', label: 'No file access' },
    { value: 'restricted', label: 'Restricted to plugin directory' },
    { value: 'full', label: 'Full file system access' },
  ];

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, policiesRes, limitsRes, statusRes, apiKeyRes] = await Promise.all([
        api.get('/api/v1/plugins/settings'),
        api.get('/api/v1/plugins/security/policies'),
        api.get('/api/v1/plugins/limits'),
        api.get('/api/v1/plugins/system/status'),
        api.get('/api/v1/plugins/api-key'),
      ]);
      
      setSettings(settingsRes.data);
      setPolicies(policiesRes.data);
      setLimits(limitsRes.data);
      setSystemStatus(statusRes.data);
      setApiKey(apiKeyRes.data.key);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load plugin settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/api/v1/plugins/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    try {
      await api.post('/api/v1/plugins/settings/reset');
      await loadSettings();
      toast.success('Settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings');
    }
  };

  const generateApiKey = async () => {
    try {
      const response = await api.post('/api/v1/plugins/api-key/generate');
      setApiKey(response.data.key);
      toast.success('New API key generated');
    } catch (error) {
      console.error('Failed to generate API key:', error);
      toast.error('Failed to generate API key');
    }
  };

  const updateSecurityPolicy = async (policyName: string, enabled: boolean) => {
    try {
      await api.put(`/api/v1/plugins/security/policies/${policyName}`, { enabled });
      setPolicies(policies.map(p => 
        p.name === policyName ? { ...p, enabled } : p
      ));
      toast.success(`Security policy ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update security policy:', error);
      toast.error('Failed to update security policy');
    }
  };

  const getStatusColor = (usage: number) => {
    if (usage < 50) return 'green';
    if (usage < 80) return 'yellow';
    return 'red';
  };

  const getStatusIcon = (usage: number) => {
    if (usage < 50) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (usage < 80) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Plugin Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure global plugin settings and security policies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={RotateCcw}
            onClick={resetSettings}
            size="sm"
          >
            Reset
          </Button>
          <Button
            icon={Save}
            onClick={saveSettings}
            loading={saving}
            size="sm"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Plugins</p>
              <p className="text-xl font-semibold">{systemStatus.active_plugins}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-8 w-8 text-green-500" />
              {getStatusIcon(systemStatus.memory_usage)}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
              <p className="text-xl font-semibold">{systemStatus.memory_usage}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-8 w-8 text-yellow-500" />
              {getStatusIcon(systemStatus.cpu_usage)}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
              <p className="text-xl font-semibold">{systemStatus.cpu_usage}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <HardDrive className="h-8 w-8 text-purple-500" />
              {getStatusIcon(systemStatus.disk_usage)}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disk Usage</p>
              <p className="text-xl font-semibold">{systemStatus.disk_usage}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Network Requests</p>
              <p className="text-xl font-semibold">{systemStatus.network_requests}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium">General Settings</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Plugin System</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable or disable the entire plugin system
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto Updates</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically update plugins when new versions are available
                  </p>
                </div>
                <Switch
                  checked={settings.auto_updates}
                  onCheckedChange={(checked) => setSettings({ ...settings, auto_updates: checked })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Log Level</label>
                <select
                  value={settings.log_level}
                  onChange={(e) => setSettings({ ...settings, log_level: e.target.value as any })}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  {logLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Maximum Plugins</label>
                <Input
                  type="number"
                  value={settings.max_plugins}
                  onChange={(e) => setSettings({ ...settings, max_plugins: parseInt(e.target.value) })}
                  min="1"
                  max="1000"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Plugin Timeout (seconds)</label>
                <Input
                  type="number"
                  value={settings.plugin_timeout}
                  onChange={(e) => setSettings({ ...settings, plugin_timeout: parseInt(e.target.value) })}
                  min="1"
                  max="300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Marketplace URL</label>
                <Input
                  value={settings.marketplace_url}
                  onChange={(e) => setSettings({ ...settings, marketplace_url: e.target.value })}
                  placeholder="https://registry.wakedock.com"
                />
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium">Security Configuration</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Security Mode</label>
                  <select
                    value={settings.security_mode}
                    onChange={(e) => setSettings({ ...settings, security_mode: e.target.value as any })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  >
                    {securityModes.map(mode => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Require Plugin Signatures</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Only allow signed plugins from trusted sources
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_signatures}
                    onCheckedChange={(checked) => setSettings({ ...settings, require_signatures: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Allow Developer Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow loading unsigned plugins for development
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_dev_mode}
                    onCheckedChange={(checked) => setSettings({ ...settings, allow_dev_mode: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">API Key</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={showApiKey ? EyeOff : Eye}
                      onClick={() => setShowApiKey(!showApiKey)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateApiKey}
                    >
                      Generate New
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium">Security Policies</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{policy.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {policy.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {policy.rules.map((rule, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {rule}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={(checked) => updateSecurityPolicy(policy.name, checked)}
                    />
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium">Resource Limits</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Memory Limit per Plugin (MB)</label>
                <Input
                  type="number"
                  value={settings.max_memory_per_plugin}
                  onChange={(e) => setSettings({ ...settings, max_memory_per_plugin: parseInt(e.target.value) })}
                  min="64"
                  max="8192"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">CPU Limit per Plugin (%)</label>
                <Input
                  type="number"
                  value={settings.max_cpu_per_plugin}
                  onChange={(e) => setSettings({ ...settings, max_cpu_per_plugin: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Cache Size (MB)</label>
                <Input
                  type="number"
                  value={settings.cache_size}
                  onChange={(e) => setSettings({ ...settings, cache_size: parseInt(e.target.value) })}
                  min="64"
                  max="10240"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto Cleanup</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically clean up unused plugin resources
                  </p>
                </div>
                <Switch
                  checked={settings.auto_cleanup}
                  onCheckedChange={(checked) => setSettings({ ...settings, auto_cleanup: checked })}
                />
              </div>

              {settings.auto_cleanup && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Cleanup Interval (days)</label>
                  <Input
                    type="number"
                    value={settings.cleanup_interval}
                    onChange={(e) => setSettings({ ...settings, cleanup_interval: parseInt(e.target.value) })}
                    min="1"
                    max="30"
                  />
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium">Network Settings</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Network Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow plugins to make network requests
                  </p>
                </div>
                <Switch
                  checked={settings.network_access}
                  onCheckedChange={(checked) => setSettings({ ...settings, network_access: checked })}
                />
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Security Warning
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Enabling network access increases security risks. Only enable for trusted plugins.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium">Storage Settings</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">File System Access</label>
                <select
                  value={settings.file_system_access}
                  onChange={(e) => setSettings({ ...settings, file_system_access: e.target.value as any })}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  {fileAccessModes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Database Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow plugins to store data in the database
                  </p>
                </div>
                <Switch
                  checked={settings.database_access}
                  onCheckedChange={(checked) => setSettings({ ...settings, database_access: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Backup Enabled</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically backup plugin data
                  </p>
                </div>
                <Switch
                  checked={settings.backup_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, backup_enabled: checked })}
                />
              </div>

              {settings.backup_enabled && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Backup Interval (hours)</label>
                  <Input
                    type="number"
                    value={settings.backup_interval}
                    onChange={(e) => setSettings({ ...settings, backup_interval: parseInt(e.target.value) })}
                    min="1"
                    max="168"
                  />
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium">Advanced Settings</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">
                      Warning
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      These settings are for advanced users only. Modifying these settings may affect system stability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => api.post('/api/v1/plugins/cache/clear')}
                >
                  Clear Plugin Cache
                </Button>
                <Button
                  variant="outline"
                  onClick={() => api.post('/api/v1/plugins/registry/sync')}
                >
                  Sync Plugin Registry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => api.post('/api/v1/plugins/cleanup')}
                >
                  Cleanup Unused Plugins
                </Button>
                <Button
                  variant="outline"
                  onClick={() => api.post('/api/v1/plugins/restart-all')}
                >
                  Restart All Plugins
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};