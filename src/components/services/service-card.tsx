'use client';

import { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  MoreVertical, 
  ExternalLink,
  Clock,
  Cpu,
  HardDrive
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting';
  ports: string[];
  created: string;
  uptime?: string;
  cpu?: number;
  memory?: number;
  description?: string;
}

interface ServiceCardProps {
  service: Service;
  onSelect: () => void;
  onAction: (serviceId: string, action: string) => void;
}

export function ServiceCard({ service, onSelect, onAction }: ServiceCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'stopped':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'restarting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>;
      case 'stopped':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'paused':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'restarting':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onAction(service.id, action);
    setShowActions(false);
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(service.status)}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {service.name}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {service.image}
          </p>
        </div>
        
        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <div className="py-1">
                {service.status === 'stopped' && (
                  <button
                    onClick={(e) => handleAction('start', e)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Play className="h-4 w-4" />
                    Start
                  </button>
                )}
                
                {service.status === 'running' && (
                  <>
                    <button
                      onClick={(e) => handleAction('pause', e)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </button>
                    <button
                      onClick={(e) => handleAction('stop', e)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Square className="h-4 w-4" />
                      Stop
                    </button>
                  </>
                )}
                
                {service.status === 'paused' && (
                  <button
                    onClick={(e) => handleAction('unpause', e)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </button>
                )}
                
                <button
                  onClick={(e) => handleAction('restart', e)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </button>
                
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
        </span>
      </div>

      {/* Ports */}
      {service.ports && service.ports.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ports</p>
          <div className="flex flex-wrap gap-1">
            {service.ports.slice(0, 3).map((port, index) => (
              <span 
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {port}
              </span>
            ))}
            {service.ports.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                +{service.ports.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Metrics */}
      {service.status === 'running' && (
        <div className="space-y-2">
          {service.cpu !== undefined && (
            <div className="flex items-center gap-2">
              <Cpu className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                CPU: {service.cpu.toFixed(1)}%
              </span>
            </div>
          )}
          
          {service.memory !== undefined && (
            <div className="flex items-center gap-2">
              <HardDrive className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Memory: {(service.memory / 1024 / 1024).toFixed(0)}MB
              </span>
            </div>
          )}
          
          {service.uptime && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Uptime: {service.uptime}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {service.description && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {service.description}
          </p>
        </div>
      )}
    </div>
  );
}