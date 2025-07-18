import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ServiceCreationWizard from '@/components/services/ServiceCreationWizard';
import DockerComposeEditor from '@/components/compose/DockerComposeEditor';
import GitHubIntegration from '@/components/github/GitHubIntegration';
import {
  Plus,
  Code,
  Github,
  Container,
  Monitor,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw,
  Eye,
  Trash2,
  Edit,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Clock
} from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting' | 'error';
  uptime: string;
  cpu: number;
  memory: number;
  network: {
    rx: number;
    tx: number;
  };
  ports: string[];
  image: string;
  created: string;
  lastUpdated: string;
}

interface ServiceManagementDashboardProps {
  className?: string;
}

const MOCK_SERVICES: ServiceStatus[] = [
  {
    id: 'srv-1',
    name: 'nginx-web',
    status: 'running',
    uptime: '2d 14h 32m',
    cpu: 12.5,
    memory: 64.2,
    network: { rx: 1024, tx: 2048 },
    ports: ['80:80', '443:443'],
    image: 'nginx:alpine',
    created: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-17T14:22:00Z'
  },
  {
    id: 'srv-2',
    name: 'postgres-db',
    status: 'running',
    uptime: '5d 8h 12m',
    cpu: 23.8,
    memory: 256.7,
    network: { rx: 512, tx: 1024 },
    ports: ['5432:5432'],
    image: 'postgres:15-alpine',
    created: '2024-01-10T09:15:00Z',
    lastUpdated: '2024-01-17T14:21:00Z'
  },
  {
    id: 'srv-3',
    name: 'redis-cache',
    status: 'stopped',
    uptime: '0s',
    cpu: 0,
    memory: 0,
    network: { rx: 0, tx: 0 },
    ports: ['6379:6379'],
    image: 'redis:7-alpine',
    created: '2024-01-12T16:45:00Z',
    lastUpdated: '2024-01-17T11:30:00Z'
  }
];

export const ServiceManagementDashboard: React.FC<ServiceManagementDashboardProps> = ({ 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'compose' | 'github'>('overview');
  const [services, setServices] = useState<ServiceStatus[]>(MOCK_SERVICES);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => {
        if (service.status === 'running') {
          return {
            ...service,
            cpu: Math.random() * 50,
            memory: service.memory + (Math.random() - 0.5) * 10,
            network: {
              rx: service.network.rx + Math.floor(Math.random() * 100),
              tx: service.network.tx + Math.floor(Math.random() * 100)
            },
            lastUpdated: new Date().toISOString()
          };
        }
        return service;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'secondary';
      case 'paused': return 'warning';
      case 'restarting': return 'info';
      case 'error': return 'error';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running': return Play;
      case 'stopped': return Square;
      case 'paused': return Pause;
      case 'restarting': return RotateCcw;
      case 'error': return Activity;
      default: return Square;
    }
  };

  const handleServiceControl = async (serviceId: string, action: 'start' | 'stop' | 'restart' | 'pause') => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setServices(prev => prev.map(service => {
        if (service.id === serviceId) {
          let newStatus: ServiceStatus['status'];
          switch (action) {
            case 'start': newStatus = 'running'; break;
            case 'stop': newStatus = 'stopped'; break;
            case 'restart': newStatus = 'restarting'; break;
            case 'pause': newStatus = 'paused'; break;
            default: newStatus = service.status;
          }
          return {
            ...service,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
        }
        return service;
      }));
    } catch (error) {
      console.error('Failed to control service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateService = async (config: any) => {
    try {
      // Simulate service creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newService: ServiceStatus = {
        id: `srv-${Date.now()}`,
        name: config.customName,
        status: 'running',
        uptime: '0s',
        cpu: 0,
        memory: 0,
        network: { rx: 0, tx: 0 },
        ports: Object.entries(config.ports).map(([internal, external]) => `${external}:${internal}`),
        image: `${config.template.dockerImage}:${config.template.dockerTag}`,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      setServices(prev => [...prev, newService]);
      setIsWizardOpen(false);
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  };

  const handleComposeDeployment = async (content: string) => {
    try {
      // Simulate compose deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Docker Compose deployed:', content);
    } catch (error) {
      console.error('Failed to deploy compose:', error);
    }
  };

  const handleGitHubDeployment = async (config: any) => {
    try {
      // Simulate GitHub deployment
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const newService: ServiceStatus = {
        id: `srv-${Date.now()}`,
        name: config.serviceName,
        status: 'running',
        uptime: '0s',
        cpu: 0,
        memory: 0,
        network: { rx: 0, tx: 0 },
        ports: Object.entries(config.ports).map(([internal, external]) => `${external}:${internal}`),
        image: `${config.repository.name}:latest`,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      setServices(prev => [...prev, newService]);
    } catch (error) {
      console.error('Failed to deploy from GitHub:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Management Dashboard</h2>
          <p className="text-gray-600">Manage your Docker services, containers, and orchestration</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Service
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('compose')}>
            <Code className="h-4 w-4 mr-2" />
            Docker Compose
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('github')}>
            <Github className="h-4 w-4 mr-2" />
            GitHub Import
          </Button>
        </div>
      </div>

      {/* Service Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-2xl font-bold">{services.length}</p>
            </div>
            <Container className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Running</p>
              <p className="text-2xl font-bold text-green-600">
                {services.filter(s => s.status === 'running').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stopped</p>
              <p className="text-2xl font-bold text-red-600">
                {services.filter(s => s.status === 'stopped').length}
              </p>
            </div>
            <Square className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold">
                {Math.round(services.reduce((acc, s) => acc + s.cpu, 0) / services.length)}%
              </p>
            </div>
            <Cpu className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Services</h3>
        <div className="space-y-3">
          {services.map((service) => {
            const StatusIcon = getStatusIcon(service.status);
            return (
              <Card key={service.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <StatusIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.image}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <Badge variant={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{service.uptime}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Cpu className="h-3 w-3" />
                        <span>{service.cpu.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <HardDrive className="h-3 w-3" />
                        <span>{service.memory.toFixed(1)}MB</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Network className="h-3 w-3" />
                        <span>{service.network.rx}↓ {service.network.tx}↑</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {service.status === 'stopped' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleServiceControl(service.id, 'start')}
                          disabled={isLoading}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleServiceControl(service.id, 'stop')}
                          disabled={isLoading}
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleServiceControl(service.id, 'restart')}
                        disabled={isLoading}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedService(service)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {service.ports.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Ports:</span>
                      <div className="flex items-center space-x-1">
                        {service.ports.map((port, index) => (
                          <Badge key={index} variant="info">
                            {port}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Service Creation Wizard */}
      <ServiceCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreateService={handleCreateService}
      />
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('overview')}
        >
          <Monitor className="h-4 w-4 mr-2 inline" />
          Overview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('create')}
        >
          <Plus className="h-4 w-4 mr-2 inline" />
          Create Service
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'compose' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('compose')}
        >
          <Code className="h-4 w-4 mr-2 inline" />
          Docker Compose
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'github' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('github')}
        >
          <Github className="h-4 w-4 mr-2 inline" />
          GitHub Integration
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'create' && (
          <ServiceCreationWizard
            isOpen={true}
            onClose={() => setActiveTab('overview')}
            onCreateService={handleCreateService}
          />
        )}
        {activeTab === 'compose' && (
          <DockerComposeEditor
            onSave={async (content) => {
              console.log('Compose saved:', content);
            }}
            onDeploy={handleComposeDeployment}
          />
        )}
        {activeTab === 'github' && (
          <GitHubIntegration
            onDeploy={handleGitHubDeployment}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceManagementDashboard;
