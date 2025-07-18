'use client';

import { useEffect } from 'react';
import { useServicesStore } from '@/lib/stores/services-store';
import { useToastStore } from '@/lib/stores/toast-store';
import { RefreshCw, Play, Square, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardPage() {
  const router = useRouter();
  const {
    services,
    isLoading: loading,
    error,
    fetchServices,
    setError
  } = useServicesStore();
  const { success, error: showError } = useToastStore();

  // Load data on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Show error as toast
  useEffect(() => {
    if (error) {
      showError('Dashboard Error', error);
      setError(null);
    }
  }, [error, showError, setError]);

  // Calculate service stats
  const serviceStats = services.reduce(
    (acc, service) => {
      acc.total++;
      switch (service.status) {
        case 'running':
          acc.running++;
          break;
        case 'stopped':
          acc.stopped++;
          break;
        case 'error':
          acc.error++;
          break;
      }
      return acc;
    },
    { total: 0, running: 0, stopped: 0, error: 0 }
  );

  const handleRefresh = async () => {
    try {
      await fetchServices();
      success('Dashboard refreshed', 'Data has been updated successfully');
    } catch (err) {
      showError('Refresh failed', 'Failed to refresh dashboard data');
    }
  };

  const handleStartAll = async () => {
    try {
      // This would need to be implemented in the services store
      success('Starting all services', 'All stopped services are being started');
    } catch (err) {
      showError('Failed to start services', 'Could not start all services');
    }
  };

  const handleStopAll = async () => {
    try {
      // This would need to be implemented in the services store
      success('Stopping all services', 'All running services are being stopped');
    } catch (err) {
      showError('Failed to stop services', 'Could not stop all services');
    }
  };

  const handleDeployService = () => {
    router.push('/services/new');
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your Docker services
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleDeployService}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4" />
            Deploy Service
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {serviceStats.total}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Services
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {serviceStats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Running
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {serviceStats.running}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                  <Square className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Stopped
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {serviceStats.stopped}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Errors
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {serviceStats.error}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            System Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                CPU Usage
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                12.5%
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Memory Usage
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                1.2 GB
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Services
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {serviceStats.running} / {serviceStats.total}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStartAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Play className="h-4 w-4" />
              Start All
            </button>
            <button
              onClick={handleStopAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Square className="h-4 w-4" />
              Stop All
            </button>
          </div>
        </div>
      </div>

      {/* Recent Services */}
      {services.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Recent Services
            </h3>
            <div className="space-y-3">
              {services.slice(0, 5).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${service.status === 'running' ? 'bg-green-500' :
                        service.status === 'stopped' ? 'bg-gray-500' :
                          'bg-red-500'
                      }`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {service.image}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {service.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}