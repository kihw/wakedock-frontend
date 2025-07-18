import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
    Container,
    Database,
    Server,
    Globe,
    Key,
    Monitor,
    Settings,
    Play,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

interface ServiceTemplate {
    id: string;
    name: string;
    description: string;
    category: 'web' | 'database' | 'cache' | 'monitoring' | 'security' | 'other';
    icon: React.ComponentType<any>;
    ports: number[];
    environment: Record<string, string>;
    volumes: string[];
    networks: string[];
    dependencies: string[];
    dockerImage: string;
    dockerTag: string;
    resources: {
        cpu: string;
        memory: string;
    };
    healthCheck?: {
        endpoint: string;
        interval: string;
        timeout: string;
        retries: number;
    };
}

interface ServiceConfig {
    template: ServiceTemplate;
    customName: string;
    ports: Record<string, string>;
    environment: Record<string, string>;
    volumes: Record<string, string>;
    networks: string[];
    resources: {
        cpu: string;
        memory: string;
    };
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

const SERVICE_TEMPLATES: ServiceTemplate[] = [
    {
        id: 'nginx',
        name: 'NGINX',
        description: 'High-performance web server and reverse proxy',
        category: 'web',
        icon: Server,
        ports: [80, 443],
        environment: {
            'NGINX_HOST': 'localhost',
            'NGINX_PORT': '80'
        },
        volumes: ['/usr/share/nginx/html', '/etc/nginx/conf.d'],
        networks: ['web'],
        dependencies: [],
        dockerImage: 'nginx',
        dockerTag: 'alpine',
        resources: {
            cpu: '0.5',
            memory: '128m'
        },
        healthCheck: {
            endpoint: '/health',
            interval: '30s',
            timeout: '5s',
            retries: 3
        }
    },
    {
        id: 'postgres',
        name: 'PostgreSQL',
        description: 'Advanced open source relational database',
        category: 'database',
        icon: Database,
        ports: [5432],
        environment: {
            'POSTGRES_DB': 'wakedock',
            'POSTGRES_USER': 'wakedock',
            'POSTGRES_PASSWORD': 'changeme'
        },
        volumes: ['/var/lib/postgresql/data'],
        networks: ['database'],
        dependencies: [],
        dockerImage: 'postgres',
        dockerTag: '15-alpine',
        resources: {
            cpu: '1.0',
            memory: '512m'
        },
        healthCheck: {
            endpoint: 'pg_isready',
            interval: '10s',
            timeout: '5s',
            retries: 5
        }
    },
    {
        id: 'redis',
        name: 'Redis',
        description: 'In-memory data structure store',
        category: 'cache',
        icon: Database,
        ports: [6379],
        environment: {
            'REDIS_PASSWORD': 'changeme'
        },
        volumes: ['/data'],
        networks: ['cache'],
        dependencies: [],
        dockerImage: 'redis',
        dockerTag: '7-alpine',
        resources: {
            cpu: '0.5',
            memory: '256m'
        },
        healthCheck: {
            endpoint: 'redis-cli ping',
            interval: '10s',
            timeout: '3s',
            retries: 3
        }
    },
    {
        id: 'prometheus',
        name: 'Prometheus',
        description: 'Systems monitoring and alerting toolkit',
        category: 'monitoring',
        icon: Monitor,
        ports: [9090],
        environment: {
            'PROMETHEUS_RETENTION_TIME': '15d'
        },
        volumes: ['/prometheus', '/etc/prometheus'],
        networks: ['monitoring'],
        dependencies: [],
        dockerImage: 'prom/prometheus',
        dockerTag: 'latest',
        resources: {
            cpu: '1.0',
            memory: '1g'
        },
        healthCheck: {
            endpoint: '/-/healthy',
            interval: '30s',
            timeout: '10s',
            retries: 3
        }
    }
];

const CATEGORY_ICONS = {
    web: Globe,
    database: Database,
    cache: Database,
    monitoring: Monitor,
    security: Key,
    other: Settings
};

interface ServiceCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateService: (config: ServiceConfig) => Promise<void>;
}

