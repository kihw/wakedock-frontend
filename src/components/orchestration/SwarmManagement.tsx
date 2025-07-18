import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/tabs';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Table } from '../ui/Table';
import { MetricCard } from '../ui/MetricCard';
import { LoadingSpinner } from '../ui/loading-spinner';
import { AlertCircle, Server, Globe, Activity, Users, RefreshCw, Settings, Plus } from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface SwarmCluster {
  id: string;
  nodes_count: number;
  managers_count: number;
  workers_count: number;
  services_count: number;
  networks_count: number;
  is_healthy: boolean;
  version: string;
  created_at: string;
}

interface SwarmNode {
  id: string;
  hostname: string;
  role: 'manager' | 'worker';
  status: string;
  availability: string;
  leader: boolean;
  cpu_cores: number;
  memory_bytes: number;
  labels: Record<string, string>;
  engine_version: string;
}

interface SwarmService {
  id: string;
  name: string;
  image: string;
  mode: 'replicated' | 'global';
  replicas_desired: number;
  replicas_running: number;
  replicas_ready: number;
  ports: Array<{ protocol: string; target_port: number; published_port: number }>;
  networks: string[];
  constraints: string[];
  labels: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const SwarmManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [cluster, setCluster] = useState<SwarmCluster | null>(null);
  const [nodes, setNodes] = useState<SwarmNode[]>([]);
  const [services, setServices] = useState<SwarmService[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClusterInfo = async () => {
    try {
      const response = await api.get('/api/v1/swarm/cluster');
      setCluster(response.data);
    } catch (error) {
      console.error('Failed to fetch cluster info:', error);
      toast.error('Failed to load cluster information');
    }
  };

  const fetchNodes = async () => {
    try {
      const response = await api.get('/api/v1/swarm/nodes');
      setNodes(response.data);
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
      toast.error('Failed to load nodes');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/v1/swarm/services');
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchClusterInfo(), fetchNodes(), fetchServices()]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'nodes', label: 'Nodes', icon: Server },
    { id: 'services', label: 'Services', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Container Orchestration
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage Docker Swarm clusters and orchestration
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          loading={refreshing}
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      {/* Cluster Status */}
      {cluster && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIndicator status={cluster.is_healthy ? 'active' : 'error'} size="lg" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Swarm Cluster</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Version {cluster.version}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={cluster.is_healthy ? 'success' : 'error'}>
                {cluster.is_healthy ? 'Healthy' : 'Unhealthy'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Metrics */}
      {cluster && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Nodes"
            value={cluster.nodes_count}
            icon={Server}
            trend={{ value: 0, direction: 'up' }}
          />
          <MetricCard
            title="Managers"
            value={cluster.managers_count}
            icon={Users}
            trend={{ value: 0, direction: 'up' }}
          />
          <MetricCard
            title="Workers"
            value={cluster.workers_count}
            icon={Users}
            trend={{ value: 0, direction: 'up' }}
          />
          <MetricCard
            title="Services"
            value={cluster.services_count}
            icon={Activity}
            trend={{ value: 0, direction: 'up' }}
          />
          <MetricCard
            title="Networks"
            value={cluster.networks_count}
            icon={Globe}
            trend={{ value: 0, direction: 'up' }}
          />
        </div>
      )}

      {/* Tabs Content */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cluster Health */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium">Cluster Health</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
                  <StatusIndicator status="active" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Manager Quorum</span>
                  <StatusIndicator status={cluster?.managers_count >= 3 ? 'active' : 'warning'} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Service Deployment</span>
                  <StatusIndicator status="active" />
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Recent Events */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium">Recent Events</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  No recent events
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === 'nodes' && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Swarm Nodes</h3>
              <Button size="sm" icon={Plus}>
                Add Node
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <Table
              columns={[
                { key: 'hostname', label: 'Hostname' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' },
                { key: 'availability', label: 'Availability' },
                { key: 'resources', label: 'Resources' },
                { key: 'version', label: 'Engine Version' },
              ]}
              data={nodes.map((node) => ({
                hostname: (
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{node.hostname}</span>
                    {node.leader && <Badge variant="primary" size="sm">Leader</Badge>}
                  </div>
                ),
                role: (
                  <Badge variant={node.role === 'manager' ? 'primary' : 'secondary'}>
                    {node.role}
                  </Badge>
                ),
                status: <StatusIndicator status={node.status === 'ready' ? 'active' : 'error'} />,
                availability: <Badge>{node.availability}</Badge>,
                resources: (
                  <div className="text-sm">
                    <div>{node.cpu_cores} CPUs</div>
                    <div className="text-gray-500">
                      {(node.memory_bytes / 1024 / 1024 / 1024).toFixed(1)} GB RAM
                    </div>
                  </div>
                ),
                version: <span className="text-sm">{node.engine_version}</span>,
              }))}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'services' && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Swarm Services</h3>
              <Button size="sm" icon={Plus}>
                Deploy Service
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <Table
              columns={[
                { key: 'name', label: 'Service Name' },
                { key: 'image', label: 'Image' },
                { key: 'mode', label: 'Mode' },
                { key: 'replicas', label: 'Replicas' },
                { key: 'ports', label: 'Ports' },
                { key: 'actions', label: 'Actions' },
              ]}
              data={services.map((service) => ({
                name: (
                  <div className="font-medium">
                    {service.name}
                  </div>
                ),
                image: (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {service.image}
                  </div>
                ),
                mode: (
                  <Badge variant="secondary">
                    {service.mode}
                  </Badge>
                ),
                replicas: (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      service.replicas_running === service.replicas_desired
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}>
                      {service.replicas_running}/{service.replicas_desired}
                    </span>
                    {service.replicas_ready < service.replicas_running && (
                      <Badge variant="warning" size="sm">
                        {service.replicas_ready} ready
                      </Badge>
                    )}
                  </div>
                ),
                ports: (
                  <div className="text-sm">
                    {service.ports.map((port, idx) => (
                      <div key={idx}>
                        {port.published_port}:{port.target_port}/{port.protocol}
                      </div>
                    ))}
                  </div>
                ),
                actions: (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">Scale</Button>
                    <Button size="sm" variant="ghost">Update</Button>
                  </div>
                ),
              }))}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium">Swarm Settings</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="font-medium mb-2">Cluster Configuration</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Auto-lock managers
                    </span>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Certificate rotation
                    </span>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="font-medium mb-2">Node Configuration</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Default node availability
                    </span>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Service Defaults</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Update configuration
                    </span>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Rollback configuration
                    </span>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};