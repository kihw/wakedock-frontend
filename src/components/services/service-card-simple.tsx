// Simplified service card for v0.6.4
'use client';

import React from 'react';
import { Service } from '@/lib/types/service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    Play,
    Square,
    RefreshCw,
    Clock
} from 'lucide-react';

interface ServiceCardProps {
    service: Service;
    onSelect: () => void;
    onAction: (serviceId: string, action: string) => void;
}

export function ServiceCard({ service, onSelect, onAction }: ServiceCardProps) {
    const getStatusColor = (status: Service['status']) => {
        switch (status) {
            case 'running':
                return 'bg-green-100 text-green-800';
            case 'stopped':
                return 'bg-red-100 text-red-800';
            case 'starting':
                return 'bg-yellow-100 text-yellow-800';
            case 'stopping':
                return 'bg-orange-100 text-orange-800';
            case 'restarting':
                return 'bg-blue-100 text-blue-800';
            case 'paused':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{service.name}</CardTitle>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                        {service.status}
                    </span>
                </div>
                <p className="text-sm text-gray-600 font-mono">{service.image}</p>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    {/* Ports */}
                    {service.ports && service.ports.length > 0 && (
                        <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Ports</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {service.ports.slice(0, 3).map((port, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {port.host_port}:{port.container_port}
                                    </span>
                                ))}
                                {service.ports.length > 3 && (
                                    <span className="text-xs text-gray-500">+{service.ports.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Health Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Health</span>
                        <span className={`text-xs px-2 py-1 rounded ${service.health_status === 'healthy'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {service.health_status}
                        </span>
                    </div>

                    {/* Created */}
                    <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Created: {new Date(service.created_at).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                        {service.status === 'running' && (
                            <>
                                <button
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction(service.id, 'stop');
                                    }}
                                >
                                    <Square className="h-3 w-3" />
                                    Stop
                                </button>
                                <button
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction(service.id, 'restart');
                                    }}
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Restart
                                </button>
                            </>
                        )}
                        {service.status === 'stopped' && (
                            <button
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(service.id, 'start');
                                }}
                            >
                                <Play className="h-3 w-3" />
                                Start
                            </button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
