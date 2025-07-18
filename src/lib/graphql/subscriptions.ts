/**
 * GraphQL subscriptions for WakeDock
 */

// Container subscriptions
export const CONTAINER_EVENTS = `
  subscription ContainerEvents($containerId: String) {
    containerEvents(containerId: $containerId) {
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
      cpuPercent
      memoryUsage
      memoryLimit
      uptime
    }
  }
`;

export const CONTAINER_STATS_STREAM = `
  subscription ContainerStatsStream($containerId: String!) {
    containerStatsStream(containerId: $containerId) {
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

// Service subscriptions
export const SERVICE_EVENTS = `
  subscription ServiceEvents($serviceId: String) {
    serviceEvents(serviceId: $serviceId) {
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

export const SERVICE_STATS_STREAM = `
  subscription ServiceStatsStream($serviceId: String!) {
    serviceStatsStream(serviceId: $serviceId) {
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

// System subscriptions
export const SYSTEM_METRICS = `
  subscription SystemMetrics {
    systemMetrics {
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

export const HEALTH_CHECK_STREAM = `
  subscription HealthCheckStream {
    healthCheckStream {
      status
      timestamp
      duration
      services
      errors
      isHealthy
    }
  }
`;

// Docker events subscription
export const DOCKER_EVENTS = `
  subscription DockerEvents($eventTypes: [String!]) {
    dockerEvents(eventTypes: $eventTypes) {
      type
      action
      actor {
        id
        attributes
      }
      time
      timeNano
      scope
    }
  }
`;

// Resource monitoring subscriptions
export const RESOURCE_USAGE_STREAM = `
  subscription ResourceUsageStream {
    resourceUsageStream {
      timestamp
      cpu {
        totalPercent
        containerUsage {
          containerId
          name
          cpuPercent
        }
      }
      memory {
        totalUsed
        totalAvailable
        usagePercent
        containerUsage {
          containerId
          name
          memoryUsage
          memoryLimit
          memoryPercent
        }
      }
      disk {
        totalUsed
        totalAvailable
        usagePercent
      }
      network {
        totalRx
        totalTx
        containerUsage {
          containerId
          name
          networkRx
          networkTx
        }
      }
    }
  }
`;

// Log streaming subscriptions
export const LOG_STREAM = `
  subscription LogStream($containerId: String!, $tail: Int = 100, $follow: Boolean = true) {
    logStream(containerId: $containerId, tail: $tail, follow: $follow) {
      containerId
      containerName
      timestamp
      level
      message
      source
      stream
    }
  }
`;

export const SERVICE_LOG_STREAM = `
  subscription ServiceLogStream($serviceId: String!, $tail: Int = 100, $follow: Boolean = true) {
    serviceLogStream(serviceId: $serviceId, tail: $tail, follow: $follow) {
      serviceId
      serviceName
      taskId
      timestamp
      level
      message
      source
      stream
    }
  }
`;

// Network monitoring subscriptions
export const NETWORK_STATS_STREAM = `
  subscription NetworkStatsStream {
    networkStatsStream {
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

// Volume monitoring subscriptions
export const VOLUME_STATS_STREAM = `
  subscription VolumeStatsStream {
    volumeStatsStream {
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

// Deployment subscriptions
export const DEPLOYMENT_PROGRESS = `
  subscription DeploymentProgress($deploymentId: String!) {
    deploymentProgress(deploymentId: $deploymentId) {
      deploymentId
      status
      progress
      currentStep
      totalSteps
      stepDescription
      errors
      warnings
      timestamp
    }
  }
`;

// Swarm subscriptions
export const SWARM_EVENTS = `
  subscription SwarmEvents {
    swarmEvents {
      type
      action
      actor {
        id
        attributes
      }
      time
      scope
    }
  }
`;

export const SWARM_NODE_EVENTS = `
  subscription SwarmNodeEvents {
    swarmNodeEvents {
      nodeId
      hostname
      role
      status
      availability
      leader
      timestamp
      event
    }
  }
`;

// Alert subscriptions
export const ALERT_STREAM = `
  subscription AlertStream {
    alertStream {
      id
      severity
      title
      message
      source
      resourceId
      resourceType
      timestamp
      acknowledged
      resolved
      metadata
    }
  }
`;

// Audit log subscriptions
export const AUDIT_LOG_STREAM = `
  subscription AuditLogStream {
    auditLogStream {
      id
      userId
      username
      action
      resource
      resourceId
      details
      timestamp
      ipAddress
      userAgent
      success
    }
  }
`;

// Backup progress subscriptions
export const BACKUP_PROGRESS = `
  subscription BackupProgress($backupId: String!) {
    backupProgress(backupId: $backupId) {
      backupId
      status
      progress
      currentStep
      totalSteps
      stepDescription
      bytesProcessed
      totalBytes
      estimatedTimeRemaining
      timestamp
    }
  }
`;

// Restore progress subscriptions
export const RESTORE_PROGRESS = `
  subscription RestoreProgress($restoreId: String!) {
    restoreProgress(restoreId: $restoreId) {
      restoreId
      status
      progress
      currentStep
      totalSteps
      stepDescription
      bytesProcessed
      totalBytes
      estimatedTimeRemaining
      timestamp
    }
  }
`;

// Image pull progress subscriptions
export const IMAGE_PULL_PROGRESS = `
  subscription ImagePullProgress($imageName: String!, $tag: String = "latest") {
    imagePullProgress(imageName: $imageName, tag: $tag) {
      imageName
      tag
      status
      progress
      progressDetail {
        current
        total
      }
      id
      timestamp
    }
  }
`;

// Registry events subscriptions
export const REGISTRY_EVENTS = `
  subscription RegistryEvents {
    registryEvents {
      type
      registry
      repository
      tag
      digest
      timestamp
      metadata
    }
  }
`;

// Dashboard real-time updates
export const DASHBOARD_UPDATES = `
  subscription DashboardUpdates {
    dashboardUpdates {
      containersCount
      servicesCount
      networksCount
      volumesCount
      runningContainers
      stoppedContainers
      totalMemoryUsage
      totalCpuUsage
      lastUpdated
      activeAlerts
      systemHealth
      resourceAlerts {
        type
        severity
        message
        value
        threshold
      }
    }
  }
`;

// Combined subscriptions for efficiency
export const REAL_TIME_DASHBOARD = `
  subscription RealTimeDashboard {
    systemMetrics {
      memoryUsagePercent
      diskUsagePercent
      containersRunning
      containersStopped
    }
    containerEvents {
      id
      name
      status
      cpuPercent
      memoryUsage
    }
    serviceEvents {
      id
      name
      status
      replicas
      runningReplicas
    }
    alertStream {
      id
      severity
      title
      message
      timestamp
    }
  }
`;

// Export all subscriptions
export const SUBSCRIPTIONS = {
  CONTAINER_EVENTS,
  CONTAINER_STATS_STREAM,
  SERVICE_EVENTS,
  SERVICE_STATS_STREAM,
  SYSTEM_METRICS,
  HEALTH_CHECK_STREAM,
  DOCKER_EVENTS,
  RESOURCE_USAGE_STREAM,
  LOG_STREAM,
  SERVICE_LOG_STREAM,
  NETWORK_STATS_STREAM,
  VOLUME_STATS_STREAM,
  DEPLOYMENT_PROGRESS,
  SWARM_EVENTS,
  SWARM_NODE_EVENTS,
  ALERT_STREAM,
  AUDIT_LOG_STREAM,
  BACKUP_PROGRESS,
  RESTORE_PROGRESS,
  IMAGE_PULL_PROGRESS,
  REGISTRY_EVENTS,
  DASHBOARD_UPDATES,
  REAL_TIME_DASHBOARD,
};