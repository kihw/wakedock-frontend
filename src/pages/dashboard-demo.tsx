/**
 * Page de démonstration du tableau de bord personnalisable - WakeDock
 */

import React, { useState, useEffect } from 'react';
import { CustomizableDashboard } from '../lib/components/CustomizableDashboard';
import { Layout, ArrowLeft, Settings } from 'lucide-react';

// Interface pour les layouts de démonstration
interface DemoLayout {
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
  widgets: Array<{
    id: string;
    type: string;
    title: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    config: Record<string, any>;
  }>;
  created_at: string;
  updated_at: string;
}

// Données de démonstration
const demoLayouts: DemoLayout[] = [
  {
    id: 1,
    name: "Dashboard Principal",
    description: "Vue d'ensemble du système",
    is_default: true,
    is_shared: false,
    grid_config: {
      columns: 12,
      rows: 8,
      gap: 16,
      padding: 24,
      responsive: true
    },
    widgets: [
      {
        id: "1",
        type: "system_metrics",
        title: "Métriques Système",
        position: { x: 0, y: 0 },
        size: { width: 6, height: 3 },
        config: { refresh_interval: 5, chart_type: "line" }
      },
      {
        id: "2",
        type: "container_list",
        title: "Containers Docker",
        position: { x: 6, y: 0 },
        size: { width: 6, height: 3 },
        config: { status_filter: "all", max_items: 10 }
      },
      {
        id: "3",
        type: "alerts_panel",
        title: "Alertes Système",
        position: { x: 0, y: 3 },
        size: { width: 4, height: 2 },
        config: { severity_filter: "warning" }
      },
      {
        id: "4",
        type: "network_traffic",
        title: "Trafic Réseau",
        position: { x: 4, y: 3 },
        size: { width: 4, height: 2 },
        config: { time_range: "1h", chart_type: "area" }
      },
      {
        id: "5",
        type: "quick_actions",
        title: "Actions Rapides",
        position: { x: 8, y: 3 },
        size: { width: 4, height: 2 },
        config: { button_actions: ["restart", "backup", "update"] }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Monitoring Avancé",
    description: "Dashboard pour le monitoring détaillé",
    is_default: false,
    is_shared: true,
    grid_config: {
      columns: 12,
      rows: 10,
      gap: 12,
      padding: 20,
      responsive: true
    },
    widgets: [
      {
        id: "6",
        type: "custom_metric",
        title: "CPU Usage",
        position: { x: 0, y: 0 },
        size: { width: 3, height: 2 },
        config: { metric_type: "cpu", threshold: 80 }
      },
      {
        id: "7",
        type: "custom_metric",
        title: "Memory Usage",
        position: { x: 3, y: 0 },
        size: { width: 3, height: 2 },
        config: { metric_type: "memory", threshold: 85 }
      },
      {
        id: "8",
        type: "logs_viewer",
        title: "Logs Récents",
        position: { x: 0, y: 2 },
        size: { width: 12, height: 4 },
        config: { log_level: "error", max_lines: 50 }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DashboardDemoPage: React.FC = () => {
  const [currentLayout, setCurrentLayout] = useState<DemoLayout | null>(demoLayouts[0] || null);
  const [showSettings, setShowSettings] = useState(false);

  // Gestionnaire de changement de layout
  const handleLayoutChange = (layout: any) => {
    console.log('Layout changed:', layout);
    // Ici on pourrait sauvegarder les changements
  };

  // Gestionnaire de sélection de layout
  const handleLayoutSelect = (layout: DemoLayout) => {
    setCurrentLayout(layout);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de la page */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Retour"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Dashboard Personnalisable
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Démonstration du système de tableaux de bord WakeDock
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Sélecteur de layout */}
              <select
                value={currentLayout?.id || ''}
                onChange={(e) => {
                  const layoutId = parseInt(e.target.value);
                  const layout = demoLayouts.find(l => l.id === layoutId);
                  if (layout) {
                    setCurrentLayout(layout);
                  }
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {demoLayouts.map(layout => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Paramètres"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau de paramètres */}
      {showSettings && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Layout Actuel
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  {currentLayout?.name} - {currentLayout?.widgets.length} widgets
                </p>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Configuration Grille
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  {currentLayout?.grid_config.columns}×{currentLayout?.grid_config.rows} 
                  {currentLayout?.grid_config.responsive && ' (Responsive)'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Statut
                </h3>
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  {currentLayout?.is_default && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs">
                      Défaut
                    </span>
                  )}
                  {currentLayout?.is_shared && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                      Partagé
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard personnalisable */}
      <div className="flex-1">
        {currentLayout && (
          <CustomizableDashboard
            initialLayout={currentLayout}
            onLayoutChange={handleLayoutChange}
            readOnly={false}
            className="h-full"
          />
        )}
      </div>

      {/* Informations de démonstration */}
      <div className="fixed bottom-4 right-4 max-w-sm">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div className="flex items-start space-x-2">
            <Layout size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <p className="font-medium mb-1">Démonstration v0.5.3</p>
              <p>
                Dashboard personnalisable avec widgets drag & drop, 
                gestion des layouts et persistance des configurations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemoPage;
