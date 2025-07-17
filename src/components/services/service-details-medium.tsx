// Simplified service details for v0.6.4
'use client';

import React from 'react';
import { Service } from '@/lib/types/service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Play,
  Square,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';

interface ServiceDetailsProps {
  service: Service;
  onClose: () => void;
  onAction: (serviceId: string, action: string) => void;
}

export function ServiceDetails({ service, onClose, onAction }: ServiceDetailsProps) {
  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      case 'starting':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopping':
        return 'bg-orange-100 text-orange-800';
      case 'restarting':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">{service.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Health:</span>
                  <Badge className={
                    service.health_status === 'healthy'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {service.health_status}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Image:</span>
                  <p className="text-sm font-mono">{service.image}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">ID:</span>
                  <p className="text-sm font-mono">{service.id}</p>
                </div>
              </div>
            </div>

            {/* Ports */}
            {service.ports && service.ports.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Ports</h3>
                <div className="space-y-1">
                  {service.ports.map((port, index) => (
                    <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                      {port.host_port}:{port.container_port}/{port.protocol}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Environment Variables */}
            {service.environment && Object.keys(service.environment).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Environment Variables</h3>
                <div className="space-y-1">
                  {Object.entries(service.environment).map(([key, value]) => (
                    <div key={key} className="text-sm font-mono bg-gray-50 p-2 rounded">
                      {key}={value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Volumes */}
            {service.volumes && service.volumes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Volumes</h3>
                <div className="space-y-1">
                  {service.volumes.map((volume, index) => (
                    <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                      {volume.host_path}:{volume.container_path} ({volume.mode})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {service.status === 'running' && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAction(service.id, 'stop')}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAction(service.id, 'restart')}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Restart
                  </Button>
                </>
              )}
              {service.status === 'stopped' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onAction(service.id, 'start')}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onAction(service.id, 'delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
