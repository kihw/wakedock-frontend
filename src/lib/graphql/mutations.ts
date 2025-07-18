/**
 * GraphQL mutations for WakeDock
 */

// Container mutations
export const START_CONTAINER = `
  mutation StartContainer($containerId: String!) {
    startContainer(containerId: $containerId) {
      id
      name
      status
      state
      started
      uptime
    }
  }
`;

export const STOP_CONTAINER = `
  mutation StopContainer($containerId: String!) {
    stopContainer(containerId: $containerId) {
      id
      name
      status
      state
      finished
    }
  }
`;

export const RESTART_CONTAINER = `
  mutation RestartContainer($containerId: String!) {
    restartContainer(containerId: $containerId) {
      id
      name
      status
      state
      started
      uptime
    }
  }
`;

export const REMOVE_CONTAINER = `
  mutation RemoveContainer($containerId: String!, $force: Boolean = false) {
    removeContainer(containerId: $containerId, force: $force)
  }
`;

export const CREATE_CONTAINER = `
  mutation CreateContainer($containerInput: ContainerInput!) {
    createContainer(containerInput: $containerInput) {
      id
      name
      image
      status
      state
      created
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
    }
  }
`;

// Service mutations
export const CREATE_SERVICE = `
  mutation CreateService($serviceInput: ServiceInput!) {
    createService(serviceInput: $serviceInput) {
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

export const UPDATE_SERVICE = `
  mutation UpdateService($serviceId: String!, $serviceInput: ServiceInput!) {
    updateService(serviceId: $serviceId, serviceInput: $serviceInput) {
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

export const DELETE_SERVICE = `
  mutation DeleteService($serviceId: String!) {
    deleteService(serviceId: $serviceId)
  }
`;

export const SCALE_SERVICE = `
  mutation ScaleService($serviceId: String!, $replicas: Int!) {
    updateService(serviceId: $serviceId, serviceInput: { replicas: $replicas }) {
      id
      name
      replicas
      runningReplicas
      status
      updated
    }
  }
`;

// Network mutations
export const CREATE_NETWORK = `
  mutation CreateNetwork($networkInput: NetworkInput!) {
    createNetwork(networkInput: $networkInput) {
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

export const REMOVE_NETWORK = `
  mutation RemoveNetwork($networkId: String!) {
    removeNetwork(networkId: $networkId)
  }
`;

export const CONNECT_CONTAINER_TO_NETWORK = `
  mutation ConnectContainerToNetwork($containerId: String!, $networkId: String!) {
    connectContainerToNetwork(containerId: $containerId, networkId: $networkId) {
      id
      name
      networks
    }
  }
`;

export const DISCONNECT_CONTAINER_FROM_NETWORK = `
  mutation DisconnectContainerFromNetwork($containerId: String!, $networkId: String!) {
    disconnectContainerFromNetwork(containerId: $containerId, networkId: $networkId) {
      id
      name
      networks
    }
  }
`;

// Volume mutations
export const CREATE_VOLUME = `
  mutation CreateVolume($volumeInput: VolumeInput!) {
    createVolume(volumeInput: $volumeInput) {
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

export const REMOVE_VOLUME = `
  mutation RemoveVolume($volumeName: String!, $force: Boolean = false) {
    removeVolume(volumeName: $volumeName, force: $force)
  }
`;

export const PRUNE_VOLUMES = `
  mutation PruneVolumes {
    pruneVolumes {
      volumesDeleted
      spaceReclaimed
    }
  }
`;

// System mutations
export const PRUNE_SYSTEM = `
  mutation PruneSystem {
    pruneSystem {
      containersDeleted
      networksDeleted
      volumesDeleted
      imagesDeleted
      totalSpaceReclaimed
    }
  }
`;

export const RESTART_DOCKER = `
  mutation RestartDocker {
    restartDocker {
      success
      message
    }
  }
`;

// Batch mutations
export const BATCH_CONTAINER_ACTIONS = `
  mutation BatchContainerActions($actions: [ContainerActionInput!]!) {
    batchContainerActions(actions: $actions) {
      containerId
      action
      success
      error
      result {
        id
        name
        status
        state
      }
    }
  }
`;

export const BATCH_SERVICE_ACTIONS = `
  mutation BatchServiceActions($actions: [ServiceActionInput!]!) {
    batchServiceActions(actions: $actions) {
      serviceId
      action
      success
      error
      result {
        id
        name
        status
        replicas
        runningReplicas
      }
    }
  }
`;

// Docker Compose mutations
export const DEPLOY_COMPOSE_STACK = `
  mutation DeployComposeStack($stackName: String!, $composeFile: String!, $envVars: [String!]) {
    deployComposeStack(stackName: $stackName, composeFile: $composeFile, envVars: $envVars) {
      stackName
      services {
        id
        name
        image
        status
        replicas
        runningReplicas
      }
      networks {
        id
        name
        driver
      }
      volumes {
        name
        driver
      }
      deploymentStatus
      errors
    }
  }
`;

export const REMOVE_COMPOSE_STACK = `
  mutation RemoveComposeStack($stackName: String!) {
    removeComposeStack(stackName: $stackName) {
      success
      message
      servicesRemoved
      networksRemoved
      volumesRemoved
    }
  }
`;

export const UPDATE_COMPOSE_STACK = `
  mutation UpdateComposeStack($stackName: String!, $composeFile: String!, $envVars: [String!]) {
    updateComposeStack(stackName: $stackName, composeFile: $composeFile, envVars: $envVars) {
      stackName
      services {
        id
        name
        image
        status
        replicas
        runningReplicas
      }
      deploymentStatus
      errors
    }
  }
`;

// Image mutations
export const PULL_IMAGE = `
  mutation PullImage($imageName: String!, $tag: String = "latest") {
    pullImage(imageName: $imageName, tag: $tag) {
      imageName
      tag
      status
      progress
      message
    }
  }
`;

export const REMOVE_IMAGE = `
  mutation RemoveImage($imageId: String!, $force: Boolean = false) {
    removeImage(imageId: $imageId, force: $force) {
      success
      message
      imageId
    }
  }
`;

export const PRUNE_IMAGES = `
  mutation PruneImages($dangling: Boolean = true) {
    pruneImages(dangling: $dangling) {
      imagesDeleted
      spaceReclaimed
    }
  }
`;

// Registry mutations
export const LOGIN_REGISTRY = `
  mutation LoginRegistry($registry: String!, $username: String!, $password: String!) {
    loginRegistry(registry: $registry, username: $username, password: $password) {
      success
      message
      registry
    }
  }
`;

export const LOGOUT_REGISTRY = `
  mutation LogoutRegistry($registry: String!) {
    logoutRegistry(registry: $registry) {
      success
      message
      registry
    }
  }
`;

// Backup and restore mutations
export const CREATE_BACKUP = `
  mutation CreateBackup($backupName: String!, $includeVolumes: Boolean = true) {
    createBackup(backupName: $backupName, includeVolumes: $includeVolumes) {
      backupId
      backupName
      size
      created
      status
      containersIncluded
      volumesIncluded
    }
  }
`;

export const RESTORE_BACKUP = `
  mutation RestoreBackup($backupId: String!) {
    restoreBackup(backupId: $backupId) {
      success
      message
      containersRestored
      volumesRestored
      networksRestored
    }
  }
`;

// Configuration mutations
export const UPDATE_SYSTEM_CONFIG = `
  mutation UpdateSystemConfig($config: SystemConfigInput!) {
    updateSystemConfig(config: $config) {
      success
      message
      config {
        autoCleanup
        logLevel
        maxContainers
        maxServices
        resourceLimits {
          maxCpuPercent
          maxMemoryPercent
          maxDiskPercent
        }
      }
    }
  }
`;

export const RESET_SYSTEM_CONFIG = `
  mutation ResetSystemConfig {
    resetSystemConfig {
      success
      message
      config {
        autoCleanup
        logLevel
        maxContainers
        maxServices
      }
    }
  }
`;

// Export all mutations
export const MUTATIONS = {
  START_CONTAINER,
  STOP_CONTAINER,
  RESTART_CONTAINER,
  REMOVE_CONTAINER,
  CREATE_CONTAINER,
  CREATE_SERVICE,
  UPDATE_SERVICE,
  DELETE_SERVICE,
  SCALE_SERVICE,
  CREATE_NETWORK,
  REMOVE_NETWORK,
  CONNECT_CONTAINER_TO_NETWORK,
  DISCONNECT_CONTAINER_FROM_NETWORK,
  CREATE_VOLUME,
  REMOVE_VOLUME,
  PRUNE_VOLUMES,
  PRUNE_SYSTEM,
  RESTART_DOCKER,
  BATCH_CONTAINER_ACTIONS,
  BATCH_SERVICE_ACTIONS,
  DEPLOY_COMPOSE_STACK,
  REMOVE_COMPOSE_STACK,
  UPDATE_COMPOSE_STACK,
  PULL_IMAGE,
  REMOVE_IMAGE,
  PRUNE_IMAGES,
  LOGIN_REGISTRY,
  LOGOUT_REGISTRY,
  CREATE_BACKUP,
  RESTORE_BACKUP,
  UPDATE_SYSTEM_CONFIG,
  RESET_SYSTEM_CONFIG,
};