import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ServiceGroup } from '../stacks/ServiceGroup';
import { useStacks } from '../../hooks/useStacks';
import { 
  Server, 
  Package, 
  ChevronRight, 
  RefreshCw, 
  Activity,
  Container,
  Eye,
  EyeOff,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  image: string;
  ports: Record<string, any>;
  created: string;
  containers: any[];
  stack_name?: string;
  lastAccessed?: string;
}

interface RecentServicesProps {
  services: Service[];
  maxItems?: number;
  onServiceClick?: (service: Service) => void;
  onViewAll?: () => void;
  showMetrics?: boolean;
  className?: string;
}

export const RecentServices: React.FC<RecentServicesProps> = ({
  services = [],
  maxItems = 8,
  onServiceClick,
  onViewAll,
  showMetrics = true,
  className = ''
}) => {
  const { stacks, overview, loading: stacksLoading, refreshStacks } = useStacks();
  const [groupByStack, setGroupByStack] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Group services by stack
  const groupedServices = React.useMemo(() => {
    if (!groupByStack) {
      return {
        standalone: services,
        stacks: []
      };
    }

    const stackServices = new Map<string, Service[]>();
    const standaloneServices: Service[] = [];

    services.forEach(service => {
      if (service.stack_name) {
        if (!stackServices.has(service.stack_name)) {
          stackServices.set(service.stack_name, []);
        }
        stackServices.get(service.stack_name)!.push(service);
      } else {
        standaloneServices.push(service);
      }
    });

    return {
      standalone: standaloneServices,
      stacks: Array.from(stackServices.entries()).map(([stackName, stackServices]) => ({
        name: stackName,
        services: stackServices,
        stack: stacks.find(s => s.name === stackName)
      }))
    };
  }, [services, groupByStack, stacks]);

  // Filter services by status
  const filteredServices = React.useMemo(() => {
    const filterByStatus = (serviceList: Service[]) => {
      if (statusFilter === 'all') return serviceList;
      return serviceList.filter(service => service.status === statusFilter);
    };

    return {
      standalone: filterByStatus(groupedServices.standalone),
      stacks: groupedServices.stacks.map(stack => ({
        ...stack,
        services: filterByStatus(stack.services)
      })).filter(stack => stack.services.length > 0)
    };
  }, [groupedServices, statusFilter]);

  // Limit services if not showing all
  const displayServices = React.useMemo(() => {
    if (showAll) return filteredServices;

    const limitServices = (serviceList: Service[]) => serviceList.slice(0, maxItems);
    const remainingItems = Math.max(0, maxItems - filteredServices.standalone.length);
    
    return {
      standalone: limitServices(filteredServices.standalone),
      stacks: filteredServices.stacks.slice(0, Math.ceil(remainingItems / 2)).map(stack => ({
        ...stack,
        services: limitServices(stack.services)
      }))
    };
  }, [filteredServices, showAll, maxItems]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'green';
      case 'stopped': return 'gray';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'stopped': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getServiceStats = () => {
    const total = services.length;
    const running = services.filter(s => s.status === 'running').length;
    const stopped = services.filter(s => s.status === 'stopped').length;
    const error = services.filter(s => s.status === 'error').length;
    
    return { total, running, stopped, error };
  };

  const stats = getServiceStats();

  const handleServiceClick = (service: Service) => {
    if (onServiceClick) {
      onServiceClick(service);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card className={className}>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Services
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGroupByStack(!groupByStack)}
              className="flex items-center gap-2"
            >
              {groupByStack ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {groupByStack ? 'Ungroup' : 'Group by Stack'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStacks}
              disabled={stacksLoading}
            >
              <RefreshCw className={`w-4 h-4 ${stacksLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Metrics */}
        {showMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.running}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.stopped}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stopped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Error</div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="flex items-center gap-2 mt-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="error">Error</option>
          </select>
        </div>
      </Card.Header>
      
      <Card.Content>
        {services.length === 0 ? (
          <div className="text-center py-8">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No services found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stack Groups */}
            {displayServices.stacks.map((stackGroup) => (
              <ServiceGroup
                key={stackGroup.name}
                stack={stackGroup.stack}
                services={stackGroup.services}
                title={`Stack: ${stackGroup.name}`}
                expanded={false}
                onToggle={() => {}}
                onServiceAction={async (serviceId, action) => {
                  // Handle service action
                  console.log(`Service ${serviceId} action: ${action}`);
                }}
              />
            ))}
            
            {/* Standalone Services */}
            {displayServices.standalone.length > 0 && (
              <div className="space-y-3">
                {displayServices.stacks.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Standalone Services
                    </h4>
                    <Badge variant="outline" className="text-gray-600 border-gray-200">
                      {displayServices.standalone.length}
                    </Badge>
                  </div>
                )}
                
                {displayServices.standalone.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {service.image}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant="outline" className={`text-${getStatusColor(service.status)}-600 border-${getStatusColor(service.status)}-200`}>
                          {service.status}
                        </Badge>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(service.lastAccessed)}
                        </div>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show More/Less Toggle */}
            {services.length > maxItems && (
              <div className="flex items-center justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2"
                >
                  {showAll ? 'Show Less' : `Show All (${services.length - maxItems} more)`}
                  <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
                </Button>
              </div>
            )}
            
            {/* View All Button */}
            {onViewAll && (
              <div className="flex items-center justify-center pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button
                  variant="outline"
                  onClick={onViewAll}
                  className="flex items-center gap-2"
                >
                  View All Services
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default RecentServices;