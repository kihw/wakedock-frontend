import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileText, Upload, Download } from 'lucide-react';

interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface YamlValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  parsed_content?: any;
  services_count?: number;
  networks_count?: number;
  volumes_count?: number;
}

const YamlValidator = () => {
  const [yamlContent, setYamlContent] = useState('');
  const [validation, setValidation] = useState<YamlValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Sample docker-compose.yml content
  const sampleCompose = `version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NGINX_HOST=\${NGINX_HOST:-localhost}
      - NGINX_PORT=80
    depends_on:
      - db
      - redis
    networks:
      - webnet
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=\${DB_NAME:-myapp}
      - POSTGRES_USER=\${DB_USER:-postgres}
      - POSTGRES_PASSWORD=\${DB_PASSWORD:-secret}
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - webnet
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    networks:
      - webnet
    restart: unless-stopped

volumes:
  db_data:

networks:
  webnet:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1`;

  // Validate YAML content
  const validateYaml = async (content: string) => {
    if (!content.trim()) {
      setValidation(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/compose/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compose_content: content,
          validate_syntax: true,
          validate_services: true
        })
      });

      if (!response.ok) throw new Error('Validation failed');
      const result = await response.json();
      setValidation(result);
    } catch (err) {
      // Fallback to basic YAML parsing
      try {
        // Simple YAML validation
        const lines = content.split('\n');
        const errors: ValidationError[] = [];
        let servicesCount = 0;
        let networksCount = 0;
        let volumesCount = 0;

        lines.forEach((line, index) => {
          const lineNum = index + 1;

          // Check for basic YAML syntax issues
          if (line.includes('\t')) {
            errors.push({
              line: lineNum,
              column: line.indexOf('\t') + 1,
              message: 'Tabs are not allowed in YAML. Use spaces instead.',
              severity: 'error'
            });
          }

          // Count sections
          if (line.trim().startsWith('services:')) servicesCount++;
          if (line.trim().startsWith('networks:')) networksCount++;
          if (line.trim().startsWith('volumes:')) volumesCount++;

          // Check for common Docker Compose issues
          if (line.includes('image:') && !line.includes(':')) {
            errors.push({
              line: lineNum,
              column: 1,
              message: 'Image specification should include a tag',
              severity: 'warning'
            });
          }
        });

        setValidation({
          is_valid: errors.filter(e => e.severity === 'error').length === 0,
          errors: errors.filter(e => e.severity === 'error'),
          warnings: errors.filter(e => e.severity === 'warning'),
          services_count: servicesCount,
          networks_count: networksCount,
          volumes_count: volumesCount
        });
      } catch (parseErr) {
        setValidation({
          is_valid: false,
          errors: [{
            line: 1,
            column: 1,
            message: 'Invalid YAML syntax',
            severity: 'error'
          }],
          warnings: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Load sample content
  const loadSample = () => {
    setYamlContent(sampleCompose);
  };

  // Clear content
  const clearContent = () => {
    setYamlContent('');
    setValidation(null);
  };

  // Download content as file
  const downloadYaml = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Upload file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setYamlContent(content);
      };
      reader.readAsText(file);
    }
  };

  // Get line numbers for editor
  const getLineNumbers = () => {
    const lines = yamlContent.split('\n');
    return lines.map((_, index) => index + 1).join('\n');
  };

  // Highlight syntax errors in content
  const getHighlightedContent = () => {
    if (!validation) return yamlContent;

    const lines = yamlContent.split('\n');
    const errorLines = new Set(validation.errors.map(e => e.line - 1));
    const warningLines = new Set(validation.warnings.map(e => e.line - 1));

    return lines.map((line, index) => {
      let className = '';
      if (errorLines.has(index)) {
        className = 'bg-red-100 border-l-4 border-red-500';
      } else if (warningLines.has(index)) {
        className = 'bg-yellow-100 border-l-4 border-yellow-500';
      }

      return (
        <div key={index} className={`${className} px-2`}>
          {line || ' '}
        </div>
      );
    });
  };

  // Auto-validate on content change
  useEffect(() => {
    const timer = setTimeout(() => {
      validateYaml(yamlContent);
    }, 1000);

    return () => clearTimeout(timer);
  }, [yamlContent]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">YAML Validator</h1>
        <div className="flex space-x-2">
          <input
            type="file"
            accept=".yml,.yaml"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </label>
          <button
            onClick={downloadYaml}
            disabled={!yamlContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Sample
          </button>
          <button
            onClick={clearContent}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {validation && (
        <div className={`mb-6 p-4 rounded-md border ${validation.is_valid
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
          }`}>
          <div className="flex items-center mb-2">
            {validation.is_valid ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400 mr-2" />
            )}
            <span className={`font-medium ${validation.is_valid ? 'text-green-800' : 'text-red-800'
              }`}>
              {validation.is_valid ? 'Valid YAML' : 'Invalid YAML'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Services:</span>
              <span className="ml-1 font-medium">{validation.services_count || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Networks:</span>
              <span className="ml-1 font-medium">{validation.networks_count || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Volumes:</span>
              <span className="ml-1 font-medium">{validation.volumes_count || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Issues:</span>
              <span className="ml-1 font-medium">
                {(validation.errors.length || 0) + (validation.warnings.length || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1 rounded text-sm ${activeTab === 'editor'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded text-sm ${activeTab === 'preview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Preview
                </button>
              </div>

              {loading && (
                <div className="text-sm text-gray-500">Validating...</div>
              )}
            </div>

            <div className="relative">
              {activeTab === 'editor' ? (
                <div className="flex">
                  {/* Line numbers */}
                  <div className="bg-gray-50 px-3 py-4 text-sm text-gray-500 font-mono select-none border-r border-gray-200">
                    <pre className="whitespace-pre">{getLineNumbers()}</pre>
                  </div>

                  {/* Editor */}
                  <div className="flex-1">
                    <textarea
                      value={yamlContent}
                      onChange={(e) => setYamlContent(e.target.value)}
                      className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none"
                      placeholder="Paste your docker-compose.yml content here..."
                      spellCheck={false}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex">
                  {/* Line numbers */}
                  <div className="bg-gray-50 px-3 py-4 text-sm text-gray-500 font-mono select-none border-r border-gray-200">
                    <pre className="whitespace-pre">{getLineNumbers()}</pre>
                  </div>

                  {/* Highlighted content */}
                  <div className="flex-1 p-4 font-mono text-sm whitespace-pre overflow-auto h-96">
                    {getHighlightedContent()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Issues Panel */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Validation Issues</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!validation ? (
                <div className="p-4 text-center text-gray-500">
                  Start typing to see validation results
                </div>
              ) : validation.errors.length === 0 && validation.warnings.length === 0 ? (
                <div className="p-4 text-center text-green-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  No issues found!
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {/* Errors */}
                  {validation.errors.map((error, index) => (
                    <div key={`error-${index}`} className="p-4">
                      <div className="flex items-start">
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-800">
                            Line {error.line}, Column {error.column}
                          </div>
                          <div className="text-sm text-red-700 mt-1">
                            {error.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Warnings */}
                  {validation.warnings.map((warning, index) => (
                    <div key={`warning-${index}`} className="p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-yellow-800">
                            Line {warning.line}, Column {warning.column}
                          </div>
                          <div className="text-sm text-yellow-700 mt-1">
                            {warning.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Quick Actions</h3>
            </div>

            <div className="p-4 space-y-3">
              <button
                onClick={() => validateYaml(yamlContent)}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Re-validate
              </button>

              <button
                onClick={loadSample}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Load Sample
              </button>

              <button
                onClick={() => {
                  const formatted = yamlContent
                    .split('\n')
                    .map(line => line.replace(/\t/g, '  '))
                    .join('\n');
                  setYamlContent(formatted);
                }}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Fix Tabs → Spaces
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YamlValidator;
