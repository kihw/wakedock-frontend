import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../forms/Select';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/loading-spinner';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Play,
  Pause,
  Terminal,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Server,
  Database,
  Globe,
  Zap,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface LogEntry {
  timestamp: number;
  level: string;
  source: string;
  service: string;
  message: string;
  context: Record<string, any>;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  trace_id?: string;
  error_details?: Record<string, any>;
}

interface LogFilters {
  query: string;
  level: string;
  source: string;
  service: string;
  start_time?: number;
  end_time?: number;
  limit: number;
}

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({
    query: '',
    level: '',
    source: '',
    service: '',
    limit: 100
  });
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  const [logSources, setLogSources] = useState<string[]>([]);
  const [logServices, setLogServices] = useState<string[]>([]);
  const [logLevels, setLogLevels] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const logLevelColors = {
    DEBUG: 'gray',
    INFO: 'blue',
    WARNING: 'yellow',
    ERROR: 'red',
    CRITICAL: 'red'
  };

  const logLevelIcons = {
    DEBUG: Info,
    INFO: Info,
    WARNING: AlertTriangle,
    ERROR: AlertCircle,
    CRITICAL: XCircle
  };

  const logSourceIcons = {
    frontend: Globe,
    backend: Server,
    system: Terminal,
    plugin: Zap,
    docker: Database,
    caddy: Globe,
    postgres: Database,
    redis: Database
  };

  useEffect(() => {
    loadLogMetadata();
    loadLogs();
    loadStats();
  }, []);

  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const loadLogMetadata = async () => {
    try {
      const [sourcesRes, servicesRes, levelsRes] = await Promise.all([
        api.get('/api/v1/logs/sources'),
        api.get('/api/v1/logs/services'),
        api.get('/api/v1/logs/levels')
      ]);
      
      setLogSources(sourcesRes.data || []);
      setLogServices(servicesRes.data || []);
      setLogLevels(levelsRes.data || []);
    } catch (error) {
      console.error('Failed to load log metadata:', error);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.query) params.append('query', filters.query);
      if (filters.level) params.append('level', filters.level);
      if (filters.source) params.append('source', filters.source);
      if (filters.service) params.append('service', filters.service);
      if (filters.start_time) params.append('start_time', filters.start_time.toString());
      if (filters.end_time) params.append('end_time', filters.end_time.toString());
      params.append('limit', filters.limit.toString());
      
      const response = await api.get(`/api/v1/logs/search?${params}`);
      setLogs(response.data.data.logs || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/v1/logs/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load log stats:', error);
    }
  };

  const startStreaming = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/v1/logs/stream`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      setStreaming(true);
      toast.success('Connected to log stream');
    };
    
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'log') {
        setLogs(prevLogs => {
          const newLogs = [...prevLogs, message.data];
          // Keep only last 1000 logs to prevent memory issues
          return newLogs.slice(-1000);
        });
      }
    };
    
    wsRef.current.onclose = () => {
      setStreaming(false);
      toast.info('Disconnected from log stream');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStreaming(false);
      toast.error('Log stream connection error');
    };
  }, []);

  const stopStreaming = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStreaming(false);
  }, []);

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportLogs = async () => {
    try {
      const response = await api.post('/api/v1/logs/export', {
        start_time: filters.start_time,
        end_time: filters.end_time
      });
      
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wakedock-logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Logs exported successfully');
    } catch (error) {
      console.error('Failed to export logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setExpandedLogs(new Set());
  };

  const getLogIcon = (source: string) => {
    const IconComponent = logSourceIcons[source as keyof typeof logSourceIcons] || Terminal;
    return <IconComponent className="h-4 w-4" />;
  };

  const getLevelIcon = (level: string) => {
    const IconComponent = logLevelIcons[level as keyof typeof logLevelIcons] || Info;
    return <IconComponent className="h-4 w-4" />;
  };

  const getLevelColor = (level: string) => {
    return logLevelColors[level as keyof typeof logLevelColors] || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Log Viewer
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time log monitoring and analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={streaming ? stopStreaming : startStreaming}
            className={streaming ? 'bg-green-50 text-green-700' : ''}
          >
            {streaming ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {streaming ? 'Stop Stream' : 'Start Stream'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            loading={loading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogs}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Terminal className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
                <p className="text-xl font-semibold">{stats.total_logs?.toLocaleString() || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recent Errors</p>
                <p className="text-xl font-semibold">{stats.recent_errors_count || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Memory Logs</p>
                <p className="text-xl font-semibold">{stats.memory_logs_count || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Streams</p>
                <p className="text-xl font-semibold">{stats.active_streams || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h3 className="text-lg font-medium">Filters</h3>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search logs..."
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              options={[
                { value: '', label: 'All Levels' },
                ...logLevels.map(level => ({ value: level, label: level }))
              ]}
            />
            <Select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              options={[
                { value: '', label: 'All Sources' },
                ...logSources.map(source => ({ value: source, label: source }))
              ]}
            />
            <Select
              value={filters.service}
              onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              options={[
                { value: '', label: 'All Services' },
                ...logServices.map(service => ({ value: service, label: service }))
              ]}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button
              size="sm"
              onClick={loadLogs}
              loading={loading}
            >
              Apply Filters
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFilters({
                query: '',
                level: '',
                source: '',
                service: '',
                limit: 100
              })}
            >
              Clear Filters
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded"
                />
                Auto-scroll
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={clearLogs}
              >
                Clear Logs
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Log Entries */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Log Entries</h3>
            <Badge variant="outline">
              {logs.length} entries
            </Badge>
          </div>
        </Card.Header>
        <Card.Content>
          <div 
            ref={logsContainerRef}
            className="space-y-2 max-h-[600px] overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm"
          >
            {loading && logs.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No logs found matching the current filters
              </div>
            ) : (
              logs.map((log, index) => {
                const logId = `${log.timestamp}-${index}`;
                const isExpanded = expandedLogs.has(logId);
                const levelColor = getLevelColor(log.level);
                
                return (
                  <div
                    key={logId}
                    className={`border-l-4 border-${levelColor}-500 bg-white dark:bg-gray-800 p-3 rounded-r-lg shadow-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleLogExpansion(logId)}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        {/* Main log line */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-${levelColor}-600 border-${levelColor}-200 bg-${levelColor}-50`}
                          >
                            <span className="flex items-center gap-1">
                              {getLevelIcon(log.level)}
                              {log.level}
                            </span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <span className="flex items-center gap-1">
                              {getLogIcon(log.source)}
                              {log.source}
                            </span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.service}
                          </Badge>
                        </div>
                        
                        <div className="text-gray-900 dark:text-gray-100 break-words">
                          {log.message}
                        </div>
                        
                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {log.user_id && (
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <User className="h-3 w-3" />
                                <span>User: {log.user_id}</span>
                              </div>
                            )}
                            
                            {log.session_id && (
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <Globe className="h-3 w-3" />
                                <span>Session: {log.session_id}</span>
                              </div>
                            )}
                            
                            {log.request_id && (
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <ExternalLink className="h-3 w-3" />
                                <span>Request: {log.request_id}</span>
                              </div>
                            )}
                            
                            {log.trace_id && (
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <Zap className="h-3 w-3" />
                                <span>Trace: {log.trace_id}</span>
                              </div>
                            )}
                            
                            {log.context && Object.keys(log.context).length > 0 && (
                              <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Context:
                                </div>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                                  {JSON.stringify(log.context, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {log.error_details && (
                              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                                  Error Details:
                                </div>
                                <pre className="text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                                  {JSON.stringify(log.error_details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(log.message)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default LogViewer;