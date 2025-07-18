import React, { useState, useEffect } from 'react';
import { ArrowRight, Database, Globe, Network, AlertTriangle } from 'lucide-react';

interface ServiceNode {
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error';
  dependencies: string[];
  dependents: string[];
  ports: string[];
  position?: { x: number; y: number };
}

interface DependencyGraph {
  nodes: ServiceNode[];
  edges: Array<{ from: string; to: string }>;
  cycles: string[][];
  startupOrder: string[][];
}

const ServiceDependencyVisualizer = () => {
  const [graph, setGraph] = useState<DependencyGraph | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  // Load dependency graph from API
  const loadDependencyGraph = async (stackId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/compose/stacks/${stackId}/dependencies`);
      if (!response.ok) throw new Error('Failed to load dependency graph');
      const data = await response.json();

      // Calculate positions for graph visualization
      const nodes = data.nodes.map((node: ServiceNode, index: number) => ({
        ...node,
        position: calculateNodePosition(index, data.nodes.length)
      }));

      setGraph({ ...data, nodes });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate node positions for graph layout
  const calculateNodePosition = (index: number, total: number) => {
    const radius = 200;
    const centerX = 300;
    const centerY = 300;
    const angle = (index / total) * 2 * Math.PI;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  // Service node component
  const ServiceNode = ({ service, isSelected, onClick }: {
    service: ServiceNode;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <div
      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${isSelected ? 'z-10' : 'z-0'
        }`}
      style={{
        left: service.position?.x || 0,
        top: service.position?.y || 0
      }}
      onClick={onClick}
    >
      <div className={`
        w-24 h-24 rounded-lg border-2 p-2 bg-white shadow-lg
        ${isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-300'}
        hover:border-blue-400 transition-all duration-200
      `}>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} mb-1`}></div>
        <div className="text-xs font-medium truncate">{service.name}</div>
        <div className="text-xs text-gray-500 truncate">{service.image}</div>
        {service.ports.length > 0 && (
          <Globe className="w-3 h-3 text-blue-500 mt-1" />
        )}
      </div>
    </div>
  );

  // Dependency arrow component
  const DependencyArrow = ({ from, to, nodes }: {
    from: string;
    to: string;
    nodes: ServiceNode[];
  }) => {
    const fromNode = nodes.find(n => n.name === from);
    const toNode = nodes.find(n => n.name === to);

    if (!fromNode?.position || !toNode?.position) return null;

    const dx = toNode.position.x - fromNode.position.x;
    const dy = toNode.position.y - fromNode.position.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: fromNode.position.x,
          top: fromNode.position.y,
          width: length,
          height: 2,
          transformOrigin: '0 50%',
          transform: `rotate(${angle}deg)`,
          background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
          zIndex: -1
        }}
      >
        <div
          className="absolute right-0 top-1/2 transform -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid #1d4ed8',
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent'
          }}
        />
      </div>
    );
  };

  // Load example data for demo
  useEffect(() => {
    // Demo data
    const demoGraph: DependencyGraph = {
      nodes: [
        {
          name: 'web',
          image: 'nginx:alpine',
          status: 'running',
          dependencies: ['db', 'redis'],
          dependents: [],
          ports: ['80:80', '443:443']
        },
        {
          name: 'db',
          image: 'postgres:13',
          status: 'running',
          dependencies: [],
          dependents: ['web', 'api'],
          ports: ['5432:5432']
        },
        {
          name: 'redis',
          image: 'redis:alpine',
          status: 'running',
          dependencies: [],
          dependents: ['web', 'api'],
          ports: ['6379:6379']
        },
        {
          name: 'api',
          image: 'node:16',
          status: 'running',
          dependencies: ['db', 'redis'],
          dependents: ['web'],
          ports: ['3000:3000']
        }
      ],
      edges: [
        { from: 'web', to: 'db' },
        { from: 'web', to: 'redis' },
        { from: 'api', to: 'db' },
        { from: 'api', to: 'redis' },
        { from: 'web', to: 'api' }
      ],
      cycles: [],
      startupOrder: [['db', 'redis'], ['api'], ['web']]
    };

    // Calculate positions
    const nodes = demoGraph.nodes.map((node, index) => ({
      ...node,
      position: calculateNodePosition(index, demoGraph.nodes.length)
    }));

    setGraph({ ...demoGraph, nodes });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Dependencies</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('graph')}
            className={`px-4 py-2 rounded ${viewMode === 'graph'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
              }`}
          >
            Graph View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded ${viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
              }`}
          >
            List View
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dependency graph...</div>
        </div>
      ) : graph ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph/List View */}
          <div className="lg:col-span-2">
            {viewMode === 'graph' ? (
              <div className="bg-gray-50 rounded-lg p-6" style={{ height: '600px' }}>
                <div className="relative w-full h-full">
                  {/* Dependency arrows */}
                  {graph.edges.map((edge, index) => (
                    <DependencyArrow
                      key={index}
                      from={edge.from}
                      to={edge.to}
                      nodes={graph.nodes}
                    />
                  ))}

                  {/* Service nodes */}
                  {graph.nodes.map((service) => (
                    <ServiceNode
                      key={service.name}
                      service={service}
                      isSelected={selectedService === service.name}
                      onClick={() => setSelectedService(service.name)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Startup Order</h3>
                {graph.startupOrder.map((batch, batchIndex) => (
                  <div key={batchIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        Step {batchIndex + 1}
                      </span>
                      <span className="ml-2 text-gray-600">
                        ({batch.length} service{batch.length !== 1 ? 's' : ''})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {batch.map((serviceName) => {
                        const service = graph.nodes.find(n => n.name === serviceName);
                        if (!service) return null;

                        return (
                          <div
                            key={serviceName}
                            className={`p-3 border rounded cursor-pointer ${selectedService === serviceName
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                              }`}
                            onClick={() => setSelectedService(serviceName)}
                          >
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} mr-2`}></div>
                              <span className="font-medium">{service.name}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{service.image}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Details */}
          <div>
            {selectedService ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {(() => {
                  const service = graph.nodes.find(n => n.name === selectedService);
                  if (!service) return <div>Service not found</div>;

                  return (
                    <div>
                      <div className="flex items-center mb-4">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(service.status)} mr-2`}></div>
                        <h3 className="text-lg font-medium">{service.name}</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image
                          </label>
                          <div className="flex items-center">
                            <Database className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm">{service.image}</span>
                          </div>
                        </div>

                        {service.ports.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ports
                            </label>
                            <div className="space-y-1">
                              {service.ports.map((port, index) => (
                                <div key={index} className="flex items-center">
                                  <Globe className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-sm">{port}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {service.dependencies.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Dependencies
                            </label>
                            <div className="space-y-1">
                              {service.dependencies.map((dep, index) => (
                                <div key={index} className="flex items-center">
                                  <ArrowRight className="w-4 h-4 text-gray-400 mr-2" />
                                  <button
                                    onClick={() => setSelectedService(dep)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    {dep}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {service.dependents.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Dependents
                            </label>
                            <div className="space-y-1">
                              {service.dependents.map((dep, index) => (
                                <div key={index} className="flex items-center">
                                  <Network className="w-4 h-4 text-gray-400 mr-2" />
                                  <button
                                    onClick={() => setSelectedService(dep)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    {dep}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Network className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No Service Selected
                </h3>
                <p className="text-sm text-gray-500">
                  {viewMode === 'graph'
                    ? 'Click on a service node to view its details'
                    : 'Click on a service in the list to view its details'
                  }
                </p>
              </div>
            )}

            {/* Cycles Warning */}
            {graph.cycles.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">
                    Circular Dependencies Detected
                  </span>
                </div>
                <div className="text-sm text-yellow-700">
                  {graph.cycles.map((cycle, index) => (
                    <div key={index}>
                      Cycle {index + 1}: {cycle.join(' → ')} → {cycle[0]}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Services:</span>
                  <span>{graph.nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dependencies:</span>
                  <span>{graph.edges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Startup Steps:</span>
                  <span>{graph.startupOrder.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Circular Dependencies:</span>
                  <span className={graph.cycles.length > 0 ? 'text-red-600' : 'text-green-600'}>
                    {graph.cycles.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No dependency graph available
        </div>
      )}
    </div>
  );
};

export default ServiceDependencyVisualizer;
