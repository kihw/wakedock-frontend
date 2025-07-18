import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Container,
  Server,
  Network,
  HardDrive,
  Activity,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export interface Service {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  image: string;
  ports: Record<string, any>;
  created: string;
  containers: Container[];
}

export interface Container {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  image: string;
  created: string;
  ports: Record<string, any>;
}

export interface StackStats {
  total_containers: number;
  running_containers: number;
  stopped_containers: number;
  services_count: number;
  networks_count: number;
  volumes_count: number;
  cpu_usage: number;
  memory_usage: number;
}

export interface Stack {
  name: string;
  status: 'running' | 'stopped' | 'error';
  services: Service[];
  containers: Container[];
  stats: StackStats;
  deployment_info?: any;
}

interface StackCardProps {
  stack: Stack;
  onAction: (action: string) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

export const StackCard: React.FC<StackCardProps> = ({
  stack,
  onAction,
  expanded = false,
  onToggleExpanded
}) => {
  const [loading, setLoading] = useState<string | null>(null);

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

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      await onAction(action);
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleExpanded}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {expanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {stack.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(stack.status)}
              <Badge variant="outline" className={`text-${getStatusColor(stack.status)}-600 border-${getStatusColor(stack.status)}-200`}>
                {stack.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('start')}
              disabled={loading === 'start' || stack.status === 'running'}
              loading={loading === 'start'}
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('stop')}
              disabled={loading === 'stop' || stack.status === 'stopped'}
              loading={loading === 'stop'}
            >
              <Pause className="w-4 h-4" />
              Stop
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('restart')}
              disabled={loading !== null}
              loading={loading === 'restart'}
            >
              <RotateCcw className="w-4 h-4" />
              Restart
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('remove')}
              disabled={loading !== null}
              loading={loading === 'remove'}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
          </div>
        </div>
      </Card.Header>
      
      <Card.Content>
        {/* Stack Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Container className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Containers</p>
              <p className="font-medium">
                {stack.stats.running_containers}/{stack.stats.total_containers}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Services</p>
              <p className="font-medium">{stack.stats.services_count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Networks</p>
              <p className="font-medium">{stack.stats.networks_count}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Volumes</p>
              <p className="font-medium">{stack.stats.volumes_count}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {(stack.stats.cpu_usage > 0 || stack.stats.memory_usage > 0) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
                <p className="font-medium">{stack.stats.cpu_usage.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
                <p className="font-medium">{stack.stats.memory_usage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-6">
            {/* Services */}
            {stack.services.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Services ({stack.services.length})
                </h4>
                <div className="space-y-3">
                  {stack.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(service.status)}
                            <span className="font-medium">{service.name}</span>
                          </div>
                          <Badge variant="outline" className={`text-${getStatusColor(service.status)}-600 border-${getStatusColor(service.status)}-200`}>
                            {service.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {service.containers?.length || 0} containers
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Image:</span>
                          <span className="ml-2 font-mono">{service.image}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Ports:</span>
                          <span className="ml-2 font-mono">{formatPorts(service.ports)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Containers */}
            {stack.containers.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <Container className="w-4 h-4" />
                  Containers ({stack.containers.length})
                </h4>
                <div className="space-y-3">
                  {stack.containers.map((container) => (
                    <div key={container.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(container.status)}
                            <span className="font-medium">{container.name}</span>
                          </div>
                          <Badge variant="outline" className={`text-${getStatusColor(container.status)}-600 border-${getStatusColor(container.status)}-200`}>
                            {container.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(container.created)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Image:</span>
                          <span className="ml-2 font-mono">{container.image}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Ports:</span>
                          <span className="ml-2 font-mono">{formatPorts(container.ports)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deployment Info */}
            {stack.deployment_info && (
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Deployment Info
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
                    {JSON.stringify(stack.deployment_info, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default StackCard;