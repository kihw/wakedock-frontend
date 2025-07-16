/**
 * Dashboard d'optimisation et performance des logs - Version 0.2.5
 * Interface avancée pour la gestion des performances du système de logs
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity,
    Database,
    Zap,
    Settings,
    BarChart3,
    TrendingUp,
    Archive,
    RefreshCw,
    Search,
    Clock,
    HardDrive,
    Cpu,
    AlertCircle,
    CheckCircle,
    Target,
    Gauge,
    Filter,
    Download
} from 'lucide-react';

// Types pour l'optimisation
interface OptimizationStats {
    total_indexed_logs: number;
    unique_search_terms: number;
    database_size_bytes: number;
    is_running: boolean;
    cache_size: number;
    compression_ratio: number;
    cache_hit_ratio: number;
    compression_stats: {
        original_size: number;
        compressed_size: number;
        compression_ratio: number;
        files_compressed: number;
        time_taken: number;
    };
}

interface PerformanceAnalysis {
    query_performance: {
        cache_hit_ratio: number;
        average_search_time_ms: number;
        index_efficiency: number;
    };
    index_efficiency: {
        terms_per_log: number;
        database_size_mb: number;
        compression_efficiency: number;
    };
    storage_efficiency: {
        total_indexed_logs: number;
        database_size_bytes: number;
        cache_size: number;
        compression_stats: any;
    };
    recommendations: string[];
}

interface StorageUsage {
    total_size_bytes: number;
    total_size_mb: number;
    file_count: number;
    storage_breakdown: {
        log_files: number;
        compressed_files: number;
        index_files: number;
        other_files: number;
    };
    compression_savings: number;
}

// Composant pour les métriques de performance
const PerformanceMetric: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: number;
    unit?: string;
}> = ({ title, value, icon, color, trend, unit }) => {
    const formatValue = (val: string | number) => {
        if (typeof val === 'number') {
            if (unit === '%') return `${val.toFixed(1)}%`;
            if (unit === 'ms') return `${val.toFixed(1)}ms`;
            if (unit === 'MB') return `${(val / (1024 * 1024)).toFixed(1)}MB`;
            return val.toLocaleString();
        }
        return val;
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
                    {trend !== undefined && (
                        <div className={`flex items-center mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span className="text-xs font-medium">
                                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
                <div className={`text-${color}-500`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

// Composant pour les recommandations
const RecommendationsPanel: React.FC<{ recommendations: string[] }> = ({ recommendations }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Recommandations d'Optimisation
                </h3>
            </div>
            <div className="p-6">
                {recommendations.length === 0 ? (
                    <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>Aucune optimisation recommandée - Performance optimale</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-yellow-800">{recommendation}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Composant pour l'utilisation du stockage
const StorageBreakdown: React.FC<{ storageUsage: StorageUsage }> = ({ storageUsage }) => {
    const { storage_breakdown, total_size_bytes } = storageUsage;
    
    const breakdown = [
        { label: 'Fichiers de logs', value: storage_breakdown.log_files, color: 'bg-blue-500' },
        { label: 'Fichiers compressés', value: storage_breakdown.compressed_files, color: 'bg-green-500' },
        { label: 'Index et métadonnées', value: storage_breakdown.index_files, color: 'bg-purple-500' },
        { label: 'Autres fichiers', value: storage_breakdown.other_files, color: 'bg-gray-500' },
    ];

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-blue-500" />
                    Utilisation du Stockage
                </h3>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {breakdown.map((item, index) => {
                        const percentage = total_size_bytes > 0 ? (item.value / total_size_bytes) * 100 : 0;
                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.label}</span>
                                    <span className="font-medium">
                                        {formatBytes(item.value)} ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${item.color}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Économies de compression</span>
                        <span className="text-lg font-bold text-green-600">
                            {storageUsage.compression_savings.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Composant principal
const LogsOptimizationDashboard: React.FC = () => {
    // État des données
    const [stats, setStats] = useState<OptimizationStats | null>(null);
    const [performance, setPerformance] = useState<PerformanceAnalysis | null>(null);
    const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // État des actions
    const [compressionInProgress, setCompressionInProgress] = useState(false);
    const [rebuildInProgress, setRebuildInProgress] = useState(false);
    const [purgeInProgress, setPurgeInProgress] = useState(false);

    // Configuration
    const [compressionType, setCompressionType] = useState<'lz4' | 'gzip'>('lz4');
    const [minSizeMB, setMinSizeMB] = useState(10);
    const [retentionDays, setRetentionDays] = useState(30);

    // Chargement des données
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsRes, performanceRes, storageRes] = await Promise.all([
                fetch('/api/v1/logs/optimization/stats'),
                fetch('/api/v1/logs/optimization/performance/analysis'),
                fetch('/api/v1/logs/optimization/storage/usage')
            ]);

            if (!statsRes.ok || !performanceRes.ok || !storageRes.ok) {
                throw new Error('Erreur lors du chargement des données');
            }

            const [statsData, performanceData, storageData] = await Promise.all([
                statsRes.json(),
                performanceRes.json(),
                storageRes.json()
            ]);

            setStats(statsData);
            setPerformance(performanceData);
            setStorageUsage(storageData);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Actualiser toutes les 30s
        return () => clearInterval(interval);
    }, [loadData]);

    // Actions d'optimisation
    const compressLogs = async () => {
        try {
            setCompressionInProgress(true);
            
            const response = await fetch('/api/v1/logs/optimization/compress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    compression_type: compressionType,
                    file_patterns: ['*.log'],
                    min_size_mb: minSizeMB
                })
            });

            if (!response.ok) throw new Error('Erreur lors de la compression');

            const result = await response.json();
            
            // Recharger les données
            await loadData();
            
            alert(`Compression terminée: ${result.files_compressed.length} fichiers compressés avec ${result.compression_ratio.toFixed(1)}% de réduction`);

        } catch (err: any) {
            setError(`Erreur lors de la compression: ${err.message}`);
        } finally {
            setCompressionInProgress(false);
        }
    };

    const rebuildIndex = async () => {
        try {
            setRebuildInProgress(true);
            
            const response = await fetch('/api/v1/logs/optimization/index/rebuild', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    force_rebuild: true,
                    optimize_after_rebuild: true
                })
            });

            if (!response.ok) throw new Error('Erreur lors de la reconstruction');

            alert('Reconstruction de l\'index démarrée en arrière-plan');

        } catch (err: any) {
            setError(`Erreur lors de la reconstruction: ${err.message}`);
        } finally {
            setRebuildInProgress(false);
        }
    };

    const purgeOldLogs = async () => {
        try {
            setPurgeInProgress(true);
            
            const response = await fetch(`/api/v1/logs/optimization/maintenance/purge?days_to_keep=${retentionDays}`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Erreur lors de la purge');

            const result = await response.json();
            
            // Recharger les données
            await loadData();
            
            alert(`Purge programmée: ${result.logs_to_remove} logs seront supprimés`);

        } catch (err: any) {
            setError(`Erreur lors de la purge: ${err.message}`);
        } finally {
            setPurgeInProgress(false);
        }
    };

    const clearCache = async () => {
        try {
            const response = await fetch('/api/v1/logs/optimization/cache/clear', {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Erreur lors du vidage du cache');

            const result = await response.json();
            
            // Recharger les données
            await loadData();
            
            alert(`Cache vidé: ${result.entries_cleared} entrées supprimées`);

        } catch (err: any) {
            setError(`Erreur lors du vidage du cache: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Chargement des données d'optimisation...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{error}</span>
                </div>
                <button
                    onClick={loadData}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Optimisation des Logs</h1>
                    <p className="text-gray-600">Performance et gestion avancée du système de logs</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                        stats?.is_running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {stats?.is_running ? "Service actif" : "Service inactif"}
                    </span>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Métriques principales */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PerformanceMetric
                        title="Logs indexés"
                        value={stats.total_indexed_logs}
                        icon={<Database className="w-8 h-8" />}
                        color="blue"
                    />
                    <PerformanceMetric
                        title="Efficacité du cache"
                        value={stats.cache_hit_ratio}
                        icon={<Zap className="w-8 h-8" />}
                        color="green"
                        unit="%"
                    />
                    <PerformanceMetric
                        title="Compression"
                        value={stats.compression_ratio}
                        icon={<Archive className="w-8 h-8" />}
                        color="purple"
                        unit="%"
                    />
                    <PerformanceMetric
                        title="Taille base de données"
                        value={stats.database_size_bytes}
                        icon={<HardDrive className="w-8 h-8" />}
                        color="orange"
                        unit="MB"
                    />
                </div>
            )}

            {/* Performance et recommandations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {performance && (
                    <RecommendationsPanel recommendations={performance.recommendations} />
                )}
                
                {storageUsage && (
                    <StorageBreakdown storageUsage={storageUsage} />
                )}
            </div>

            {/* Actions d'optimisation */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-500" />
                        Actions d'Optimisation
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Compression */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Compression des logs</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type de compression
                                    </label>
                                    <select
                                        value={compressionType}
                                        onChange={(e) => setCompressionType(e.target.value as 'lz4' | 'gzip')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="lz4">LZ4 (Rapide)</option>
                                        <option value="gzip">GZIP (Compact)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Taille minimale (MB)
                                    </label>
                                    <input
                                        type="number"
                                        value={minSizeMB}
                                        onChange={(e) => setMinSizeMB(Number(e.target.value))}
                                        min="1"
                                        max="1000"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={compressLogs}
                                    disabled={compressionInProgress}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {compressionInProgress ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Archive className="w-4 h-4" />
                                    )}
                                    Compresser
                                </button>
                            </div>
                        </div>

                        {/* Reconstruction de l'index */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Index de recherche</h4>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    Reconstruit l'index pour optimiser les recherches
                                </p>
                                <button
                                    onClick={rebuildIndex}
                                    disabled={rebuildInProgress}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {rebuildInProgress ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Database className="w-4 h-4" />
                                    )}
                                    Reconstruire
                                </button>
                                <button
                                    onClick={clearCache}
                                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    Vider le cache
                                </button>
                            </div>
                        </div>

                        {/* Purge des logs anciens */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Maintenance</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rétention (jours)
                                    </label>
                                    <input
                                        type="number"
                                        value={retentionDays}
                                        onChange={(e) => setRetentionDays(Number(e.target.value))}
                                        min="1"
                                        max="365"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={purgeOldLogs}
                                    disabled={purgeInProgress}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {purgeInProgress ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Clock className="w-4 h-4" />
                                    )}
                                    Purger logs anciens
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Détails de performance */}
            {performance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-blue-500" />
                            Performance des requêtes
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Taux de cache hit</span>
                                <span className="font-medium">{(performance.query_performance.cache_hit_ratio * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Temps moyen de recherche</span>
                                <span className="font-medium">{performance.query_performance.average_search_time_ms.toFixed(1)}ms</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Efficacité de l'index</span>
                                <span className="font-medium">{(performance.query_performance.index_efficiency * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-500" />
                            Efficacité de l'index
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Termes par log</span>
                                <span className="font-medium">{performance.index_efficiency.terms_per_log.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Taille base de données</span>
                                <span className="font-medium">{performance.index_efficiency.database_size_mb.toFixed(1)} MB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Efficacité compression</span>
                                <span className="font-medium">{performance.index_efficiency.compression_efficiency.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-purple-500" />
                            Stockage
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Logs indexés</span>
                                <span className="font-medium">{performance.storage_efficiency.total_indexed_logs.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Taille base</span>
                                <span className="font-medium">{(performance.storage_efficiency.database_size_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Entrées en cache</span>
                                <span className="font-medium">{performance.storage_efficiency.cache_size}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogsOptimizationDashboard;
