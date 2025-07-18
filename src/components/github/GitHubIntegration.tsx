import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  Github, 
  Search, 
  Download, 
  GitBranch, 
  FileText, 
  Container, 
  Settings,
  Play,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Folder,
  Star,
  Users,
  Calendar
} from 'lucide-react';

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  has_dockerfile: boolean;
  has_compose: boolean;
  topics: string[];
}

interface DockerFile {
  name: string;
  path: string;
  content: string;
  size: number;
}

interface DeploymentConfig {
  repository: GitHubRepository;
  branch: string;
  dockerfile: DockerFile | null;
  composeFile: DockerFile | null;
  serviceName: string;
  envVars: Record<string, string>;
  ports: Record<string, string>;
  autoWebhook: boolean;
}

interface GitHubIntegrationProps {
  onDeploy?: (config: DeploymentConfig) => Promise<void>;
  className?: string;
}

const SAMPLE_REPOSITORIES: GitHubRepository[] = [
  {
    id: 1,
    name: 'awesome-webapp',
    full_name: 'user/awesome-webapp',
    description: 'A modern web application built with React and Node.js',
    html_url: 'https://github.com/user/awesome-webapp',
    clone_url: 'https://github.com/user/awesome-webapp.git',
    default_branch: 'main',
    stargazers_count: 142,
    forks_count: 28,
    language: 'JavaScript',
    updated_at: '2024-01-15T10:30:00Z',
    has_dockerfile: true,
    has_compose: true,
    topics: ['react', 'nodejs', 'docker', 'web-app']
  },
  {
    id: 2,
    name: 'microservice-api',
    full_name: 'user/microservice-api',
    description: 'RESTful API microservice with FastAPI and PostgreSQL',
    html_url: 'https://github.com/user/microservice-api',
    clone_url: 'https://github.com/user/microservice-api.git',
    default_branch: 'main',
    stargazers_count: 89,
    forks_count: 15,
    language: 'Python',
    updated_at: '2024-01-14T16:45:00Z',
    has_dockerfile: true,
    has_compose: false,
    topics: ['fastapi', 'python', 'microservice', 'api']
  },
  {
    id: 3,
    name: 'data-pipeline',
    full_name: 'user/data-pipeline',
    description: 'ETL data pipeline with Apache Airflow and Docker',
    html_url: 'https://github.com/user/data-pipeline',
    clone_url: 'https://github.com/user/data-pipeline.git',
    default_branch: 'develop',
    stargazers_count: 67,
    forks_count: 12,
    language: 'Python',
    updated_at: '2024-01-13T09:20:00Z',
    has_dockerfile: false,
    has_compose: true,
    topics: ['airflow', 'etl', 'data', 'pipeline']
  }
];

