import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle, 
  Target, Zap, Cpu, HardDrive, Network, Calendar,
  Filter, Download, RefreshCw, Settings, BarChart3,
  PieChart as PieChartIcon, Activity as ActivityIcon
} from 'lucide-react';

// Types pour TypeScript
interface PerformanceTrend {
  metric_type: string;
  container_id: string;
  container_name: string;
  service_name?: string;
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  slope: number;
  correlation: number;
  current_value: number;
  average_value: number;
  min_value: number;
  max_value: number;
  std_deviation: number;
  predicted_1h: number;
  predicted_6h: number;
  predicted_24h: number;
  confidence: 'high' | 'medium' | 'low';
  calculated_at: string;
  data_points: number;
  time_range_hours: number;
}

interface ResourceOptimization {
  container_id: string;
  container_name: string;
  service_name?: string;
  resource_type: string;
  optimization_type: string;
  current_limit?: number;
  recommended_limit: number;
  expected_improvement: number;
  reason: string;
  impact_level: string;
  confidence_score: number;
  created_at: string;
}

interface AnalyticsSummary {
  period_hours: number;
  summary: {
    total_trends: number;
    total_optimizations: number;
    unique_containers: number;
  };
  trends_by_direction: Record<string, number>;
  trends_by_confidence: Record<string, number>;
  optimizations_by_type: Record<string, number>;
  optimizations_by_impact: Record<string, number>;
  top_problematic_containers: Array<{
    container_id: string;
    container_name: string;
    service_name?: string;
    issues_count: number;
    issues: Array<{
      metric: string;
      current_value: number;
      predicted_24h: number;
    }>;
  }>;
  generated_at: string;
}

