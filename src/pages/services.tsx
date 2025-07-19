import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useServiceController } from '@/hooks/api/useServiceController';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Plus,
    Play,
    Square,
    RotateCcw,
    Eye,
    Edit,
    Trash2,
    Activity,
    Cpu,
    HardDrive,
    Network,
    Clock,
    Container,
    Filter,
    List,
    Grid
} from 'lucide-react';

export default function ServicesPage() {
    const router = useRouter();
    const { services, loading, isLoading, startService, stopService, restartService } = useServiceController();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'success';
            case 'stopped': return 'secondary';
            case 'paused': return 'warning';
            case 'restarting': return 'secondary';
            case 'error': return 'error';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return Play;
            case 'stopped': return Square;
            case 'paused': return Square;
            case 'restarting': return RotateCcw;
            case 'error': return Activity;
            default: return Square;
        }
    };

    const handleServiceControl = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
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
            }
        } catch (error) {
            console.error('Failed to control service:', error);
        }
    };

    const filteredServices = services?.filter(service => 
        statusFilter === 'all' || service.status === statusFilter
    ) || [];

    return (
        <>
            <Head>
                <title>Services - WakeDock</title>
                <meta name="description" content="Manage and monitor your Docker services with WakeDock" />
            </Head>

            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Services
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage and monitor your Docker services
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => router.push('/services/create')}
                                variant="primary"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Service
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
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

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Services List</h3>
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
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Services List */}
                    <div className="space-y-3">
                        {filteredServices.map((service) => {
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
                                                    <span>{service.uptime || '0s'}</span>
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

                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-3 w-3" />
                                                </Button>

                                                <Button size="sm" variant="outline">
                                                    <Edit className="h-3 w-3" />
                                                </Button>

                                                <Button size="sm" variant="outline">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {service.ports && service.ports.length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-600">Ports:</span>
                                                <div className="flex items-center space-x-1">
                                                    {service.ports.map((port, index) => (
                                                        <Badge key={index} variant="secondary">
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

                    {filteredServices.length === 0 && (
                        <Card className="p-8 text-center">
                            <Container className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                            <p className="text-gray-600 mb-4">
                                {statusFilter === 'all' 
                                    ? "You don't have any services yet. Create your first service to get started."
                                    : `No services with status "${statusFilter}" found.`
                                }
                            </p>
                            <Button
                                onClick={() => router.push('/services/create')}
                                variant="primary"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Service
                            </Button>
                        </Card>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}