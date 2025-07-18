import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Tabs } from '../ui/tabs';
import { 
  Package, 
  Play, 
  Pause, 
  Settings, 
  Trash2,
  Upload,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Shield,
  Code,
  Users
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import { PluginMarketplace } from './PluginMarketplace';
import { PluginDeveloper } from './PluginDeveloper';
import { PluginSettings } from './PluginSettings';

interface Plugin {
  name: string;
  version: string;
  description: string;
  author: string;
  type: string;
  status: 'active' | 'inactive' | 'error' | 'loading';
  active: boolean;
  enabled: boolean;
  dependencies: string[];
  permissions: string[];
  health: {
    status: string;
    active: boolean;
    config: any;
    hooks: string[];
    event_handlers: string[];
  };
  metrics: {
    hooks_count: number;
    event_handlers_count: number;
    memory_usage: number;
    cpu_usage: number;
  };
  tags: string[];
  homepage?: string;
  repository?: string;
  license?: string;
}

interface PluginConfig {
  enabled: boolean;
  config: Record<string, any>;
  permissions: string[];
  resource_limits: Record<string, any>;
  sandboxed: boolean;
  auto_start: boolean;
  log_level: string;
}

export const PluginManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('installed');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [systemMetrics, setSystemMetrics] = useState({
    total_plugins: 0,
    active_plugins: 0,
    failed_plugins: 0,
    load_time: 0,
  });

  const tabs = [
    { id: 'installed', label: 'Installed Plugins', icon: Package },
    { id: 'marketplace', label: 'Marketplace', icon: Download },
    { id: 'developer', label: 'Developer', icon: Code },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const loadPlugins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/plugins');
      setPlugins(response.data);
    } catch (error) {
      console.error('Failed to load plugins:', error);
      toast.error('Failed to load plugins');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const response = await api.get('/api/v1/plugins/system/metrics');
      setSystemMetrics(response.data);
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    }
  };

  useEffect(() => {
    loadPlugins();
    loadSystemMetrics();
    
    const interval = setInterval(() => {
      loadPlugins();
      loadSystemMetrics();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handlePluginAction = async (pluginName: string, action: string) => {
    try {
      setActionLoading(`${pluginName}-${action}`);
      
      switch (action) {
        case 'start':
          await api.post(`/api/v1/plugins/${pluginName}/start`);
          toast.success(`Plugin ${pluginName} started`);
          break;
        case 'stop':
          await api.post(`/api/v1/plugins/${pluginName}/stop`);
          toast.success(`Plugin ${pluginName} stopped`);
          break;
        case 'restart':
          await api.post(`/api/v1/plugins/${pluginName}/restart`);
          toast.success(`Plugin ${pluginName} restarted`);
          break;
        case 'enable':
          await api.post(`/api/v1/plugins/${pluginName}/enable`);
          toast.success(`Plugin ${pluginName} enabled`);
          break;
        case 'disable':
          await api.post(`/api/v1/plugins/${pluginName}/disable`);
          toast.success(`Plugin ${pluginName} disabled`);
          break;
        case 'uninstall':
          if (confirm(`Are you sure you want to uninstall ${pluginName}?`)) {
            await api.delete(`/api/v1/plugins/${pluginName}`);
            toast.success(`Plugin ${pluginName} uninstalled`);
          }
          break;
      }
      
      await loadPlugins();
    } catch (error) {
      console.error(`Failed to ${action} plugin:`, error);
      toast.error(`Failed to ${action} plugin ${pluginName}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfigurePlugin = async (pluginName: string, config: Record<string, any>) => {
    try {
      await api.put(`/api/v1/plugins/${pluginName}/config`, config);
      toast.success(`Plugin ${pluginName} configured`);
      await loadPlugins();
    } catch (error) {
      console.error('Failed to configure plugin:', error);
      toast.error(`Failed to configure plugin ${pluginName}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      container_extension: 'blue',
      service_extension: 'green',
      monitoring_extension: 'yellow',
      ui_extension: 'purple',
      webhook_extension: 'orange',
      storage_extension: 'indigo',
      security_extension: 'red',
    };
    return colors[type as keyof typeof colors] || 'gray';
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
            Plugin Manager
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage installed plugins and extend WakeDock functionality
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={loadPlugins}
            size="sm"
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            icon={Upload}
            onClick={() => toast.info('Plugin upload coming soon')}
            size="sm"
          >
            Upload Plugin
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Plugins</p>
              <p className="text-xl font-semibold">{systemMetrics.total_plugins}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Plugins</p>
              <p className="text-xl font-semibold">{systemMetrics.active_plugins}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed Plugins</p>
              <p className="text-xl font-semibold">{systemMetrics.failed_plugins}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Load Time</p>
              <p className="text-xl font-semibold">{systemMetrics.load_time}ms</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Installed Plugins Tab */}
      {activeTab === 'installed' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium">Installed Plugins</h3>
          </Card.Header>
          <Card.Content>
            <Table
              columns={[
                { key: 'name', label: 'Plugin' },
                { key: 'type', label: 'Type' },
                { key: 'status', label: 'Status' },
                { key: 'health', label: 'Health' },
                { key: 'metrics', label: 'Metrics' },
                { key: 'actions', label: 'Actions' },
              ]}
              data={plugins.map((plugin) => ({
                name: (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">{plugin.name}</div>
                      <div className="text-sm text-gray-500">v{plugin.version}</div>
                    </div>
                  </div>
                ),
                type: (
                  <Badge 
                    variant="secondary"
                    className={`bg-${getTypeColor(plugin.type)}-100 text-${getTypeColor(plugin.type)}-800`}
                  >
                    {plugin.type.replace('_', ' ')}
                  </Badge>
                ),
                status: (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(plugin.status)}
                    <div>
                      <div className="text-sm font-medium">{plugin.status}</div>
                      <div className="text-xs text-gray-500">
                        {plugin.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                ),
                health: (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        plugin.health.active ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">
                        {plugin.health.active ? 'Healthy' : 'Unhealthy'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {plugin.health.hooks.length} hooks, {plugin.health.event_handlers.length} handlers
                    </div>
                  </div>
                ),
                metrics: (
                  <div className="text-sm space-y-1">
                    <div>Memory: {plugin.metrics.memory_usage}MB</div>
                    <div>CPU: {plugin.metrics.cpu_usage}%</div>
                  </div>
                ),
                actions: (
                  <div className="flex items-center gap-2">
                    {plugin.active ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Pause}
                        onClick={() => handlePluginAction(plugin.name, 'stop')}
                        loading={actionLoading === `${plugin.name}-stop`}
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Play}
                        onClick={() => handlePluginAction(plugin.name, 'start')}
                        loading={actionLoading === `${plugin.name}-start`}
                      />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Settings}
                      onClick={() => setSelectedPlugin(plugin)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      onClick={() => handlePluginAction(plugin.name, 'uninstall')}
                      loading={actionLoading === `${plugin.name}-uninstall`}
                    />
                  </div>
                ),
              }))}
            />
          </Card.Content>
        </Card>
      )}

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <PluginMarketplace />
      )}

      {/* Developer Tab */}
      {activeTab === 'developer' && (
        <PluginDeveloper />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <PluginSettings />
      )}

      {/* Plugin Details Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold">{selectedPlugin.name}</h3>
                    <p className="text-sm text-gray-500">v{selectedPlugin.version}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlugin(null)}
                >
                  ×
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPlugin.description}
                  </p>
                </div>

                {/* Status and Health */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedPlugin.status)}
                      <span className="text-sm">{selectedPlugin.status}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Health</h4>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedPlugin.health.active ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">
                        {selectedPlugin.health.active ? 'Healthy' : 'Unhealthy'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="font-medium mb-2">Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <div>Memory Usage: {selectedPlugin.metrics.memory_usage}MB</div>
                      <div>CPU Usage: {selectedPlugin.metrics.cpu_usage}%</div>
                    </div>
                    <div className="text-sm">
                      <div>Hooks: {selectedPlugin.metrics.hooks_count}</div>
                      <div>Event Handlers: {selectedPlugin.metrics.event_handlers_count}</div>
                    </div>
                  </div>
                </div>

                {/* Dependencies */}
                {selectedPlugin.dependencies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Dependencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlugin.dependencies.map((dep) => (
                        <Badge key={dep} variant="outline" size="sm">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permissions */}
                {selectedPlugin.permissions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Permissions</h4>
                    <div className="space-y-1">
                      {selectedPlugin.permissions.map((perm) => (
                        <div key={perm} className="flex items-center gap-2 text-sm">
                          <Shield className="h-3 w-3 text-gray-400" />
                          <span>{perm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card.Content>
            <Card.Footer>
              <div className="flex items-center gap-2">
                {selectedPlugin.active ? (
                  <Button
                    onClick={() => {
                      handlePluginAction(selectedPlugin.name, 'stop');
                      setSelectedPlugin(null);
                    }}
                    loading={actionLoading === `${selectedPlugin.name}-stop`}
                  >
                    Stop Plugin
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handlePluginAction(selectedPlugin.name, 'start');
                      setSelectedPlugin(null);
                    }}
                    loading={actionLoading === `${selectedPlugin.name}-start`}
                  >
                    Start Plugin
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handlePluginAction(selectedPlugin.name, 'restart');
                    setSelectedPlugin(null);
                  }}
                  loading={actionLoading === `${selectedPlugin.name}-restart`}
                >
                  Restart
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
};