interface AnalyticsFilters {
  timeRange: number;
  metricType: string;
  direction: string;
  confidence: string;
  resourceType: string;
  impactLevel: string;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  // États principaux
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [optimizations, setOptimizations] = useState<ResourceOptimization[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États de l'interface
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'predictions' | 'optimizations'>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  
  // Filtres
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: 24,
    metricType: '',
    direction: '',
    confidence: '',
    resourceType: '',
    impactLevel: ''
  });
  
  // Références
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Configuration des couleurs
  const trendColors = {
    increasing: '#ef4444',
    decreasing: '#10b981',
    stable: '#3b82f6',
    volatile: '#f59e0b'
  };
  
  const confidenceColors = {
    high: '#10b981',
    medium: '#f59e0b', 
    low: '#ef4444'
  };
  
  const impactColors = {
    high: '#dc2626',
    medium: '#ea580c',
    low: '#16a34a'
  };

  // Chargement des données
  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      // Charge les données en parallèle
      const [trendsResponse, optimizationsResponse, summaryResponse] = await Promise.all([
        fetch(`${API_BASE}/api/v1/analytics/trends?hours=${filters.timeRange}&limit=100`),
        fetch(`${API_BASE}/api/v1/analytics/optimizations?hours=${filters.timeRange}&limit=100`),
        fetch(`${API_BASE}/api/v1/analytics/summary?hours=${filters.timeRange}`)
      ]);
      
      if (!trendsResponse.ok || !optimizationsResponse.ok || !summaryResponse.ok) {
        throw new Error('Erreur lors du chargement des données analytics');
      }
      
      const [trendsData, optimizationsData, summaryData] = await Promise.all([
        trendsResponse.json(),
        optimizationsResponse.json(),
        summaryResponse.json()
      ]);
      
      setTrends(trendsData);
      setOptimizations(optimizationsData);
      setSummary(summaryData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur chargement analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.timeRange]);
  
  // Effet de chargement initial et refresh automatique
  useEffect(() => {
    loadAnalyticsData();
    
    // Refresh automatique toutes les 5 minutes
    refreshInterval.current = setInterval(loadAnalyticsData, 5 * 60 * 1000);
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [loadAnalyticsData]);
  
  // Filtrage des données
  const filteredTrends = trends.filter(trend => {
    if (filters.metricType && trend.metric_type !== filters.metricType) return false;
    if (filters.direction && trend.direction !== filters.direction) return false;
    if (filters.confidence && trend.confidence !== filters.confidence) return false;
    if (selectedContainer && trend.container_id !== selectedContainer) return false;
    return true;
  });
  
  const filteredOptimizations = optimizations.filter(opt => {
    if (filters.resourceType && opt.resource_type !== filters.resourceType) return false;
    if (filters.impactLevel && opt.impact_level !== filters.impactLevel) return false;
    if (selectedContainer && opt.container_id !== selectedContainer) return false;
    return true;
  });
  
  // Préparation des données pour les graphiques
  const trendDirectionData = summary ? Object.entries(summary.trends_by_direction).map(([direction, count]) => ({
    name: direction,
    value: count,
    color: trendColors[direction as keyof typeof trendColors] || '#94a3b8'
  })) : [];
  
  const confidenceData = summary ? Object.entries(summary.trends_by_confidence).map(([confidence, count]) => ({
    name: confidence,
    value: count,
    color: confidenceColors[confidence as keyof typeof confidenceColors] || '#94a3b8'
  })) : [];
  
  const optimizationTypeData = summary ? Object.entries(summary.optimizations_by_type).map(([type, count]) => ({
    name: type,
    value: count
  })) : [];
  
  // Données pour le graphique de prédictions
  const predictionData = filteredTrends.map(trend => ({
    name: `${trend.container_name}`,
    metric: trend.metric_type,
    current: trend.current_value,
    predicted_1h: trend.predicted_1h,
    predicted_6h: trend.predicted_6h,
    predicted_24h: trend.predicted_24h,
    correlation: trend.correlation,
    confidence: trend.confidence
  }));
  
  // Liste des conteneurs uniques
  const uniqueContainers = Array.from(new Set([
    ...trends.map(t => ({ id: t.container_id, name: t.container_name })),
    ...optimizations.map(o => ({ id: o.container_id, name: o.container_name }))
  ].map(c => JSON.stringify(c)))).map(c => JSON.parse(c));
  
  // Gestionnaires d'événements
  const handleFilterChange = (key: keyof AnalyticsFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleRefresh = () => {
    loadAnalyticsData();
  };
  
  const handleExportData = () => {
    const data = {
      trends: filteredTrends,
      optimizations: filteredOptimizations,
      summary,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Rendu des composants
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tendances Actives</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary?.summary.total_trends || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Optimisations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary?.summary.total_optimizations || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conteneurs Analysés</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary?.summary.unique_containers || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conteneurs Problématiques</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary?.top_problematic_containers.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Graphiques de répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des Tendances</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trendDirectionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }: any) => `${name}: ${value}`}
              >
                {trendDirectionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confiance des Prédictions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {confidenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Conteneurs problématiques */}
      {summary && summary.top_problematic_containers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conteneurs Nécessitant une Attention</h3>
          <div className="space-y-4">
            {summary.top_problematic_containers.map((container, index) => (
              <div key={container.container_id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{container.container_name}</h4>
                    {container.service_name && (
                      <p className="text-sm text-gray-500">Service: {container.service_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {container.issues_count} problème{container.issues_count > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {container.issues.map((issue, issueIndex) => (
                    <div key={issueIndex} className="text-sm text-gray-600">
                      <span className="font-medium">{issue.metric}:</span> {issue.current_value.toFixed(1)}% 
                      → <span className="text-red-600">{issue.predicted_24h.toFixed(1)}%</span> (24h)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderTrendsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tendances de Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conteneur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métrique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur Actuelle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prédiction 24h
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confiance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrends.map((trend, index) => (
                <tr key={`${trend.container_id}-${trend.metric_type}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{trend.container_name}</div>
                      {trend.service_name && (
                        <div className="text-sm text-gray-500">{trend.service_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {trend.metric_type === 'cpu_percent' && <Cpu className="w-4 h-4 mr-2 text-blue-500" />}
                      {trend.metric_type === 'memory_percent' && <HardDrive className="w-4 h-4 mr-2 text-green-500" />}
                      {trend.metric_type === 'network_mbps' && <Network className="w-4 h-4 mr-2 text-purple-500" />}
                      <span className="text-sm text-gray-900">{trend.metric_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {trend.direction === 'increasing' && <TrendingUp className="w-4 h-4 mr-2 text-red-500" />}
                      {trend.direction === 'decreasing' && <TrendingDown className="w-4 h-4 mr-2 text-green-500" />}
                      {trend.direction === 'stable' && <Activity className="w-4 h-4 mr-2 text-blue-500" />}
                      {trend.direction === 'volatile' && <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trend.direction === 'increasing' ? 'bg-red-100 text-red-800' :
                        trend.direction === 'decreasing' ? 'bg-green-100 text-green-800' :
                        trend.direction === 'stable' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {trend.direction}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.current_value.toFixed(1)}
                    {trend.metric_type.includes('percent') ? '%' : ' MB/s'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={trend.predicted_24h > trend.current_value * 1.2 ? 'text-red-600 font-medium' : 
                                   trend.predicted_24h < trend.current_value * 0.8 ? 'text-green-600 font-medium' : 
                                   'text-gray-900'}>
                      {trend.predicted_24h.toFixed(1)}
                      {trend.metric_type.includes('percent') ? '%' : ' MB/s'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trend.confidence === 'high' ? 'bg-green-100 text-green-800' :
                      trend.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trend.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTrends.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune tendance trouvée avec les filtres actuels
          </div>
        )}
      </div>
    </div>
  );
  
  const renderPredictionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Graphique des Prédictions</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: any) => [
                `${Number(value).toFixed(1)}${predictionData[0]?.metric?.includes('percent') ? '%' : ' MB/s'}`,
                name
              ]}
            />
            <Legend />
            <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Actuel" />
            <Line type="monotone" dataKey="predicted_1h" stroke="#10b981" strokeWidth={2} name="Prédiction 1h" />
            <Line type="monotone" dataKey="predicted_6h" stroke="#f59e0b" strokeWidth={2} name="Prédiction 6h" />
            <Line type="monotone" dataKey="predicted_24h" stroke="#ef4444" strokeWidth={2} name="Prédiction 24h" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analyse de Corrélation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="current" name="Valeur Actuelle" />
            <YAxis type="number" dataKey="predicted_24h" name="Prédiction 24h" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Corrélation" dataKey="correlation" fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
  
  const renderOptimizationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommandations d'Optimisation</h3>
        <div className="space-y-4">
          {filteredOptimizations.map((opt, index) => (
            <div key={`${opt.container_id}-${opt.resource_type}-${index}`} 
                 className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{opt.container_name}</h4>
                    {opt.service_name && (
                      <span className="ml-2 text-sm text-gray-500">({opt.service_name})</span>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center">
                      {opt.resource_type === 'cpu' && <Cpu className="w-4 h-4 mr-1 text-blue-500" />}
                      {opt.resource_type === 'memory' && <HardDrive className="w-4 h-4 mr-1 text-green-500" />}
                      {opt.resource_type === 'network' && <Network className="w-4 h-4 mr-1 text-purple-500" />}
                      <span className="text-sm font-medium text-gray-700">{opt.resource_type}</span>
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      opt.optimization_type === 'increase' ? 'bg-red-100 text-red-800' :
                      opt.optimization_type === 'decrease' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {opt.optimization_type}
                    </span>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      opt.impact_level === 'high' ? 'bg-red-100 text-red-800' :
                      opt.impact_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Impact {opt.impact_level}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">{opt.reason}</p>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Limite actuelle:</span>
                      <span className="ml-1 font-medium">
                        {opt.current_limit ? opt.current_limit.toFixed(1) : 'Non définie'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Recommandée:</span>
                      <span className="ml-1 font-medium text-blue-600">
                        {opt.recommended_limit.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Amélioration:</span>
                      <span className="ml-1 font-medium text-green-600">
                        +{opt.expected_improvement.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <div className="text-sm text-gray-500">
                    Confiance: {(opt.confidence_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(opt.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredOptimizations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune recommandation d'optimisation trouvée
          </div>
        )}
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des analytics...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Avancé</h1>
              <p className="mt-1 text-sm text-gray-500">
                Analyse des performances et prédictions
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sélecteur de conteneur */}
              <select
                value={selectedContainer}
                onChange={(e) => setSelectedContainer(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Tous les conteneurs</option>
                {uniqueContainers.map(container => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </select>
              
              {/* Sélecteur de période */}
              <select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value={6}>6 heures</option>
                <option value={24}>24 heures</option>
                <option value={72}>3 jours</option>
                <option value={168}>7 jours</option>
              </select>
              
              {/* Boutons d'action */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </button>
              
              <button
                onClick={handleExportData}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </button>
            </div>
          </div>
          
          {/* Onglets */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: PieChartIcon },
                { id: 'trends', label: 'Tendances', icon: TrendingUp },
                { id: 'predictions', label: 'Prédictions', icon: ActivityIcon },
                { id: 'optimizations', label: 'Optimisations', icon: Target }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de métrique</label>
                <select
                  value={filters.metricType}
                  onChange={(e) => handleFilterChange('metricType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Toutes</option>
                  <option value="cpu_percent">CPU</option>
                  <option value="memory_percent">Mémoire</option>
                  <option value="network_mbps">Réseau</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direction de tendance</label>
                <select
                  value={filters.direction}
                  onChange={(e) => handleFilterChange('direction', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Toutes</option>
                  <option value="increasing">Croissante</option>
                  <option value="decreasing">Décroissante</option>
                  <option value="stable">Stable</option>
                  <option value="volatile">Volatile</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confiance</label>
                <select
                  value={filters.confidence}
                  onChange={(e) => handleFilterChange('confidence', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Toutes</option>
                  <option value="high">Élevée</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Faible</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'predictions' && renderPredictionsTab()}
        {activeTab === 'optimizations' && renderOptimizationsTab()}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
