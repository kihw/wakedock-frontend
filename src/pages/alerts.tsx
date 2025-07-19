import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Shield,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Clock,
    Eye,
    X,
    Settings,
    Plus,
    Filter,
    Search
} from 'lucide-react';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    source: string;
    acknowledged: boolean;
    resolved: boolean;
}

const MOCK_ALERTS: Alert[] = [
    {
        id: 'alert-1',
        type: 'critical',
        title: 'Container Memory Limit Exceeded',
        message: 'nginx-web container is using 95% of allocated memory (512MB)',
        timestamp: '2024-01-20T14:30:00Z',
        source: 'nginx-web',
        acknowledged: false,
        resolved: false
    },
    {
        id: 'alert-2',
        type: 'warning',
        title: 'High CPU Usage',
        message: 'postgres-db container CPU usage has been above 80% for 10 minutes',
        timestamp: '2024-01-20T14:25:00Z',
        source: 'postgres-db',
        acknowledged: true,
        resolved: false
    },
    {
        id: 'alert-3',
        type: 'info',
        title: 'Container Restart',
        message: 'redis-cache container was restarted automatically',
        timestamp: '2024-01-20T14:15:00Z',
        source: 'redis-cache',
        acknowledged: true,
        resolved: true
    },
    {
        id: 'alert-4',
        type: 'critical',
        title: 'Service Unavailable',
        message: 'api-gateway container is not responding to health checks',
        timestamp: '2024-01-20T14:10:00Z',
        source: 'api-gateway',
        acknowledged: false,
        resolved: false
    },
    {
        id: 'alert-5',
        type: 'success',
        title: 'Backup Completed',
        message: 'Database backup completed successfully',
        timestamp: '2024-01-20T13:00:00Z',
        source: 'backup-service',
        acknowledged: true,
        resolved: true
    }
];

export default function AlertsPage() {
    const router = useRouter();
    const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getAlertIcon = (type: Alert['type']) => {
        switch (type) {
            case 'critical': return AlertCircle;
            case 'warning': return AlertTriangle;
            case 'info': return Shield;
            case 'success': return CheckCircle;
            default: return Shield;
        }
    };

    const getAlertColor = (type: Alert['type']) => {
        switch (type) {
            case 'critical': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'secondary';
            case 'success': return 'success';
            default: return 'secondary';
        }
    };

    const handleAcknowledge = (alertId: string) => {
        setAlerts(prev => prev.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ));
    };

    const handleResolve = (alertId: string) => {
        setAlerts(prev => prev.map(alert => 
            alert.id === alertId ? { ...alert, resolved: true, acknowledged: true } : alert
        ));
    };

    const handleDismiss = (alertId: string) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    const filteredAlerts = alerts.filter(alert => {
        // Type filter
        if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
        
        // Status filter
        if (statusFilter === 'active' && (alert.acknowledged || alert.resolved)) return false;
        if (statusFilter === 'acknowledged' && !alert.acknowledged) return false;
        if (statusFilter === 'resolved' && !alert.resolved) return false;
        
        // Search filter
        if (searchTerm && !alert.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !alert.message.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !alert.source.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        
        return true;
    });

    const alertCounts = {
        total: alerts.length,
        critical: alerts.filter(a => a.type === 'critical' && !a.resolved).length,
        warning: alerts.filter(a => a.type === 'warning' && !a.resolved).length,
        active: alerts.filter(a => !a.acknowledged && !a.resolved).length
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <>
            <Head>
                <title>Alerts - WakeDock</title>
                <meta name="description" content="Monitor and manage system alerts and notifications" />
            </Head>

            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Alerts & Notifications
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Monitor system alerts and manage notifications
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => router.push('/settings')}
                                variant="outline"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Alert Settings
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Alerts</p>
                                    <p className="text-2xl font-bold">{alertCounts.total}</p>
                                </div>
                                <Shield className="h-8 w-8 text-blue-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Critical</p>
                                    <p className="text-2xl font-bold text-red-600">{alertCounts.critical}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Warnings</p>
                                    <p className="text-2xl font-bold text-yellow-600">{alertCounts.warning}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-orange-600">{alertCounts.active}</p>
                                </div>
                                <Clock className="h-8 w-8 text-orange-500" />
                            </div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search alerts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                                >
                                    <option value="all">All Types</option>
                                    <option value="critical">Critical</option>
                                    <option value="warning">Warning</option>
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="acknowledged">Acknowledged</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Alerts List */}
                    <div className="space-y-3">
                        {filteredAlerts.map((alert) => {
                            const AlertIcon = getAlertIcon(alert.type);
                            return (
                                <Card key={alert.id} className={`p-4 ${!alert.acknowledged ? 'border-l-4' : ''} ${
                                    alert.type === 'critical' ? 'border-l-red-500' :
                                    alert.type === 'warning' ? 'border-l-yellow-500' :
                                    alert.type === 'info' ? 'border-l-blue-500' :
                                    'border-l-green-500'
                                }`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <AlertIcon className={`h-5 w-5 mt-0.5 ${
                                                alert.type === 'critical' ? 'text-red-500' :
                                                alert.type === 'warning' ? 'text-yellow-500' :
                                                alert.type === 'info' ? 'text-blue-500' :
                                                'text-green-500'
                                            }`} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium">{alert.title}</h4>
                                                    <Badge variant={getAlertColor(alert.type)} size="sm">
                                                        {alert.type}
                                                    </Badge>
                                                    {alert.acknowledged && (
                                                        <Badge variant="secondary" size="sm">
                                                            Acknowledged
                                                        </Badge>
                                                    )}
                                                    {alert.resolved && (
                                                        <Badge variant="success" size="sm">
                                                            Resolved
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>Source: {alert.source}</span>
                                                    <span>{formatTimestamp(alert.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            {!alert.acknowledged && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAcknowledge(alert.id)}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Acknowledge
                                                </Button>
                                            )}
                                            {!alert.resolved && (
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => handleResolve(alert.id)}
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Resolve
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDismiss(alert.id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredAlerts.length === 0 && (
                        <Card className="p-8 text-center">
                            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                                    ? "No alerts match your current filters."
                                    : "No alerts at this time. Your system is running smoothly."
                                }
                            </p>
                            {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
                                <Button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setTypeFilter('all');
                                        setStatusFilter('all');
                                    }}
                                    variant="outline"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </Card>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}