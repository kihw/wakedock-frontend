import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  FileText,
  Save,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Eye,
  Code,
  Settings
} from 'lucide-react';
import yaml from 'js-yaml';

interface DockerComposeEditorProps {
  initialContent?: string;
  onSave?: (content: string) => Promise<void>;
  onDeploy?: (content: string) => Promise<void>;
  className?: string;
}

interface ValidationError {
  line: number;
  message: string;
  type: 'error' | 'warning';
}

interface DockerComposeService {
  image?: string;
  container_name?: string;
  ports?: string[];
  environment?: Record<string, string> | string[];
  volumes?: string[];
  networks?: string[];
  depends_on?: string[];
  restart?: string;
  deploy?: {
    resources?: {
      limits?: {
        cpus?: string;
        memory?: string;
      };
      reservations?: {
        cpus?: string;
        memory?: string;
      };
    };
  };
  healthcheck?: {
    test?: string[];
    interval?: string;
    timeout?: string;
    retries?: number;
  };
}

interface DockerComposeConfig {
  version?: string;
  services?: Record<string, DockerComposeService>;
  networks?: Record<string, any>;
  volumes?: Record<string, any>;
}

const DEFAULT_COMPOSE_CONTENT = `version: '3.8'

services:
  web:
    image: nginx:alpine
    container_name: web-server
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    networks:
      - frontend
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    container_name: database
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend
    restart: unless-stopped

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  postgres_data:
`;

