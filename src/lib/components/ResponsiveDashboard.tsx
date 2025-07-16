/**
 * Dashboard responsive pour WakeDock
 * Interface adaptée automatiquement selon l'appareil et l'orientation
 */

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useBreakpoint, useOrientation } from '../utils/responsive';
import { ResponsiveLayout, ResponsiveContent, ShowOn } from './ResponsiveLayout';

interface DashboardData {
  containers: {
    total: number;
    running: number;
    stopped: number;
    paused: number;
  };
  system: {
    cpu_percent: number;
    memory_percent: number;
    disk_percent: number;
    status: string;
  };
  alerts: Array<{
    id: string;
    message: string;
    severity: string;
    timestamp: string;
  }>;
  timestamp: string;
}

interface ResponsiveDashboardProps {
  className?: string;
}

export const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  className = ''
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { isPortrait, isLandscape } = useOrientation();

  // Gestion du statut online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch des données
  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Utiliser l'endpoint mobile si on est sur mobile
      const endpoint = isMobile ? '/api/v1/mobile/dashboard/summary' : '/api/v1/dashboard/summary';
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const dashboardData = await response.json();
      setData(dashboardData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial et auto-refresh
  useEffect(() => {
    fetchDashboardData();

    if (autoRefresh && isOnline) {
      const interval = setInterval(fetchDashboardData, isMobile ? 30000 : 15000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isOnline, isMobile]);

  // Composant StatCard responsive
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    subtitle?: string;
  }> = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className={`
      card-mobile bg-white dark:bg-gray-800 
      ${isMobile ? 'p-4' : 'p-6'}
      border border-gray-200 dark:border-gray-700 
      hover:shadow-lg transition-all duration-200
    `}>
      <div className={`flex items-center ${isMobile && isPortrait ? 'justify-between' : 'space-x-4'}`}>
        <div className={`
          rounded-lg p-3 ${color}
          ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}
          flex items-center justify-center
        `}>
          <Icon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
            {title}
          </p>
          <p className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {trend && !isMobile && (
          <div className="flex items-center">
            {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
            {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
          </div>
        )}
      </div>
    </div>
  );

  // Composant AlertBanner responsive
  const AlertBanner: React.FC<{ alerts: DashboardData['alerts'] }> = ({ alerts }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
      <div className={`
        bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
        rounded-lg p-4 space-y-2
      `}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-red-800 dark:text-red-200">
            Alertes critiques ({alerts.length})
          </h3>
        </div>
        
        <div className="space-y-1">
          {alerts.slice(0, isMobile ? 2 : 3).map((alert) => (
            <p key={alert.id} className="text-sm text-red-700 dark:text-red-300">
              {alert.message}
            </p>
          ))}
          
          {alerts.length > (isMobile ? 2 : 3) && (
            <p className="text-xs text-red-600 dark:text-red-400">
              +{alerts.length - (isMobile ? 2 : 3)} autre(s) alerte(s)
            </p>
          )}
        </div>
      </div>
    );
  };

  // Layout mobile
  const MobileLayout = () => (
    <div className="space-y-4">
      {/* Header mobile */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isOnline ? (
              <span className="flex items-center space-x-1">
                <Wifi className="w-4 h-4" />
                <span>En ligne</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <WifiOff className="w-4 h-4" />
                <span>Hors ligne</span>
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="btn-touch bg-blue-500 text-white p-2 rounded-lg"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alertes */}
      {data?.alerts && <AlertBanner alerts={data.alerts} />}

      {/* Statistiques en stack vertical */}
      <div className="space-y-3">
        <StatCard
          title="Containers"
          value={data?.containers.total || 0}
          icon={Container}
          color="bg-blue-500"
          subtitle={`${data?.containers.running || 0} actifs`}
        />
        
        <StatCard
          title="CPU"
          value={`${data?.system.cpu_percent || 0}%`}
          icon={Activity}
          color="bg-green-500"
          trend={(data?.system.cpu_percent ?? 0) > 80 ? 'up' : 'stable'}
        />
        
        <StatCard
          title="Mémoire"
          value={`${data?.system.memory_percent || 0}%`}
          icon={Activity}
          color="bg-yellow-500"
          trend={(data?.system.memory_percent ?? 0) > 85 ? 'up' : 'stable'}
        />
      </div>

      {/* Dernière mise à jour */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  // Layout tablette
  const TabletLayout = () => (
    <div className="space-y-6">
      {/* Header tablette */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Vue d'ensemble du système • {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600">En ligne</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600">Hors ligne</span>
              </>
            )}
          </div>
          
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-touch bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alertes */}
      {data?.alerts && <AlertBanner alerts={data.alerts} />}

      {/* Grille 2x2 en portrait, 4x1 en paysage */}
      <div className={`
        grid gap-4
        ${isPortrait ? 'grid-cols-2 grid-rows-2' : 'grid-cols-4 grid-rows-1'}
      `}>
        <StatCard
          title="Containers Total"
          value={data?.containers.total || 0}
          icon={Container}
          color="bg-blue-500"
          subtitle={`${data?.containers.running || 0} actifs`}
        />
        
        <StatCard
          title="CPU Usage"
          value={`${data?.system.cpu_percent || 0}%`}
          icon={Activity}
          color="bg-green-500"
          trend={(data?.system.cpu_percent ?? 0) > 80 ? 'up' : 'stable'}
        />
        
        <StatCard
          title="Memory Usage"
          value={`${data?.system.memory_percent || 0}%`}
          icon={Activity}
          color="bg-yellow-500"
          trend={(data?.system.memory_percent ?? 0) > 85 ? 'up' : 'stable'}
        />
        
        <StatCard
          title="Disk Usage"
          value={`${data?.system.disk_percent || 0}%`}
          icon={Activity}
          color="bg-purple-500"
          trend={(data?.system.disk_percent ?? 0) > 90 ? 'up' : 'stable'}
        />
      </div>
    </div>
  );

  // Layout desktop
  const DesktopLayout = () => (
    <div className="space-y-8">
      {/* Header desktop */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard WakeDock</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Supervision complète de vos containers Docker • Dernière mise à jour: {lastUpdate.toLocaleString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">Connecté</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-red-600 font-medium">Déconnecté</span>
              </>
            )}
          </div>
          
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-touch bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Alertes */}
      {data?.alerts && <AlertBanner alerts={data.alerts} />}

      {/* Grille 4 colonnes */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Containers Total"
          value={data?.containers.total || 0}
          icon={Container}
          color="bg-blue-500"
          subtitle={`${data?.containers.running || 0} en cours d'exécution`}
          trend="stable"
        />
        
        <StatCard
          title="Utilisation CPU"
          value={`${data?.system.cpu_percent || 0}%`}
          icon={Activity}
          color="bg-green-500"
          trend={(data?.system.cpu_percent ?? 0) > 80 ? 'up' : 'stable'}
        />
        
        <StatCard
          title="Utilisation Mémoire"
          value={`${data?.system.memory_percent || 0}%`}
          icon={Activity}
          color="bg-yellow-500"
          trend={(data?.system.memory_percent ?? 0) > 85 ? 'up' : 'stable'}
        />
        
        <StatCard
          title="Utilisation Disque"
          value={`${data?.system.disk_percent || 0}%`}
          icon={Activity}
          color="bg-purple-500"
          trend={(data?.system.disk_percent ?? 0) > 90 ? 'up' : 'stable'}
        />
      </div>
    </div>
  );

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">Chargement du dashboard...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Erreur de chargement</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="btn-touch bg-blue-500 text-white px-6 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContent
        mobileLayout={<MobileLayout />}
        tabletLayout={<TabletLayout />}
        desktopLayout={<DesktopLayout />}
      >
        {/* Fallback content */}
        <div>Chargement...</div>
      </ResponsiveContent>
      
      {/* Indicateur d'appareil (debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs">
          {isMobile && <span className="flex items-center space-x-1"><Smartphone className="w-3 h-3" /><span>Mobile</span></span>}
          {isTablet && <span>Tablette</span>}
          {isDesktop && <span className="flex items-center space-x-1"><Monitor className="w-3 h-3" /><span>Desktop</span></span>}
          {' • '}
          {isPortrait ? 'Portrait' : 'Paysage'}
        </div>
      )}
    </div>
  );
};

export default ResponsiveDashboard;
