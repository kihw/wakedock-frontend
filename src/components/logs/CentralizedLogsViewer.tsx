/**
 * Interface principale de visualisation des logs centralisés
 */
import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import {
    Play,
    Pause,
    Download,
    Search,
    Filter,
    RefreshCw,
    Clock,
    Container,
    AlertTriangle,
    Info,
    XCircle,
    CheckCircle,
    Zap
} from 'lucide-react';

// Types
interface LogEntry {
    timestamp: string;
    level: string;
    container_id: string;
    container_name: string;
    service_name?: string;
    message: string;
    source: string;
    metadata: Record<string, any>;
}

interface LogSearchResponse {
    logs: LogEntry[];
    total_found: number;
    search_time_ms: number;
    has_more: boolean;
}

interface LogStatistics {
    total_logs: number;
    level_distribution: Record<string, number>;
    container_distribution: Record<string, number>;
    service_distribution: Record<string, number>;
    timeline: Record<string, number>;
}

interface LogCollectorStatus {
    is_running: boolean;
    monitored_containers: number;
    active_tasks: number;
    buffered_logs: number;
    log_files: number;
    storage_path: string;
}

// Composant pour une entrée de log
const LogEntryComponent: React.FC<{ log: LogEntry; highlight?: string }> = ({
    log,
    highlight
}) => {
    const getLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case 'error':
            case 'fatal':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warn':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'info':
                return <Info className="w-4 h-4 text-blue-500" />;
            case 'debug':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            default:
                return <Zap className="w-4 h-4 text-gray-500" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'error':
            case 'fatal':
                return 'bg-red-100 text-red-800 border border-red-200 px-2 py-1 rounded';
            case 'warn':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-1 rounded';
            case 'info':
                return 'bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded';
            case 'debug':
                return 'bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200 px-2 py-1 rounded';
        }
    };

    const highlightMessage = (message: string, searchTerm?: string) => {
        if (!searchTerm) return message;

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = message.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ?
                <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> :
                part
        );
    };

    return (
        <div className="border-l-4 border-l-gray-200 pl-4 py-2 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs text-gray-500 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className={`text-xs flex items-center gap-1 ${getLevelColor(log.level)}`}>
                    {getLevelIcon(log.level)}
                    {log.level.toUpperCase()}
                </span>
                <span className="text-xs bg-gray-100 text-gray-800 border border-gray-200 px-2 py-1 rounded flex items-center gap-1">
                    <Container className="w-3 h-3" />
                    {log.container_name}
                </span>
                {log.service_name && (
                    <span className="text-xs bg-white text-gray-700 border border-gray-200 px-2 py-1 rounded">
                        {log.service_name}
                    </span>
                )}
            </div>
            <div className="text-sm font-mono text-gray-800 break-words">
                {highlightMessage(log.message, highlight)}
            </div>
            {Object.keys(log.metadata).length > 0 && (
                <details className="mt-1">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        Métadonnées ({Object.keys(log.metadata).length})
                    </summary>
                    <pre className="text-xs text-gray-600 bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
};

// Composant principal
const CentralizedLogsViewer: React.FC = () => {
    // État des logs
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResponse, setSearchResponse] = useState<LogSearchResponse | null>(null);

    // État des filtres
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContainer, setSelectedContainer] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [limit, setLimit] = useState(1000);

    // État du streaming
    const [isStreaming, setIsStreaming] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const eventSourceRef = useRef<EventSource | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // État des statistiques
    const [statistics, setStatistics] = useState<LogStatistics | null>(null);
    const [collectorStatus, setCollectorStatus] = useState<LogCollectorStatus | null>(null);

    // Conteneurs et services disponibles
    const [containers, setContainers] = useState<string[]>([]);
    const [services, setServices] = useState<string[]>([]);

    // Niveaux de log disponibles
    const logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

    // Chargement initial
    useEffect(() => {
        loadInitialData();
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    // Auto-scroll vers le bas
    useEffect(() => {
        if (autoScroll && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoScroll]);

    const loadInitialData = async () => {
        try {
            await Promise.all([
                loadCollectorStatus(),
                loadStatistics(),
                searchLogs()
            ]);
        } catch (err) {
            setError('Erreur lors du chargement initial');
            console.error(err);
        }
    };

    const loadCollectorStatus = async () => {
        try {
            const response = await fetch('/api/v1/logs/status');
            if (!response.ok) throw new Error('Erreur lors du chargement du statut');

            const status = await response.json();
            setCollectorStatus(status);
        } catch (err) {
            console.error('Erreur lors du chargement du statut:', err);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await fetch('/api/v1/logs/statistics');
            if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');

            const stats = await response.json();
            setStatistics(stats);

            // Extrait les conteneurs et services
            setContainers(Object.keys(stats.container_distribution));
            setServices(Object.keys(stats.service_distribution));
        } catch (err) {
            console.error('Erreur lors du chargement des statistiques:', err);
        }
    };

    const searchLogs = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            if (selectedContainer) params.append('container_id', selectedContainer);
            if (selectedService) params.append('service_name', selectedService);
            if (selectedLevel) params.append('level', selectedLevel);
            if (startTime) params.append('start_time', startTime);
            if (endTime) params.append('end_time', endTime);
            params.append('limit', limit.toString());

            const response = await fetch(`/api/v1/logs/search?${params}`);
            if (!response.ok) throw new Error('Erreur lors de la recherche');

            const data: LogSearchResponse = await response.json();
            setLogs(data.logs);
            setSearchResponse(data);
        } catch (err: any) {
            setError(err.message);
            console.error('Erreur lors de la recherche:', err);
        } finally {
            setLoading(false);
        }
    };

    const startStreaming = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const params = new URLSearchParams();
        if (selectedContainer) params.append('container_id', selectedContainer);
        if (selectedLevel) params.append('level', selectedLevel);
        params.append('follow', 'true');

        const eventSource = new EventSource(`/api/v1/logs/stream?${params}`);

        eventSource.onmessage = (event) => {
            try {
                const logEntry: LogEntry = JSON.parse(event.data);
                setLogs(prevLogs => [...prevLogs, logEntry]);
            } catch (err) {
                console.error('Erreur lors du parsing du log:', err);
            }
        };

        eventSource.onerror = (err) => {
            console.error('Erreur de streaming:', err);
            setIsStreaming(false);
            eventSource.close();
        };

        eventSourceRef.current = eventSource;
        setIsStreaming(true);
    };

    const stopStreaming = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsStreaming(false);
    };

    const exportLogs = async (format: 'json' | 'csv' | 'txt') => {
        try {
            const requestBody = {
                format,
                container_id: selectedContainer || undefined,
                service_name: selectedService || undefined,
                level: selectedLevel || undefined,
                start_time: startTime || undefined,
                end_time: endTime || undefined,
                limit: 10000
            };

            const response = await fetch('/api/v1/logs/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error('Erreur lors de l\'export');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `logs_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            setError(`Erreur lors de l'export: ${err.message}`);
        }
    };

    const clearLogs = () => {
        setLogs([]);
        setSearchResponse(null);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num);
    };

    return (
        <div className="p-6 space-y-6">
            {/* En-tête avec statut */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Logs Centralisés</h1>
                    <p className="text-gray-600">Recherche et visualisation des logs de conteneurs</p>
                </div>

                {collectorStatus && (
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded text-sm font-medium ${collectorStatus.is_running
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {collectorStatus.is_running ? "Actif" : "Inactif"}
                        </span>
                        <span className="text-sm text-gray-600">
                            {collectorStatus.monitored_containers} conteneurs surveillés
                        </span>
                    </div>
                )}
            </div>

            {/* Statistiques */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                                <p className="text-2xl font-bold">{formatNumber(statistics.total_logs)}</p>
                            </div>
                            <div className="text-blue-500">
                                <Clock className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Conteneurs</p>
                                <p className="text-2xl font-bold">
                                    {Object.keys(statistics.container_distribution).length}
                                </p>
                            </div>
                            <div className="text-green-500">
                                <Container className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Erreurs</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {(statistics.level_distribution.error || 0) + (statistics.level_distribution.fatal || 0)}
                                </p>
                            </div>
                            <div className="text-red-500">
                                <XCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avertissements</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {statistics.level_distribution.warn || 0}
                                </p>
                            </div>
                            <div className="text-yellow-500">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtres et Recherche
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Rechercher dans les logs..."
                                    value={searchQuery}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && searchLogs()}
                                />
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    onClick={searchLogs}
                                    disabled={loading}
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Conteneur</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedContainer}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedContainer(e.target.value)}
                            >
                                <option value="">Tous les conteneurs</option>
                                {containers.map(container => (
                                    <option key={container} value={container}>
                                        {container}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedService}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedService(e.target.value)}
                            >
                                <option value="">Tous les services</option>
                                {services.map(service => (
                                    <option key={service} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedLevel}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedLevel(e.target.value)}
                            >
                                <option value="">Tous les niveaux</option>
                                {logLevels.map(level => (
                                    <option key={level} value={level}>
                                        {level.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={startTime}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={endTime}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                                onClick={searchLogs}
                                disabled={loading}
                            >
                                <Search className="w-4 h-4" />
                                Rechercher
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                onClick={clearLogs}
                            >
                                Effacer
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 flex items-center gap-2"
                                onClick={loadStatistics}
                                disabled={loading}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Actualiser
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={limit.toString()}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setLimit(parseInt(e.target.value))}
                            >
                                <option value="100">100</option>
                                <option value="500">500</option>
                                <option value="1000">1000</option>
                                <option value="5000">5000</option>
                            </select>
                            <span className="text-sm text-gray-600">logs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contrôles de streaming et export */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {!isStreaming ? (
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
                            onClick={startStreaming}
                        >
                            <Play className="w-4 h-4" />
                            Streaming Temps Réel
                        </button>
                    ) : (
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2"
                            onClick={stopStreaming}
                        >
                            <Pause className="w-4 h-4" />
                            Arrêter Streaming
                        </button>
                    )}

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setAutoScroll(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Auto-scroll
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2"
                        onClick={() => exportLogs('json')}
                    >
                        <Download className="w-4 h-4" />
                        JSON
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2"
                        onClick={() => exportLogs('csv')}
                    >
                        <Download className="w-4 h-4" />
                        CSV
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2"
                        onClick={() => exportLogs('txt')}
                    >
                        <Download className="w-4 h-4" />
                        TXT
                    </button>
                </div>
            </div>

            {/* Résultats de recherche */}
            {searchResponse && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center">
                        <Info className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-blue-800">
                            {formatNumber(searchResponse.total_found)} logs trouvés en {searchResponse.search_time_ms}ms
                            {searchResponse.has_more && " (résultats tronqués)"}
                        </span>
                    </div>
                </div>
            )}

            {/* Erreur */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center">
                        <XCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-red-800">{error}</span>
                    </div>
                </div>
            )}

            {/* Logs */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-medium">Logs ({formatNumber(logs.length)})</h3>
                    {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
                </div>
                <div className="p-6">
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Aucun log trouvé
                            </div>
                        ) : (
                            logs.map((log, index) => (
                                <LogEntryComponent
                                    key={`${log.container_id}-${log.timestamp}-${index}`}
                                    log={log}
                                    highlight={searchQuery}
                                />
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CentralizedLogsViewer;
