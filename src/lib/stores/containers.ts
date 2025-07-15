/**
 * Store Svelte pour la gestion des containers
 */
import { writable, derived, get } from 'svelte/store';
import { api } from '../api';
import type { Container, ContainerCreate, DockerImage } from '../types/containers';

// État des containers
export const containers = writable<Container[]>([]);
export const selectedContainer = writable<Container | null>(null);
export const containerLogs = writable<string>('');
export const isLoadingContainers = writable<boolean>(false);
export const containerError = writable<string | null>(null);

// État des images
export const images = writable<DockerImage[]>([]);
export const isLoadingImages = writable<boolean>(false);
export const imageError = writable<string | null>(null);

// Filtres et recherche
export const containerFilter = writable<string>('all'); // 'all', 'running', 'stopped'
export const searchQuery = writable<string>('');

// Derived stores
export const filteredContainers = derived(
  [containers, containerFilter, searchQuery],
  ([allContainers, filter, query]) => {
    let filtered = allContainers;

    // Filtrer par statut
    if (filter !== 'all') {
      filtered = filtered.filter(container => {
        if (filter === 'running') return container.status === 'running';
        if (filter === 'stopped') return container.status !== 'running';
        return true;
      });
    }

    // Filtrer par recherche
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(container =>
        container.name.toLowerCase().includes(lowercaseQuery) ||
        container.image.toLowerCase().includes(lowercaseQuery) ||
        container.id.toLowerCase().includes(lowercaseQuery)
      );
    }

    return filtered;
  }
);

export const runningContainers = derived(
  containers,
  $containers => $containers.filter(c => c.status === 'running')
);

export const stoppedContainers = derived(
  containers,
  $containers => $containers.filter(c => c.status !== 'running')
);

// Actions pour les containers
export const containerActions = {
  /**
   * Charger la liste des containers
   */
  async loadContainers(includeAll: boolean = true) {
    isLoadingContainers.set(true);
    containerError.set(null);

    try {
      const containerList = await api.containers.listContainers(includeAll);
      containers.set(containerList);
    } catch (error) {
      console.error('Erreur lors du chargement des containers:', error);
      containerError.set(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      isLoadingContainers.set(false);
    }
  },

  /**
   * Créer un nouveau container
   */
  async createContainer(containerData: ContainerCreate): Promise<Container | null> {
    try {
      const newContainer = await api.containers.createContainer(containerData);
      
      // Mettre à jour la liste des containers
      containers.update(list => [...list, newContainer]);
      
      return newContainer;
    } catch (error) {
      console.error('Erreur lors de la création du container:', error);
      containerError.set(error instanceof Error ? error.message : 'Erreur lors de la création');
      return null;
    }
  },

  /**
   * Démarrer un container
   */
  async startContainer(containerId: string): Promise<boolean> {
    try {
      await api.containers.startContainer(containerId);
      
      // Mettre à jour le container dans la liste
      containers.update(list => 
        list.map(container => 
          container.id === containerId 
            ? { ...container, status: 'running', state: 'running' }
            : container
        )
      );
      
      return true;
    } catch (error) {
      console.error('Erreur lors du démarrage du container:', error);
      containerError.set(error instanceof Error ? error.message : 'Erreur lors du démarrage');
      return false;
    }
  },

  /**
   * Arrêter un container
   */
  async stopContainer(containerId: string): Promise<boolean> {
    try {
      await api.containers.stopContainer(containerId);
      
      // Mettre à jour le container dans la liste
      containers.update(list => 
        list.map(container => 
          container.id === containerId 
            ? { ...container, status: 'exited', state: 'exited' }
            : container
        )
      );
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du container:', error);
      containerError.set(error instanceof Error ? error.message : 'Erreur lors de l\'arrêt');
      return false;
    }
  },

  /**
   * Redémarrer un container
   */
  async restartContainer(containerId: string): Promise<boolean> {
    try {
      await api.containers.restartContainer(containerId);
      
      // Mettre à jour le container dans la liste
      containers.update(list => 
        list.map(container => 
          container.id === containerId 
            ? { ...container, status: 'running', state: 'running' }
            : container
        )
      );
      
      return true;
    } catch (error) {
      console.error('Erreur lors du redémarrage du container:', error);
      containerError.set(error instanceof Error ? error.message : 'Erreur lors du redémarrage');
      return false;
    }
  },

  /**
   * Supprimer un container
   */
  async deleteContainer(containerId: string, force: boolean = false): Promise<boolean> {
    try {
      await api.containers.deleteContainer(containerId, force);
      
      // Retirer le container de la liste
      containers.update(list => list.filter(container => container.id !== containerId));
      
      // Désélectionner si c'était le container sélectionné
      const current = get(selectedContainer);
      if (current && current.id === containerId) {
        selectedContainer.set(null);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du container:', error);
      containerError.set(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      return false;
    }
  },

  /**
   * Sélectionner un container
   */
  selectContainer(container: Container | null) {
    selectedContainer.set(container);
  },

  /**
   * Charger les logs d'un container
   */
  async loadContainerLogs(containerId: string, tail: number = 100) {
    try {
      const response = await api.containers.getContainerLogs(containerId, tail);
      containerLogs.set(response.logs);
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
      containerError.set(error instanceof Error ? error.message : 'Erreur lors du chargement des logs');
    }
  },

  /**
   * Vider les erreurs
   */
  clearError() {
    containerError.set(null);
  }
};

// Actions pour les images
export const imageActions = {
  /**
   * Charger la liste des images
   */
  async loadImages() {
    isLoadingImages.set(true);
    imageError.set(null);

    try {
      const imageList = await api.containers.listImages();
      images.set(imageList);
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      imageError.set(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      isLoadingImages.set(false);
    }
  },

  /**
   * Télécharger une image
   */
  async pullImage(imageName: string, tag: string = 'latest'): Promise<boolean> {
    try {
      const newImage = await api.containers.pullImage({ image: imageName, tag });
      
      // Ajouter l'image à la liste
      images.update(list => [...list, newImage]);
      
      return true;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      imageError.set(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
      return false;
    }
  },

  /**
   * Supprimer une image
   */
  async deleteImage(imageId: string, force: boolean = false): Promise<boolean> {
    try {
      await api.containers.deleteImage(imageId, force);
      
      // Retirer l'image de la liste
      images.update(list => list.filter(image => image.id !== imageId));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      imageError.set(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      return false;
    }
  },

  /**
   * Vider les erreurs
   */
  clearError() {
    imageError.set(null);
  }
};
