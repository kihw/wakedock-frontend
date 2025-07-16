/**
 * Palette de widgets pour le tableau de bord personnalisable - WakeDock
 */

import React, { useState } from 'react';
import { X, Search, Grid, Monitor, AlertTriangle, Activity, Zap, FileText, BarChart } from 'lucide-react';

interface WidgetType {
  name: string;
  description: string;
  category: string;
  size: { width: number; height: number };
  configurable: string[];
  data_sources: string[];
}

interface WidgetPaletteProps {
  availableWidgets: Record<string, WidgetType>;
  onAddWidget: (widgetType: string) => void;
  onClose: () => void;
}

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({
  availableWidgets,
  onAddWidget,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Icônes pour les types de widgets
  const widgetIcons: Record<string, React.ReactNode> = {
    'system_metrics': <Monitor size={24} />,
    'container_list': <Grid size={24} />,
    'alerts_panel': <AlertTriangle size={24} />,
    'network_traffic': <Activity size={24} />,
    'quick_actions': <Zap size={24} />,
    'logs_viewer': <FileText size={24} />,
    'custom_metric': <BarChart size={24} />
  };

  // Couleurs pour les catégories
  const categoryColors: Record<string, string> = {
    'monitoring': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'containers': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'controls': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'custom': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  };

  // Filtrer les widgets
  const filteredWidgets = Object.entries(availableWidgets).filter(([type, widget]) => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtenir les catégories disponibles
  const categories = Array.from(new Set(Object.values(availableWidgets).map(w => w.category)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Palette de Widgets
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Glissez-déposez ou cliquez pour ajouter un widget à votre dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un widget..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtres par catégorie */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Tous
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grille des widgets */}
        <div className="p-6 overflow-y-auto max-h-96">
          {filteredWidgets.length === 0 ? (
            <div className="text-center py-12">
              <Grid size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucun widget trouvé pour votre recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWidgets.map(([type, widget]) => (
                <div
                  key={type}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
                  onClick={() => onAddWidget(type)}
                >
                  {/* Icône et titre */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900 dark:group-hover:text-blue-300 transition-colors">
                      {widgetIcons[type] || <Grid size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {widget.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {widget.description}
                      </p>
                    </div>
                  </div>

                  {/* Informations du widget */}
                  <div className="space-y-2">
                    {/* Catégorie */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        categoryColors[widget.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {widget.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {widget.size.width}×{widget.size.height}
                      </span>
                    </div>

                    {/* Sources de données */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Sources:</span> {widget.data_sources.join(', ')}
                    </div>

                    {/* Options configurables */}
                    {widget.configurable.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Configurable:</span> {widget.configurable.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Bouton d'ajout */}
                  <button className="w-full mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                    Ajouter au dashboard
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Tip: Vous pouvez réorganiser les widgets après les avoir ajoutés
          </p>
        </div>
      </div>
    </div>
  );
};
