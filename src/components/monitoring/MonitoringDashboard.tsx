import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  Server,
  AlertTriangle,
  AlertCircle,
  Info,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Maximize2,
  Minimize2,
  Filter,
  Download
} from 'lucide-react';

// Types pour les métriques et alertes
interface ContainerMetrics {
  container_id: string;
  container_name: string;
  service_name?: string;
  timestamp: string;
  cpu_percent: number;
  memory_usage: number;
  memory_limit: number;
  memory_percent: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  block_read_bytes: number;
  block_write_bytes: number;
  pids: number;
}

interface Alert {
  container_id: string;
  container_name: string;
  service_name?: string;
  timestamp: string;
  level: 'info' | 'warning' | 'critical';
  metric_type: string;
  value: number;
  threshold: number;
  message: string;
}

interface MonitoringStats {
  monitoring: {
    is_running: boolean;
    monitored_containers: number;
    collection_interval: number;
    retention_days: number;
  };
  websocket: {
    is_running: boolean;
    active_connections: number;
    total_connections: number;
    messages_sent: number;
  };
  thresholds: Record<string, any>;
}

// Composant pour une métrique individuelle
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
  className?: string;
}> = ({ title, value, unit, icon, trend, status = 'normal', className = '' }) => {
  const statusColors = {
    normal: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    critical: 'border-red-200 bg-red-50'
  };

  const trendColors = {
    up: 'text-red-500',
    down: 'text-green-500',
    stable: 'text-gray-500'
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColors[status]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        {trend && (
          <span className={`text-xs ${trendColors[trend]}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
};

// Composant pour les graphiques en temps réel
const RealTimeChart: React.FC<{
  data: Array<{ timestamp: string; value: number }>;
  title: string;
  color: string;
  unit: string;
  maxPoints?: number;
}> = ({ data, title, color, unit, maxPoints = 50 }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Prend les derniers points
    const points = data.slice(-maxPoints);
    if (points.length < 2) return;

    // Trouve les valeurs min/max pour l'échelle
    const values = points.map(p => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Dessine la grille
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Lignes horizontales
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Lignes verticales
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Dessine la courbe
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((point, index) => {
      const x = (width / (points.length - 1)) * index;
      const y = height - ((point.value - minValue) / range) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Remplit sous la courbe
    ctx.fillStyle = color + '20';
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

  }, [data, color, maxPoints]);

  const latestValue = data.length > 0 ? data[data.length - 1]?.value || 0 : 0;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="text-xl font-bold" style={{ color }}>
          {latestValue.toFixed(1)}{unit}
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={chartRef}
          width={400}
          height={150}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

// Composant pour les alertes
const AlertsList: React.FC<{
  alerts: Alert[];
  onClearAlerts?: () => void;
}> = ({ alerts, onClearAlerts }) => {
  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Alertes récentes</h3>
        {alerts.length > 0 && onClearAlerts && (
          <button
            onClick={onClearAlerts}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Effacer
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucune alerte récente
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 border-b border-gray-100 last:border-b-0 ${getAlertStyle(alert.level)}`}
            >
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.level)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {alert.container_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  {alert.service_name && (
                    <span className="text-xs text-gray-500">
                      Service: {alert.service_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Composant principal du dashboard
const MonitoringDashboard: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [containers, setContainers] = useState<ContainerMetrics[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Données pour les graphiques
  const [cpuHistory, setCpuHistory] = useState<Array<{ timestamp: string; value: number }>>([]);
  const [memoryHistory, setMemoryHistory] = useState<Array<{ timestamp: string; value: number }>>([]);
  const [networkHistory, setNetworkHistory] = useState<Array<{ timestamp: string; value: number }>>([]);

  const wsRef = useRef<WebSocket | null>(null);

  // Connexion WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/v1/monitoring/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connecté');
        setIsConnected(true);
        
        // S'abonne aux flux
        wsRef.current?.send(JSON.stringify({
          action: 'subscribe',
          stream_type: 'metrics',
          filters: selectedContainer !== 'all' ? { container_ids: [selectedContainer] } : {}
        }));
        
        wsRef.current?.send(JSON.stringify({
          action: 'subscribe',
          stream_type: 'alerts'
        }));
        
        wsRef.current?.send(JSON.stringify({
          action: 'subscribe',
          stream_type: 'system_status'
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'metrics_update':
              handleMetricsUpdate(message.data);
              break;
            case 'alert':
              handleAlert(message.data);
              break;
            case 'status_update':
              handleStatusUpdate(message.data);
              break;
            case 'pong':
              // Garde la connexion vivante
              break;
          }
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket déconnecté');
        setIsConnected(false);
        
        // Reconnexion automatique après 5 secondes
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };
    };

    connectWebSocket();

    return () => {
      wsRef.current?.close();
    };
  }, [selectedContainer]);

  // Ping périodique pour maintenir la connexion
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'ping' }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Gestion des mises à jour de métriques
  const handleMetricsUpdate = (metrics: ContainerMetrics) => {
    const timestamp = new Date(metrics.timestamp).toISOString();
    
    // Met à jour les conteneurs
    setContainers(prev => {
      const index = prev.findIndex(c => c.container_id === metrics.container_id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = metrics;
        return updated;
      }
      return [...prev, metrics];
    });

    // Met à jour les historiques
    if (selectedContainer === 'all' || selectedContainer === metrics.container_id) {
      setCpuHistory(prev => [...prev, { timestamp, value: metrics.cpu_percent }].slice(-50));
      setMemoryHistory(prev => [...prev, { timestamp, value: metrics.memory_percent }].slice(-50));
      setNetworkHistory(prev => [...prev, { 
        timestamp, 
        value: (metrics.network_rx_bytes + metrics.network_tx_bytes) / 1024 / 1024 
      }].slice(-50));
    }
  };

  // Gestion des alertes
  const handleAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 50));
  };

  // Gestion des mises à jour de statut
  const handleStatusUpdate = (status: any) => {
    if (status.monitoring_active !== undefined) {
      setIsMonitoring(status.monitoring_active);
    }
    if (status.collector_stats || status.websocket_stats) {
      setStats(status);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Charge le statut
        const statusResponse = await fetch('/api/v1/monitoring/status');
        const statusData = await statusResponse.json();
        setStats(statusData);
        setIsMonitoring(statusData.monitoring.is_running);

        // Charge les conteneurs
        const containersResponse = await fetch('/api/v1/monitoring/containers');
        const containersData = await containersResponse.json();
        setContainers(containersData.containers || []);

        // Charge les alertes récentes
        const alertsResponse = await fetch('/api/v1/monitoring/alerts?hours=24&limit=20');
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadInitialData();
  }, []);

  // Actions du dashboard
  const startMonitoring = async () => {
    try {
      await fetch('/api/v1/monitoring/start', { method: 'POST' });
      setIsMonitoring(true);
    } catch (error) {
      console.error('Erreur lors du démarrage du monitoring:', error);
    }
  };

  const stopMonitoring = async () => {
    try {
      await fetch('/api/v1/monitoring/stop', { method: 'POST' });
      setIsMonitoring(false);
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du monitoring:', error);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/v1/monitoring/metrics?hours=24&limit=10000');
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  // Calcul des métriques globales
  const globalMetrics = useMemo(() => {
    if (containers.length === 0) {
      return { avgCpu: 0, avgMemory: 0, totalNetwork: 0 };
    }

    const filteredContainers = selectedContainer === 'all' 
      ? containers 
      : containers.filter(c => c.container_id === selectedContainer);

    const avgCpu = filteredContainers.reduce((sum, c) => sum + c.cpu_percent, 0) / filteredContainers.length;
    const avgMemory = filteredContainers.reduce((sum, c) => sum + c.memory_percent, 0) / filteredContainers.length;
    const totalNetwork = filteredContainers.reduce((sum, c) => 
      sum + (c.network_rx_bytes + c.network_tx_bytes) / 1024 / 1024, 0
    );

    return { avgCpu, avgMemory, totalNetwork };
  }, [containers, selectedContainer]);

  // Statut de connexion
  const connectionStatus = isConnected ? 'Connecté' : 'Déconnecté';
  const connectionColor = isConnected ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`p-6 bg-gray-50 min-h-screen ${isExpanded ? 'fixed inset-0 z-50' : ''}`}>
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoring Temps Réel</h1>
            <p className="text-gray-600 mt-2">
              Surveillance des performances des conteneurs Docker
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Statut de connexion */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm ${connectionColor}`}>{connectionStatus}</span>
            </div>

            {/* Contrôles */}
            <div className="flex items-center space-x-2">
              <button
                onClick={autoRefresh ? () => setAutoRefresh(false) : () => setAutoRefresh(true)}
                className={`p-2 rounded-lg border ${
                  autoRefresh 
                    ? 'bg-green-100 border-green-300 text-green-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
                title={autoRefresh ? 'Désactiver la mise à jour automatique' : 'Activer la mise à jour automatique'}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isMonitoring
                    ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4 inline mr-2" />
                    Arrêter
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 inline mr-2" />
                    Démarrer
                  </>
                )}
              </button>

              <button
                onClick={exportData}
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                title="Exporter les données"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                title={isExpanded ? 'Mode normal' : 'Plein écran'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Filtre par conteneur */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Conteneur:</span>
          </div>
          <select
            value={selectedContainer}
            onChange={(e) => setSelectedContainer(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm"
          >
            <option value="all">Tous les conteneurs</option>
            {containers.map(container => (
              <option key={container.container_id} value={container.container_id}>
                {container.container_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="CPU Moyen"
          value={globalMetrics.avgCpu.toFixed(1)}
          unit="%"
          icon={<Cpu className="w-5 h-5 text-blue-500" />}
          status={globalMetrics.avgCpu > 80 ? 'critical' : globalMetrics.avgCpu > 60 ? 'warning' : 'normal'}
        />
        
        <MetricCard
          title="Mémoire Moyenne"
          value={globalMetrics.avgMemory.toFixed(1)}
          unit="%"
          icon={<HardDrive className="w-5 h-5 text-green-500" />}
          status={globalMetrics.avgMemory > 90 ? 'critical' : globalMetrics.avgMemory > 75 ? 'warning' : 'normal'}
        />
        
        <MetricCard
          title="Trafic Réseau"
          value={globalMetrics.totalNetwork.toFixed(1)}
          unit="MB"
          icon={<Network className="w-5 h-5 text-purple-500" />}
        />
        
        <MetricCard
          title="Conteneurs"
          value={containers.length}
          icon={<Server className="w-5 h-5 text-orange-500" />}
        />
      </div>

      {/* Graphiques temps réel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <RealTimeChart
          data={cpuHistory}
          title="CPU (%)"
          color="#3b82f6"
          unit="%"
        />
        
        <RealTimeChart
          data={memoryHistory}
          title="Mémoire (%)"
          color="#10b981"
          unit="%"
        />
        
        <RealTimeChart
          data={networkHistory}
          title="Réseau (MB)"
          color="#8b5cf6"
          unit="MB"
        />
      </div>

      {/* Section inférieure: Alertes et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes */}
        <AlertsList
          alerts={alerts}
          onClearAlerts={() => setAlerts([])}
        />

        {/* Statistiques détaillées */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Statistiques du système</h3>
          </div>
          <div className="p-4 space-y-4">
            {stats && (
              <>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Collecteur de métriques</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Statut:</span>
                      <span className={`ml-2 font-medium ${
                        stats.monitoring.is_running ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.monitoring.is_running ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Conteneurs surveillés:</span>
                      <span className="ml-2 font-medium">{stats.monitoring.monitored_containers}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Intervalle:</span>
                      <span className="ml-2 font-medium">{stats.monitoring.collection_interval}s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rétention:</span>
                      <span className="ml-2 font-medium">{stats.monitoring.retention_days}j</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">WebSocket</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Connexions actives:</span>
                      <span className="ml-2 font-medium">{stats.websocket.active_connections}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total connexions:</span>
                      <span className="ml-2 font-medium">{stats.websocket.total_connections}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Messages envoyés:</span>
                      <span className="ml-2 font-medium">{stats.websocket.messages_sent}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
