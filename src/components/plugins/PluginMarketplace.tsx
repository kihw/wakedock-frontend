import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../forms/Select';
import { Table } from '../ui/Table';
import { LoadingSpinner } from '../ui/loading-spinner';
import { 
  Package, 
  Download, 
  Star, 
  Search, 
  Filter, 
  Tag,
  User,
  Calendar,
  Shield,
  Activity,
  Settings,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface Plugin {
  name: string;
  version: string;
  description: string;
  author: string;
  plugin_type: string;
  tags: string[];
  downloads: number;
  rating: number;
  updated: string;
  license: string;
  repository: string;
  size: number;
  installed: boolean;
  active: boolean;
}

interface PluginFilters {
  type: string;
  category: string;
  author: string;
  license: string;
  sort: string;
}

export const PluginMarketplace: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PluginFilters>({
    type: 'all',
    category: 'all',
    author: 'all',
    license: 'all',
    sort: 'popularity'
  });
  const [installingPlugin, setInstallingPlugin] = useState<string | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const pluginTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'container_extension', label: 'Container Extensions' },
    { value: 'service_extension', label: 'Service Extensions' },
    { value: 'monitoring_extension', label: 'Monitoring Extensions' },
    { value: 'ui_extension', label: 'UI Extensions' },
    { value: 'webhook_extension', label: 'Webhook Extensions' },
    { value: 'storage_extension', label: 'Storage Extensions' },
    { value: 'security_extension', label: 'Security Extensions' },
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'recent', label: 'Recently Updated' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'downloads', label: 'Most Downloads' },
  ];

  const loadPlugins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/plugins/marketplace', {
        params: {
          search: searchQuery,
          type: filters.type !== 'all' ? filters.type : undefined,
          author: filters.author !== 'all' ? filters.author : undefined,
          license: filters.license !== 'all' ? filters.license : undefined,
          sort: filters.sort,
        }
      });
      setPlugins(response.data);
    } catch (error) {
      console.error('Failed to load plugins:', error);
      toast.error('Failed to load plugins from marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, [searchQuery, filters]);

  const handleInstallPlugin = async (pluginName: string) => {
    try {
      setInstallingPlugin(pluginName);
      await api.post(`/api/v1/plugins/${pluginName}/install`);
      toast.success(`Plugin ${pluginName} installed successfully`);
      
      // Update plugin status
      setPlugins(plugins.map(p => 
        p.name === pluginName ? { ...p, installed: true } : p
      ));
    } catch (error) {
      console.error('Failed to install plugin:', error);
      toast.error(`Failed to install plugin ${pluginName}`);
    } finally {
      setInstallingPlugin(null);
    }
  };

  const handleUninstallPlugin = async (pluginName: string) => {
    try {
      await api.delete(`/api/v1/plugins/${pluginName}`);
      toast.success(`Plugin ${pluginName} uninstalled successfully`);
      
      // Update plugin status
      setPlugins(plugins.map(p => 
        p.name === pluginName ? { ...p, installed: false, active: false } : p
      ));
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      toast.error(`Failed to uninstall plugin ${pluginName}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getPluginTypeColor = (type: string) => {
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
            Plugin Marketplace
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Discover and install plugins to extend WakeDock functionality
          </p>
        </div>
        <Button
          variant="outline"
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                options={pluginTypes}
              />
              <Select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                options={sortOptions}
              />
              <Select
                value={filters.license}
                onChange={(e) => setFilters({ ...filters, license: e.target.value })}
                options={[
                  { value: 'all', label: 'All Licenses' },
                  { value: 'MIT', label: 'MIT' },
                  { value: 'Apache-2.0', label: 'Apache 2.0' },
                  { value: 'GPL-3.0', label: 'GPL 3.0' },
                  { value: 'BSD-3-Clause', label: 'BSD 3-Clause' },
                ]}
              />
              <Select
                value={filters.author}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                options={[
                  { value: 'all', label: 'All Authors' },
                  { value: 'official', label: 'Official' },
                  { value: 'community', label: 'Community' },
                ]}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <Card key={plugin.name} className="p-4">
            <div className="space-y-3">
              {/* Plugin Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-lg">{plugin.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{plugin.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Plugin Type */}
              <Badge 
                variant="secondary" 
                className={`bg-${getPluginTypeColor(plugin.plugin_type)}-100 text-${getPluginTypeColor(plugin.plugin_type)}-800`}
              >
                {plugin.plugin_type.replace('_', ' ')}
              </Badge>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {plugin.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {plugin.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Plugin Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{plugin.author}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Download className="h-4 w-4" />
                  <span>{plugin.downloads.toLocaleString()} downloads</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {new Date(plugin.updated).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {plugin.installed ? (
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUninstallPlugin(plugin.name)}
                      className="flex-1"
                    >
                      Uninstall
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Settings}
                      onClick={() => setSelectedPlugin(plugin)}
                    />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleInstallPlugin(plugin.name)}
                    loading={installingPlugin === plugin.name}
                    className="flex-1"
                  >
                    Install
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => window.open(plugin.repository, '_blank')}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

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
                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPlugin.description}
                  </p>
                </div>

                {/* Plugin Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>Author: {selectedPlugin.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>License: {selectedPlugin.license}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span>Size: {formatFileSize(selectedPlugin.size)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Download className="h-4 w-4 text-gray-400" />
                        <span>{selectedPlugin.downloads.toLocaleString()} downloads</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{selectedPlugin.rating.toFixed(1)} rating</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Updated {new Date(selectedPlugin.updated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlugin.tags.map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Content>
            <Card.Footer>
              <div className="flex items-center gap-2">
                {selectedPlugin.installed ? (
                  <Button
                    variant="outline"
                    onClick={() => handleUninstallPlugin(selectedPlugin.name)}
                  >
                    Uninstall
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleInstallPlugin(selectedPlugin.name)}
                    loading={installingPlugin === selectedPlugin.name}
                  >
                    Install Plugin
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedPlugin.repository, '_blank')}
                >
                  View Repository
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
};