'use client';

import { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Terminal,
  Download,
  Trash2,
  Settings,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Info
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting';
  ports: string[];
  created: string;
  uptime?: string;
  cpu?: number;
  memory?: number;
  description?: string;
  env?: Record<string, string>;
  volumes?: string[];
  networks?: string[];
  command?: string;
  logs?: string[];
}

interface ServiceDetailsProps {
  service: Service;
  onClose: () => void;
  onAction: (serviceId: string, action: string) => void;
}

export function ServiceDetails({ service, onClose, onAction }: ServiceDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'env' | 'volumes'>('overview');
  const [showLogs, setShowLogs] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 dark:text-green-400';
      case 'stopped':
        return 'text-red-600 dark:text-red-400';
      case 'paused':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'restarting':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleAction = (action: string) => {
    onAction(service.id, action);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'env', label: 'Environment', icon: Settings },
    { id: 'volumes', label: 'Volumes', icon: HardDrive }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {service.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {service.image}
                </p>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {service.status === 'stopped' && (
              <button
                onClick={() => handleAction('start')}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                <Play className="h-4 w-4" />
                Start
              </button>
            )}
            
            {service.status === 'running' && (
              <>
                <button
                  onClick={() => handleAction('pause')}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </button>
                <button
                  onClick={() => handleAction('stop')}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </>
            )}
            
            {service.status === 'paused' && (
              <button
                onClick={() => handleAction('unpause')}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                <Play className="h-4 w-4" />
                Resume
              </button>
            )}
            
            <button
              onClick={() => handleAction('restart')}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Restart
            </button>
            
            <button
              onClick={() => setShowLogs(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
            >
              <Terminal className="h-4 w-4" />
              View Logs
            </button>
            
            <button
              onClick={() => handleAction('download-logs')}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
            >
              <Download className="h-4 w-4" />
              Export Logs
            </button>
            
            <button
              onClick={() => handleAction('delete')}
              className="inline-flex items-center gap-2 px-3 py-2 border border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metrics */}
                {service.status === 'running' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">CPU Usage</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {service.cpu?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Memory</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {service.memory ? (service.memory / 1024 / 1024).toFixed(0) : '0'}MB
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Uptime</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {service.uptime || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Ports */}
                {service.ports && service.ports.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Exposed Ports
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {service.ports.map((port, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded px-3 py-2 text-sm font-mono">
                          {port}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Networks */}
                {service.networks && service.networks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Networks</h4>
                    <div className="space-y-2">
                      {service.networks.map((network, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded px-3 py-2 text-sm">
                          {network}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Command */}
                {service.command && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Command</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded px-3 py-2 text-sm font-mono">
                      {service.command}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 max-h-80 overflow-y-auto">
                  {service.logs && service.logs.length > 0 ? (
                    service.logs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No logs available</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'env' && (
              <div>
                {service.env && Object.keys(service.env).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(service.env).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
                        <div className="font-mono text-sm">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{key}=</span>
                          <span className="text-gray-900 dark:text-gray-100">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No environment variables
                  </div>
                )}
              </div>
            )}

            {activeTab === 'volumes' && (
              <div>
                {service.volumes && service.volumes.length > 0 ? (
                  <div className="space-y-2">
                    {service.volumes.map((volume, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded px-3 py-2 font-mono text-sm">
                        {volume}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No volumes mounted
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}