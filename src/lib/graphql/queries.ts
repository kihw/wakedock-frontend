/**
 * GraphQL queries for WakeDock
 */

// Container queries
export const GET_CONTAINERS = `
  query GetContainers($pagination: PaginationInput, $filter: FilterInput, $sort: SortInput) {
    containers(pagination: $pagination, filter: $filter, sort: $sort) {
      id
      name
      image
      status
      state
      created
      started
      finished
      ports {
        containerPort
        hostPort
        protocol
        hostIp
      }
      mounts {
        source
        destination
        type
        readOnly
      }
      labels
      envVars
      networks
      restartPolicy
      cpuPercent
      memoryUsage
      memoryLimit
      uptime
    }
  }
`;

export const GET_CONTAINER = `
  query GetContainer($containerId: String!) {
    container(containerId: $containerId) {
      id
      name
      image
      status
      state
      created
      started
      finished
      ports {
        containerPort
        hostPort
        protocol
        hostIp
      }
      mounts {
        source
        destination
        type
        readOnly
      }
      labels
      envVars
      networks
      restartPolicy
      cpuPercent
      memoryUsage
      memoryLimit
      uptime
    }
  }
`;

// Service queries
export const GET_SERVICES = `
  query GetServices($pagination: PaginationInput, $filter: FilterInput) {
    services(pagination: $pagination, filter: $filter) {
      id
      name
      image
      replicas
      status
      created
      updated
      ports {
        containerPort
        hostPort
        protocol
        hostIp
      }
      networks
      labels
      envVars
      constraints
      mode
      endpointMode
      runningReplicas
    }
  }
`;

export const GET_SERVICE = `
  query GetService($serviceId: String!) {
    service(serviceId: $serviceId) {
      id
      name
      image
      replicas
      status
      created
      updated
      ports {
        containerPort
        hostPort
        protocol
        hostIp
      }
      networks
      labels
      envVars
      constraints
      mode
      endpointMode
      runningReplicas
    }
  }
`;

// Network queries
export const GET_NETWORKS = `
  query GetNetworks {
    networks {
      id
      name
      driver
      scope
      internal
      attachable
      ingress
      ipamConfig {
        subnet
        gateway
        ipRange
      }
      containers
      services
      created
      labels
      connectedCount
    }
  }
`;

export const GET_NETWORK = `
  query GetNetwork($networkId: String!) {
    network(networkId: $networkId) {
      id
      name
      driver
      scope
      internal
      attachable
      ingress
      ipamConfig {
        subnet
        gateway
        ipRange
      }
      containers
      services
      created
      labels
      connectedCount
    }
  }
`;

// Volume queries
export const GET_VOLUMES = `
  query GetVolumes {
    volumes {
      name
      driver
      mountpoint
      created
      labels
      scope
      size
      usage
      usedByCount
    }
  }
`;

export const GET_VOLUME = `
  query GetVolume($volumeName: String!) {
    volume(volumeName: $volumeName) {
      name
      driver
      mountpoint
      created
      labels
      scope
      size
      usage
      usedByCount
    }
  }
`;

// System queries
export const GET_SYSTEM_INFO = `
  query GetSystemInfo {
    systemInfo {
      version
      apiVersion
      dockerVersion
      platform
      architecture
      cpuCount
      memoryTotal
      memoryAvailable
      diskTotal
      diskAvailable
      uptime
      containersRunning
      containersStopped
      containersPaused
      imagesCount
      volumesCount
      networksCount
      memoryUsagePercent
      diskUsagePercent
    }
  }
`;

export const GET_HEALTH_CHECK = `
  query GetHealthCheck {
    healthCheck {
      status
      timestamp
      duration
      services
      errors
      isHealthy
    }
  }
`;

export const GET_DASHBOARD_SUMMARY = `
  query GetDashboardSummary {
    dashboardSummary {
      containersCount
      servicesCount
      networksCount
      volumesCount
      runningContainers
      stoppedContainers
      totalMemoryUsage
      totalCpuUsage
      lastUpdated
    }
  }
`;

// Statistics queries
export const GET_CONTAINER_STATS = `
  query GetContainerStats($containerId: String!) {
    containerStats(containerId: $containerId) {
      containerId
      cpuPercent
      memoryUsage
      memoryLimit
      memoryPercent
      networkRxBytes
      networkTxBytes
      blockReadBytes
      blockWriteBytes
      timestamp
      memoryUsageMb
      memoryLimitMb
    }
  }
`;

