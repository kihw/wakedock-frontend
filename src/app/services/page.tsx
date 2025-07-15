'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useServicesStore } from '@/lib/stores/services-store';
import { useToastStore } from '@/lib/stores/toast-store';
import { ServiceCard } from '@/components/services/service-card';
import { ServiceDetails } from '@/components/services/service-details';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';

function ServicesPage() {
  const { 
    services, 
    loading, 
    error, 
    fetchServices, 
    selectedService,
    setSelectedService 
  } = useServicesStore();
  
  const { success: showSuccess, error: showError } = useToastStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (error) {
      showError('Services Error', error);
    }
  }, [error, showError]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.image.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || service.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setShowDetails(true);
  };

  const handleServiceAction = async (serviceId: string, action: string) => {
    try {
      // Action handlers will be implemented with the store
      showSuccess('Service Action', `${action} action completed for service ${serviceId}`);
      await fetchServices(); // Refresh the list
    } catch (error) {
      showError('Service Action Failed', `Failed to ${action} service`);
    }
  };

  const handleRefresh = () => {
    fetchServices();
    showSuccess('Services', 'Services refreshed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Docker Services
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor your Docker containers
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
            <Plus className="h-4 w-4" />
            New Service
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services by name or image..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="paused">Paused</option>
            <option value="restarting">Restarting</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={() => handleServiceSelect(service)}
              onAction={handleServiceAction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No services found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first Docker service.'
            }
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
              <Plus className="h-4 w-4" />
              Create First Service
            </button>
          )}
        </div>
      )}

      {/* Service Details Modal */}
      {showDetails && selectedService && (
        <ServiceDetails
          service={selectedService}
          onClose={() => setShowDetails(false)}
          onAction={handleServiceAction}
        />
      )}
    </div>
  );
}

export default function ServicesPageWrapper() {
  return (
    <DashboardLayout>
      <ServicesPage />
    </DashboardLayout>
  );
}