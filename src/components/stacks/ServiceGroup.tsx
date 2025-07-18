import React, { useState } from 'react';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  ChevronDown, 
  ChevronRight,
  Container,
  Server,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  ExternalLink,
  Clock,
  Image,
  Network,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';
import { Service, Container as ContainerType, Stack } from './StackCard';

interface ServiceGroupProps {
  stack?: Stack;
  services: Service[];
  title?: string;
  expanded?: boolean;
  onToggle?: () => void;
  onServiceAction?: (serviceId: string, action: string) => void;
  onContainerAction?: (containerId: string, action: string) => void;
}

export const ServiceGroup: React.FC<ServiceGroupProps> = ({
  stack,
  services,
  title,
  expanded = false,
  onToggle,
  onServiceAction,
  onContainerAction
}) => {
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const toggleServiceExpanded = (serviceId: string) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'green';
      case 'stopped':
        return 'gray';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'stopped':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleServiceAction = async (serviceId: string, action: string) => {
    if (!onServiceAction) return;
    
    setLoading(`${serviceId}-${action}`);
    try {
      await onServiceAction(serviceId, action);
    } finally {
      setLoading(null);
    }
  };

  const handleContainerAction = async (containerId: string, action: string) => {
    if (!onContainerAction) return;
    
    setLoading(`${containerId}-${action}`);
    try {
      await onContainerAction(containerId, action);
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatPorts = (ports: Record<string, any>) => {
    if (!ports || Object.keys(ports).length === 0) return 'No ports';
    
    const portMappings = Object.entries(ports)
      .filter(([_, value]) => value)
      .map(([internal, external]) => {
        if (Array.isArray(external)) {
          return `${external[0]?.HostPort || '?'}:${internal}`;
        }
        return internal;
      });
    
    return portMappings.join(', ') || 'No ports';
  };

  const getServiceCounts = () => {
    const running = services.filter(s => s.status === 'running').length;
    const stopped = services.filter(s => s.status === 'stopped').length;
    const error = services.filter(s => s.status === 'error').length;
    
    return { running, stopped, error, total: services.length };
  };

  const counts = getServiceCounts();

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {expanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            )}
            
            <div className="flex items-center gap-2">
              {stack ? (
                <Server className="w-5 h-5 text-blue-500" />
              ) : (
                <Package className="w-5 h-5 text-gray-500" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title || (stack ? `Stack: ${stack.name}` : 'Standalone Services')}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {counts.total} services
            </Badge>
            
            {counts.running > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                {counts.running} running
              </Badge>
            )}
            
            {counts.stopped > 0 && (
              <Badge variant="outline" className="text-gray-600 border-gray-200">
                {counts.stopped} stopped
              </Badge>
            )}
            
            {counts.error > 0 && (
              <Badge variant="outline" className="text-red-600 border-red-200">
                {counts.error} error
              </Badge>
            )}
          </div>
        </div>
      </Card.Header>
      
      {expanded && (
        <Card.Content>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleServiceExpanded(service.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      {expandedServices.has(service.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <Badge variant="outline" className={`text-${getStatusColor(service.status)}-600 border-${getStatusColor(service.status)}-200`}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-gray-600 border-gray-200">
                      {service.containers?.length || 0} containers
                    </Badge>
                    
                    {onServiceAction && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleServiceAction(service.id, 'start')}
                          disabled={loading === `${service.id}-start` || service.status === 'running'}
                          loading={loading === `${service.id}-start`}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleServiceAction(service.id, 'stop')}
                          disabled={loading === `${service.id}-stop` || service.status === 'stopped'}
                          loading={loading === `${service.id}-stop`}
                        >
                          <Pause className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleServiceAction(service.id, 'restart')}
                          disabled={loading?.startsWith(`${service.id}-`)}
                          loading={loading === `${service.id}-restart`}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Service Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Image className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Image:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{service.image}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Ports:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{formatPorts(service.ports)}</span>
                  </div>
                </div>
                
                {/* Expanded Service Details */}
                {expandedServices.has(service.id) && service.containers && (
                  <div className="mt-4 space-y-3">
                    <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Container className="w-4 h-4" />
                      Containers ({service.containers.length})
                    </h5>
                    
                    <div className="space-y-2">
                      {service.containers.map((container) => (
                        <div key={container.id} className="bg-white dark:bg-gray-700 p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(container.status)}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {container.name}
                                </span>
                              </div>
                              <Badge variant="outline" className={`text-${getStatusColor(container.status)}-600 border-${getStatusColor(container.status)}-200`}>
                                {container.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {formatDate(container.created)}
                              </div>
                              
                              {onContainerAction && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleContainerAction(container.id, 'start')}
                                    disabled={loading === `${container.id}-start` || container.status === 'running'}
                                    loading={loading === `${container.id}-start`}
                                  >
                                    <Play className="w-3 h-3" />
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleContainerAction(container.id, 'stop')}
                                    disabled={loading === `${container.id}-stop` || container.status === 'stopped'}
                                    loading={loading === `${container.id}-stop`}
                                  >
                                    <Pause className="w-3 h-3" />
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleContainerAction(container.id, 'restart')}
                                    disabled={loading?.startsWith(`${container.id}-`)}
                                    loading={loading === `${container.id}-restart`}
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Image className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400">Image:</span>
                              <span className="font-mono text-gray-900 dark:text-white">{container.image}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Network className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400">Ports:</span>
                              <span className="font-mono text-gray-900 dark:text-white">{formatPorts(container.ports)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card.Content>
      )}
    </Card>
  );
};

export default ServiceGroup;