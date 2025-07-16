/**
 * Tests pour les composants de containers
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ContainerList from '../../../src/components/containers/ContainerList.svelte';
import ContainerCard from '../../../src/components/containers/ContainerCard.svelte';
import ContainerCreateModal from '../../../src/components/containers/ContainerCreateModal.svelte';
import ContainerStatusIndicator from '../../../src/components/containers/ContainerStatusIndicator.svelte';
import ContainerActions from '../../../src/components/containers/ContainerActions.svelte';

// Mock des stores
vi.mock('$lib/stores/containers', () => ({
    containers: {
        subscribe: vi.fn()
    },
    filteredContainers: {
        subscribe: vi.fn()
    },
    containerFilter: {
        subscribe: vi.fn(),
        set: vi.fn()
    },
    searchQuery: {
        subscribe: vi.fn(),
        set: vi.fn()
    },
    isLoadingContainers: {
        subscribe: vi.fn()
    },
    containerError: {
        subscribe: vi.fn()
    },
    containerActions: {
        loadContainers: vi.fn(),
        createContainer: vi.fn(),
        startContainer: vi.fn(),
        stopContainer: vi.fn(),
        restartContainer: vi.fn(),
        deleteContainer: vi.fn(),
        clearError: vi.fn()
    },
    images: {
        subscribe: vi.fn()
    },
    imageActions: {
        loadImages: vi.fn()
    }
}));

// Mock de l'API
vi.mock('$lib/api', () => ({
    api: {
        containers: {
            listContainers: vi.fn(),
            createContainer: vi.fn(),
            startContainer: vi.fn(),
            stopContainer: vi.fn(),
            restartContainer: vi.fn(),
            deleteContainer: vi.fn()
        }
    }
}));

describe('ContainerStatusIndicator', () => {
    it('affiche le bon statut pour un container en cours d\'exécution', () => {
        render(ContainerStatusIndicator, {
            props: {
                status: 'running'
            }
        });

        expect(screen.getByText('En cours')).toBeInTheDocument();
        expect(screen.getByText('●')).toBeInTheDocument();
    });

    it('affiche le bon statut pour un container arrêté', () => {
        render(ContainerStatusIndicator, {
            props: {
                status: 'exited'
            }
        });

        expect(screen.getByText('Arrêté')).toBeInTheDocument();
        expect(screen.getByText('■')).toBeInTheDocument();
    });

    it('cache le texte quand showText est false', () => {
        render(ContainerStatusIndicator, {
            props: {
                status: 'running',
                showText: false
            }
        });

        expect(screen.queryByText('En cours')).not.toBeInTheDocument();
        expect(screen.getByText('●')).toBeInTheDocument();
    });
});

describe('ContainerActions', () => {
    const mockContainer = {
        id: 'test-container-id',
        name: 'test-container',
        image: 'nginx:latest',
        status: 'running',
        state: 'running',
        created: '2023-01-01T00:00:00Z'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('affiche les bonnes actions pour un container en cours d\'exécution', () => {
        render(ContainerActions, {
            props: {
                container: mockContainer
            }
        });

        expect(screen.getByTitle('Arrêter le container')).toBeInTheDocument();
        expect(screen.getByTitle('Redémarrer le container')).toBeInTheDocument();
        expect(screen.getByTitle('Supprimer le container')).toBeInTheDocument();
        expect(screen.queryByTitle('Démarrer le container')).not.toBeInTheDocument();
    });

    it('affiche les bonnes actions pour un container arrêté', () => {
        const stoppedContainer = { ...mockContainer, status: 'exited', state: 'exited' };

        render(ContainerActions, {
            props: {
                container: stoppedContainer
            }
        });

        expect(screen.getByTitle('Démarrer le container')).toBeInTheDocument();
        expect(screen.getByTitle('Supprimer le container')).toBeInTheDocument();
        expect(screen.queryByTitle('Arrêter le container')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Redémarrer le container')).not.toBeInTheDocument();
    });

    it('émet un événement lors du clic sur start', async () => {
        const stoppedContainer = { ...mockContainer, status: 'exited', state: 'exited' };
        const { component } = render(ContainerActions, {
            props: {
                container: stoppedContainer
            }
        });

        let emittedEvent = null;
        component.$on('actionStarted', (event) => {
            emittedEvent = event.detail;
        });

        const startButton = screen.getByTitle('Démarrer le container');
        await fireEvent.click(startButton);

        expect(emittedEvent).toEqual({
            action: 'start',
            container: stoppedContainer
        });
    });
});

describe('ContainerCard', () => {
    const mockContainer = {
        id: 'test-container-id',
        name: 'test-container',
        image: 'nginx:latest',
        status: 'running',
        state: 'running',
        created: '2023-01-01T00:00:00Z',
        ports: {
            '80/tcp': [{ HostPort: '8080' }]
        },
        environment: {
            'NODE_ENV': 'production',
            'PORT': '3000'
        }
    };

    it('affiche les informations de base du container', () => {
        render(ContainerCard, {
            props: {
                container: mockContainer
            }
        });

        expect(screen.getByText('test-container')).toBeInTheDocument();
        expect(screen.getByText('nginx:latest')).toBeInTheDocument();
        expect(screen.getByText('running')).toBeInTheDocument();
    });

    it('affiche les ports mappés', () => {
        render(ContainerCard, {
            props: {
                container: mockContainer
            }
        });

        expect(screen.getByText('8080:80/tcp')).toBeInTheDocument();
    });

    it('affiche le nombre de variables d\'environnement', () => {
        render(ContainerCard, {
            props: {
                container: mockContainer
            }
        });

        expect(screen.getByText('2 variables')).toBeInTheDocument();
    });

    it('émet un événement lors du clic sur "Logs"', async () => {
        const { component } = render(ContainerCard, {
            props: {
                container: mockContainer
            }
        });

        let emittedEvent = null;
        component.$on('viewLogs', (event) => {
            emittedEvent = event.detail;
        });

        // Cliquer sur le bouton des logs (icône terminal)
        const logsButton = screen.getByTitle('Logs'); // Assumant qu'il y a un titre
        await fireEvent.click(logsButton);

        expect(emittedEvent).toEqual(mockContainer);
    });
});

describe('ContainerCreateModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('affiche le formulaire de création', () => {
        render(ContainerCreateModal, {
            props: {
                isOpen: true
            }
        });

        expect(screen.getByText('Créer un nouveau container')).toBeInTheDocument();
        expect(screen.getByLabelText('Nom du container *')).toBeInTheDocument();
        expect(screen.getByLabelText('Image Docker *')).toBeInTheDocument();
    });

    it('affiche le formulaire d\'édition en mode edit', () => {
        const initialData = {
            name: 'test-container',
            image: 'nginx:latest',
            environment: [{ key: 'NODE_ENV', value: 'production' }],
            ports: [{ containerPort: '80', hostPort: 8080 }],
            volumes: [],
            restartPolicy: 'no'
        };

        render(ContainerCreateModal, {
            props: {
                isOpen: true,
                editMode: true,
                initialData
            }
        });

        expect(screen.getByText('Modifier le container')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test-container')).toBeInTheDocument();
        expect(screen.getByDisplayValue('nginx:latest')).toBeInTheDocument();
    });

    it('valide les champs requis', async () => {
        render(ContainerCreateModal, {
            props: {
                isOpen: true
            }
        });

        const submitButton = screen.getByText('Créer');
        await fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Le nom du container est requis')).toBeInTheDocument();
            expect(screen.getByText('L\'image Docker est requise')).toBeInTheDocument();
        });
    });

    it('ajoute une nouvelle variable d\'environnement', async () => {
        render(ContainerCreateModal, {
            props: {
                isOpen: true
            }
        });

        const addEnvButton = screen.getByText('+ Ajouter');
        await fireEvent.click(addEnvButton);

        // Vérifier qu'il y a maintenant 2 paires de champs d'environnement
        const envKeyInputs = screen.getAllByPlaceholderText('VARIABLE_NAME');
        expect(envKeyInputs).toHaveLength(2);
    });

    it('émet un événement de fermeture', async () => {
        const { component } = render(ContainerCreateModal, {
            props: {
                isOpen: true
            }
        });

        let eventEmitted = false;
        component.$on('close', () => {
            eventEmitted = true;
        });

        const closeButton = screen.getByRole('button', { name: /annuler/i });
        await fireEvent.click(closeButton);

        expect(eventEmitted).toBe(true);
    });
});

describe('ContainerList', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock des valeurs des stores
        vi.mocked(containers.subscribe).mockImplementation((callback) => {
            callback([]);
            return () => { };
        });

        vi.mocked(filteredContainers.subscribe).mockImplementation((callback) => {
            callback([]);
            return () => { };
        });

        vi.mocked(isLoadingContainers.subscribe).mockImplementation((callback) => {
            callback(false);
            return () => { };
        });

        vi.mocked(containerError.subscribe).mockImplementation((callback) => {
            callback(null);
            return () => { };
        });

        vi.mocked(containerFilter.subscribe).mockImplementation((callback) => {
            callback('all');
            return () => { };
        });

        vi.mocked(searchQuery.subscribe).mockImplementation((callback) => {
            callback('');
            return () => { };
        });
    });

    it('affiche le message de liste vide', () => {
        render(ContainerList);

        expect(screen.getByText('Aucun container')).toBeInTheDocument();
        expect(screen.getByText('Commencez par créer votre premier container Docker.')).toBeInTheDocument();
    });

    it('affiche le bouton de création', () => {
        render(ContainerList);

        expect(screen.getByText('Nouveau Container')).toBeInTheDocument();
        expect(screen.getByText('Créer un container')).toBeInTheDocument();
    });

    it('affiche le spinner de chargement', () => {
        vi.mocked(isLoadingContainers.subscribe).mockImplementation((callback) => {
            callback(true);
            return () => { };
        });

        render(ContainerList);

        expect(screen.getByText('Chargement des containers...')).toBeInTheDocument();
    });

    it('affiche un message d\'erreur', () => {
        vi.mocked(containerError.subscribe).mockImplementation((callback) => {
            callback('Erreur de connexion');
            return () => { };
        });

        render(ContainerList);

        expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
    });

    it('appelle loadContainers au montage', () => {
        render(ContainerList);

        expect(containerActions.loadContainers).toHaveBeenCalledTimes(1);
    });
});
