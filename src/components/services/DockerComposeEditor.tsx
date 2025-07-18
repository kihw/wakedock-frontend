'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FileText,
    Upload,
    Download,
    Check,
    X,
    Eye,
    Edit,
    Save,
    RefreshCw
} from 'lucide-react';

interface DockerComposeEditorProps {
    onSave?: (content: string) => void;
    onValidate?: (content: string) => Promise<boolean>;
    initialContent?: string;
    readOnly?: boolean;
}

interface ValidationError {
    line: number;
    message: string;
    type: 'error' | 'warning';
}

export function DockerComposeEditor({
    onSave,
    onValidate,
    initialContent = '',
    readOnly = false
}: DockerComposeEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [isValidating, setIsValidating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [isValid, setIsValid] = useState(true);
    const [activeTab, setActiveTab] = useState('editor');

    const defaultTemplate = `version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    environment:
      - NGINX_HOST=localhost
      - NGINX_PORT=80
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: unless-stopped
    
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  default:
    driver: bridge`;

    const validateYAML = async (yamlContent: string): Promise<ValidationError[]> => {
        setIsValidating(true);
        const errors: ValidationError[] = [];

        try {
            // Basic YAML validation
            const lines = yamlContent.split('\n');
            lines.forEach((line, index) => {
                const lineNumber = index + 1;

                // Check for common YAML issues
                if (line.trim().startsWith('- ') && line.includes(':')) {
                    const colonIndex = line.indexOf(':');
                    const dashIndex = line.indexOf('-');
                    if (colonIndex < dashIndex) {
                        errors.push({
                            line: lineNumber,
                            message: 'Invalid YAML syntax: colon before dash in list item',
                            type: 'error'
                        });
                    }
                }

                // Check for Docker Compose specific issues
                if (line.includes('version:') && !line.includes("'") && !line.includes('"')) {
                    errors.push({
                        line: lineNumber,
                        message: 'Version should be quoted (e.g., "3.8")',
                        type: 'warning'
                    });
                }

                if (line.includes('ports:') && lines[index + 1]?.includes('- ')) {
                    const portLine = lines[index + 1];
                    if (portLine.includes(':') && !portLine.includes('"')) {
                        errors.push({
                            line: lineNumber + 1,
                            message: 'Port mapping should be quoted to avoid YAML parsing issues',
                            type: 'warning'
                        });
                    }
                }
            });

            // Validate Docker Compose structure
            if (!yamlContent.includes('services:')) {
                errors.push({
                    line: 1,
                    message: 'Docker Compose file must contain a "services" section',
                    type: 'error'
                });
            }

            if (onValidate) {
                const customValidation = await onValidate(yamlContent);
                if (!customValidation) {
                    errors.push({
                        line: 1,
                        message: 'Custom validation failed',
                        type: 'error'
                    });
                }
            }

        } catch (error) {
            errors.push({
                line: 1,
                message: `YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error'
            });
        }

        setIsValidating(false);
        return errors;
    };

    const handleContentChange = async (newContent: string) => {
        setContent(newContent);
        const errors = await validateYAML(newContent);
        setValidationErrors(errors);
        setIsValid(errors.filter(e => e.type === 'error').length === 0);
    };

    const handleSave = () => {
        if (onSave && isValid) {
            onSave(content);
        }
    };

    const handleLoadTemplate = () => {
        setContent(defaultTemplate);
        handleContentChange(defaultTemplate);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setContent(content);
                handleContentChange(content);
            };
            reader.readAsText(file);
        }
    };

    const handleFileDownload = () => {
        const blob = new Blob([content], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'docker-compose.yml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Docker Compose Editor
                        </CardTitle>
                        <CardDescription>
                            Edit and validate your Docker Compose configuration
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={isValid ? "default" : "destructive"}>
                            {isValid ? (
                                <>
                                    <Check className="w-3 h-3 mr-1" />
                                    Valid
                                </>
                            ) : (
                                <>
                                    <X className="w-3 h-3 mr-1" />
                                    Invalid
                                </>
                            )}
                        </Badge>
                        {isValidating && <RefreshCw className="w-4 h-4 animate-spin" />}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="editor">Editor</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="validation">Validation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="editor">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLoadTemplate}
                                >
                                    Load Template
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleFileDownload}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                                <div className="flex-1" />
                                <Button
                                    onClick={handleSave}
                                    disabled={!isValid || readOnly}
                                    size="sm"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div>

                            <input
                                id="file-upload"
                                type="file"
                                accept=".yml,.yaml"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />

                            <div className="relative">
                                <textarea
                                    value={content}
                                    onChange={(e) => handleContentChange(e.target.value)}
                                    readOnly={readOnly}
                                    className="w-full h-96 p-4 border border-border rounded-lg font-mono text-sm bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter your Docker Compose configuration here..."
                                />
                                {validationErrors.length > 0 && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="destructive">
                                            {validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="preview">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span className="font-medium">Configuration Preview</span>
                            </div>
                            <div className="bg-card border border-border rounded-lg p-4">
                                <pre className="text-sm text-foreground whitespace-pre-wrap">
                                    {content || 'No configuration to preview'}
                                </pre>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="validation">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                <span className="font-medium">Validation Results</span>
                            </div>

                            {validationErrors.length === 0 ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-800 text-sm">
                                        ✅ Configuration is valid! No issues found.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {validationErrors.map((error, index) => (
                                        <div
                                            key={index}
                                            className={`border rounded-lg p-3 ${error.type === 'error'
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-yellow-50 border-yellow-200'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {error.type === 'error' ? (
                                                    <X className="w-4 h-4 text-red-500 mt-0.5" />
                                                ) : (
                                                    <div className="w-4 h-4 bg-yellow-500 rounded-full mt-0.5 flex items-center justify-center">
                                                        <span className="text-white text-xs">!</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className={`text-sm font-medium ${error.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                                                        }`}>
                                                        Line {error.line}: {error.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
