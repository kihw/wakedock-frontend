'use client';

import React, { useState, useEffect } from 'react';
import {
    Layers,
    Container,
    Play,
    Square,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Search,
    Eye,
    MoreVertical
} from 'lucide-react';

// Types pour les stacks
interface StackSummary {
    id: string;
    name: string;
    type: 'compose' | 'swarm' | 'kubernetes' | 'standalone' | 'custom';
    status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'unknown';
    total_containers: number;
    running_containers: number;
    created: string;
    updated: string;
    project_name?: string;
    labels?: Record<string, string>;
}

interface StackOverview {
    total_stacks: number;
    running_stacks: number;
    stopped_stacks: number;
    error_stacks: number;
    total_containers: number;
    running_containers: number;
    by_type: Record<string, {
        count: number;
        running: number;
        stopped: number;
        error: number;
    }>;
}

// Composant principal pour la gestion des stacks
export function StackManagement() {
    const [stacks, setStacks] = useState<StackSummary[]>([]);
    const [overview, setOverview] = useState<StackOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Charger les données au montage
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Charger les stacks et l'aperçu en parallèle
            const [stacksResponse, overviewResponse] = await Promise.all([
                fetch('/api/v1/stacks'),
                fetch('/api/v1/stacks/stats/overview')
            ]);

            if (!stacksResponse.ok || !overviewResponse.ok) {
                throw new Error('Erreur lors du chargement des données');
            }

            const stacksData = await stacksResponse.json();
            const overviewData = await overviewResponse.json();

            // Adapter les données pour la compatibilité avec les nouveaux endpoints
            const adaptedStacks = Array.isArray(stacksData) ? stacksData : [];
            const adaptedOverview = overviewData.overview || overviewData;

            setStacks(adaptedStacks);
            setOverview(adaptedOverview);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les stacks
    const filteredStacks = stacks.filter(stack => {
        const matchesSearch = stack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (stack.project_name && stack.project_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = selectedType === 'all' || stack.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || stack.status === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    // Fonctions utilitaires
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'stopped':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'starting':
            case 'stopping':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'error':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default:
                return <Container className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'bg-green-100 text-green-800';
            case 'stopped':
                return 'bg-red-100 text-red-800';
            case 'starting':
            case 'stopping':
                return 'bg-yellow-100 text-yellow-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'compose':
                return 'bg-blue-100 text-blue-800';
            case 'swarm':
                return 'bg-purple-100 text-purple-800';
            case 'kubernetes':
                return 'bg-indigo-100 text-indigo-800';
            case 'standalone':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-orange-100 text-orange-800';
        }
    };

    const executeStackAction = async (stackId: string, action: string) => {
        try {
            const response = await fetch(`/api/v1/stacks/${stackId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                throw new Error(`Erreur lors de l'exécution de l'action: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Action exécutée:', result);
            
            // Rafraîchir les données après l'action
            await loadData();
        } catch (err) {
            console.error('Erreur lors de l\'exécution de l\'action:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Chargement des stacks...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                </div>
                <button
                    onClick={loadData}
                    className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec statistiques */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Layers className="w-8 h-8 mr-3 text-blue-600" />
                        Gestion des Stacks
                    </h2>
                    <button
                        onClick={loadData}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualiser
                    </button>
                </div>

                {/* Statistiques globales */}
                {overview && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <Layers className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Stacks</p>
                                    <p className="text-2xl font-bold text-blue-900">{overview.total_stacks}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-600">En Cours</p>
                                    <p className="text-2xl font-bold text-green-900">{overview.running_stacks}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <XCircle className="w-8 h-8 text-gray-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Arrêtées</p>
                                    <p className="text-2xl font-bold text-gray-900">{overview.stopped_stacks}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-red-600">Erreurs</p>
                                    <p className="text-2xl font-bold text-red-900">{overview.error_stacks}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtres */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher une stack..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tous les types</option>
                        <option value="compose">Docker Compose</option>
                        <option value="swarm">Docker Swarm</option>
                        <option value="kubernetes">Kubernetes</option>
                        <option value="standalone">Standalone</option>
                        <option value="custom">Custom</option>
                    </select>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="running">En cours</option>
                        <option value="stopped">Arrêtées</option>
                        <option value="error">Erreurs</option>
                    </select>
                </div>
            </div>

            {/* Liste des stacks */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Stacks Détectées ({filteredStacks.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stack
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Containers
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dernière MAJ
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStacks.map((stack) => (
                                <tr key={stack.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Layers className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{stack.name}</div>
                                                {stack.project_name && (
                                                    <div className="text-sm text-gray-500">{stack.project_name}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(stack.type)}`}>
                                            {stack.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getStatusIcon(stack.status)}
                                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stack.status)}`}>
                                                {stack.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <Container className="w-4 h-4 mr-1" />
                                            {stack.running_containers}/{stack.total_containers}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(stack.updated).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => executeStackAction(stack.id, 'start')}
                                                className="text-green-600 hover:text-green-900"
                                                title="Démarrer"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => executeStackAction(stack.id, 'stop')}
                                                className="text-red-600 hover:text-red-900"
                                                title="Arrêter"
                                            >
                                                <Square className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => executeStackAction(stack.id, 'restart')}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Redémarrer"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-gray-600 hover:text-gray-900"
                                                title="Voir détails"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStacks.length === 0 && (
                    <div className="text-center py-12">
                        <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune stack trouvée</h3>
                        <p className="text-gray-500">
                            {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                                ? 'Aucune stack ne correspond aux critères de recherche.'
                                : 'Aucune stack détectée. Démarrez des containers avec des labels appropriés.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
