import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ServiceCreationWizard from '@/components/services/ServiceCreationWizard';
import DockerComposeEditor from '@/components/compose/DockerComposeEditor';
import GitHubIntegration from '@/components/github/GitHubIntegration';
import { StackManagement } from '@/components/dashboard/StackManagement';
import {
  Plus,
  FileText,
  Github,
  Container,
  Network,
  HardDrive,
  Activity,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Eye,
  Terminal,
  BarChart3,
  Monitor,
  Layers
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  ports: string[];
  cpu: number;
  memory: number;
  uptime: string;
  health: 'healthy' | 'unhealthy' | 'unknown';
}

interface ContainerMetrics {
  cpuPercent: number;
  memoryPercent: number;
  networkRx: number;
  networkTx: number;
  diskUsage: number;
}

interface SystemStats {
  totalContainers: number;
  runningContainers: number;
  totalImages: number;
  totalVolumes: number;
  totalNetworks: number;
  systemLoad: number;
  memoryUsage: number;
  diskUsage: number;
}

const ServiceManagementDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalContainers: 0,
    runningContainers: 0,
    totalImages: 0,
    totalVolumes: 0,
    totalNetworks: 0,
    systemLoad: 0,
    memoryUsage: 0,
    diskUsage: 0
  });
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'wizard' | 'compose' | 'github' | 'stacks'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeMetrics, setRealTimeMetrics] = useState<Map<string, ContainerMetrics>>(new Map());

  // Mock data for demonstration
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'nginx-proxy',
      image: 'nginx:alpine',
      status: 'running',
      ports: ['80:80', '443:443'],
      cpu: 2.5,
      memory: 45.2,
      uptime: '2d 14h 30m',
      health: 'healthy'
    },
    {
      id: '2',
      name: 'postgres-db',
      image: 'postgres:15-alpine',
      status: 'running',
      ports: ['5432:5432'],
      cpu: 8.1,
      memory: 256.7,
      uptime: '2d 14h 25m',
      health: 'healthy'
    },
    {
      id: '3',
      name: 'redis-cache',
      image: 'redis:7-alpine',
      status: 'running',
      ports: ['6379:6379'],
      cpu: 1.2,
      memory: 32.1,
      uptime: '2d 14h 20m',
      health: 'healthy'
    },
    {
      id: '4',
      name: 'app-service',
      image: 'node:18-alpine',
      status: 'stopped',
      ports: ['3000:3000'],
      cpu: 0,
      memory: 0,
      uptime: '0m',
      health: 'unknown'
    }
  ];

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      setServices(mockServices);
      setSystemStats({
        totalContainers: 4,
        runningContainers: 3,
        totalImages: 12,
        totalVolumes: 8,
        totalNetworks: 5,
        systemLoad: 65.4,
        memoryUsage: 72.3,
        diskUsage: 45.8
      });

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = new Map();
      services.forEach(service => {
        if (service.status === 'running') {
          newMetrics.set(service.id, {
            cpuPercent: Math.random() * 20 + service.cpu - 5,
            memoryPercent: Math.random() * 10 + service.memory - 5,
            networkRx: Math.random() * 1000,
            networkTx: Math.random() * 500,
            diskUsage: Math.random() * 100
          });
        }
      });
      setRealTimeMetrics(newMetrics);
    }, 3000);

    return () => clearInterval(interval);
  }, [services]);

  const handleServiceControl = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setServices(prev => prev.map(service =>
        service.id === serviceId
          ? {
            ...service,
            status: action === 'start' ? 'running' : action === 'stop' ? 'stopped' : 'starting'
          }
          : service
      ));
    } catch (error) {
      console.error('Failed to control service:', error);
    }
  };

  const handleCreateService = async (config: any) => {
    try {
      // Simulate service creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newService: Service = {
        id: Date.now().toString(),
        name: config.customName,
        image: `${config.template.dockerImage}:${config.template.dockerTag}`,
        status: 'running',
        ports: Object.entries(config.ports).map(([internal, external]) => `${external}:${internal}`),
        cpu: 0,
        memory: 0,
        uptime: '0m',
        health: 'healthy'
      };

      setServices(prev => [...prev, newService]);
      setIsWizardOpen(false);
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  };

  const handleSaveCompose = async (content: string) => {
    try {
      // Simulate saving compose file
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Compose file saved:', content);
    } catch (error) {
      console.error('Failed to save compose file:', error);
    }
  };

  const handleDeployCompose = async (content: string) => {
    try {
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Compose deployed:', content);
    } catch (error) {
      console.error('Failed to deploy compose:', error);
    }
  };

  const handleGitHubDeploy = async (config: any) => {
    try {
      // Simulate GitHub deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('GitHub deployment:', config);
    } catch (error) {
      console.error('Failed to deploy from GitHub:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'secondary';
      case 'starting':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'success';
      case 'unhealthy':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Containers</p>
              <p className="text-2xl font-bold">{systemStats.totalContainers}</p>
            </div>
            <Container className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Running</p>
              <p className="text-2xl font-bold text-green-600">{systemStats.runningContainers}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Networks</p>
              <p className="text-2xl font-bold">{systemStats.totalNetworks}</p>
            </div>
            <Network className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Volumes</p>
              <p className="text-2xl font-bold">{systemStats.totalVolumes}</p>
            </div>
            <HardDrive className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* System Resources */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">CPU Usage</span>
              <span className="text-sm text-gray-600">{systemStats.systemLoad}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStats.systemLoad}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Memory Usage</span>
              <span className="text-sm text-gray-600">{systemStats.memoryUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStats.memoryUsage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Disk Usage</span>
              <span className="text-sm text-gray-600">{systemStats.diskUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStats.diskUsage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Services List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Services</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsWizardOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading services...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map(service => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Container className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.image}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge variant={getStatusColor(service.status) as any}>
                        {service.status}
                      </Badge>
                      <Badge variant={getHealthColor(service.health) as any} className="ml-2">
                        {service.health}
                      </Badge>
                    </div>

                    <div className="text-right text-sm">
                      <p className="text-gray-600">CPU: {service.cpu}%</p>
                      <p className="text-gray-600">Memory: {service.memory}%</p>
                    </div>

                    <div className="text-right text-sm">
                      <p className="text-gray-600">Ports: {service.ports.join(', ')}</p>
                      <p className="text-gray-600">Uptime: {service.uptime}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {service.status === 'running' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleServiceControl(service.id, 'stop')}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleServiceControl(service.id, 'restart')}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleServiceControl(service.id, 'start')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Terminal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Management Dashboard</h1>
          <p className="text-gray-600">WakeDock v1.0.0 - Advanced Service & Container Orchestration</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="success">
            <Monitor className="h-3 w-3 mr-1" />
            v1.0.0
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 className="h-4 w-4 mr-2 inline" />
          Overview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'wizard' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('wizard')}
        >
          <Plus className="h-4 w-4 mr-2 inline" />
          Service Wizard
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'compose' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('compose')}
        >
          <FileText className="h-4 w-4 mr-2 inline" />
          Compose Editor
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'github' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('github')}
        >
          <Github className="h-4 w-4 mr-2 inline" />
          GitHub Integration
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'stacks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stacks')}
        >
          <Layers className="h-4 w-4 mr-2 inline" />
          Stack Management
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'wizard' && (
          <div className="py-4">
            <ServiceCreationWizard
              isOpen={true}
              onClose={() => setActiveTab('overview')}
              onCreateService={handleCreateService}
            />
          </div>
        )}
        {activeTab === 'compose' && (
          <div className="py-4">
            <DockerComposeEditor
              onSave={handleSaveCompose}
              onDeploy={handleDeployCompose}
            />
          </div>
        )}
        {activeTab === 'github' && (
          <div className="py-4">
            <GitHubIntegration
              onDeploy={handleGitHubDeploy}
            />
          </div>
        )}
        {activeTab === 'stacks' && (
          <div className="py-4">
            <StackManagement />
          </div>
        )}
      </div>

      {/* Service Creation Wizard Modal */}
      <ServiceCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreateService={handleCreateService}
      />
    </div>
  );
};

export default ServiceManagementDashboard;
