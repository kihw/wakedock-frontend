'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useWebSocket } from './useWebSocket'
import { serviceApi } from '../services/service-api'
import { Service, ServiceStatus } from '../../models/domain/service'

export interface RealTimeUpdate {
    type: 'service_created' | 'service_updated' | 'service_deleted' | 'service_status_changed'
    data: Service | { id: string; status: ServiceStatus } | { id: string }
    timestamp: number
}

export interface RealTimeStats {
    totalServices: number
    runningServices: number
    stoppedServices: number
    totalContainers: number
    lastUpdate: number
}

export const useRealTimeUpdates = () => {
    const [services, setServices] = useState<Service[]>([])
    const [stats, setStats] = useState<RealTimeStats>({
        totalServices: 0,
        runningServices: 0,
        stoppedServices: 0,
        totalContainers: 0,
        lastUpdate: Date.now()
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const servicesRef = useRef<Service[]>([])

    // WebSocket connection
    const websocket = useWebSocket({
        url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
        reconnectInterval: 3000,
        maxReconnectAttempts: 10,
        heartbeatInterval: 30000
    })

    // Update stats based on services
    const updateStats = useCallback((servicesList: Service[]) => {
        const runningServices = servicesList.filter(s => s.status === 'running').length
        const stoppedServices = servicesList.filter(s => s.status === 'stopped').length
        const totalContainers = servicesList.reduce((sum, s) => sum + (s.containers?.length || 0), 0)

        setStats({
            totalServices: servicesList.length,
            runningServices,
            stoppedServices,
            totalContainers,
            lastUpdate: Date.now()
        })
    }, [])

    // Handle service creation
    const handleServiceCreated = useCallback((data: Service) => {
        setServices(prev => {
            const updated = [...prev, data]
            servicesRef.current = updated
            updateStats(updated)
            return updated
        })
    }, [updateStats])

    // Handle service updates
    const handleServiceUpdated = useCallback((data: Service) => {
        setServices(prev => {
            const updated = prev.map(service =>
                service.id === data.id ? { ...service, ...data } : service
            )
            servicesRef.current = updated
            updateStats(updated)
            return updated
        })
    }, [updateStats])

    // Handle service deletion
    const handleServiceDeleted = useCallback((data: { id: string }) => {
        setServices(prev => {
            const updated = prev.filter(service => service.id !== data.id)
            servicesRef.current = updated
            updateStats(updated)
            return updated
        })
    }, [updateStats])

    // Handle status changes
    const handleServiceStatusChanged = useCallback((data: { id: string; status: ServiceStatus }) => {
        setServices(prev => {
            const updated = prev.map(service =>
                service.id === data.id ? { ...service, status: data.status } : service
            )
            servicesRef.current = updated
            updateStats(updated)
            return updated
        })
    }, [updateStats])

    // Initial data load
    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await serviceApi.getServices()
            const data = response.items || []
            setServices(data)
            servicesRef.current = data
            updateStats(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des services')
        } finally {
            setIsLoading(false)
        }
    }, [updateStats])

    // Subscribe to WebSocket updates
    useEffect(() => {
        const unsubscribers = [
            websocket.subscribe('service_created', handleServiceCreated),
            websocket.subscribe('service_updated', handleServiceUpdated),
            websocket.subscribe('service_deleted', handleServiceDeleted),
            websocket.subscribe('service_status_changed', handleServiceStatusChanged)
        ]

        return () => {
            unsubscribers.forEach(unsubscribe => unsubscribe())
        }
    }, [websocket, handleServiceCreated, handleServiceUpdated, handleServiceDeleted, handleServiceStatusChanged])

    // Load initial data
    useEffect(() => {
        loadInitialData()
    }, [loadInitialData])

    // Manual refresh
    const refresh = useCallback(() => {
        loadInitialData()
    }, [loadInitialData])

    // Get service by ID
    const getServiceById = useCallback((id: string) => {
        return servicesRef.current.find(service => service.id === id)
    }, [])

    // Get services by status
    const getServicesByStatus = useCallback((status: ServiceStatus) => {
        return servicesRef.current.filter(service => service.status === status)
    }, [])

    // Get services by stack
    const getServicesByStack = useCallback((stackId: string) => {
        return servicesRef.current.filter(service => service.stack_id === stackId)
    }, [])

    return {
        services,
        stats,
        isLoading,
        error,
        websocket,
        refresh,
        getServiceById,
        getServicesByStatus,
        getServicesByStack
    }
}
