'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import {
  Network,
  Wifi,
  WifiOff,
  Globe,
  Router,
  Server,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Filter,
  Search,
  MoreHorizontal,
  Zap,
  Link,
  Link2Off,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Gauge,
  Database
} from 'lucide-react'

export type NetworkInterfaceStatus = 'up' | 'down' | 'unknown'
export type NetworkType = 'ethernet' | 'wifi' | 'loopback' | 'bridge' | 'docker' | 'vpn'

export interface NetworkInterface {
  name: string
  type: NetworkType
  status: NetworkInterfaceStatus
  ip: string
  subnet: string
  gateway?: string
  dns?: string[]
  mac: string
  speed: number
  duplex: 'full' | 'half' | 'unknown'
  mtu: number
  rxBytes: number
  txBytes: number
  rxPackets: number
  txPackets: number
  rxErrors: number
  txErrors: number
  rxDropped: number
  txDropped: number
  rxRate: number
  txRate: number
  lastSeen: string
}

export interface NetworkConnection {
  id: string
  protocol: 'tcp' | 'udp' | 'icmp'
  localAddress: string
  localPort: number
  remoteAddress: string
  remotePort: number
  state: 'established' | 'listening' | 'closed' | 'time_wait' | 'close_wait'
  process?: string
  pid?: number
}

export interface NetworkStatusProps {
  interfaces: NetworkInterface[]
  connections?: NetworkConnection[]
  gateway?: {
    ip: string
    reachable: boolean
    latency: number
  }
  dns?: {
    servers: string[]
    working: boolean
    latency: number
  }
  loading?: boolean
  error?: string
  autoRefresh?: boolean
  refreshInterval?: number
  showDetails?: boolean
  showConnections?: boolean
  onRefresh?: () => void
  onInterfaceClick?: (networkInterface: NetworkInterface) => void
  onConnectionClick?: (connection: NetworkConnection) => void
  onToggleInterface?: (interfaceName: string) => void
  className?: string
}

