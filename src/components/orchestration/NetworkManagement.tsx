import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Input } from '../ui/Input';
import { Select } from '../forms/Select';
import { 
  Network, 
  Plus, 
  Trash2, 
  Info,
  Globe,
  Shield,
  Link,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
  scope: string;
  internal: boolean;
  attachable: boolean;
  ingress: boolean;
  ipam: {
    driver: string;
    config: Array<{
      subnet: string;
      gateway: string;
    }>;
  };
  containers: number;
  created: string;
  labels: Record<string, string>;
}

export const NetworkManagement: React.FC = () => {
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [newNetwork, setNewNetwork] = useState({
    name: '',
    driver: 'bridge',
    subnet: '',
    gateway: '',
    internal: false,
    attachable: true,
  });

  const fetchNetworks = async () => {
    try {
      const response = await api.get('/api/v1/networks');
      setNetworks(response.data);
    } catch (error) {
      console.error('Failed to fetch networks:', error);
      toast.error('Failed to load networks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworks();
    const interval = setInterval(fetchNetworks, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateNetwork = async () => {
    try {
      const config: any = {
        name: newNetwork.name,
        driver: newNetwork.driver,
        internal: newNetwork.internal,
        attachable: newNetwork.attachable,
      };

      if (newNetwork.subnet) {
        config.ipam = {
          driver: 'default',
          config: [{
            subnet: newNetwork.subnet,
            gateway: newNetwork.gateway || undefined,
          }],
        };
      }

      await api.post('/api/v1/networks', config);
      toast.success('Network created successfully');
      setShowCreateModal(false);
      setNewNetwork({
        name: '',
        driver: 'bridge',
        subnet: '',
        gateway: '',
        internal: false,
        attachable: true,
      });
      fetchNetworks();
    } catch (error) {
      console.error('Failed to create network:', error);
      toast.error('Failed to create network');
    }
  };

  const handleDeleteNetwork = async (networkId: string) => {
    if (!confirm('Are you sure you want to delete this network?')) return;
    
    try {
      await api.delete(`/api/v1/networks/${networkId}`);
      toast.success('Network deleted successfully');
      fetchNetworks();
    } catch (error) {
      console.error('Failed to delete network:', error);
      toast.error('Failed to delete network');
    }
  };

  const filteredNetworks = networks.filter(network => {
    const matchesSearch = network.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'custom' && !['bridge', 'host', 'none'].includes(network.name)) ||
      (filter === 'system' && ['bridge', 'host', 'none'].includes(network.name));
    return matchesSearch && matchesFilter;
  });

  const getNetworkIcon = (driver: string) => {
    switch (driver) {
      case 'bridge': return Link;
      case 'host': return Globe;
      case 'overlay': return Network;
      default: return Network;
    }
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
      {/* Header & Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="Search networks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Networks' },
                { value: 'custom', label: 'Custom Networks' },
                { value: 'system', label: 'System Networks' },
              ]}
            />
          </div>
          <Button
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Create Network
          </Button>
        </div>
      </Card>

      {/* Networks List */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium">Networks ({filteredNetworks.length})</h3>
        </Card.Header>
        <Card.Content>
          <Table
            columns={[
              { key: 'name', label: 'Network Name' },
              { key: 'driver', label: 'Driver' },
              { key: 'subnet', label: 'Subnet' },
              { key: 'containers', label: 'Containers' },
              { key: 'properties', label: 'Properties' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={filteredNetworks.map((network) => {
              const Icon = getNetworkIcon(network.driver);
              return {
                name: (
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{network.name}</span>
                  </div>
                ),
                driver: (
                  <Badge variant="secondary">
                    {network.driver}
                  </Badge>
                ),
                subnet: (
                  <div className="text-sm">
                    {network.ipam?.config?.[0]?.subnet || (
                      <span className="text-gray-500">Default</span>
                    )}
                  </div>
                ),
                containers: (
                  <Badge variant={network.containers > 0 ? 'primary' : 'secondary'}>
                    {network.containers} connected
                  </Badge>
                ),
                properties: (
                  <div className="flex items-center gap-2">
                    {network.internal && (
                      <Badge variant="warning" size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        Internal
                      </Badge>
                    )}
                    {network.attachable && (
                      <Badge variant="success" size="sm">
                        Attachable
                      </Badge>
                    )}
                    {network.scope === 'swarm' && (
                      <Badge variant="primary" size="sm">
                        Swarm
                      </Badge>
                    )}
                  </div>
                ),
                actions: (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Info}
                      onClick={() => setSelectedNetwork(network.id)}
                    />
                    {!['bridge', 'host', 'none'].includes(network.name) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => handleDeleteNetwork(network.id)}
                      />
                    )}
                  </div>
                ),
              };
            })}
          />
        </Card.Content>
      </Card>

      {/* Create Network Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <Card.Header>
              <h3 className="text-lg font-medium">Create Network</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Network Name
                  </label>
                  <Input
                    value={newNetwork.name}
                    onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
                    placeholder="my-network"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Driver
                  </label>
                  <Select
                    value={newNetwork.driver}
                    onChange={(e) => setNewNetwork({ ...newNetwork, driver: e.target.value })}
                    options={[
                      { value: 'bridge', label: 'Bridge' },
                      { value: 'overlay', label: 'Overlay' },
                      { value: 'macvlan', label: 'Macvlan' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subnet (optional)
                  </label>
                  <Input
                    value={newNetwork.subnet}
                    onChange={(e) => setNewNetwork({ ...newNetwork, subnet: e.target.value })}
                    placeholder="172.20.0.0/16"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gateway (optional)
                  </label>
                  <Input
                    value={newNetwork.gateway}
                    onChange={(e) => setNewNetwork({ ...newNetwork, gateway: e.target.value })}
                    placeholder="172.20.0.1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newNetwork.internal}
                      onChange={(e) => setNewNetwork({ ...newNetwork, internal: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Internal (no external connectivity)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newNetwork.attachable}
                      onChange={(e) => setNewNetwork({ ...newNetwork, attachable: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Attachable (manual container attachment)</span>
                  </label>
                </div>
              </div>
            </Card.Content>
            <Card.Footer>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateNetwork}
                  disabled={!newNetwork.name}
                >
                  Create Network
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}

      {/* Network Details Modal */}
      {selectedNetwork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Network Details</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedNetwork(null)}
                >
                  Close
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {/* Network details would be fetched and displayed here */}
                <div className="text-sm text-gray-600">
                  Detailed network information including connected containers, 
                  configuration, and options will be displayed here.
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
};