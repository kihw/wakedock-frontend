// Ultra simplified service details for v0.6.4
'use client';

import React from 'react';
import { Service } from '@/lib/types/service';
import { X } from 'lucide-react';

interface ServiceDetailsProps {
    service: Service;
    onClose: () => void;
    onAction: (serviceId: string, action: string) => void;
}

export function ServiceDetails({ service, onClose }: ServiceDetailsProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{service.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <strong>Status:</strong>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${service.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {service.status}
                        </span>
                    </div>

                    <div>
                        <strong>Health:</strong>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${service.health_status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {service.health_status}
                        </span>
                    </div>

                    <div>
                        <strong>Image:</strong>
                        <span className="ml-2 font-mono text-sm">{service.image}</span>
                    </div>

                    <div>
                        <strong>ID:</strong>
                        <span className="ml-2 font-mono text-sm">{service.id}</span>
                    </div>

                    {service.ports && service.ports.length > 0 && (
                        <div>
                            <strong>Ports:</strong>
                            <div className="mt-1 space-y-1">
                                {service.ports.map((port, index) => (
                                    <div key={index} className="bg-gray-50 p-2 rounded text-sm font-mono">
                                        {port.host_port}:{port.container_port}/{port.protocol}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {service.environment && Object.keys(service.environment).length > 0 && (
                        <div>
                            <strong>Environment:</strong>
                            <div className="mt-1 space-y-1">
                                {Object.entries(service.environment).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-2 rounded text-sm font-mono">
                                        {key}={value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
