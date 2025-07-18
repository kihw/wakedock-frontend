'use client';

import { useState } from 'react';
import {
    FileText,
    Upload,
    Download,
    Check,
    X,
    Eye,
    Edit,
    Save,
    RefreshCw,
    Github,
    GitBranch,
    Star,
    Book,
    ExternalLink
} from 'lucide-react';

interface GitHubIntegrationProps {
    onDeploy?: (repoUrl: string, config: DeployConfig) => void;
    onConnect?: (token: string) => void;
}

interface Repository {
    id: string;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    language: string;
    has_docker: boolean;
    has_compose: boolean;
}

interface DeployConfig {
    repository: Repository;
    branch: string;
    environment: string;
    dockerfile: string;
    compose_file: string;
    environment_vars: Record<string, string>;
    port_mappings: Record<string, string>;
}

export function GitHubIntegration({ onDeploy, onConnect }: GitHubIntegrationProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [accessToken, setAccessToken] = useState('');
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
    const [deployConfig, setDeployConfig] = useState<DeployConfig | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<'connect' | 'browse' | 'configure' | 'deploy'>('connect');

    // Mock repositories data
    const mockRepositories: Repository[] = [
        {
            id: '1',
            name: 'my-web-app',
            full_name: 'user/my-web-app',
            description: 'A modern web application with Node.js and React',
            html_url: 'https://github.com/user/my-web-app',
            stargazers_count: 25,
            language: 'JavaScript',
            has_docker: true,
            has_compose: true
        },
        {
            id: '2',
            name: 'api-service',
            full_name: 'user/api-service',
            description: 'RESTful API built with Python FastAPI',
            html_url: 'https://github.com/user/api-service',
            stargazers_count: 12,
            language: 'Python',
            has_docker: true,
            has_compose: false
        },
        {
            id: '3',
            name: 'microservice-demo',
            full_name: 'user/microservice-demo',
            description: 'Microservices architecture demonstration',
            html_url: 'https://github.com/user/microservice-demo',
            stargazers_count: 45,
            language: 'Go',
            has_docker: true,
            has_compose: true
        }
    ];

    const handleConnect = async () => {
        setIsLoading(true);
        // Simulate GitHub OAuth flow
        setTimeout(() => {
            setIsConnected(true);
            setRepositories(mockRepositories);
            setCurrentStep('browse');
            setIsLoading(false);
            if (onConnect) {
                onConnect(accessToken);
            }
        }, 1500);
    };

    const handleRepoSelect = (repo: Repository) => {
        setSelectedRepo(repo);
        setDeployConfig({
            repository: repo,
            branch: 'main',
            environment: 'production',
            dockerfile: 'Dockerfile',
            compose_file: 'docker-compose.yml',
            environment_vars: {},
            port_mappings: {}
        });
        setCurrentStep('configure');
    };

    const handleDeploy = () => {
        if (deployConfig && onDeploy) {
            onDeploy(deployConfig.repository.html_url, deployConfig);
            setCurrentStep('deploy');
        }
    };

    const updateDeployConfig = (updates: Partial<DeployConfig>) => {
        if (deployConfig) {
            setDeployConfig({ ...deployConfig, ...updates });
        }
    };

    const ConnectStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <Github className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-semibold mb-2">Connect to GitHub</h3>
                <p className="text-gray-600 mb-6">
                    Connect your GitHub account to browse and deploy repositories
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Personal Access Token
                    </label>
                    <input
                        type="password"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Create a personal access token in your GitHub settings
                    </p>
                </div>

                <button
                    onClick={handleConnect}
                    disabled={!accessToken || isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Github className="w-4 h-4" />
                    )}
                    {isLoading ? 'Connecting...' : 'Connect to GitHub'}
                </button>
            </div>
        </div>
    );

    const BrowseStep = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Repositories</h3>
                <span className="text-sm text-gray-500">
                    {repositories.length} repositories found
                </span>
            </div>

            <div className="space-y-3">
                {repositories.map((repo) => (
                    <div
                        key={repo.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRepoSelect(repo)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Book className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{repo.name}</span>
                                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                        {repo.language}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{repo.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3" />
                                        {repo.stargazers_count}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Docker: {repo.has_docker ? 'Yes' : 'No'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Compose: {repo.has_compose ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                            <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ConfigureStep = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Configure Deployment</h3>
            </div>

            {selectedRepo && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Book className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{selectedRepo.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{selectedRepo.description}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Branch</label>
                    <select
                        value={deployConfig?.branch || 'main'}
                        onChange={(e) => updateDeployConfig({ branch: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="main">main</option>
                        <option value="develop">develop</option>
                        <option value="staging">staging</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Environment</label>
                    <select
                        value={deployConfig?.environment || 'production'}
                        onChange={(e) => updateDeployConfig({ environment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Dockerfile</label>
                    <input
                        type="text"
                        value={deployConfig?.dockerfile || 'Dockerfile'}
                        onChange={(e) => updateDeployConfig({ dockerfile: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Compose File</label>
                    <input
                        type="text"
                        value={deployConfig?.compose_file || 'docker-compose.yml'}
                        onChange={(e) => updateDeployConfig({ compose_file: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setCurrentStep('browse')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={handleDeploy}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Deploy Repository
                </button>
            </div>
        </div>
    );

    const DeployStep = () => (
        <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Deployment Started!</h3>
                <p className="text-gray-600 mb-4">
                    Your repository is being deployed to WakeDock
                </p>

                {selectedRepo && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
                        <div className="flex items-center gap-2">
                            <Book className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{selectedRepo.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Branch: {deployConfig?.branch} | Environment: {deployConfig?.environment}
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={() => {
                    setCurrentStep('browse');
                    setSelectedRepo(null);
                    setDeployConfig(null);
                }}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
                Deploy Another Repository
            </button>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <Github className="w-6 h-6 text-gray-700" />
                    <div>
                        <h2 className="text-lg font-semibold">GitHub Integration</h2>
                        <p className="text-sm text-gray-600">
                            Deploy repositories directly from GitHub
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {currentStep === 'connect' && <ConnectStep />}
                {currentStep === 'browse' && <BrowseStep />}
                {currentStep === 'configure' && <ConfigureStep />}
                {currentStep === 'deploy' && <DeployStep />}
            </div>

            {/* Progress indicator */}
            <div className="border-t border-gray-200 px-6 py-3">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${['connect', 'browse', 'configure', 'deploy'].indexOf(currentStep) >= 0
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`} />
                    <div className={`w-3 h-3 rounded-full ${['browse', 'configure', 'deploy'].indexOf(currentStep) >= 0
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`} />
                    <div className={`w-3 h-3 rounded-full ${['configure', 'deploy'].indexOf(currentStep) >= 0
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`} />
                    <div className={`w-3 h-3 rounded-full ${currentStep === 'deploy'
                            ? 'bg-green-600'
                            : 'bg-gray-300'
                        }`} />
                </div>
            </div>
        </div>
    );
}
