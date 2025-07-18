import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Input } from '../ui/Input';
import { Select } from '../forms/Select';
import { ProgressBar } from '../ui/ProgressBar';
import { 
  HardDrive, 
  Plus, 
  Trash2, 
  Download,
  Upload,
  AlertTriangle,
  FolderOpen,
  Clock,
  Database
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface DockerVolume {
  name: string;
  driver: string;
  mountpoint: string;
  created_at: string;
  labels: Record<string, string>;
  scope: string;
  size: number;
  used_by: number;
  ref_count: number;
  status?: string;
}

interface VolumeStats {
  total_size: number;
  used_size: number;
  available_size: number;
  orphaned_count: number;
}

export const VolumeManagement: React.FC = () => {
  const [volumes, setVolumes] = useState<DockerVolume[]>([]);
  const [stats, setStats] = useState<VolumeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const [newVolume, setNewVolume] = useState({
    name: '',
    driver: 'local',
    driverOpts: {} as Record<string, string>,
    labels: {} as Record<string, string>,
  });

  const fetchVolumes = async () => {
    try {
      const response = await api.get('/api/v1/volumes');
      setVolumes(response.data);
    } catch (error) {
      console.error('Failed to fetch volumes:', error);
      toast.error('Failed to load volumes');
    }
  };

  const fetchVolumeStats = async () => {
    try {
      const response = await api.get('/api/v1/volumes/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch volume stats:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchVolumes(), fetchVolumeStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateVolume = async () => {
    try {
      const config: any = {
        Name: newVolume.name,
        Driver: newVolume.driver,
      };

      if (Object.keys(newVolume.driverOpts).length > 0) {
        config.DriverOpts = newVolume.driverOpts;
      }

      if (Object.keys(newVolume.labels).length > 0) {
        config.Labels = newVolume.labels;
      }

      await api.post('/api/v1/volumes', config);
      toast.success('Volume created successfully');
      setShowCreateModal(false);
      setNewVolume({
        name: '',
        driver: 'local',
        driverOpts: {},
        labels: {},
      });
      loadData();
    } catch (error) {
      console.error('Failed to create volume:', error);
      toast.error('Failed to create volume');
    }
  };

  const handleDeleteVolume = async (volumeName: string) => {
    if (!confirm('Are you sure you want to delete this volume?')) return;
    
    try {
      await api.delete(`/api/v1/volumes/${volumeName}`);
      toast.success('Volume deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete volume:', error);
      toast.error('Failed to delete volume');
    }
  };

  const handleCleanupOrphaned = async () => {
    if (!confirm('Are you sure you want to remove all orphaned volumes?')) return;
    
    setCleanupLoading(true);
    try {
      const response = await api.post('/api/v1/volumes/prune');
      toast.success(`Removed ${response.data.count} orphaned volumes`);
      loadData();
    } catch (error) {
      console.error('Failed to cleanup volumes:', error);
      toast.error('Failed to cleanup orphaned volumes');
    } finally {
      setCleanupLoading(false);
    }
  };

  const filteredVolumes = volumes.filter(volume => {
    const matchesSearch = volume.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'in-use' && volume.ref_count > 0) ||
      (filter === 'orphaned' && volume.ref_count === 0);
    return matchesSearch && matchesFilter;
  });

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
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
      {/* Storage Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Storage</p>
                <p className="text-xl font-semibold">{formatBytes(stats.total_size)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Used Space</p>
                <p className="text-xl font-semibold">{formatBytes(stats.used_size)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-xl font-semibold">{formatBytes(stats.available_size)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Orphaned</p>
                <p className="text-xl font-semibold">{stats.orphaned_count}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Storage Usage Bar */}
      {stats && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm text-gray-600">
                {((stats.used_size / stats.total_size) * 100).toFixed(1)}% used
              </span>
            </div>
            <ProgressBar 
              value={(stats.used_size / stats.total_size) * 100} 
              className="h-3"
            />
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="Search volumes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Volumes' },
                { value: 'in-use', label: 'In Use' },
                { value: 'orphaned', label: 'Orphaned' },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            {stats && stats.orphaned_count > 0 && (
              <Button
                variant="outline"
                icon={Trash2}
                onClick={handleCleanupOrphaned}
                loading={cleanupLoading}
              >
                Cleanup Orphaned
              </Button>
            )}
            <Button
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              Create Volume
            </Button>
          </div>
        </div>
      </Card>

      {/* Volumes List */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium">Volumes ({filteredVolumes.length})</h3>
        </Card.Header>
        <Card.Content>
          <Table
            columns={[
              { key: 'name', label: 'Volume Name' },
              { key: 'driver', label: 'Driver' },
              { key: 'size', label: 'Size' },
              { key: 'status', label: 'Status' },
              { key: 'created', label: 'Created' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={filteredVolumes.map((volume) => ({
              name: (
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{volume.name}</span>
                </div>
              ),
              driver: (
                <Badge variant="secondary">
                  {volume.driver}
                </Badge>
              ),
              size: (
                <span className="text-sm">
                  {volume.size ? formatBytes(volume.size) : 'Unknown'}
                </span>
              ),
              status: (
                <div className="flex items-center gap-2">
                  {volume.ref_count > 0 ? (
                    <Badge variant="success">
                      In use ({volume.ref_count})
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Orphaned
                    </Badge>
                  )}
                </div>
              ),
              created: (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  {new Date(volume.created_at).toLocaleDateString()}
                </div>
              ),
              actions: (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Download}
                    onClick={() => {
                      toast.info('Backup feature coming soon');
                    }}
                    title="Backup"
                  />
                  {volume.ref_count === 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      onClick={() => handleDeleteVolume(volume.name)}
                      title="Delete"
                    />
                  )}
                </div>
              ),
            }))}
          />
        </Card.Content>
      </Card>

      {/* Create Volume Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <Card.Header>
              <h3 className="text-lg font-medium">Create Volume</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Volume Name
                  </label>
                  <Input
                    value={newVolume.name}
                    onChange={(e) => setNewVolume({ ...newVolume, name: e.target.value })}
                    placeholder="my-volume"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Driver
                  </label>
                  <Select
                    value={newVolume.driver}
                    onChange={(e) => setNewVolume({ ...newVolume, driver: e.target.value })}
                    options={[
                      { value: 'local', label: 'Local' },
                      { value: 'nfs', label: 'NFS' },
                      { value: 'tmpfs', label: 'Tmpfs' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Driver Options (optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Add driver-specific options as key-value pairs
                  </p>
                  {/* Driver options input would go here */}
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
                  onClick={handleCreateVolume}
                  disabled={!newVolume.name}
                >
                  Create Volume
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
};