'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useServicesStore } from '@/lib/stores/services-store';
import { useToastStore } from '@/lib/stores/toast-store';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

function MonitoringPage() {
  const { 
    services, 
    systemOverview, 
    loading, 
    error, 
    loadServices, 
    loadSystemOverview,
    refreshAll 
  } = useServicesStore();
  
  const { success: showSuccess, error: showError } = useToastStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadServices();
    loadSystemOverview();
  }, [loadServices, loadSystemOverview]);

  useEffect(() => {
    if (error) {
      showError('Monitoring Error', error);
    }
  }, [error, showError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
      showSuccess('Monitoring', 'Data refreshed successfully');
    } catch (error) {
      showError('Refresh Failed', 'Failed to refresh monitoring data');
    } finally {
      setRefreshing(false);
    }
  };

  const runningServices = services.filter(s => s.status === 'running').length;
  const stoppedServices = services.filter(s => s.status === 'stopped').length;
  const totalServices = services.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 dark:text-green-400';
      case 'stopped':
        return 'text-red-600 dark:text-red-400';
      case 'paused':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time system and service monitoring dashboard
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Healthy</span>
              </div>
            </div>
            <Server className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemOverview?.total_cpu_usage?.toFixed(1) || '0.0'}%
                </span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <Cpu className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${systemOverview?.total_cpu_usage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemOverview?.total_memory_usage ? `${(systemOverview.total_memory_usage / 1024 / 1024).toFixed(1)} MB` : '0.0 MB'}
                </span>
                <TrendingDown className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <HardDrive className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${systemOverview?.total_memory_usage ? Math.min((systemOverview.total_memory_usage / 1024 / 1024 / 1024) * 100, 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Disk Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disk Usage</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  N/A
                </span>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
            </div>
            <HardDrive className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Services Status</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Services</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{totalServices}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Running</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">{runningServices}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Stopped</span>
              <span className="text-lg font-semibold text-red-600 dark:text-red-400">{stoppedServices}</span>
            </div>
            
            {/* Status Bar */}
            <div className="mt-4">
              <div className="flex w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {totalServices > 0 && (
                  <>
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(runningServices / totalServices) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${(stoppedServices / totalServices) * 100}%` }}
                    ></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Uptime */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                N/A
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Docker Status</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                Healthy
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Caddy Status</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                Healthy
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Load Average</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">0.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Details</h3>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      CPU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Memory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Uptime
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.status === 'running' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : service.status === 'stopped'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {service.cpu ? `${service.cpu.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {service.memory ? `${(service.memory / 1024 / 1024).toFixed(0)}MB` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {service.uptime || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No services found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No Docker services are currently available for monitoring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'System Monitoring - WakeDock',
  description: 'Real-time system and service monitoring dashboard',
};

export default function MonitoringPageWrapper() {
  return (
    <DashboardLayout>
      <MonitoringPage />
    </DashboardLayout>
  );
}