// ServiceCard Component - Molecule (MVC Architecture)
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Square,
    RotateCcw,
    Wrench,
    MoreHorizontal,
    ExternalLink,
    Activity,
    HardDrive,
    Cpu,
    Clock
} from 'lucide-react';

import { Service } from '@/models/domain/service';
import { Card, CardContent, CardHeader, CardTitle } from '@/views/atoms/Card';
import { Button } from '@/views/atoms/Button';
import { Badge, StatusBadge } from '@/views/atoms/Badge';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
    service: Service;
    onStart?: (serviceId: string) => void;
    onStop?: (serviceId: string) => void;
    onRestart?: (serviceId: string) => void;
    onRebuild?: (serviceId: string) => void;
    onViewDetails?: (serviceId: string) => void;
    loading?: boolean;
    selected?: boolean;
    onSelect?: (serviceId: string, selected: boolean) => void;
    compact?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    onStart,
    onStop,
    onRestart,
    onRebuild,
    onViewDetails,
    loading = false,
    selected = false,
    onSelect,
    compact = false,
}) => {
    const [showActions, setShowActions] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleAction = async (action: string, handler?: (serviceId: string) => void) => {
        if (!handler) return;

        setActionLoading(action);
        try {
            await handler(service.id);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'text-green-500';
            case 'stopped':
                return 'text-gray-500';
            case 'error':
                return 'text-red-500';
            case 'starting':
            case 'stopping':
                return 'text-yellow-500';
            default:
                return 'text-gray-500';
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatUptime = (createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diff = now.getTime() - created.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h`;
        return '< 1h';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="relative"
        >
            <Card
                variant="default"
                surface="elevated"
                depth={2}
                interaction="hover"
                padding={compact ? 'sm' : 'md'}
                className={cn(
                    'transition-all duration-300 hover:shadow-lg',
                    selected && 'ring-2 ring-indigo-500 ring-offset-2',
                    loading && 'opacity-50 pointer-events-none'
                )}
            >
                <CardHeader className={cn('pb-2', compact && 'pb-1')}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {onSelect && (
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={(e) => onSelect(service.id, e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg font-semibold truncate">
                                    {service.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <StatusBadge
                                        status={service.status === 'starting' || service.status === 'stopping' ? 'pending' : service.status}
                                        size="sm"
                                        className="capitalize"
                                    >
                                        {service.status}
                                    </StatusBadge>
                                    {service.subdomain && (
                                        <Badge variant="secondary" size="sm">
                                            {service.subdomain}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {onViewDetails && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onViewDetails(service.id)}
                                    icon={<ExternalLink className="w-4 h-4" />}
                                />
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowActions(!showActions)}
                                icon={<MoreHorizontal className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className={cn('pt-2', compact && 'pt-1')}>
                    {/* Service Info */}
                    <div className="space-y-3">
                        {service.docker_image && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <HardDrive className="w-4 h-4" />
                                <span className="truncate">{service.docker_image}</span>
                            </div>
                        )}

                        {service.ports && service.ports.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {service.ports.map((port, index) => (
                                    <Badge key={index} variant="secondary" size="sm">
                                        {port}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Resource Usage */}
                        {service.resource_usage && !compact && (
                            <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                        <Cpu className="w-4 h-4" />
                                        <span>CPU</span>
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {service.resource_usage.cpu_percent.toFixed(1)}%
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                        <Activity className="w-4 h-4" />
                                        <span>Memory</span>
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {formatBytes(service.resource_usage.memory_usage)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        <span>Uptime</span>
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {formatUptime(service.created_at)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <AnimatePresence>
                            {showActions && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700"
                                >
                                    {service.status === 'stopped' && onStart && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleAction('start', onStart)}
                                            loading={actionLoading === 'start'}
                                            icon={<Play className="w-4 h-4" />}
                                        >
                                            Start
                                        </Button>
                                    )}

                                    {service.status === 'running' && onStop && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleAction('stop', onStop)}
                                            loading={actionLoading === 'stop'}
                                            icon={<Square className="w-4 h-4" />}
                                        >
                                            Stop
                                        </Button>
                                    )}

                                    {onRestart && (
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => handleAction('restart', onRestart)}
                                            loading={actionLoading === 'restart'}
                                            icon={<RotateCcw className="w-4 h-4" />}
                                        >
                                            Restart
                                        </Button>
                                    )}

                                    {onRebuild && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleAction('rebuild', onRebuild)}
                                            loading={actionLoading === 'rebuild'}
                                            icon={<Wrench className="w-4 h-4" />}
                                        >
                                            Rebuild
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