export const ServiceCreationWizard: React.FC<ServiceCreationWizardProps> = ({
    isOpen,
    onClose,
    onCreateService
}) => {
    const [currentStep, setCurrentStep] = useState<'template' | 'config' | 'preview'>('template');
    const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
    const [serviceConfig, setServiceConfig] = useState<ServiceConfig | null>(null);
    const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });
    const [isDeploying, setIsDeploying] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'ports' | 'environment' | 'resources'>('basic');

    const handleTemplateSelect = (template: ServiceTemplate) => {
        setSelectedTemplate(template);
        setServiceConfig({
            template,
            customName: template.name.toLowerCase(),
            ports: template.ports.reduce((acc, port) => ({ ...acc, [port]: port.toString() }), {}),
            environment: { ...template.environment },
            volumes: template.volumes.reduce((acc, vol) => ({ ...acc, [vol]: vol }), {}),
            networks: [...template.networks],
            resources: { ...template.resources }
        });
        setCurrentStep('config');
    };

    const validateConfiguration = (config: ServiceConfig): ValidationResult => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate service name
        if (!config.customName || config.customName.length < 3) {
            errors.push('Service name must be at least 3 characters long');
        }

        // Validate ports
        Object.values(config.ports).forEach(port => {
            const portNum = parseInt(port);
            if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                errors.push(`Invalid port number: ${port}`);
            }
        });

        // Validate environment variables
        Object.entries(config.environment).forEach(([key, value]) => {
            if (key.includes('PASSWORD') && value === 'changeme') {
                warnings.push(`Default password detected for ${key}. Consider changing it.`);
            }
        });

        // Validate resources
        const cpuNum = parseFloat(config.resources.cpu);
        if (isNaN(cpuNum) || cpuNum < 0.1 || cpuNum > 4.0) {
            errors.push('CPU allocation must be between 0.1 and 4.0');
        }

        const memoryMatch = config.resources.memory.match(/^(\d+)([kmg]?)$/i);
        if (!memoryMatch) {
            errors.push('Invalid memory format. Use format like 256m, 1g, etc.');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    };

    const handleConfigChange = (field: string, value: any) => {
        if (!serviceConfig) return;

        const newConfig = { ...serviceConfig, [field]: value };
        setServiceConfig(newConfig);
        setValidation(validateConfiguration(newConfig));
    };

    const handlePreview = () => {
        if (!serviceConfig) return;
        const validationResult = validateConfiguration(serviceConfig);
        setValidation(validationResult);
        if (validationResult.isValid) {
            setCurrentStep('preview');
        }
    };

    const handleDeploy = async () => {
        if (!serviceConfig || !validation.isValid) return;

        setIsDeploying(true);
        try {
            await onCreateService(serviceConfig);
            onClose();
        } catch (error) {
            console.error('Failed to deploy service:', error);
        } finally {
            setIsDeploying(false);
        }
    };

    const generateDockerCompose = (config: ServiceConfig) => {
        const { template, customName, ports, environment, volumes, networks, resources } = config;

        const portMappings = Object.entries(ports).map(([internal, external]) =>
            `      - "${external}:${internal}"`
        ).join('\n');

        const envVars = Object.entries(environment).map(([key, value]) =>
            `      - ${key}=${value}`
        ).join('\n');

        const volumeMappings = Object.entries(volumes).map(([container, host]) =>
            `      - ${host}:${container}`
        ).join('\n');

        return `version: '3.8'
services:
  ${customName}:
    image: ${template.dockerImage}:${template.dockerTag}
    container_name: ${customName}
    restart: unless-stopped
    ports:
${portMappings}
    environment:
${envVars}
    volumes:
${volumeMappings}
    networks:
      - ${networks.join('\n      - ')}
    deploy:
      resources:
        limits:
          cpus: '${resources.cpu}'
          memory: ${resources.memory}
        reservations:
          cpus: '${parseFloat(resources.cpu) / 2}'
          memory: ${parseInt(resources.memory) / 2}${resources.memory.slice(-1)}
    ${template.healthCheck ? `healthcheck:
      test: ["CMD", "${template.healthCheck.endpoint}"]
      interval: ${template.healthCheck.interval}
      timeout: ${template.healthCheck.timeout}
      retries: ${template.healthCheck.retries}` : ''}

networks:
  ${networks.map(network => `${network}:\n    external: true`).join('\n  ')}`;
    };

    const renderTemplateSelector = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Choose a Service Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SERVICE_TEMPLATES.map((template) => {
                        const IconComponent = template.icon;
                        const CategoryIcon = CATEGORY_ICONS[template.category];

                        return (
                            <Card
                                key={template.id}
                                className="cursor-pointer hover:shadow-md transition-shadow p-4"
                                onClick={() => handleTemplateSelect(template)}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <IconComponent className="h-6 w-6 text-blue-600" />
                                            <h4 className="text-lg font-medium">{template.name}</h4>
                                        </div>
                                        <Badge variant="secondary">
                                            <CategoryIcon className="h-3 w-3 mr-1" />
                                            {template.category}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{template.description}</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Container className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                {template.dockerImage}:{template.dockerTag}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Server className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                Ports: {template.ports.join(', ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Monitor className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                {template.resources.cpu} CPU, {template.resources.memory} RAM
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderConfigurationForm = () => {
        if (!serviceConfig) return null;

        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => setCurrentStep('template')}>
                        ← Back to Templates
                    </Button>
                    <h3 className="text-lg font-semibold">Configure {serviceConfig.template.name}</h3>
                </div>

                <div className="w-full">
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-2 ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('basic')}
                        >
                            Basic
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === 'ports' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('ports')}
                        >
                            Ports
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === 'environment' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('environment')}
                        >
                            Environment
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === 'resources' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('resources')}
                        >
                            Resources
                        </button>
                    </div>

                    <div className="mt-4">
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Service Name</label>
                                    <input
                                        type="text"
                                        value={serviceConfig.customName}
                                        onChange={(e) => handleConfigChange('customName', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        placeholder="Enter service name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Networks</label>
                                    <div className="space-y-2">
                                        {serviceConfig.networks.map((network, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={network}
                                                    onChange={(e) => {
                                                        const newNetworks = [...serviceConfig.networks];
                                                        newNetworks[index] = e.target.value;
                                                        handleConfigChange('networks', newNetworks);
                                                    }}
                                                    className="flex-1 p-2 border rounded-md"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newNetworks = serviceConfig.networks.filter((_, i) => i !== index);
                                                        handleConfigChange('networks', newNetworks);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                handleConfigChange('networks', [...serviceConfig.networks, 'new-network']);
                                            }}
                                        >
                                            Add Network
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ports' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Port Mappings</label>
                                    <div className="space-y-2">
                                        {Object.entries(serviceConfig.ports).map(([internal, external]) => (
                                            <div key={internal} className="flex items-center space-x-2">
                                                <span className="w-20 text-sm">{internal} →</span>
                                                <input
                                                    type="number"
                                                    value={external}
                                                    onChange={(e) => {
                                                        const newPorts = { ...serviceConfig.ports };
                                                        newPorts[internal] = e.target.value;
                                                        handleConfigChange('ports', newPorts);
                                                    }}
                                                    className="flex-1 p-2 border rounded-md"
                                                    min="1"
                                                    max="65535"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'environment' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Environment Variables</label>
                                    <div className="space-y-2">
                                        {Object.entries(serviceConfig.environment).map(([key, value]) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <span className="w-32 text-sm font-mono">{key}</span>
                                                <input
                                                    type={key.includes('PASSWORD') ? 'password' : 'text'}
                                                    value={value}
                                                    onChange={(e) => {
                                                        const newEnv = { ...serviceConfig.environment };
                                                        newEnv[key] = e.target.value;
                                                        handleConfigChange('environment', newEnv);
                                                    }}
                                                    className="flex-1 p-2 border rounded-md"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">CPU Limit</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={serviceConfig.resources.cpu}
                                            onChange={(e) => {
                                                const newResources = { ...serviceConfig.resources };
                                                newResources.cpu = e.target.value;
                                                handleConfigChange('resources', newResources);
                                            }}
                                            className="w-full p-2 border rounded-md"
                                            min="0.1"
                                            max="4.0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Memory Limit</label>
                                        <input
                                            type="text"
                                            value={serviceConfig.resources.memory}
                                            onChange={(e) => {
                                                const newResources = { ...serviceConfig.resources };
                                                newResources.memory = e.target.value;
                                                handleConfigChange('resources', newResources);
                                            }}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="e.g., 256m, 1g"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Validation Messages */}
                {validation.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <XCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        {validation.errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {validation.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Warnings</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        {validation.warnings.map((warning, index) => (
                                            <li key={index}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep('template')}>
                        Back
                    </Button>
                    <Button onClick={handlePreview} disabled={!validation.isValid}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </Button>
                </div>
            </div>
        );
    };

    const renderPreview = () => {
        if (!serviceConfig) return null;

        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => setCurrentStep('config')}>
                        ← Back to Configuration
                    </Button>
                    <h3 className="text-lg font-semibold">Preview & Deploy</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium mb-3">Service Configuration</h4>
                        <Card className="p-4">
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium">Name:</span>
                                    <span className="ml-2">{serviceConfig.customName}</span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium">Image:</span>
                                    <span className="ml-2">{serviceConfig.template.dockerImage}:{serviceConfig.template.dockerTag}</span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium">Ports:</span>
                                    <span className="ml-2">{Object.entries(serviceConfig.ports).map(([internal, external]) => `${external}:${internal}`).join(', ')}</span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium">Resources:</span>
                                    <span className="ml-2">{serviceConfig.resources.cpu} CPU, {serviceConfig.resources.memory} RAM</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div>
                        <h4 className="font-medium mb-3">Generated Docker Compose</h4>
                        <div className="h-96 overflow-y-auto">
                            <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">
                                {generateDockerCompose(serviceConfig)}
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep('config')}>
                        Back
                    </Button>
                    <Button onClick={handleDeploy} disabled={isDeploying}>
                        {isDeploying ? (
                            <>
                                <Monitor className="h-4 w-4 mr-2 animate-spin" />
                                Deploying...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" />
                                Deploy Service
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Service Creation Wizard</h2>
                        <Button variant="ghost" onClick={onClose}>
                            <XCircle className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="py-4">
                        {currentStep === 'template' && renderTemplateSelector()}
                        {currentStep === 'config' && renderConfigurationForm()}
                        {currentStep === 'preview' && renderPreview()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceCreationWizard;
