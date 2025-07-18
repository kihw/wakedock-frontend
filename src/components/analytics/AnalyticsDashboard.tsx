'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { LoadingSpinner } from '../ui/loading-spinner';
import { 
  Activity, 
  Users, 
  Globe, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  MousePointer,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface DashboardData {
  performance: {
    average_response_time: number;
    average_cpu_usage: number;
    average_memory_usage: number;
    average_throughput: number;
    average_availability: number;
    total_data_points: number;
  };
  users: {
    active_sessions: number;
    total_events: number;
    average_session_duration: number;
    top_features: [string, number][];
    total_errors: number;
    error_breakdown: Record<string, number>;
  };
  api: {
    total_api_calls: number;
    total_errors: number;
    overall_error_rate: number;
    endpoint_stats: {
      endpoint: string;
      total_calls: number;
      average_response_time: number;
      error_rate: number;
      status_codes: Record<string, number>;
    }[];
  };
  realtime: {
    timestamp: number;
    metrics: Record<string, any>;
    active_sessions: number;
    recent_events: number;
    alerts: any[];
  };
  health: {
    status: string;
    health_score: number;
    issues: string[];
    metrics: {
      cpu_usage: number;
      memory_usage: number;
      error_rate: number;
      availability: number;
    };
  };
  alerts: any[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  trend,
  trendValue
}) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 text-sm ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
           trend === 'down' ? <TrendingDown className="h-4 w-4" /> : 
           <Activity className="h-4 w-4" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  </Card>
);

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'api', label: 'API', icon: Globe },
    { id: 'alerts', label: 'Alerts', icon: AlertCircle },
  ];

  const loadDashboardData = async () => {
    if (typeof window === 'undefined') return; // Skip on SSR
    
    try {
      setLoading(true);
      const response = await api.get('/api/v1/analytics/dashboard');
      setData(response.data.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleExport = async () => {
    if (typeof window === 'undefined') return; // Skip on SSR
    
    try {
      const response = await api.post('/api/v1/analytics/export');
      toast.success('Analytics data exported successfully');
      
      // Download the exported data
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export analytics data');
    }
  };

  const formatValue = (value: number, type: 'bytes' | 'percentage' | 'time' | 'number' = 'number'): string => {
    if (type === 'bytes') {
      if (value < 1024) return `${value.toFixed(1)} B`;
      if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
      if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
      return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    
    if (type === 'time') {
      if (value < 1000) return `${value.toFixed(0)}ms`;
      return `${(value / 1000).toFixed(1)}s`;
    }
    
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      default: return AlertCircle;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time insights and performance metrics
            {lastUpdate && (
              <span className="ml-2">
                • Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            loading={loading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Health Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-${getHealthColor(data.health.status)}-100 dark:bg-${getHealthColor(data.health.status)}-900/30`}>
              {React.createElement(getHealthIcon(data.health.status), {
                className: `h-8 w-8 text-${getHealthColor(data.health.status)}-600 dark:text-${getHealthColor(data.health.status)}-400`
              })}
            </div>
            <div>
              <h3 className="text-lg font-semibold">System Health</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Health Score: {data.health.health_score}/100
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant="secondary" 
              className={`bg-${getHealthColor(data.health.status)}-100 text-${getHealthColor(data.health.status)}-800`}
            >
              {data.health.status.toUpperCase()}
            </Badge>
            {data.health.issues.length > 0 && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {data.health.issues.length} issue(s) detected
              </div>
            )}
          </div>
        </div>
        {data.health.issues.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Issues:</h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {data.health.issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Sessions"
              value={data.users.active_sessions}
              subtitle="Current active users"
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="API Calls"
              value={formatValue(data.api.total_api_calls)}
              subtitle="Total API requests"
              icon={Globe}
              color="green"
            />
            <MetricCard
              title="Response Time"
              value={formatValue(data.performance.average_response_time, 'time')}
              subtitle="Average response time"
              icon={Zap}
              color="yellow"
            />
            <MetricCard
              title="Error Rate"
              value={formatValue(data.api.overall_error_rate, 'percentage')}
              subtitle="API error rate"
              icon={AlertCircle}
              color="red"
            />
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="CPU Usage"
              value={formatValue(data.health.metrics.cpu_usage, 'percentage')}
              subtitle="Current CPU usage"
              icon={Cpu}
              color="purple"
            />
            <MetricCard
              title="Memory Usage"
              value={formatValue(data.health.metrics.memory_usage, 'percentage')}
              subtitle="Current memory usage"
              icon={HardDrive}
              color="indigo"
            />
            <MetricCard
              title="Availability"
              value={formatValue(data.health.metrics.availability, 'percentage')}
              subtitle="System availability"
              icon={Server}
              color="green"
            />
            <MetricCard
              title="Recent Events"
              value={data.realtime.recent_events}
              subtitle="Last 5 minutes"
              icon={Activity}
              color="orange"
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium">Top Features</h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {data.users.top_features.slice(0, 5).map(([feature, count]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(count / Math.max(...data.users.top_features.map(f => f[1]))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium">API Endpoints</h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {data.api.endpoint_stats.slice(0, 5).map((endpoint) => (
                    <div key={endpoint.endpoint} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{endpoint.endpoint}</span>
                        <div className="text-xs text-gray-500">
                          {formatValue(endpoint.average_response_time, 'time')} avg
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatValue(endpoint.total_calls)}</div>
                        <div className={`text-xs ${endpoint.error_rate > 5 ? 'text-red-500' : 'text-green-500'}`}>
                          {formatValue(endpoint.error_rate, 'percentage')} errors
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Average Response Time"
              value={formatValue(data.performance.average_response_time, 'time')}
              subtitle="Across all endpoints"
              icon={Zap}
              color="blue"
            />
            <MetricCard
              title="Throughput"
              value={formatValue(data.performance.average_throughput)}
              subtitle="Requests per second"
              icon={TrendingUp}
              color="green"
            />
            <MetricCard
              title="Availability"
              value={formatValue(data.performance.average_availability, 'percentage')}
              subtitle="System uptime"
              icon={CheckCircle}
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium">Resource Usage</h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>{formatValue(data.performance.average_cpu_usage, 'percentage')}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${data.performance.average_cpu_usage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>{formatValue(data.performance.average_memory_usage, 'percentage')}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${data.performance.average_memory_usage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium">Performance Metrics</h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Data Points</span>
                    <span className="text-sm font-medium">{formatValue(data.performance.total_data_points)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response</span>
                    <span className="text-sm font-medium">{formatValue(data.performance.average_response_time, 'time')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Throughput</span>
                    <span className="text-sm font-medium">{formatValue(data.performance.average_throughput)}/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Availability</span>
                    <span className="text-sm font-medium">{formatValue(data.performance.average_availability, 'percentage')}</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Sessions"
              value={data.users.active_sessions}
              subtitle="Currently active"
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Total Events"
              value={formatValue(data.users.total_events)}
              subtitle="User interactions"
              icon={MousePointer}
              color="green"
            />
            <MetricCard
              title="Avg Session Duration"
              value={formatValue(data.users.average_session_duration, 'time')}
              subtitle="Time per session"
              icon={Clock}
              color="yellow"
            />
            <MetricCard
              title="Total Errors"
              value={data.users.total_errors}
              subtitle="User-facing errors"
              icon={AlertCircle}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium">Feature Usage</h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {data.users.top_features.map(([feature, count]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(count / Math.max(...data.users.top_features.map(f => f[1]))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium">Error Breakdown</h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {Object.entries(data.users.error_breakdown).map(([error, count]) => (
                    <div key={error} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{error}</span>
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {/* API Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total API Calls"
              value={formatValue(data.api.total_api_calls)}
              subtitle="All-time requests"
              icon={Globe}
              color="blue"
            />
            <MetricCard
              title="Total Errors"
              value={formatValue(data.api.total_errors)}
              subtitle="Failed requests"
              icon={XCircle}
              color="red"
            />
            <MetricCard
              title="Error Rate"
              value={formatValue(data.api.overall_error_rate, 'percentage')}
              subtitle="Overall error rate"
              icon={AlertTriangle}
              color="yellow"
            />
            <MetricCard
              title="Endpoints"
              value={data.api.endpoint_stats.length}
              subtitle="Active endpoints"
              icon={Network}
              color="green"
            />
          </div>

          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium">Endpoint Performance</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {data.api.endpoint_stats.map((endpoint) => (
                  <div key={endpoint.endpoint} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{endpoint.endpoint}</span>
                      <Badge 
                        variant={endpoint.error_rate > 5 ? "destructive" : "default"}
                        className="text-xs"
                      >
                        {formatValue(endpoint.error_rate, 'percentage')} errors
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Calls</span>
                        <div className="font-medium">{formatValue(endpoint.total_calls)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Response</span>
                        <div className="font-medium">{formatValue(endpoint.average_response_time, 'time')}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Status Codes</span>
                        <div className="flex gap-1">
                          {Object.entries(endpoint.status_codes).map(([code, count]) => (
                            <Badge 
                              key={code}
                              variant="outline"
                              className={`text-xs ${
                                code.startsWith('2') ? 'text-green-600' : 
                                code.startsWith('4') ? 'text-yellow-600' : 
                                code.startsWith('5') ? 'text-red-600' : 'text-gray-600'
                              }`}
                            >
                              {code}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Active Alerts</h3>
            <Badge variant="outline">
              {data.alerts.length} alerts
            </Badge>
          </div>

          {data.alerts.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All systems are operating normally
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.alerts.map((alert) => (
                <Card key={alert.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`h-5 w-5 mt-0.5 ${
                      alert.level === 'error' ? 'text-red-500' : 
                      alert.level === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge 
                          variant={alert.level === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {alert.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};