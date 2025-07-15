/**
 * Containers API Service
 * Service pour la gestion des containers Docker
 */

import { BaseApiClient } from './base-client';
import type { 
  Container, 
  ContainerCreate, 
  ContainerUpdate,
  ContainerStats,
  DockerImage,
  ImagePull,
  ContainerAction 
} from '../types/containers';

export class ContainersApi extends BaseApiClient {

  /**
   * Récupérer la liste des containers
   */
  async listContainers(all: boolean = false): Promise<Container[]> {
    const query = all ? '?all=true' : '';
    return this.request<Container[]>(`/containers${query}`);
  }

  /**
   * Récupérer un container spécifique
   */
  async getContainer(containerId: string): Promise<Container> {
    return this.request<Container>(`/containers/${containerId}`);
  }

  /**
   * Créer un nouveau container
   */
  async createContainer(containerData: ContainerCreate): Promise<Container> {
    return this.request<Container>(`/containers`, {
      method: 'POST',
      body: JSON.stringify(containerData)
    });
  }

  /**
   * Mettre à jour un container
   */
  async updateContainer(containerId: string, updates: ContainerUpdate): Promise<Container> {
    return this.request<Container>(`/containers/${containerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Supprimer un container
   */
  async deleteContainer(containerId: string, force: boolean = false): Promise<void> {
    const query = force ? '?force=true' : '';
    return this.request<void>(`/containers/${containerId}${query}`, {
      method: 'DELETE'
    });
  }

  /**
   * Démarrer un container
   */
  async startContainer(containerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/containers/${containerId}/start`, {
      method: 'POST'
    });
  }

  /**
   * Arrêter un container
   */
  async stopContainer(containerId: string, timeout: number = 10): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/containers/${containerId}/stop`, {
      method: 'POST',
      body: JSON.stringify({ timeout })
    });
  }

  /**
   * Redémarrer un container
   */
  async restartContainer(containerId: string, timeout: number = 10): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/containers/${containerId}/restart`, {
      method: 'POST',
      body: JSON.stringify({ timeout })
    });
  }

  /**
   * Récupérer les logs d'un container
   */
  async getContainerLogs(containerId: string, tail: number = 100, follow: boolean = false): Promise<{ logs: string }> {
    const query = `?tail=${tail}&follow=${follow}`;
    return this.request<{ logs: string }>(`/containers/${containerId}/logs${query}`);
  }

  /**
   * Récupérer les statistiques d'un container
   */
  async getContainerStats(containerId: string): Promise<{ stats: ContainerStats }> {
    return this.request<{ stats: ContainerStats }>(`/containers/${containerId}/stats`);
  }

  /**
   * Télécharger les logs d'un container
   */
  async downloadContainerLogs(containerId: string, tail: number = 1000): Promise<Blob> {
    const query = `?tail=${tail}`;
    const response = await window.fetch(`${this.baseUrl}/containers/${containerId}/logs/download${query}`, {
      method: 'GET',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : ''
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download logs');
    }
    
    return response.blob();
  }

  /**
   * Vider les logs d'un container
   */
  async clearContainerLogs(containerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/containers/${containerId}/logs/clear`, {
      method: 'POST'
    });
  }

  /**
   * Récupérer la liste des images Docker
   */
  async listImages(all: boolean = false): Promise<DockerImage[]> {
    const query = all ? '?all=true' : '';
    return this.request<DockerImage[]>(`/images${query}`);
  }

  /**
   * Récupérer une image spécifique
   */
  async getImage(imageId: string): Promise<DockerImage> {
    return this.request<DockerImage>(`/images/${imageId}`);
  }

  /**
   * Télécharger une image Docker
   */
  async pullImage(imageData: ImagePull): Promise<DockerImage> {
    return this.request<DockerImage>(`/images/pull`, {
      method: 'POST',
      body: JSON.stringify(imageData)
    });
  }

  /**
   * Supprimer une image Docker
   */
  async deleteImage(imageId: string, force: boolean = false): Promise<void> {
    const query = force ? '?force=true' : '';
    return this.request<void>(`/images/${imageId}${query}`, {
      method: 'DELETE'
    });
  }

  /**
   * Rechercher des images sur Docker Hub
   */
  async searchImages(term: string, limit: number = 25): Promise<{ results: any[] }> {
    const query = `?limit=${limit}`;
    return this.request<{ results: any[] }>(`/images/search/${term}${query}`);
  }

  /**
   * Récupérer l'historique d'une image
   */
  async getImageHistory(imageId: string): Promise<{ history: any[] }> {
    return this.request<{ history: any[] }>(`/images/${imageId}/history`);
  }

  /**
   * Créer une connexion WebSocket pour les logs en temps réel
   */
  createLogStream(containerId: string, tail: number = 100): WebSocket {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${this.baseUrl}/containers/${containerId}/logs/stream?tail=${tail}`;
    return new WebSocket(wsUrl);
  }
}
