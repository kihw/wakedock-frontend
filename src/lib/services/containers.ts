/**
 * Service API pour la gestion des containers Docker
 */
import { api } from '../api';
import type {
    Container,
    ContainerCreate,
    ContainerUpdate,
    ContainerStats,
    DockerImage,
    ImagePull,
    ContainerAction
} from '$lib/types/containers';

export class ContainerService {
    private baseUrl = '/api/v1';

    /**
     * Récupérer la liste des containers
     */
    async listContainers(all: boolean = false): Promise<Container[]> {
        const response = await api.get(`${this.baseUrl}/containers`, {
            params: { all }
        });
        return response.data;
    }

    /**
     * Récupérer un container spécifique
     */
    async getContainer(containerId: string): Promise<Container> {
        const response = await api.get(`${this.baseUrl}/containers/${containerId}`);
        return response.data;
    }

    /**
     * Créer un nouveau container
     */
    async createContainer(containerData: ContainerCreate): Promise<Container> {
        const response = await api.post(`${this.baseUrl}/containers`, containerData);
        return response.data;
    }

    /**
     * Mettre à jour un container
     */
    async updateContainer(containerId: string, updates: ContainerUpdate): Promise<Container> {
        const response = await api.put(`${this.baseUrl}/containers/${containerId}`, updates);
        return response.data;
    }

    /**
     * Supprimer un container
     */
    async deleteContainer(containerId: string, force: boolean = false): Promise<void> {
        await api.delete(`${this.baseUrl}/containers/${containerId}`, {
            params: { force }
        });
    }

    /**
     * Démarrer un container
     */
    async startContainer(containerId: string): Promise<{ message: string }> {
        const response = await api.post(`${this.baseUrl}/containers/${containerId}/start`);
        return response.data;
    }

    /**
     * Arrêter un container
     */
    async stopContainer(containerId: string, timeout: number = 10): Promise<{ message: string }> {
        const response = await api.post(`${this.baseUrl}/containers/${containerId}/stop`, { timeout });
        return response.data;
    }

    /**
     * Redémarrer un container
     */
    async restartContainer(containerId: string, timeout: number = 10): Promise<{ message: string }> {
        const response = await api.post(`${this.baseUrl}/containers/${containerId}/restart`, { timeout });
        return response.data;
    }

    /**
     * Récupérer les logs d'un container
     */
    async getContainerLogs(containerId: string, tail: number = 100, follow: boolean = false): Promise<{ logs: string }> {
        const response = await api.get(`${this.baseUrl}/containers/${containerId}/logs`, {
            params: { tail, follow }
        });
        return response.data;
    }

    /**
     * Récupérer les statistiques d'un container
     */
    async getContainerStats(containerId: string): Promise<{ stats: ContainerStats }> {
        const response = await api.get(`${this.baseUrl}/containers/${containerId}/stats`);
        return response.data;
    }

    /**
     * Télécharger les logs d'un container
     */
    async downloadContainerLogs(containerId: string, tail: number = 1000): Promise<Blob> {
        const response = await api.get(`${this.baseUrl}/containers/${containerId}/logs/download`, {
            params: { tail },
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Vider les logs d'un container
     */
    async clearContainerLogs(containerId: string): Promise<{ message: string }> {
        const response = await api.post(`${this.baseUrl}/containers/${containerId}/logs/clear`);
        return response.data;
    }

    /**
     * Récupérer la liste des images Docker
     */
    async listImages(all: boolean = false): Promise<DockerImage[]> {
        const response = await api.get(`${this.baseUrl}/images`, {
            params: { all }
        });
        return response.data;
    }

    /**
     * Récupérer une image spécifique
     */
    async getImage(imageId: string): Promise<DockerImage> {
        const response = await api.get(`${this.baseUrl}/images/${imageId}`);
        return response.data;
    }

    /**
     * Télécharger une image Docker
     */
    async pullImage(imageData: ImagePull): Promise<DockerImage> {
        const response = await api.post(`${this.baseUrl}/images/pull`, imageData);
        return response.data;
    }

    /**
     * Supprimer une image Docker
     */
    async deleteImage(imageId: string, force: boolean = false): Promise<void> {
        await api.delete(`${this.baseUrl}/images/${imageId}`, {
            params: { force }
        });
    }

    /**
     * Rechercher des images sur Docker Hub
     */
    async searchImages(term: string, limit: number = 25): Promise<{ results: any[] }> {
        const response = await api.get(`${this.baseUrl}/images/search/${term}`, {
            params: { limit }
        });
        return response.data;
    }

    /**
     * Récupérer l'historique d'une image
     */
    async getImageHistory(imageId: string): Promise<{ history: any[] }> {
        const response = await api.get(`${this.baseUrl}/images/${imageId}/history`);
        return response.data;
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

// Instance singleton du service
export const containerService = new ContainerService();