const SAMPLE_DOCKERFILE = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]`;

const SAMPLE_COMPOSE = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:`;

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({ 
  onDeploy,
  className = ''
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'configure' | 'deploy'>('browse');
  const [dockerfiles, setDockerfiles] = useState<DockerFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Simulate GitHub authentication status
    setIsAuthenticated(true);
    setRepositories(SAMPLE_REPOSITORIES);
  }, []);

  const handleAuthenticate = async () => {
    setIsLoading(true);
    // Simulate GitHub OAuth
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    // Simulate search API call
    setTimeout(() => {
      const filtered = SAMPLE_REPOSITORIES.filter(repo =>
        repo.name.toLowerCase().includes(query.toLowerCase()) ||
        repo.description.toLowerCase().includes(query.toLowerCase()) ||
        repo.topics.some(topic => topic.toLowerCase().includes(query.toLowerCase()))
      );
      setRepositories(filtered);
      setIsLoading(false);
    }, 500);
  };

  const analyzeRepository = async (repo: GitHubRepository) => {
    setIsAnalyzing(true);
    setSelectedRepo(repo);
    
    // Simulate repository analysis
    setTimeout(() => {
      const dockerfiles: DockerFile[] = [];
      
      if (repo.has_dockerfile) {
        dockerfiles.push({
          name: 'Dockerfile',
          path: 'Dockerfile',
          content: SAMPLE_DOCKERFILE,
          size: SAMPLE_DOCKERFILE.length
        });
      }
      
      if (repo.has_compose) {
        dockerfiles.push({
          name: 'docker-compose.yml',
          path: 'docker-compose.yml',
          content: SAMPLE_COMPOSE,
          size: SAMPLE_COMPOSE.length
        });
      }
      
      setDockerfiles(dockerfiles);
      
      setDeploymentConfig({
        repository: repo,
        branch: repo.default_branch,
        dockerfile: dockerfiles.find(f => f.name === 'Dockerfile') || null,
        composeFile: dockerfiles.find(f => f.name === 'docker-compose.yml') || null,
        serviceName: repo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
        envVars: {
          NODE_ENV: 'production',
          PORT: '3000'
        },
        ports: {
          '3000': '3000'
        },
        autoWebhook: true
      });
      
      setIsAnalyzing(false);
      setActiveTab('configure');
    }, 1500);
  };

  const handleDeploy = async () => {
    if (!deploymentConfig || !onDeploy) return;
    
    try {
      await onDeploy(deploymentConfig);
      setActiveTab('deploy');
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  };

  const renderAuthentication = () => (
    <Card className="p-8 text-center">
      <Github className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl font-semibold mb-2">Connect to GitHub</h3>
      <p className="text-gray-600 mb-6">
        Connect your GitHub account to import and deploy containerized projects directly from your repositories.
      </p>
      <Button onClick={handleAuthenticate} disabled={isLoading}>
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Github className="h-4 w-4 mr-2" />
            Connect GitHub
          </>
        )}
      </Button>
    </Card>
  );

  const renderRepositoryBrowser = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Repository Browser</h3>
        <Button variant="outline" onClick={() => handleSearch('')}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search repositories..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading repositories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repositories.map((repo) => (
            <Card key={repo.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{repo.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {repo.has_dockerfile && (
                      <Badge variant="success">
                        <Container className="h-3 w-3 mr-1" />
                        Dockerfile
                      </Badge>
                    )}
                    {repo.has_compose && (
                      <Badge variant="info">
                        <FileText className="h-3 w-3 mr-1" />
                        Compose
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{repo.forks_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {repo.language && (
                      <Badge variant="secondary">{repo.language}</Badge>
                    )}
                    <Badge variant="secondary">
                      <GitBranch className="h-3 w-3 mr-1" />
                      {repo.default_branch}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => analyzeRepository(repo)}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing && selectedRepo?.id === repo.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
                
                {repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {repo.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                    {repo.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{repo.topics.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderConfiguration = () => {
    if (!deploymentConfig) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Configure Deployment</h3>
            <p className="text-gray-600">{deploymentConfig.repository.full_name}</p>
          </div>
          <Button variant="outline" onClick={() => setActiveTab('browse')}>
            ← Back to Browse
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium mb-3">Repository Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Repository:</span>
                  <span>{deploymentConfig.repository.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span>{deploymentConfig.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span>{deploymentConfig.repository.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Has Dockerfile:</span>
                  <span>{deploymentConfig.dockerfile ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Has Compose:</span>
                  <span>{deploymentConfig.composeFile ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Service Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Service Name</label>
                  <input
                    type="text"
                    value={deploymentConfig.serviceName}
                    onChange={(e) => setDeploymentConfig({
                      ...deploymentConfig,
                      serviceName: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Branch</label>
                  <input
                    type="text"
                    value={deploymentConfig.branch}
                    onChange={(e) => setDeploymentConfig({
                      ...deploymentConfig,
                      branch: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={deploymentConfig.autoWebhook}
                      onChange={(e) => setDeploymentConfig({
                        ...deploymentConfig,
                        autoWebhook: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Auto-deploy on push</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium mb-3">Environment Variables</h4>
              <div className="space-y-2">
                {Object.entries(deploymentConfig.envVars).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={key}
                      className="w-1/3 p-2 border rounded text-sm"
                      readOnly
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setDeploymentConfig({
                        ...deploymentConfig,
                        envVars: {
                          ...deploymentConfig.envVars,
                          [key]: e.target.value
                        }
                      })}
                      className="flex-1 p-2 border rounded text-sm"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeploymentConfig({
                    ...deploymentConfig,
                    envVars: {
                      ...deploymentConfig.envVars,
                      'NEW_VAR': 'value'
                    }
                  })}
                >
                  Add Variable
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Port Mappings</h4>
              <div className="space-y-2">
                {Object.entries(deploymentConfig.ports).map(([internal, external]) => (
                  <div key={internal} className="flex items-center space-x-2">
                    <span className="text-sm w-16">{internal} →</span>
                    <input
                      type="text"
                      value={external}
                      onChange={(e) => setDeploymentConfig({
                        ...deploymentConfig,
                        ports: {
                          ...deploymentConfig.ports,
                          [internal]: e.target.value
                        }
                      })}
                      className="flex-1 p-2 border rounded text-sm"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {dockerfiles.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Detected Container Files</h4>
            <div className="space-y-3">
              {dockerfiles.map((file) => (
                <Card key={file.name} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{file.size} bytes</span>
                  </div>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto max-h-32">
                    {file.content.split('\n').slice(0, 6).join('\n')}
                    {file.content.split('\n').length > 6 && '\n...'}
                  </pre>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setActiveTab('browse')}>
            Cancel
          </Button>
          <Button onClick={handleDeploy}>
            <Play className="h-4 w-4 mr-2" />
            Deploy Now
          </Button>
        </div>
      </div>
    );
  };

  const renderDeploymentStatus = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Deployment Status</h3>
      <Card className="p-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium mb-2">Deployment Successful!</h4>
          <p className="text-gray-600 mb-4">
            Your application has been successfully deployed from GitHub.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Service:</strong> {deploymentConfig?.serviceName}</p>
            <p><strong>Repository:</strong> {deploymentConfig?.repository.full_name}</p>
            <p><strong>Branch:</strong> {deploymentConfig?.branch}</p>
            <p><strong>Webhook:</strong> {deploymentConfig?.autoWebhook ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className={className}>
        {renderAuthentication()}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'browse' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('browse')}
        >
          <Folder className="h-4 w-4 mr-2 inline" />
          Browse
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'configure' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('configure')}
          disabled={!deploymentConfig}
        >
          <Settings className="h-4 w-4 mr-2 inline" />
          Configure
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'deploy' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('deploy')}
          disabled={!deploymentConfig}
        >
          <Play className="h-4 w-4 mr-2 inline" />
          Deploy
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'browse' && renderRepositoryBrowser()}
        {activeTab === 'configure' && renderConfiguration()}
        {activeTab === 'deploy' && renderDeploymentStatus()}
      </div>
    </div>
  );
};

export default GitHubIntegration;
