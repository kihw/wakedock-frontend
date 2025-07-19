'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import ServiceCreationWizard from '@/components/services/ServiceCreationWizard';
import DockerComposeEditor from '@/components/compose/DockerComposeEditor';
import GitHubIntegration from '@/components/github/GitHubIntegration';
import { ServiceGroup } from '@/components/stacks/ServiceGroup';
import { useStacks } from '@/hooks/api/useStacks';
import { useServiceController } from '@/hooks/api/useServiceController';
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
    Clock,
    Server,
    Package,
    Grid,
    List,
    Filter
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
    stack_name?: string;
    stack_id?: string;
    containers?: any[];
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
        lastUpdated: '2024-01-17T14:22:00Z',
        stack_name: 'webstack',
        stack_id: 'stack-1',
        containers: [{ id: 'cont-1', name: 'nginx-web-1', status: 'running' }]
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
        lastUpdated: '2024-01-17T14:21:00Z',
        stack_name: 'datastack',
        stack_id: 'stack-2',
        containers: [{ id: 'cont-2', name: 'postgres-db-1', status: 'running' }]
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
        lastUpdated: '2024-01-17T11:30:00Z',
        stack_name: 'datastack',
        stack_id: 'stack-2',
        containers: [{ id: 'cont-3', name: 'redis-cache-1', status: 'stopped' }]
    },
    {
        id: 'srv-4',
        name: 'standalone-app',
        status: 'running',
        uptime: '1d 2h 15m',
        cpu: 8.2,
        memory: 128.5,
        network: { rx: 256, tx: 512 },
        ports: ['3000:3000'],
        image: 'node:18-alpine',
        created: '2024-01-16T12:00:00Z',
        lastUpdated: '2024-01-17T14:20:00Z',
        containers: [{ id: 'cont-4', name: 'standalone-app-1', status: 'running' }]
    }
];