const interfaceTypeConfig = {
  ethernet: {
    icon: Network,
    label: 'Ethernet',
    color: 'text-blue-600 dark:text-blue-400',
  },
  wifi: {
    icon: Wifi,
    label: 'WiFi',
    color: 'text-green-600 dark:text-green-400',
  },
  loopback: {
    icon: Router,
    label: 'Loopback',
    color: 'text-gray-600 dark:text-gray-400',
  },
  bridge: {
    icon: Link,
    label: 'Bridge',
    color: 'text-purple-600 dark:text-purple-400',
  },
  docker: {
    icon: Database,
    label: 'Docker',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  vpn: {
    icon: Shield,
    label: 'VPN',
    color: 'text-orange-600 dark:text-orange-400',
  },
}

const statusConfig = {
  up: {
    icon: CheckCircle,
    label: 'Up',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
  },
  down: {
    icon: XCircle,
    label: 'Down',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
  unknown: {
    icon: AlertTriangle,
    label: 'Unknown',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
}

const connectionStateConfig = {
  established: {
    label: 'Established',
    color: 'text-green-600 dark:text-green-400',
  },
  listening: {
    label: 'Listening',
    color: 'text-blue-600 dark:text-blue-400',
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-600 dark:text-gray-400',
  },
  time_wait: {
    label: 'Time Wait',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  close_wait: {
    label: 'Close Wait',
    color: 'text-orange-600 dark:text-orange-400',
  },
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  interfaces,
  connections = [],
  gateway,
  dns,
  loading = false,
  error,
  autoRefresh = true,
  refreshInterval = 10000,
  showDetails = false,
  showConnections = false,
  onRefresh,
  onInterfaceClick,
  onConnectionClick,
  onToggleInterface,
  className,
}) => {
  const [selectedInterface, setSelectedInterface] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<NetworkType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<NetworkInterfaceStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }

  const formatRate = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s'
  }

  const getSignalStrength = (rxRate: number, txRate: number) => {
    const totalRate = rxRate + txRate
    const mbps = totalRate / (1024 * 1024)

    if (mbps > 100) return { icon: SignalHigh, level: 'high', color: 'text-green-500' }
    if (mbps > 10) return { icon: SignalMedium, level: 'medium', color: 'text-yellow-500' }
    if (mbps > 1) return { icon: SignalLow, level: 'low', color: 'text-orange-500' }
    return { icon: Signal, level: 'none', color: 'text-red-500' }
  }

  const filteredInterfaces = useMemo(() => {
    let filtered = interfaces

    if (filterType !== 'all') {
      filtered = filtered.filter(iface => iface.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(iface => iface.status === filterStatus)
    }

    if (searchQuery) {
      filtered = filtered.filter(iface =>
        iface.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        iface.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        iface.mac.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [interfaces, filterType, filterStatus, searchQuery])

  const activeInterfaces = interfaces.filter(iface => iface.status === 'up')
  const totalRxRate = interfaces.reduce((sum, iface) => sum + iface.rxRate, 0)
  const totalTxRate = interfaces.reduce((sum, iface) => sum + iface.txRate, 0)

  const renderInterfaceCard = (iface: NetworkInterface) => {
    const typeConfig = interfaceTypeConfig[iface.type]
    const statusConf = statusConfig[iface.status]
    const TypeIcon = typeConfig.icon
    const StatusIcon = statusConf.icon
    const signal = getSignalStrength(iface.rxRate, iface.txRate)
    const SignalIcon = signal.icon

    return (
      <div
        key={iface.name}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700',
          'hover:shadow-md transition-all duration-200',
          onInterfaceClick && 'cursor-pointer',
          selectedInterface === iface.name && 'ring-2 ring-blue-500'
        )}
        onClick={() => {
          onInterfaceClick?.(iface)
          setSelectedInterface(selectedInterface === iface.name ? null : iface.name)
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <TypeIcon className={cn('h-5 w-5', typeConfig.color)} />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{iface.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{typeConfig.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SignalIcon className={cn('h-4 w-4', signal.color)} />
            <div className={cn('px-2 py-1 rounded-full text-xs font-medium', statusConf.bg, statusConf.color)}>
              {statusConf.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">IP:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{iface.ip}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">MAC:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{iface.mac}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="text-green-600 dark:text-green-400">
              ↓ {formatRate(iface.rxRate)}
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              ↑ {formatRate(iface.txRate)}
            </div>
          </div>

          {(iface.rxErrors > 0 || iface.txErrors > 0) && (
            <div className="text-red-500 text-xs">
              {iface.rxErrors + iface.txErrors} errors
            </div>
          )}
        </div>

        {showDetails && selectedInterface === iface.name && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Subnet:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{iface.subnet}</span>
              </div>
              {iface.gateway && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Gateway:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{iface.gateway}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500 dark:text-gray-400">Speed:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{iface.speed} Mbps</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">MTU:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{iface.mtu}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">RX Packets:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{iface.rxPackets.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">TX Packets:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{iface.txPackets.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">RX Bytes:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{formatBytes(iface.rxBytes)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">TX Bytes:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{formatBytes(iface.txBytes)}</span>
              </div>
            </div>

            {iface.dns && iface.dns.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-500 dark:text-gray-400">DNS:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{iface.dns.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderConnectionRow = (connection: NetworkConnection) => {
    const stateConfig = connectionStateConfig[connection.state]

    return (
      <div
        key={connection.id}
        className={cn(
          'flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg',
          'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
          onConnectionClick && 'cursor-pointer'
        )}
        onClick={() => onConnectionClick?.(connection)}
      >
        <div className="flex items-center gap-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {connection.protocol}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900 dark:text-white">
              {connection.localAddress}:{connection.localPort}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {connection.remoteAddress}:{connection.remotePort}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {connection.process && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {connection.process}
            </div>
          )}

          <div className={cn('text-xs font-medium', stateConfig.color)}>
            {stateConfig.label}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('space-y-6 animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <WifiOff className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Network Status
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Network className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Network Status
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeInterfaces.length} of {interfaces.length} interfaces active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
          </button>

          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatRate(totalRxRate)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Download</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatRate(totalTxRate)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Upload</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {gateway?.reachable ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {gateway?.reachable ? `${gateway.latency}ms` : 'No Gateway'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search interfaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as NetworkType | 'all')}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                {Object.entries(interfaceTypeConfig).map(([type, config]) => (
                  <option key={type} value={type}>{config.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as NetworkInterfaceStatus | 'all')}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Network Interfaces */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Network Interfaces
        </h4>

        {filteredInterfaces.length === 0 ? (
          <div className="text-center py-8">
            <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No interfaces found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or check your network configuration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInterfaces.map(renderInterfaceCard)}
          </div>
        )}
      </div>

      {/* Gateway & DNS Status */}
      {(gateway || dns) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gateway && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Router className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">Gateway</h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">IP Address:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{gateway.ip}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <div className="flex items-center gap-2">
                    {gateway.reachable ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {gateway.reachable ? 'Reachable' : 'Unreachable'}
                    </span>
                  </div>
                </div>

                {gateway.reachable && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Latency:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{gateway.latency}ms</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {dns && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">DNS</h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <div className="flex items-center gap-2">
                    {dns.working ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {dns.working ? 'Working' : 'Not Working'}
                    </span>
                  </div>
                </div>

                {dns.working && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Latency:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{dns.latency}ms</span>
                  </div>
                )}

                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Servers:</span>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white">
                    {dns.servers.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Network Connections */}
      {showConnections && connections.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Active Connections ({connections.length})
          </h4>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {connections.map(renderConnectionRow)}
          </div>
        </div>
      )}
    </div>
  )
}

export default NetworkStatus