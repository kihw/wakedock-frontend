/**
 * Hook pour l'API de gestion des tableaux de bord personnalisables - WakeDock
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

interface WidgetType {
  name: string;
  description: string;
  category: string;
  size: { width: number; height: number };
  configurable: string[];
  data_sources: string[];
}

interface Widget {
  id: number;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
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
  created_at: string;
  updated_at: string;
}

interface CreateLayoutRequest {
  name: string;
  description?: string;
  grid_config?: any;
  is_default?: boolean;
}

interface UpdateLayoutRequest {
  name?: string;
  description?: string;
  grid_config?: any;
  is_default?: boolean;
}

interface CreateWidgetRequest {
  widget_type: string;
  title?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config?: Record<string, any>;
}

interface UpdateWidgetRequest {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  config?: Record<string, any>;
  title?: string;
}

export const useDashboardApi = () => {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<Record<string, WidgetType>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les layouts utilisateur
  const loadLayouts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/dashboard/layouts');
      setLayouts(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des layouts');
      console.error('Erreur loadLayouts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les types de widgets disponibles
  const loadAvailableWidgets = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/widgets/types');
      setAvailableWidgets(response.data);
    } catch (err) {
      console.error('Erreur loadAvailableWidgets:', err);
    }
  }, []);

  // Créer un nouveau layout
  const createLayout = useCallback(async (request: CreateLayoutRequest): Promise<DashboardLayout | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/dashboard/layouts', request);
      const newLayout = response.data;
      setLayouts(prev => [newLayout, ...prev]);
      return newLayout;
    } catch (err) {
      setError('Erreur lors de la création du layout');
      console.error('Erreur createLayout:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mettre à jour un layout
  const updateLayout = useCallback(async (layoutId: number, request: UpdateLayoutRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.put(`/dashboard/layouts/${layoutId}`, request);
      
      // Recharger les layouts pour obtenir les données mises à jour
      await loadLayouts();
      return true;
    } catch (err) {
      setError('Erreur lors de la mise à jour du layout');
      console.error('Erreur updateLayout:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadLayouts]);

  // Supprimer un layout
  const deleteLayout = useCallback(async (layoutId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/dashboard/layouts/${layoutId}`);
      setLayouts(prev => prev.filter(layout => layout.id !== layoutId));
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression du layout');
      console.error('Erreur deleteLayout:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Dupliquer un layout
  const duplicateLayout = useCallback(async (layoutId: number, newName: string): Promise<DashboardLayout | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(`/dashboard/layouts/${layoutId}/duplicate?new_name=${encodeURIComponent(newName)}`);
      const duplicatedLayout = response.data;
      setLayouts(prev => [duplicatedLayout, ...prev]);
      return duplicatedLayout;
    } catch (err) {
      setError('Erreur lors de la duplication du layout');
      console.error('Erreur duplicateLayout:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Partager/départager un layout
  const shareLayout = useCallback(async (layoutId: number, isShared: boolean): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post(`/dashboard/layouts/${layoutId}/share?is_shared=${isShared}`);
      
      // Mettre à jour le layout dans l'état local
      setLayouts(prev => prev.map(layout => 
        layout.id === layoutId 
          ? { ...layout, is_shared: isShared }
          : layout
      ));
      return true;
    } catch (err) {
      setError('Erreur lors du partage du layout');
      console.error('Erreur shareLayout:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ajouter un widget à un layout
  const addWidget = useCallback(async (layoutId: number, request: CreateWidgetRequest): Promise<Widget | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(`/dashboard/layouts/${layoutId}/widgets`, request);
      const newWidget = response.data;
      
      // Mettre à jour le layout dans l'état local
      setLayouts(prev => prev.map(layout => 
        layout.id === layoutId 
          ? { ...layout, widgets: [...layout.widgets, newWidget] }
          : layout
      ));
      
      return newWidget;
    } catch (err) {
      setError('Erreur lors de l\'ajout du widget');
      console.error('Erreur addWidget:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mettre à jour un widget
  const updateWidget = useCallback(async (widgetId: number, request: UpdateWidgetRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.put(`/dashboard/widgets/${widgetId}`, request);
      
      // Mettre à jour le widget dans l'état local
      setLayouts(prev => prev.map(layout => ({
        ...layout,
        widgets: layout.widgets.map(widget => 
          widget.id === widgetId 
            ? { ...widget, ...request }
            : widget
        )
      })));
      
      return true;
    } catch (err) {
      setError('Erreur lors de la mise à jour du widget');
      console.error('Erreur updateWidget:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Supprimer un widget
  const deleteWidget = useCallback(async (widgetId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/dashboard/widgets/${widgetId}`);
      
      // Retirer le widget de l'état local
      setLayouts(prev => prev.map(layout => ({
        ...layout,
        widgets: layout.widgets.filter(widget => widget.id !== widgetId)
      })));
      
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression du widget');
      console.error('Erreur deleteWidget:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtenir les données d'un widget
  const getWidgetData = useCallback(async (widgetId: number): Promise<any> => {
    try {
      const response = await api.get(`/dashboard/widgets/${widgetId}/data`);
      return response.data;
    } catch (err) {
      console.error('Erreur getWidgetData:', err);
      return null;
    }
  }, []);

  // Obtenir les templates disponibles
  const getTemplates = useCallback(async (category?: string): Promise<any[]> => {
    try {
      const params = category ? `?category=${category}` : '';
      const response = await api.get(`/dashboard/templates${params}`);
      return response.data;
    } catch (err) {
      console.error('Erreur getTemplates:', err);
      return [];
    }
  }, []);

  // Appliquer un template
  const applyTemplate = useCallback(async (templateId: number, layoutName: string): Promise<DashboardLayout | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(`/dashboard/templates/${templateId}/apply?layout_name=${encodeURIComponent(layoutName)}`);
      const newLayout = response.data;
      setLayouts(prev => [newLayout, ...prev]);
      return newLayout;
    } catch (err) {
      setError('Erreur lors de l\'application du template');
      console.error('Erreur applyTemplate:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les données initiales
  useEffect(() => {
    loadLayouts();
    loadAvailableWidgets();
  }, [loadLayouts, loadAvailableWidgets]);

  return {
    // État
    layouts,
    availableWidgets,
    isLoading,
    error,

    // Actions layouts
    loadLayouts,
    createLayout,
    updateLayout,
    deleteLayout,
    duplicateLayout,
    shareLayout,

    // Actions widgets
    addWidget,
    updateWidget,
    deleteWidget,
    getWidgetData,

    // Templates
    getTemplates,
    applyTemplate,

    // Utilitaires
    loadAvailableWidgets
  };
};