export const DockerComposeEditor: React.FC<DockerComposeEditorProps> = ({
  initialContent = DEFAULT_COMPOSE_CONTENT,
  onSave,
  onDeploy,
  className = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'validation'>('editor');
  const [parsedConfig, setParsedConfig] = useState<DockerComposeConfig | null>(null);

  const validateYaml = useCallback((yamlContent: string): ValidationError[] => {
    const errors: ValidationError[] = [];

    try {
      const parsed = yaml.load(yamlContent) as DockerComposeConfig;
      setParsedConfig(parsed);

      // Basic structure validation
      if (!parsed.version) {
        errors.push({
          line: 1,
          message: 'Missing version field',
          type: 'warning'
        });
      }

      if (!parsed.services || Object.keys(parsed.services).length === 0) {
        errors.push({
          line: 1,
          message: 'No services defined',
          type: 'error'
        });
      }

      // Service validation
      if (parsed.services) {
        Object.entries(parsed.services).forEach(([serviceName, service]) => {
          if (!service.image) {
            errors.push({
              line: 1,
              message: `Service '${serviceName}' is missing image field`,
              type: 'error'
            });
          }

          // Port validation
          if (service.ports) {
            service.ports.forEach(port => {
              const portPattern = /^\d+:\d+$|^\d+$/;
              if (!portPattern.test(port)) {
                errors.push({
                  line: 1,
                  message: `Invalid port format '${port}' in service '${serviceName}'`,
                  type: 'error'
                });
              }
            });
          }

          // Environment validation
          if (service.environment) {
            if (Array.isArray(service.environment)) {
              service.environment.forEach(env => {
                if (!env.includes('=')) {
                  errors.push({
                    line: 1,
                    message: `Invalid environment variable format '${env}' in service '${serviceName}'`,
                    type: 'warning'
                  });
                }
              });
            }
          }

          // Health check validation
          if (service.healthcheck) {
            if (!service.healthcheck.test) {
              errors.push({
                line: 1,
                message: `Health check missing test command in service '${serviceName}'`,
                type: 'warning'
              });
            }
          }
        });
      }

    } catch (error) {
      errors.push({
        line: 1,
        message: `YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
      setParsedConfig(null);
    }

    return errors;
  }, []);

  useEffect(() => {
    const errors = validateYaml(content);
    setValidationErrors(errors);
    setIsValid(errors.filter(e => e.type === 'error').length === 0);
  }, [content, validateYaml]);

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(content);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!onDeploy || !isValid) return;

    setIsDeploying(true);
    try {
      await onDeploy(content);
    } catch (error) {
      console.error('Failed to deploy:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addService = () => {
    const newServiceTemplate = `
  new-service:
    image: nginx:alpine
    container_name: new-service
    ports:
      - "8080:80"
    restart: unless-stopped
    networks:
      - default`;

    const lines = content.split('\n');
    const servicesIndex = lines.findIndex(line => line.trim() === 'services:');

    if (servicesIndex !== -1) {
      // Find the end of services section
      let insertIndex = servicesIndex + 1;
      while (insertIndex < lines.length && (lines[insertIndex].startsWith('  ') || lines[insertIndex].trim() === '')) {
        insertIndex++;
      }

      lines.splice(insertIndex, 0, newServiceTemplate);
      setContent(lines.join('\n'));
    }
  };

  const renderEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Docker Compose Editor</h3>
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".yml,.yaml"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={addService}>
            <Settings className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">docker-compose.yml</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Lines: {content.split('\n').length}
              </span>
              <span className="text-xs text-gray-500">
                Size: {new Blob([content]).size} bytes
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm border-none resize-none focus:outline-none focus:ring-0"
            placeholder="Enter your Docker Compose configuration..."
            style={{
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", consolas, "source-code-pro", monospace',
              lineHeight: '1.5',
              tabSize: 2
            }}
          />

          {/* Line numbers */}
          <div className="absolute left-0 top-0 w-12 h-full bg-gray-100 border-r">
            {content.split('\n').map((_, index) => (
              <div
                key={index}
                className="h-6 flex items-center justify-center text-xs text-gray-500"
                style={{ lineHeight: '1.5' }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {onSave && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          {onDeploy && (
            <Button onClick={handleDeploy} disabled={isDeploying || !isValid}>
              {isDeploying ? (
                <>
                  <Play className="h-4 w-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Deploy
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Configuration Preview</h3>

      {parsedConfig && (
        <div className="space-y-4">
          {/* Services */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Services ({Object.keys(parsedConfig.services || {}).length})</h4>
            <div className="space-y-3">
              {Object.entries(parsedConfig.services || {}).map(([name, service]) => (
                <div key={name} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{name}</h5>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {service.image || 'No image'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {service.ports && (
                      <div>
                        <span className="text-gray-600">Ports:</span>
                        <span className="ml-2">{service.ports.join(', ')}</span>
                      </div>
                    )}
                    {service.networks && (
                      <div>
                        <span className="text-gray-600">Networks:</span>
                        <span className="ml-2">{service.networks.join(', ')}</span>
                      </div>
                    )}
                    {service.volumes && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Volumes:</span>
                        <span className="ml-2">{service.volumes.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Networks */}
          {parsedConfig.networks && Object.keys(parsedConfig.networks).length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">Networks ({Object.keys(parsedConfig.networks).length})</h4>
              <div className="space-y-2">
                {Object.entries(parsedConfig.networks).map(([name, network]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span>{name}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {network?.driver || 'bridge'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Volumes */}
          {parsedConfig.volumes && Object.keys(parsedConfig.volumes).length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">Volumes ({Object.keys(parsedConfig.volumes).length})</h4>
              <div className="space-y-2">
                {Object.keys(parsedConfig.volumes).map((name) => (
                  <div key={name} className="flex items-center justify-between">
                    <span>{name}</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Persistent
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderValidation = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Validation Results</h3>

      {validationErrors.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <span className="text-green-800">No validation errors found. Configuration is valid!</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {validationErrors.map((error, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${error.type === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
                }`}
            >
              <div className="flex items-start">
                {error.type === 'error' ? (
                  <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${error.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                      {error.type === 'error' ? 'Error' : 'Warning'}
                    </span>
                    <span className="text-xs text-gray-500">Line {error.line}</span>
                  </div>
                  <p className={`text-sm mt-1 ${error.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                    {error.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'editor' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('editor')}
        >
          <Code className="h-4 w-4 mr-2 inline" />
          Editor
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'preview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('preview')}
        >
          <Eye className="h-4 w-4 mr-2 inline" />
          Preview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'validation' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('validation')}
        >
          <FileText className="h-4 w-4 mr-2 inline" />
          Validation
          {validationErrors.length > 0 && (
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${validationErrors.some(e => e.type === 'error')
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
              }`}>
              {validationErrors.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'editor' && renderEditor()}
        {activeTab === 'preview' && renderPreview()}
        {activeTab === 'validation' && renderValidation()}
      </div>
    </div>
  );
};

export default DockerComposeEditor;
