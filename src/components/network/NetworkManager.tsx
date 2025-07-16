import React, { useState, useEffect } from 'react';
import { Network, Plus, Trash2, Settings, Globe, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
  scope: string;
  ipam?: {
    driver: string;
    config: Array<{
      subnet: string;
      gateway: string;
    }>;
  };
  containers: Array<{
    name: string;
    ipv4_address: string;
  }>;
  created: string;
  labels: Record<string, string>;
  options: Record<string, string>;
}

interface NetworkCreateRequest {
  name: string;
  driver: 'bridge' | 'host' | 'none' | 'overlay';
  subnet?: string;
  gateway?: string;
  ip_range?: string;
  labels?: Record<string, string>;
  options?: Record<string, string>;
}

const NetworkManager = () => {
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<DockerNetwork | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<NetworkCreateRequest>({
    name: '',
    driver: 'bridge'
  });

  // Fetch networks from API
  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/networks');
      if (!response.ok) throw new Error('Failed to fetch networks');
      const data = await response.json();
      setNetworks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Create network
  const createNetwork = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/networks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      
      if (!response.ok) throw new Error('Failed to create network');
      
      setShowCreateDialog(false);
      setCreateForm({ name: '', driver: 'bridge' });
      await fetchNetworks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete network
  const deleteNetwork = async (networkId: string) => {
    if (!confirm('Are you sure you want to delete this network?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/networks/${networkId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete network');
      
      if (selectedNetwork?.id === networkId) {
        setSelectedNetwork(null);
      }
      await fetchNetworks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  // Get driver color
  const getDriverColor = (driver: string) => {
    switch (driver) {
      case 'bridge': return 'bg-blue-500';
      case 'host': return 'bg-green-500';
      case 'overlay': return 'bg-purple-500';
      case 'none': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  // Create dialog component
  const CreateNetworkDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Create Network</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Network Name
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="my-network"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver
            </label>
            <select
              value={createForm.driver}
              onChange={(e) => setCreateForm({ ...createForm, driver: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bridge">Bridge</option>
              <option value="host">Host</option>
              <option value="overlay">Overlay</option>
              <option value="none">None</option>
            </select>
          </div>
          
          {createForm.driver === 'bridge' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subnet (optional)
                </label>
                <input
                  type="text"
                  value={createForm.subnet || ''}
                  onChange={(e) => setCreateForm({ ...createForm, subnet: e.target.value })}
                  placeholder="172.20.0.0/16"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gateway (optional)
                </label>
                <input
                  type="text"
                  value={createForm.gateway || ''}
                  onChange={(e) => setCreateForm({ ...createForm, gateway: e.target.value })}
                  placeholder="172.20.0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowCreateDialog(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={createNetwork}
            disabled={!createForm.name.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Create Network
          </button>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchNetworks();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Docker Networks</h1>
        <div className="space-x-2">
          <button
            onClick={fetchNetworks}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Network
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Networks List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Networks ({networks.length})</h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {loading && networks.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : networks.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No networks found</div>
              ) : (
                networks.map((network) => (
                  <div
                    key={network.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedNetwork?.id === network.id
                        ? 'bg-blue-50 border-r-2 border-r-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedNetwork(network)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium truncate">{network.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs text-white ${getDriverColor(network.driver)}`}>
                        {network.driver}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center">
                        <Network className="w-4 h-4 mr-1" />
                        <span>{network.scope}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Globe className="w-4 h-4 mr-1" />
                        <span>{network.containers.length} containers</span>
                      </div>
                    </div>
                    
                    {network.name !== 'bridge' && network.name !== 'host' && network.name !== 'none' && (
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNetwork(network.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Network Details */}
        <div className="lg:col-span-2">
          {selectedNetwork ? (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">{selectedNetwork.name}</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs text-white ${getDriverColor(selectedNetwork.driver)}`}>
                      {selectedNetwork.driver}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {selectedNetwork.scope}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-gray-600 mb-1">Network ID</label>
                      <code className="block bg-gray-100 p-2 rounded text-xs break-all">
                        {selectedNetwork.id}
                      </code>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Created</label>
                      <span>{new Date(selectedNetwork.created).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* IPAM Configuration */}
                {selectedNetwork.ipam && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">IPAM Configuration</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-600 mb-1">IPAM Driver</label>
                        <span className="text-sm">{selectedNetwork.ipam.driver}</span>
                      </div>
                      
                      {selectedNetwork.ipam.config.map((config, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="block text-gray-600 mb-1">Subnet</label>
                              <code className="text-sm">{config.subnet}</code>
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Gateway</label>
                              <code className="text-sm">{config.gateway}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Containers */}
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Connected Containers ({selectedNetwork.containers.length})
                  </h3>
                  
                  {selectedNetwork.containers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No containers connected to this network
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedNetwork.containers.map((container, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{container.name}</div>
                            <div className="text-sm text-gray-600">IP: {container.ipv4_address}</div>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Labels */}
                {Object.keys(selectedNetwork.labels || {}).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Labels</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedNetwork.labels).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                            {key}
                          </code>
                          <span className="text-sm">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options */}
                {Object.keys(selectedNetwork.options || {}).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Options</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedNetwork.options).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <code className="text-sm">{value}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Network Selected</h3>
                  <p>Select a network from the left to view its details</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Network Dialog */}
      {showCreateDialog && <CreateNetworkDialog />}
    </div>
  );
};

export default NetworkManager;
