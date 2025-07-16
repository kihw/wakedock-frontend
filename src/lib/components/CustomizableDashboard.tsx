/**
 * Système de grille drag & drop pour tableaux de bord personnalisables - WakeDock
 * Composant principal de gestion des layouts avec widgets déplaçables
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Grid, 
  Plus, 
  Settings, 
  Save, 
  Layout,
  Share,
  Copy,
  Trash2,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';

import { DraggableWidget } from './DraggableWidget';
import { WidgetPalette } from './WidgetPalette';
import { GridBackground } from './GridBackground';
import { LayoutManager } from './LayoutManager';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { useBreakpoint } from '../utils/responsive';

// Toast notification simple
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message)
};

interface GridPosition {
  x: number;
  y: number;
}

interface WidgetSize {
  width: number;
  height: number;
}

interface Widget {
  id: string;
  type: string;
  title: string;
  position: GridPosition;
  size: WidgetSize;
  config: Record<string, any>;
  data?: any;
}

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
  widgets: Widget[];
}

interface CustomizableDashboardProps {
  initialLayout?: DashboardLayout;
  onLayoutChange?: (layout: DashboardLayout) => void;
  readOnly?: boolean;
  className?: string;
}

export const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  initialLayout,
  onLayoutChange,
  readOnly = false,
  className = ''
}) => {
  // État principal
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(initialLayout || null);
  const [widgets, setWidgets] = useState<Widget[]>(initialLayout?.widgets || []);
  const [activeWidget, setActiveWidget] = useState<Widget | null>(null);
  const [isEditMode, setIsEditMode] = useState(!readOnly);
  const [showGrid, setShowGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);

  // Hooks et refs
  const { current: breakpoint } = useBreakpoint();
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    layouts, 
    createLayout, 
    updateLayout, 
    deleteLayout,
    addWidget,
    updateWidget,
    deleteWidget,
    availableWidgets 
  } = useDashboardApi();

  // Configuration simplifiée sans drag & drop externe
  const sensors = null;

  // Configuration de la grille responsive
  const getGridConfig = useCallback(() => {
    if (!currentLayout) {
      return {
        columns: breakpoint === 'xs' || breakpoint === 'sm' ? 4 : breakpoint === 'md' ? 8 : 12,
        rows: 8,
        gap: 16,
        padding: 24,
        responsive: true
      };
    }
    
    const baseConfig = currentLayout.grid_config;
    if (baseConfig.responsive) {
      return {
        ...baseConfig,
        columns: breakpoint === 'xs' || breakpoint === 'sm' ? 
          Math.min(baseConfig.columns, 4) : 
          breakpoint === 'md' ? 
            Math.min(baseConfig.columns, 8) : 
            baseConfig.columns
      };
    }
    
    return baseConfig;
  }, [currentLayout, breakpoint]);

  const gridConfig = getGridConfig();

  // Calcul des dimensions des cellules
  const getCellDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 100, height: 100 };
    
    const containerWidth = containerRef.current.clientWidth - (gridConfig.padding * 2);
    const cellWidth = (containerWidth - (gridConfig.gap * (gridConfig.columns - 1))) / gridConfig.columns;
    const cellHeight = 80; // Hauteur fixe pour cohérence
    
    return { width: cellWidth, height: cellHeight };
  }, [gridConfig]);

  // Conversion position pixel vers grille
  const pixelToGrid = useCallback((x: number, y: number) => {
    const { width: cellWidth, height: cellHeight } = getCellDimensions();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return { x: 0, y: 0 };
    
    const relativeX = x - containerRect.left - gridConfig.padding;
    const relativeY = y - containerRect.top - gridConfig.padding;
    
    const gridX = Math.round(relativeX / (cellWidth + gridConfig.gap));
    const gridY = Math.round(relativeY / (cellHeight + gridConfig.gap));
    
    return {
      x: Math.max(0, Math.min(gridX, gridConfig.columns - 1)),
      y: Math.max(0, Math.min(gridY, gridConfig.rows - 1))
    };
  }, [gridConfig, getCellDimensions]);

  // Conversion position grille vers pixel
  const gridToPixel = useCallback((gridX: number, gridY: number) => {
    const { width: cellWidth, height: cellHeight } = getCellDimensions();
    
    return {
      x: gridX * (cellWidth + gridConfig.gap),
      y: gridY * (cellHeight + gridConfig.gap)
    };
  }, [gridConfig, getCellDimensions]);

  // Vérification des collisions
  const checkCollision = useCallback((
    widget: Widget, 
    newPosition: GridPosition, 
    excludeId?: string
  ): boolean => {
    const endX = newPosition.x + widget.size.width;
    const endY = newPosition.y + widget.size.height;
    
    // Vérifier les limites de la grille
    if (endX > gridConfig.columns || endY > gridConfig.rows) {
      return true;
    }
    
    // Vérifier les collisions avec autres widgets
    return widgets.some(w => {
      if (w.id === widget.id || w.id === excludeId) return false;
      
      const wEndX = w.position.x + w.size.width;
      const wEndY = w.position.y + w.size.height;
      
      return !(
        newPosition.x >= wEndX || 
        endX <= w.position.x ||
        newPosition.y >= wEndY || 
        endY <= w.position.y
      );
    });
  }, [widgets, gridConfig]);

  // Trouver une position libre
  const findFreePosition = useCallback((widget: Widget): GridPosition => {
    for (let y = 0; y <= gridConfig.rows - widget.size.height; y++) {
      for (let x = 0; x <= gridConfig.columns - widget.size.width; x++) {
        const position = { x, y };
        if (!checkCollision(widget, position)) {
          return position;
        }
      }
    }
    return { x: 0, y: 0 }; // Position par défaut si aucune position libre
  }, [gridConfig, checkCollision]);

  // Gestionnaires drag & drop (version simplifiée)
  const handleDragStart = useCallback((event: any) => {
    const widget = widgets.find(w => w.id === event.active.id);
    if (widget) {
      setActiveWidget(widget);
    }
  }, [widgets]);

  const handleDragEnd = useCallback(async (event: any) => {
    setActiveWidget(null);
    
    if (!event.over || !currentLayout) return;
    
    const widgetId = event.active.id as string;
    const widget = widgets.find(w => w.id === widgetId);
    
    if (!widget) return;
    
    // Pour l'instant, pas de drag & drop actuel
    console.log('Drag end:', event);
  }, [widgets, currentLayout, readOnly, onLayoutChange]);

  // Gestionnaire d'ajout de widget
  const handleAddWidget = useCallback(async (widgetType: string) => {
    if (!currentLayout || readOnly) return;
    
    const widgetTemplate = availableWidgets[widgetType];
    if (!widgetTemplate) {
      toast.error('Type de widget non disponible');
      return;
    }
    
    const newWidget: Widget = {
      id: `temp-${Date.now()}`,
      type: widgetType,
      title: widgetTemplate.name,
      position: { x: 0, y: 0 },
      size: widgetTemplate.size,
      config: {}
    };
    
    // Trouver une position libre
    const freePosition = findFreePosition(newWidget);
    newWidget.position = freePosition;
    
    try {
      setIsLoading(true);
      const createdWidget = await addWidget(currentLayout.id, {
        widget_type: widgetType,
        title: widgetTemplate.name,
        position: freePosition,
        size: widgetTemplate.size,
        config: {}
      });
      
      if (createdWidget) {
        const widgetWithId = { ...newWidget, id: createdWidget.id.toString() };
        setWidgets(prev => [...prev, widgetWithId]);
        toast.success('Widget ajouté avec succès');
        setShowPalette(false);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du widget');
      console.error('Erreur add widget:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLayout, readOnly, availableWidgets, findFreePosition, addWidget]);

  // Gestionnaire de suppression de widget
  const handleDeleteWidget = useCallback(async (widgetId: string) => {
    if (readOnly) return;
    
    try {
      await deleteWidget(parseInt(widgetId));
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
      toast.success('Widget supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Erreur delete widget:', error);
    }
  }, [readOnly, deleteWidget]);

  // Sauvegarde du layout
  const handleSaveLayout = useCallback(async () => {
    if (!currentLayout || readOnly) return;
    
    try {
      setIsLoading(true);
      await updateLayout(currentLayout.id, {
        name: currentLayout.name,
        description: currentLayout.description,
        grid_config: gridConfig
      });
      toast.success('Layout sauvegardé');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error('Erreur save layout:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLayout, readOnly, gridConfig, updateLayout]);

  // Rendu du composant
  return (
    <div className={`customizable-dashboard ${className}`}>
      {/* Barre d'outils */}
      <div className="dashboard-toolbar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentLayout?.name || 'Tableau de Bord'}
          </h2>
          
          {!readOnly && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-2 rounded-md transition-colors ${
                  isEditMode 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
                title={isEditMode ? 'Mode lecture' : 'Mode édition'}
              >
                {isEditMode ? <Eye size={16} /> : <Edit3 size={16} />}
              </button>
              
              {isEditMode && (
                <>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 rounded-md transition-colors ${
                      showGrid 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                    title="Afficher/masquer la grille"
                  >
                    <Grid size={16} />
                  </button>
                  
                  <button
                    onClick={() => setShowPalette(!showPalette)}
                    className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    title="Ajouter un widget"
                  >
                    <Plus size={16} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!readOnly && (
            <>
              <button
                onClick={() => setShowLayoutManager(true)}
                className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Gestionnaire de layouts"
              >
                <Layout size={16} />
              </button>
              
              <button
                onClick={handleSaveLayout}
                disabled={isLoading}
                className="p-2 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors disabled:opacity-50"
                title="Sauvegarder"
              >
                <Save size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Conteneur principal (version simplifiée sans DnD externe) */}
      <div className="dashboard-container relative overflow-auto">
        {/* Grille de fond */}
        {showGrid && isEditMode && (
          <GridBackground
            gridConfig={gridConfig}
            cellDimensions={getCellDimensions()}
          />
        )}

        {/* Conteneur des widgets */}
        <div
          ref={containerRef}
          className="widgets-container relative"
          style={{
            padding: `${gridConfig.padding}px`,
            minHeight: '100vh'
          }}
        >
          {widgets.map((widget) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              gridConfig={gridConfig}
              cellDimensions={getCellDimensions()}
              isEditMode={isEditMode}
              onDelete={handleDeleteWidget}
              readOnly={readOnly}
            />
          ))}
        </div>

        {/* Palette de widgets */}
        {showPalette && isEditMode && (
          <WidgetPalette
            availableWidgets={availableWidgets}
            onAddWidget={handleAddWidget}
            onClose={() => setShowPalette(false)}
          />
        )}

        {/* Gestionnaire de layouts */}
        {showLayoutManager && (
          <LayoutManager
            layouts={layouts}
            currentLayout={currentLayout}
            onLayoutSelect={setCurrentLayout}
            onClose={() => setShowLayoutManager(false)}
          />
        )}
      </div>
    </div>
  );
};
