/**
 * Widget draggable pour le système de tableau de bord personnalisable - WakeDock
 */

import React, { useState, useCallback } from 'react';
import { 
  Settings, 
  Trash2, 
  Move, 
  Maximize2, 
  Minimize2,
  MoreVertical,
  RefreshCw
} from 'lucide-react';

interface Widget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  data?: any;
}

interface GridConfig {
  columns: number;
  rows: number;
  gap: number;
  padding: number;
  responsive: boolean;
}

interface DraggableWidgetProps {
  widget: Widget;
  gridConfig: GridConfig;
  cellDimensions: { width: number; height: number };
  isEditMode: boolean;
  onDelete: (widgetId: string) => void;
  onConfigure?: (widgetId: string) => void;
  readOnly?: boolean;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  gridConfig,
  cellDimensions,
  isEditMode,
  onDelete,
  onConfigure,
  readOnly = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calcul des dimensions et position
  const pixelPosition = {
    x: widget.position.x * (cellDimensions.width + gridConfig.gap),
    y: widget.position.y * (cellDimensions.height + gridConfig.gap)
  };

  const pixelSize = {
    width: (widget.size.width * cellDimensions.width) + ((widget.size.width - 1) * gridConfig.gap),
    height: (widget.size.height * cellDimensions.height) + ((widget.size.height - 1) * gridConfig.gap)
  };

  const style = {
    position: 'absolute' as const,
    left: pixelPosition.x,
    top: pixelPosition.y,
    width: pixelSize.width,
    height: pixelSize.height
  };

  // Gestionnaire de rafraîchissement
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulation de rafraîchissement
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  // Gestionnaire de suppression
  const handleDelete = useCallback(() => {
    if (window.confirm(`Supprimer le widget "${widget.title}" ?`)) {
      onDelete(widget.id);
    }
  }, [widget.id, widget.title, onDelete]);

  // Rendu du contenu du widget basé sur son type
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'system_metrics':
        return (
          <div className="p-2">
            <div className="text-sm font-medium mb-2">Métriques Système</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>CPU:</span>
                <span className="text-blue-600">45%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>RAM:</span>
                <span className="text-green-600">67%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Disque:</span>
                <span className="text-orange-600">23%</span>
              </div>
            </div>
          </div>
        );
      case 'container_list':
        return (
          <div className="p-2">
            <div className="text-sm font-medium mb-2">Containers</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>nginx</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>postgres</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>redis</span>
              </div>
            </div>
          </div>
        );
      case 'alerts_panel':
        return (
          <div className="p-2">
            <div className="text-sm font-medium mb-2">Alertes</div>
            <div className="space-y-1">
              <div className="text-xs text-red-600">CPU élevé: 85%</div>
              <div className="text-xs text-yellow-600">Disque: 78%</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm">{widget.type}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={style}
      className="widget-container group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      {/* Conteneur principal du widget */}
      <div className={`
        h-full rounded-lg border transition-all duration-200
        ${isEditMode 
          ? 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500' 
          : 'border-gray-200 dark:border-gray-700'
        }
        shadow-sm bg-white dark:bg-gray-800
      `}>
        
        {/* En-tête du widget */}
        <div className={`
          widget-header flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700
          ${isEditMode ? 'cursor-move' : ''}
        `}>
          {/* Titre et handle de drag */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {isEditMode && (
              <Move 
                size={14} 
                className="text-gray-400 flex-shrink-0" 
              />
            )}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {widget.title}
            </h3>
          </div>

          {/* Actions du widget */}
          <div className={`
            flex items-center space-x-1 transition-opacity duration-200
            ${isEditMode && (isHovered || showMenu) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}>
            {/* Bouton rafraîchir */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw 
                size={14} 
                className={isRefreshing ? 'animate-spin' : ''} 
              />
            </button>

            {/* Menu d'actions (en mode édition) */}
            {isEditMode && !readOnly && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Actions"
                >
                  <MoreVertical size={14} />
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                    {onConfigure && (
                      <button
                        onClick={() => {
                          onConfigure(widget.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                      >
                        <Settings size={12} />
                        <span>Configurer</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <Trash2 size={12} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contenu du widget */}
        <div className="widget-content h-[calc(100%-3.5rem)] p-3 overflow-hidden">
          {renderWidgetContent()}
        </div>

        {/* Overlay de sélection en mode édition */}
        {isEditMode && isHovered && (
          <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none">
            <div className="absolute -top-6 left-0 bg-blue-400 text-white text-xs px-2 py-1 rounded">
              {widget.size.width}×{widget.size.height}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
