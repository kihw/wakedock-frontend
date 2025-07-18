// Simplified monitoring page for v0.6.4
'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useServicesStore } from '@/lib/stores/services-store';

export default function MonitoringPage() {
  const { services, isLoading, error, fetchServices } = useServicesStore();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <DashboardLayout title="System Monitoring">
      <div className="space-y-6">
        {/* System Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900">Total Services</h3>
              <p className="text-2xl font-bold text-blue-600">{services.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-900">Running</h3>
              <p className="text-2xl font-bold text-green-600">
                {services.filter(s => s.status === 'running').length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-900">Stopped</h3>
              <p className="text-2xl font-bold text-red-600">
                {services.filter(s => s.status === 'stopped').length}
              </p>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Services Status</h2>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-red-600 py-4">{error}</div>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.image}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${service.status === 'running'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {service.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${service.health_status === 'healthy'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {service.health_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