export const GET_SERVICE_STATS = `
  query GetServiceStats($serviceId: String!) {
    serviceStats(serviceId: $serviceId) {
      serviceId
      replicasRunning
      replicasDesired
      tasksRunning
      tasksDesired
      cpuUsage
      memoryUsage
      networkIngress
      networkEgress
      timestamp
      replicaHealthPercent
    }
  }
`;

export const GET_NETWORK_STATS = `
  query GetNetworkStats {
    networkStats {
      networkId
      containersConnected
      servicesConnected
      totalRxBytes
      totalTxBytes
      packetsRx
      packetsTx
      timestamp
    }
  }
`;

export const GET_VOLUME_STATS = `
  query GetVolumeStats {
    volumeStats {
      volumeName
      sizeBytes
      usedBytes
      availableBytes
      usedByContainers
      timestamp
      usagePercent
      sizeMb
    }
  }
`;

// Combined queries for dashboard
export const GET_DASHBOARD_DATA = `
  query GetDashboardData {
    dashboardSummary {
      containersCount
      servicesCount
      networksCount
      volumesCount
      runningContainers
      stoppedContainers
      totalMemoryUsage
      totalCpuUsage
      lastUpdated
    }
    systemInfo {
      version
      dockerVersion
      platform
      architecture
      cpuCount
      memoryTotal
      memoryAvailable
      diskTotal
      diskAvailable
      uptime
      memoryUsagePercent
      diskUsagePercent
    }
    healthCheck {
      status
      timestamp
      duration
      services
      errors
      isHealthy
    }
    containers(pagination: { limit: 10 }) {
      id
      name
      image
      status
      created
      cpuPercent
      memoryUsage
      memoryLimit
    }
    services(pagination: { limit: 10 }) {
      id
      name
      image
      replicas
      status
      runningReplicas
    }
  }
`;

// Search queries
export const SEARCH_CONTAINERS = `
  query SearchContainers($query: String!, $limit: Int = 10) {
    containers(
      pagination: { limit: $limit }
      filter: { name: $query }
    ) {
      id
      name
      image
      status
      created
    }
  }
`;

export const SEARCH_SERVICES = `
  query SearchServices($query: String!, $limit: Int = 10) {
    services(
      pagination: { limit: $limit }
      filter: { name: $query }
    ) {
      id
      name
      image
      status
      replicas
    }
  }
`;

// Batch queries
export const GET_OVERVIEW_DATA = `
  query GetOverviewData {
    containers(pagination: { limit: 20 }) {
      id
      name
      image
      status
      created
      cpuPercent
      memoryUsage
    }
    services(pagination: { limit: 20 }) {
      id
      name
      image
      replicas
      status
      runningReplicas
    }
    networks {
      id
      name
      driver
      connectedCount
    }
    volumes {
      name
      driver
      size
      usedByCount
    }
    systemInfo {
      version
      dockerVersion
      containersRunning
      containersStopped
      imagesCount
      volumesCount
      networksCount
      memoryUsagePercent
      diskUsagePercent
    }
  }
`;

// Real-time queries with optimized fields
export const GET_REAL_TIME_STATS = `
  query GetRealTimeStats {
    systemInfo {
      memoryUsagePercent
      diskUsagePercent
      containersRunning
      containersStopped
    }
    containers(filter: { status: ["running"] }) {
      id
      name
      cpuPercent
      memoryUsage
      memoryLimit
    }
  }
`;

// Aggregated queries for analytics
export const GET_RESOURCE_USAGE = `
  query GetResourceUsage {
    containers {
      id
      name
      cpuPercent
      memoryUsage
      memoryLimit
    }
    systemInfo {
      cpuCount
      memoryTotal
      memoryAvailable
      diskTotal
      diskAvailable
    }
    containerStats {
      containerId
      cpuPercent
      memoryUsage
      memoryLimit
      networkRxBytes
      networkTxBytes
      timestamp
    }
  }
`;

// Export all queries
export const QUERIES = {
  GET_CONTAINERS,
  GET_CONTAINER,
  GET_SERVICES,
  GET_SERVICE,
  GET_NETWORKS,
  GET_NETWORK,
  GET_VOLUMES,
  GET_VOLUME,
  GET_SYSTEM_INFO,
  GET_HEALTH_CHECK,
  GET_DASHBOARD_SUMMARY,
  GET_CONTAINER_STATS,
  GET_SERVICE_STATS,
  GET_NETWORK_STATS,
  GET_VOLUME_STATS,
  GET_DASHBOARD_DATA,
  SEARCH_CONTAINERS,
  SEARCH_SERVICES,
  GET_OVERVIEW_DATA,
  GET_REAL_TIME_STATS,
  GET_RESOURCE_USAGE,
};