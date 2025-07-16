import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Play, 
  Square, 
  Trash2, 
  FileText, 
  Settings, 
  Network,
  Database,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ComposeStack {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  services: ComposeService[];
  created_at: string;
  env_file?: string;
}

interface ComposeService {
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error';
  ports: string[];
  volumes: string[];
  depends_on: string[];
}

const ComposeStackManager = () => {
  const [stacks, setStacks] = useState<ComposeStack[]>([]);
  const [selectedStack, setSelectedStack] = useState<ComposeStack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stacks from API
  const fetchStacks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/compose/stacks');
      if (!response.ok) throw new Error('Failed to fetch stacks');
      const data = await response.json();
      setStacks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Deploy stack
  const deployStack = async (stackId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/compose/stacks/${stackId}/deploy`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to deploy stack');
      await fetchStacks(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed');
    } finally {
      setLoading(false);
    }
  };

  // Stop stack
  const stopStack = async (stackId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/compose/stacks/${stackId}/stop`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to stop stack');
      await fetchStacks(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stop failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete stack
  const deleteStack = async (stackId: string) => {
    if (!confirm('Are you sure you want to delete this stack?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/compose/stacks/${stackId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete stack');
      await fetchStacks(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'running':
          return { color: 'bg-green-500', icon: CheckCircle, text: 'Running' };
        case 'stopped':
          return { color: 'bg-gray-500', icon: Square, text: 'Stopped' };
        case 'error':
          return { color: 'bg-red-500', icon: XCircle, text: 'Error' };
        default:
          return { color: 'bg-yellow-500', icon: AlertCircle, text: 'Unknown' };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  // Service card component
  const ServiceCard = ({ service }: { service: ComposeService }) => (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium">{service.name}</h4>
          <StatusBadge status={service.status} />
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center">
            <Database className="w-4 h-4 mr-2" />
            <span>{service.image}</span>
          </div>
          
          {service.ports.length > 0 && (
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              <span>{service.ports.join(', ')}</span>
            </div>
          )}
          
          {service.depends_on.length > 0 && (
            <div className="flex items-center">
              <Network className="w-4 h-4 mr-2" />
              <span>Depends on: {service.depends_on.join(', ')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    fetchStacks();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Docker Compose Stacks</h1>
        <div className="space-x-2">
          <Button onClick={fetchStacks} disabled={loading}>
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Stack
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacks List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Stacks ({stacks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : stacks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No stacks found
                </div>
              ) : (
                <div className="space-y-2">
                  {stacks.map((stack) => (
                    <Card 
                      key={stack.id}
                      className={`cursor-pointer transition-colors ${
                        selectedStack?.id === stack.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedStack(stack)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{stack.name}</h3>
                          <StatusBadge status={stack.status} />
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div>{stack.services.length} services</div>
                          <div>Created: {new Date(stack.created_at).toLocaleDateString()}</div>
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          {stack.status === 'stopped' ? (
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                deployStack(stack.id);
                              }}
                              disabled={loading}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Deploy
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                stopStack(stack.id);
                              }}
                              disabled={loading}
                            >
                              <Square className="w-3 h-3 mr-1" />
                              Stop
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStack(stack.id);
                            }}
                            disabled={loading}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stack Details */}
        <div className="lg:col-span-2">
          {selectedStack ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    {selectedStack.name}
                    <StatusBadge status={selectedStack.status} />
                  </CardTitle>
                  <div className="space-x-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      View Compose
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Environment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="services" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="networks">Networks</TabsTrigger>
                    <TabsTrigger value="volumes">Volumes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="services" className="mt-4">
                    <div className="space-y-2">
                      {selectedStack.services.map((service) => (
                        <ServiceCard key={service.name} service={service} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="networks" className="mt-4">
                    <div className="text-center py-8 text-gray-500">
                      Networks management coming soon...
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="volumes" className="mt-4">
                    <div className="text-center py-8 text-gray-500">
                      Volumes management coming soon...
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No stack selected</h3>
                  <p>Select a stack from the left to view its details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComposeStackManager;