export const ServiceManagementDashboard: React.FC<ServiceManagementDashboardProps> = ({
    className = ''
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'compose' | 'github'>('overview');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'services' | 'stacks'>('services');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedService, setSelectedService] = useState<ServiceStatus | null>(null);
    
    // Modern SPA hooks
    const { stacks, overview, loading: stacksLoading, executeStackAction } = useStacks();
    const {
        services,
        loading,
        isLoading,
        error,
        filters,
        selectedServices,
        totalCount,
        page,
        pageSize,
        startService,
        stopService,
        restartService,
        rebuildService,
        bulkAction,
        setFilters,
        setSelectedServices,
        setPage,
        setPageSize,
        refreshServices
    } = useServiceController();

    useEffect(() => {
        // Real-time updates through React Query
        const interval = setInterval(() => {
            refreshServices();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [refreshServices]);

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
        try {
            switch (action) {
                case 'start':
                    await startService(serviceId);
                    break;
                case 'stop':
                    await stopService(serviceId);
                    break;
                case 'restart':
                    await restartService(serviceId);
                    break;
                case 'pause':
                    // Note: pause action not implemented in useServiceController
                    console.warn('Pause action not yet implemented');
                    break;
                default:
                    console.error('Unknown action:', action);
            }
        } catch (error) {
            console.error('Failed to control service:', error);
        }
    };

    const handleCreateService = async (config: any) => {
        try {
            // Create service through API
            // Note: This would need to be implemented in the service API
            console.log('Creating service with config:', config);
            
            // For now, refresh the services list to pick up any new services
            await refreshServices();
            setIsWizardOpen(false);
        } catch (error) {
            console.error('Failed to create service:', error);
        }
    };

    // Groupement des services par stack
    const groupedServices = React.useMemo(() => {
        const stackServices = new Map<string, ServiceStatus[]>();
        const standaloneServices: ServiceStatus[] = [];

        services.forEach(service => {
            if (service.stack_name) {
                if (!stackServices.has(service.stack_name)) {
                    stackServices.set(service.stack_name, []);
                }
                stackServices.get(service.stack_name)!.push(service);
            } else {
                standaloneServices.push(service);
            }
        });

        return {
            standalone: standaloneServices,
            stacks: Array.from(stackServices.entries()).map(([stackName, stackServices]) => ({
                name: stackName,
                services: stackServices,
                stack: stacks.find(s => s.name === stackName)
            }))
        };
    }, [services, stacks]);

    // Filtrage par statut
    const filteredServices = React.useMemo(() => {
        const filterByStatus = (serviceList: ServiceStatus[]) => {
            if (statusFilter === 'all') return serviceList;
            return serviceList.filter(service => service.status === statusFilter);
        };

        return {
            standalone: filterByStatus(groupedServices.standalone),
            stacks: groupedServices.stacks.map(stack => ({
                ...stack,
                services: filterByStatus(stack.services)
            })).filter(stack => stack.services.length > 0)
        };
    }, [groupedServices, statusFilter]);

    // Gestion des actions sur les services
    const handleServiceAction = async (serviceId: string, action: string) => {
        await handleServiceControl(serviceId, action as any);
    };

    // Gestion des actions sur les stacks
    const handleStackAction = async (stackName: string, action: string) => {
        try {
            await executeStackAction(stackName, action);
        } catch (error) {
            console.error(`Failed to ${action} stack ${stackName}:`, error);
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
                            <p className="text-2xl font-bold">{services?.length || 0}</p>
                        </div>
                        <Container className="h-8 w-8 text-blue-500" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Running</p>
                            <p className="text-2xl font-bold text-green-600">
                                {services?.filter(s => s.status === 'running').length || 0}
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
                                {services?.filter(s => s.status === 'stopped').length || 0}
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
                                {services?.length ? Math.round(services.reduce((acc, s) => acc + (s.cpu || 0), 0) / services.length) : 0}%
                            </p>
                        </div>
                        <Cpu className="h-8 w-8 text-orange-500" />
                    </div>
                </Card>
            </div>

            {/* Services List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Services</h3>
                    <div className="flex items-center gap-3">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="running">Running</option>
                                <option value="stopped">Stopped</option>
                                <option value="paused">Paused</option>
                                <option value="error">Error</option>
                            </select>
                        </div>
                        
                        {/* View Toggle */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'services' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('services')}
                                className="flex items-center gap-2"
                            >
                                <List className="w-4 h-4" />
                                Services
                            </Button>
                            <Button
                                variant={viewMode === 'stacks' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('stacks')}
                                className="flex items-center gap-2"
                            >
                                <Grid className="w-4 h-4" />
                                Stacks
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Services/Stacks View */}
                {viewMode === 'stacks' ? (
                    <div className="space-y-4">
                        {/* Stack Groups */}
                        {filteredServices.stacks.map((stackGroup) => (
                            <ServiceGroup
                                key={stackGroup.name}
                                stack={stackGroup.stack}
                                services={stackGroup.services.map(service => ({
                                    id: service.id,
                                    name: service.name,
                                    status: service.status,
                                    image: service.image,
                                    ports: service.ports.reduce((acc, port) => {
                                        const [external, internal] = port.split(':');
                                        acc[internal] = external;
                                        return acc;
                                    }, {} as Record<string, any>),
                                    created: service.created,
                                    containers: service.containers || []
                                }))}
                                title={`Stack: ${stackGroup.name}`}
                                expanded={false}
                                onServiceAction={handleServiceAction}
                                onContainerAction={async (containerId, action) => {
                                    console.log(`Container ${containerId} action: ${action}`);
                                }}
                            />
                        ))}
                        
                        {/* Standalone Services */}
                        {filteredServices.standalone.length > 0 && (
                            <ServiceGroup
                                services={filteredServices.standalone.map(service => ({
                                    id: service.id,
                                    name: service.name,
                                    status: service.status,
                                    image: service.image,
                                    ports: service.ports.reduce((acc, port) => {
                                        const [external, internal] = port.split(':');
                                        acc[internal] = external;
                                        return acc;
                                    }, {} as Record<string, any>),
                                    created: service.created,
                                    containers: service.containers || []
                                }))}
                                title="Standalone Services"
                                expanded={false}
                                onServiceAction={handleServiceAction}
                                onContainerAction={async (containerId, action) => {
                                    console.log(`Container ${containerId} action: ${action}`);
                                }}
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                    {(statusFilter === 'all' ? services : services?.filter(s => s.status === statusFilter) || []).map((service) => {
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
                                                <span>{service.cpu?.toFixed(1) || 0}%</span>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600">
                                            <div className="flex items-center space-x-1">
                                                <HardDrive className="h-3 w-3" />
                                                <span>{service.memory?.toFixed(1) || 0}MB</span>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600">
                                            <div className="flex items-center space-x-1">
                                                <Network className="h-3 w-3" />
                                                <span>{service.network?.rx || 0}↓ {service.network?.tx || 0}↑</span>
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
                )}
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
