import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../forms/Select';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { LoadingSpinner } from '../ui/loading-spinner';
import { 
  Code, 
  Package, 
  Upload, 
  Download, 
  Play, 
  Stop, 
  Settings, 
  FileText, 
  Terminal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  FolderOpen,
  TestTube,
  AlertCircle,
  CheckCircle,
  Book,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface Plugin {
  name: string;
  version: string;
  description: string;
  author: string;
  type: string;
  status: 'development' | 'testing' | 'published';
  files: string[];
  dependencies: string[];
  permissions: string[];
  config_schema: any;
  last_modified: string;
  size: number;
  test_results?: {
    passed: number;
    failed: number;
    coverage: number;
  };
}

interface PluginTemplate {
  name: string;
  description: string;
  type: string;
  files: { [key: string]: string };
}

export const PluginDeveloper: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [templates, setTemplates] = useState<PluginTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showFileEditor, setShowFileEditor] = useState(false);
  const [currentFile, setCurrentFile] = useState<{ name: string; content: string } | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: 'container_extension',
    template: 'basic',
    author: '',
    version: '1.0.0',
    license: 'MIT'
  });

  const pluginTypes = [
    { value: 'container_extension', label: 'Container Extension' },
    { value: 'service_extension', label: 'Service Extension' },
    { value: 'monitoring_extension', label: 'Monitoring Extension' },
    { value: 'ui_extension', label: 'UI Extension' },
    { value: 'webhook_extension', label: 'Webhook Extension' },
    { value: 'storage_extension', label: 'Storage Extension' },
    { value: 'security_extension', label: 'Security Extension' },
  ];

  const tabs = [
    { id: 'projects', label: 'My Projects', icon: Package },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'testing', label: 'Testing', icon: TestTube },
    { id: 'documentation', label: 'Documentation', icon: Book },
  ];

  const loadPlugins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/plugins/developer');
      setPlugins(response.data.plugins || []);
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Failed to load developer plugins:', error);
      toast.error('Failed to load developer plugins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const handleCreateProject = async () => {
    try {
      await api.post('/api/v1/plugins/developer/create', newProject);
      toast.success(`Plugin project ${newProject.name} created successfully`);
      setShowNewProjectModal(false);
      setNewProject({
        name: '',
        description: '',
        type: 'container_extension',
        template: 'basic',
        author: '',
        version: '1.0.0',
        license: 'MIT'
      });
      await loadPlugins();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create plugin project');
    }
  };

  const handleBuildPlugin = async (pluginName: string) => {
    try {
      setBuildLogs([]);
      const response = await api.post(`/api/v1/plugins/developer/${pluginName}/build`);
      setBuildLogs(response.data.logs || []);
      toast.success(`Plugin ${pluginName} built successfully`);
      await loadPlugins();
    } catch (error) {
      console.error('Failed to build plugin:', error);
      toast.error('Failed to build plugin');
    }
  };

  const handleTestPlugin = async (pluginName: string) => {
    try {
      const response = await api.post(`/api/v1/plugins/developer/${pluginName}/test`);
      setTestResults(response.data);
      toast.success(`Plugin ${pluginName} tests completed`);
    } catch (error) {
      console.error('Failed to test plugin:', error);
      toast.error('Failed to test plugin');
    }
  };

  const handlePublishPlugin = async (pluginName: string) => {
    try {
      await api.post(`/api/v1/plugins/developer/${pluginName}/publish`);
      toast.success(`Plugin ${pluginName} published successfully`);
      await loadPlugins();
    } catch (error) {
      console.error('Failed to publish plugin:', error);
      toast.error('Failed to publish plugin');
    }
  };

  const handleEditFile = async (pluginName: string, fileName: string) => {
    try {
      const response = await api.get(`/api/v1/plugins/developer/${pluginName}/files/${fileName}`);
      setCurrentFile({
        name: fileName,
        content: response.data.content
      });
      setShowFileEditor(true);
    } catch (error) {
      console.error('Failed to load file:', error);
      toast.error('Failed to load file');
    }
  };

  const handleSaveFile = async () => {
    if (!currentFile || !selectedPlugin) return;

    try {
      await api.put(`/api/v1/plugins/developer/${selectedPlugin.name}/files/${currentFile.name}`, {
        content: currentFile.content
      });
      toast.success('File saved successfully');
      setShowFileEditor(false);
      setCurrentFile(null);
      await loadPlugins();
    } catch (error) {
      console.error('Failed to save file:', error);
      toast.error('Failed to save file');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'development':
        return 'yellow';
      case 'testing':
        return 'blue';
      case 'published':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'development':
        return <Code className="h-4 w-4" />;
      case 'testing':
        return <TestTube className="h-4 w-4" />;
      case 'published':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
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
            Plugin Developer
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Develop, test, and publish WakeDock plugins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={Book}
            onClick={() => window.open('/docs/plugins', '_blank')}
            size="sm"
          >
            Documentation
          </Button>
          <Button
            icon={Plus}
            onClick={() => setShowNewProjectModal(true)}
            size="sm"
          >
            New Project
          </Button>
        </div>
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

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {plugins.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first plugin project to get started
              </p>
              <Button onClick={() => setShowNewProjectModal(true)}>
                Create New Project
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugins.map((plugin) => (
                <Card key={plugin.name} className="p-4">
                  <div className="space-y-3">
                    {/* Plugin Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">{plugin.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(plugin.status)}
                        <Badge 
                          variant="secondary" 
                          className={`bg-${getStatusColor(plugin.status)}-100 text-${getStatusColor(plugin.status)}-800`}
                        >
                          {plugin.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Plugin Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {plugin.description}
                    </p>

                    {/* Plugin Info */}
                    <div className="space-y-1 text-sm text-gray-500">
                      <div>Version: {plugin.version}</div>
                      <div>Type: {plugin.type.replace('_', ' ')}</div>
                      <div>Files: {plugin.files.length}</div>
                      <div>Size: {(plugin.size / 1024).toFixed(1)} KB</div>
                    </div>

                    {/* Test Results */}
                    {plugin.test_results && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-sm font-medium mb-1">Test Results</div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{plugin.test_results.passed} passed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span>{plugin.test_results.failed} failed</span>
                          </div>
                          <div className="text-gray-500">
                            {plugin.test_results.coverage}% coverage
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Edit}
                        onClick={() => setSelectedPlugin(plugin)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Play}
                        onClick={() => handleBuildPlugin(plugin.name)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        icon={TestTube}
                        onClick={() => handleTestPlugin(plugin.name)}
                      />
                      {plugin.status === 'testing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Upload}
                          onClick={() => handlePublishPlugin(plugin.name)}
                        />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.name} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {template.description}
                </p>
                <Badge variant="outline">
                  {template.type.replace('_', ' ')}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewProject({ ...newProject, template: template.name });
                    setShowNewProjectModal(true);
                  }}
                >
                  Use Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Testing Tab */}
      {activeTab === 'testing' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium">Plugin Testing</h3>
          </Card.Header>
          <Card.Content>
            {testResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {testResults.passed || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tests Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {testResults.failed || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tests Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {testResults.coverage || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Coverage</div>
                  </div>
                </div>
                {testResults.details && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(testResults.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No test results yet. Run tests on a plugin to see results here.
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Documentation Tab */}
      {activeTab === 'documentation' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium">Plugin Development Documentation</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Getting Started</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Plugin Architecture Overview</li>
                    <li>• Creating Your First Plugin</li>
                    <li>• Plugin Types and Templates</li>
                    <li>• Development Environment Setup</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">API Reference</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• WakeDock Plugin API</li>
                    <li>• Container Operations</li>
                    <li>• Event System</li>
                    <li>• Configuration Management</li>
                  </ul>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  icon={ExternalLink}
                  onClick={() => window.open('/docs/plugins', '_blank')}
                >
                  Open Full Documentation
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <Card.Header>
              <h3 className="text-lg font-semibold">Create New Plugin Project</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <Input
                  label="Plugin Name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="my-awesome-plugin"
                />
                <Textarea
                  label="Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Description of your plugin..."
                />
                <Select
                  label="Plugin Type"
                  value={newProject.type}
                  onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                  options={pluginTypes}
                />
                <Input
                  label="Author"
                  value={newProject.author}
                  onChange={(e) => setNewProject({ ...newProject, author: e.target.value })}
                  placeholder="Your name"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Version"
                    value={newProject.version}
                    onChange={(e) => setNewProject({ ...newProject, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                  <Input
                    label="License"
                    value={newProject.license}
                    onChange={(e) => setNewProject({ ...newProject, license: e.target.value })}
                    placeholder="MIT"
                  />
                </div>
              </div>
            </Card.Content>
            <Card.Footer>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewProjectModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>
                  Create Project
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}

      {/* File Editor Modal */}
      {showFileEditor && currentFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit {currentFile.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileEditor(false)}
                >
                  ×
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <Textarea
                value={currentFile.content}
                onChange={(e) => setCurrentFile({ ...currentFile, content: e.target.value })}
                className="font-mono text-sm"
                rows={20}
              />
            </Card.Content>
            <Card.Footer>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFileEditor(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveFile}>
                  Save Changes
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
};