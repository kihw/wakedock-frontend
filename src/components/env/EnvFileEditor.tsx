import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface EnvVariable {
  name: string;
  value: string;
  description?: string;
  is_secret: boolean;
  is_required: boolean;
}

interface EnvFile {
  path: string;
  variables: Record<string, EnvVariable>;
  comments: string[];
}

interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  variables_count: number;
  secret_variables_count: number;
}

const EnvFileEditor = () => {
  const [envFile, setEnvFile] = useState<EnvFile | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load env file
  const loadEnvFile = async (filePath: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/env/files/${encodeURIComponent(filePath)}`);
      if (!response.ok) throw new Error('Failed to load env file');
      const data = await response.json();
      setEnvFile(data);
      setValidation(data.validation_result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Save env file
  const saveEnvFile = async () => {
    if (!envFile) return;

    setLoading(true);
    try {
      const requestData = {
        variables: Object.fromEntries(
          Object.entries(envFile.variables).map(([name, variable]) => [
            name,
            {
              name: variable.name,
              value: variable.value,
              description: variable.description,
              is_secret: variable.is_secret,
              is_required: variable.is_required
            }
          ])
        ),
        comments: envFile.comments
      };

      const response = await fetch(`/api/v1/env/files/${encodeURIComponent(envFile.path)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) throw new Error('Failed to save env file');
      const data = await response.json();
      setEnvFile(data);
      setValidation(data.validation_result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  // Validate env file
  const validateEnvFile = async () => {
    if (!envFile) return;

    setLoading(true);
    try {
      const requestData = {
        variables: Object.fromEntries(
          Object.entries(envFile.variables).map(([name, variable]) => [
            name,
            {
              name: variable.name,
              value: variable.value,
              description: variable.description,
              is_secret: variable.is_secret,
              is_required: variable.is_required
            }
          ])
        ),
        comments: envFile.comments
      };

      const response = await fetch('/api/v1/env/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) throw new Error('Validation failed');
      const data = await response.json();
      setValidation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  // Add new variable
  const addVariable = () => {
    if (!envFile || !newVariableName.trim()) return;

    const newVariable: EnvVariable = {
      name: newVariableName.trim(),
      value: newVariableValue,
      description: '',
      is_secret: false,
      is_required: true
    };

    setEnvFile({
      ...envFile,
      variables: {
        ...envFile.variables,
        [newVariableName.trim()]: newVariable
      }
    });

    setNewVariableName('');
    setNewVariableValue('');
  };

  // Update variable
  const updateVariable = (name: string, updates: Partial<EnvVariable>) => {
    if (!envFile) return;

    setEnvFile({
      ...envFile,
      variables: {
        ...envFile.variables,
        [name]: {
          ...envFile.variables[name],
          ...updates
        }
      }
    });
  };

  // Remove variable
  const removeVariable = (name: string) => {
    if (!envFile) return;

    const { [name]: removed, ...remaining } = envFile.variables;
    setEnvFile({
      ...envFile,
      variables: remaining
    });
  };

  // Create initial empty env file
  const createEmptyEnvFile = () => {
    setEnvFile({
      path: '.env',
      variables: {},
      comments: ['# Environment variables']
    });
  };

  useEffect(() => {
    // Load default .env file or create empty one
    loadEnvFile('.env').catch(() => createEmptyEnvFile());
  }, []);

  if (loading && !envFile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading environment file...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Environment Variables Editor</h1>
        <div className="flex space-x-2">
          <button
            onClick={validateEnvFile}
            disabled={loading || !envFile}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Validate
          </button>
          <button
            onClick={saveEnvFile}
            disabled={loading || !envFile}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {validation && (
        <div className={`mb-6 p-4 rounded-md ${validation.is_valid
            ? 'bg-green-50 border border-green-200'
            : 'bg-yellow-50 border border-yellow-200'
          }`}>
          <div className="flex items-center mb-2">
            {validation.is_valid ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            )}
            <span className={validation.is_valid ? 'text-green-800' : 'text-yellow-800'}>
              Validation {validation.is_valid ? 'Passed' : 'Issues Found'}
            </span>
          </div>

          <div className="text-sm space-y-1">
            <div>Variables: {validation.variables_count} (Secrets: {validation.secret_variables_count})</div>

            {validation.errors.length > 0 && (
              <div>
                <strong className="text-red-700">Errors:</strong>
                <ul className="list-disc list-inside ml-4">
                  {validation.errors.map((error, idx) => (
                    <li key={idx} className="text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div>
                <strong className="text-yellow-700">Warnings:</strong>
                <ul className="list-disc list-inside ml-4">
                  {validation.warnings.map((warning, idx) => (
                    <li key={idx} className="text-yellow-700">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {envFile && (
        <div className="space-y-6">
          {/* File info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">File: {envFile.path}</span>
              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                {showSecrets ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Hide Secrets
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Show Secrets
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add new variable */}
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium mb-3">Add New Variable</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Variable name"
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Variable value"
                value={newVariableValue}
                onChange={(e) => setNewVariableValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addVariable}
                disabled={!newVariableName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variable
              </button>
            </div>
          </div>

          {/* Variables list */}
          <div className="space-y-3">
            <h3 className="font-medium">Environment Variables ({Object.keys(envFile.variables).length})</h3>

            {Object.entries(envFile.variables).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No environment variables defined
              </div>
            ) : (
              Object.entries(envFile.variables).map(([name, variable]) => (
                <div key={name} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variable Name
                      </label>
                      <input
                        type="text"
                        value={variable.name}
                        onChange={(e) => updateVariable(name, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      <input
                        type={variable.is_secret && !showSecrets ? 'password' : 'text'}
                        value={variable.is_secret && !showSecrets ? '••••••••' : variable.value}
                        onChange={(e) => updateVariable(name, { value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={variable.is_secret && !showSecrets}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                      </label>
                      <input
                        type="text"
                        value={variable.description || ''}
                        onChange={(e) => updateVariable(name, { description: e.target.value })}
                        placeholder="Brief description of this variable"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="lg:col-span-2 flex items-center justify-between">
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={variable.is_secret}
                            onChange={(e) => updateVariable(name, { is_secret: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">Secret variable</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={variable.is_required}
                            onChange={(e) => updateVariable(name, { is_required: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm">Required</span>
                        </label>
                      </div>

                      <button
                        onClick={() => removeVariable(name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvFileEditor;
