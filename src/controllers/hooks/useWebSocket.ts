'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useToast } from './useToast'

export interface WebSocketMessage {
    type: string
    data: any
    timestamp: number
}

export interface WebSocketConfig {
    url: string
    reconnectInterval?: number
    maxReconnectAttempts?: number
    heartbeatInterval?: number
    protocols?: string[]
}

export interface WebSocketState {
    isConnected: boolean
    isConnecting: boolean
    isReconnecting: boolean
    reconnectAttempts: number
    lastMessage: WebSocketMessage | null
    connectionError: string | null
}

export const useWebSocket = (config: WebSocketConfig) => {
    const { addToast } = useToast()
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const messageQueueRef = useRef<WebSocketMessage[]>([])

    const [state, setState] = useState<WebSocketState>({
        isConnected: false,
        isConnecting: false,
        isReconnecting: false,
        reconnectAttempts: 0,
        lastMessage: null,
        connectionError: null
    })

    const {
        url,
        reconnectInterval = 5000,
        maxReconnectAttempts = 10,
        heartbeatInterval = 30000,
        protocols = []
    } = config

    // Message handlers
    const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map())

    const subscribe = useCallback((messageType: string, handler: (data: any) => void) => {
        messageHandlers.current.set(messageType, handler)

        return () => {
            messageHandlers.current.delete(messageType)
        }
    }, [])

    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message))
        } else {
            // Queue message for when connection is established
            messageQueueRef.current.push(message)
        }
    }, [])

    const sendHeartbeat = useCallback(() => {
        sendMessage({
            type: 'heartbeat',
            data: { timestamp: Date.now() },
            timestamp: Date.now()
        })
    }, [sendMessage])

    const clearTimeouts = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current)
            heartbeatIntervalRef.current = null
        }
    }, [])

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return
        }

        setState(prev => ({
            ...prev,
            isConnecting: true,
            connectionError: null
        }))

        try {
            wsRef.current = new WebSocket(url, protocols)

            wsRef.current.onopen = () => {
                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    isConnecting: false,
                    isReconnecting: false,
                    reconnectAttempts: 0,
                    connectionError: null
                }))

                // Send queued messages
                while (messageQueueRef.current.length > 0) {
                    const message = messageQueueRef.current.shift()
                    if (message) {
                        wsRef.current?.send(JSON.stringify(message))
                    }
                }

                // Start heartbeat
                if (heartbeatInterval > 0) {
                    heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval)
                }

                addToast('WebSocket connecté', 'success')
            }

            wsRef.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data)

                    setState(prev => ({ ...prev, lastMessage: message }))

                    // Handle message based on type
                    const handler = messageHandlers.current.get(message.type)
                    if (handler) {
                        handler(message.data)
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error)
                }
            }

            wsRef.current.onclose = () => {
                setState(prev => ({ ...prev, isConnected: false, isConnecting: false }))
                clearTimeouts()

                // Attempt reconnection if not manually closed
                if (state.reconnectAttempts < maxReconnectAttempts) {
                    setState(prev => ({
                        ...prev,
                        isReconnecting: true,
                        reconnectAttempts: prev.reconnectAttempts + 1
                    }))

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect()
                    }, reconnectInterval)

                    addToast(`Reconnexion WebSocket... (${state.reconnectAttempts + 1}/${maxReconnectAttempts})`, 'warning')
                } else {
                    setState(prev => ({
                        ...prev,
                        connectionError: 'Nombre maximum de tentatives de reconnexion atteint'
                    }))
                    addToast('Connexion WebSocket perdue', 'error')
                }
            }

            wsRef.current.onerror = (error) => {
                setState(prev => ({
                    ...prev,
                    connectionError: 'Erreur de connexion WebSocket'
                }))
                console.error('WebSocket error:', error)
            }

        } catch (error) {
            setState(prev => ({
                ...prev,
                isConnecting: false,
                connectionError: 'Impossible de créer la connexion WebSocket'
            }))
            console.error('WebSocket connection error:', error)
        }
    }, [url, protocols, heartbeatInterval, reconnectInterval, maxReconnectAttempts, state.reconnectAttempts, sendHeartbeat, addToast])

    const disconnect = useCallback(() => {
        clearTimeouts()

        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        setState({
            isConnected: false,
            isConnecting: false,
            isReconnecting: false,
            reconnectAttempts: 0,
            lastMessage: null,
            connectionError: null
        })
    }, [clearTimeouts])

    const reconnect = useCallback(() => {
        disconnect()
        setState(prev => ({ ...prev, reconnectAttempts: 0 }))
        connect()
    }, [disconnect, connect])

    // Auto-connect on mount
    useEffect(() => {
        connect()

        return () => {
            disconnect()
        }
    }, []) // Only run once on mount

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeouts()
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [clearTimeouts])

    return {
        ...state,
        connect,
        disconnect,
        reconnect,
        sendMessage,
        subscribe
    }
}
