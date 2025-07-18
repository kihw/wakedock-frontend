import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { StatusIndicator } from '../ui/StatusIndicator';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Select } from '../forms/Select';
import { Input } from '../ui/Input';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Square, 
  Terminal, 
  Trash2, 
  Settings,
  Cpu,
  HardDrive,
  Activity,
  Clock,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: string;
  started: string;
  ports: Array<{ private: number; public: number; type: string }>;
  networks: string[];
  mounts: string[];
  cpu_percent: number;
  memory_usage: number;
  memory_limit: number;
  health_status?: string;
  restart_count: number;
}

interface ContainerStats {
  cpu_percent: number;
  memory_usage: number;
  memory_limit: number;
  network_rx: number;
  network_tx: number;
  block_read: number;
  block_write: number;
}

export const AdvancedContainerControls: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, ContainerStats>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchContainers = async () => {
    try {
      const response = await api.get('/api/v1/containers');
      setContainers(response.data);
    } catch (error) {
      console.error('Failed to fetch containers:', error);
      toast.error('Failed to load containers');
    }
  };

  const fetchStats = async () => {
    try {
      const statsPromises = containers.map(container =>
        api.get(`/api/v1/containers/${container.id}/stats`)
          .then(res => ({ id: container.id, stats: res.data }))
          .catch(() => ({ id: container.id, stats: null }))
      );
      
      const results = await Promise.all(statsPromises);
      const newStats: Record<string, ContainerStats> = {};
      results.forEach(result => {
        if (result.stats) {
          newStats[result.id] = result.stats;
        }
      });
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchContainers();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containers.length > 0) {
      fetchStats();
      const interval = setInterval(fetchStats, 2000);
      return () => clearInterval(interval);
    }
  }, [containers]);

  const handleAction = async (containerId: string, action: string) => {
    setActionLoading(containerId);
    try {
      await api.post(`/api/v1/containers/${containerId}/${action}`);
      toast.success(`Container ${action} successful`);
      await fetchContainers();
    } catch (error) {
      console.error(`Failed to ${action} container:`, error);
      toast.error(`Failed to ${action} container`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredContainers = containers.filter(container => {
    const matchesFilter = filter === 'all' || container.state.toLowerCase() === filter;
    const matchesSearch = container.name.toLowerCase().includes(search.toLowerCase()) ||
                         container.image.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running': return 'active';
      case 'paused': return 'warning';
      case 'stopped': return 'inactive';
      case 'dead': return 'error';
      default: return 'inactive';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search containers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Containers' },
              { value: 'running', label: 'Running' },
              { value: 'stopped', label: 'Stopped' },
              { value: 'paused', label: 'Paused' },
            ]}
          />
        </div>
      </Card>

      {/* Container List */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium">Containers ({filteredContainers.length})</h3>
        </Card.Header>
        <Card.Content>
          <Table
            columns={[
              { key: 'name', label: 'Container' },
              { key: 'status', label: 'Status' },
              { key: 'resources', label: 'Resources' },
              { key: 'health', label: 'Health' },
              { key: 'network', label: 'Network' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={filteredContainers.map((container) => {
              const containerStats = stats[container.id];
              return {
                name: (
                  <div>
                    <div className="font-medium">{container.name}</div>
                    <div className="text-sm text-gray-500">{container.image}</div>
                  </div>
                ),
                status: (
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={getStatusColor(container.state)} />
                    <Badge variant={container.state === 'running' ? 'success' : 'secondary'}>
                      {container.state}
                    </Badge>
                  </div>
                ),
                resources: containerStats ? (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3 w-3 text-gray-400" />
                      <span>{containerStats.cpu_percent.toFixed(1)}% CPU</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-3 w-3 text-gray-400" />
                      <span>
                        {formatBytes(containerStats.memory_usage)} / {formatBytes(containerStats.memory_limit)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">N/A</span>
                ),
                health: (
                  <div className="space-y-1">
                    {container.health_status && (
                      <Badge 
                        variant={container.health_status === 'healthy' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {container.health_status}
                      </Badge>
                    )}
                    {container.restart_count > 0 && (
                      <div className="flex items-center gap-1 text-sm text-yellow-600">
                        <AlertCircle className="h-3 w-3" />
                        {container.restart_count} restarts
                      </div>
                    )}
                  </div>
                ),
                network: (
                  <div className="text-sm">
                    {container.ports.length > 0 ? (
                      container.ports.map((port, idx) => (
                        <div key={idx}>
                          {port.public}:{port.private}/{port.type}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500">No ports</span>
                    )}
                  </div>
                ),
                actions: (
                  <div className="flex items-center gap-1">
                    {container.state === 'running' ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Pause}
                          onClick={() => handleAction(container.id, 'pause')}
                          loading={actionLoading === container.id}
                          title="Pause"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Square}
                          onClick={() => handleAction(container.id, 'stop')}
                          loading={actionLoading === container.id}
                          title="Stop"
                        />
                      </>
                    ) : container.state === 'paused' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Play}
                        onClick={() => handleAction(container.id, 'unpause')}
                        loading={actionLoading === container.id}
                        title="Unpause"
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Play}
                        onClick={() => handleAction(container.id, 'start')}
                        loading={actionLoading === container.id}
                        title="Start"
                      />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={RotateCw}
                      onClick={() => handleAction(container.id, 'restart')}
                      loading={actionLoading === container.id}
                      title="Restart"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Terminal}
                      onClick={() => {
                        // Open terminal/exec interface
                        toast.info('Terminal feature coming soon');
                      }}
                      title="Terminal"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Settings}
                      onClick={() => setSelectedContainer(container.id)}
                      title="Details"
                    />
                  </div>
                ),
              };
            })}
          />
        </Card.Content>
      </Card>

      {/* Container Details Modal */}
      {selectedContainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Container Details</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedContainer(null)}
                >
                  Close
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              {/* Container details implementation */}
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Detailed container information and controls will be displayed here.
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
};