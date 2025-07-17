/**
 * Gestionnaire de layouts pour le tableau de bord personnalisable - WakeDock
 */

import React, { useState } from 'react';
import {
    X,
    Plus,
    Edit3,
    Trash2,
    Copy,
    Share,
    Star,
    Calendar,
    User,
    Layout as LayoutIcon
} from 'lucide-react';

interface DashboardLayout {
    id: number;
    name: string;
    description?: string;
    is_default: boolean;
    is_shared: boolean;
    grid_config: {
        columns: number;
        rows: number;
        gap: number;
        padding: number;
        responsive: boolean;
    };
    widgets: any[];
    created_at: string;
    updated_at: string;
}

interface LayoutManagerProps {
    layouts: DashboardLayout[];
    currentLayout: DashboardLayout | null;
    onLayoutSelect: (layout: DashboardLayout) => void;
    onClose: () => void;
    onCreateLayout?: (name: string, description?: string) => void;
    onDeleteLayout?: (layoutId: number) => void;
    onDuplicateLayout?: (layoutId: number, newName: string) => void;
    onShareLayout?: (layoutId: number, isShared: boolean) => void;
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({
    layouts,
    currentLayout,
    onLayoutSelect,
    onClose,
    onCreateLayout,
    onDeleteLayout,
    onDuplicateLayout,
    onShareLayout
}) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newLayoutName, setNewLayoutName] = useState('');
    const [newLayoutDescription, setNewLayoutDescription] = useState('');

    // Gestionnaire de création de layout
    const handleCreateLayout = () => {
        if (newLayoutName.trim() && onCreateLayout) {
            onCreateLayout(newLayoutName.trim(), newLayoutDescription.trim() || undefined);
            setNewLayoutName('');
            setNewLayoutDescription('');
            setShowCreateForm(false);
        }
    };

    // Gestionnaire de duplication
    const handleDuplicate = (layout: DashboardLayout) => {
        const newName = `${layout.name} (Copie)`;
        if (onDuplicateLayout) {
            onDuplicateLayout(layout.id, newName);
        }
    };

    // Gestionnaire de suppression
    const handleDelete = (layout: DashboardLayout) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le layout "${layout.name}" ?`)) {
            if (onDeleteLayout) {
                onDeleteLayout(layout.id);
            }
        }
    };

    // Formater la date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                {/* En-tête */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Gestionnaire de Layouts
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Gérez vos configurations de tableau de bord
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Actions */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        <Plus size={16} />
                        <span>Nouveau Layout</span>
                    </button>
                </div>

                {/* Formulaire de création */}
                {showCreateForm && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nom du layout
                                </label>
                                <input
                                    type="text"
                                    value={newLayoutName}
                                    onChange={(e) => setNewLayoutName(e.target.value)}
                                    placeholder="Mon nouveau dashboard"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={newLayoutDescription}
                                    onChange={(e) => setNewLayoutDescription(e.target.value)}
                                    placeholder="Description du dashboard"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCreateLayout}
                                    disabled={!newLayoutName.trim()}
                                    className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Créer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewLayoutName('');
                                        setNewLayoutDescription('');
                                    }}
                                    className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Liste des layouts */}
                <div className="p-6 overflow-y-auto max-h-96">
                    {layouts.length === 0 ? (
                        <div className="text-center py-12">
                            <LayoutIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                Aucun layout créé pour le moment
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {layouts.map((layout) => (
                                <div
                                    key={layout.id}
                                    className={`border rounded-lg p-4 transition-all cursor-pointer ${currentLayout?.id === layout.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    onClick={() => onLayoutSelect(layout)}
                                >
                                    <div className="flex items-start justify-between">
                                        {/* Informations du layout */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {layout.name}
                                                </h3>
                                                {layout.is_default && (
                                                    <Star size={14} className="text-yellow-500" />
                                                )}
                                                {layout.is_shared && (
                                                    <Share size={14} className="text-green-500" />
                                                )}
                                            </div>

                                            {layout.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    {layout.description}
                                                </p>
                                            )}

                                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center space-x-1">
                                                    <LayoutIcon size={12} />
                                                    <span>{layout.grid_config.columns}×{layout.grid_config.rows}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <span>📊</span>
                                                    <span>{layout.widgets.length} widgets</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(layout.updated_at)}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-1 ml-4">
                                            {onDuplicateLayout && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDuplicate(layout);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                    title="Dupliquer"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            )}

                                            {onShareLayout && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onShareLayout(layout.id, !layout.is_shared);
                                                    }}
                                                    className={`p-1 transition-colors ${layout.is_shared
                                                            ? 'text-green-500 hover:text-green-600'
                                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                                        }`}
                                                    title={layout.is_shared ? 'Arrêter le partage' : 'Partager'}
                                                >
                                                    <Share size={14} />
                                                </button>
                                            )}

                                            {onDeleteLayout && !layout.is_default && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(layout);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pied de page */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Cliquez sur un layout pour l'activer
                    </p>
                </div>
            </div>
        </div>
    );
};
