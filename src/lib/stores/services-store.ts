// Minimal services store for v0.6.4
import { create } from 'zustand';
import type { Service } from '../types/service';

interface ServicesState {
    services: Service[];
    isLoading: boolean;
    error: string | null;
    selectedService: Service | null;

    // Actions
    fetchServices: () => Promise<void>;
    getServiceById: (id: string) => Service | undefined;
    selectService: (service: Service | null) => void;
    updateServiceStatus: (id: string, status: Service['status']) => void;
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
    services: [],
    isLoading: false,
    error: null,
    selectedService: null,

    fetchServices: async () => {
        set({ isLoading: true, error: null });
        try {
            // Mock services for v0.6.4
            const mockServices: Service[] = [
                {
                    id: '1',
                    name: 'nginx-proxy',
                    image: 'nginx:latest',
                    status: 'running' as Service['status'],
                    ports: [
                        { host_port: 80, container_port: 80, protocol: 'tcp' },
                        { host_port: 443, container_port: 443, protocol: 'tcp' }
                    ],
                    environment: { ENV: 'production' },
                    volumes: [{ source: '/data', target: '/var/www', type: 'bind' as const }],
                    networks: ['default'],
                    labels: { 'com.wakedock.managed': 'true' },
                    restart_policy: 'always' as const,
                    created: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    health_status: 'healthy' as const
                },
                {
                    id: '2',
                    name: 'postgres-db',
                    image: 'postgres:13',
                    status: 'running' as Service['status'],
                    ports: [{ host_port: 5432, container_port: 5432, protocol: 'tcp' }],
                    environment: { POSTGRES_DB: 'wakedock' },
                    volumes: [{ source: '/db', target: '/var/lib/postgresql/data', type: 'bind' as const }],
                    networks: ['default'],
                    labels: { 'com.wakedock.managed': 'true' },
                    restart_policy: 'always' as const,
                    created: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    health_status: 'healthy' as const
                }
            ];

            set({ services: mockServices, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch services',
                isLoading: false
            });
        }
    },

    getServiceById: (id: string) => {
        return get().services.find(service => service.id === id);
    },

    selectService: (service: Service | null) => {
        set({ selectedService: service });
    },

    updateServiceStatus: (id: string, status: Service['status']) => {
        set((state) => ({
            services: state.services.map(service =>
                service.id === id ? { ...service, status } : service
            )
        }));
    },

    setError: (error: string | null) => {
        set({ error });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    }
}));
