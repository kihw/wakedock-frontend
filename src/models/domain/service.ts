// Domain Models - Core business entities
export interface Service {
  id: string;
  name: string;
  subdomain: string;
  status: ServiceStatus;
  docker_image?: string;
  ports: string[];
  stack_id?: string;
  created_at: string;
  updated_at: string;
  resource_usage?: ServiceResourceUsage;
  health_check?: ServiceHealthCheck;
  actions: ServiceAction[];
}

export interface Stack {
  id: string;
  name: string;
  project_name: string;
  services: Service[];
  containers: Container[];
  status: StackStatus;
  created_at: string;
  updated_at: string;
  stats: StackStats;
  labels: Record<string, string>;
}

export interface Container {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  ports: Port[];
  service_id?: string;
  stack_id?: string;
  created_at: string;
  state: ContainerState;
  resource_usage?: ContainerResourceUsage;
}

export interface Port {
  container_port: number;
  host_port?: number;
  protocol: 'tcp' | 'udp';
  host_ip?: string;
}

// Status Enums
export type ServiceStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'pending';
export type StackStatus = 'active' | 'inactive' | 'partial' | 'error';
export type ContainerStatus = 'running' | 'stopped' | 'paused' | 'restarting' | 'removing' | 'dead' | 'created';

// Resource Usage
export interface ServiceResourceUsage {
  cpu_percent: number;
  memory_usage: number;
  memory_percent: number;
  network_io: {
    bytes_sent: number;
    bytes_received: number;
  };
  disk_io: {
    bytes_read: number;
    bytes_written: number;
  };
}

export interface ContainerResourceUsage {
  cpu_percent: number;
  memory_usage: number;
  memory_limit: number;
  memory_percent: number;
  network_io: {
    bytes_sent: number;
    bytes_received: number;
  };
  disk_io: {
    bytes_read: number;
    bytes_written: number;
  };
}

// Health Check
export interface ServiceHealthCheck {
  status: 'healthy' | 'unhealthy' | 'starting' | 'none';
  last_check: string;
  consecutive_failures: number;
  test: string[];
}

// Container State
export interface ContainerState {
  status: ContainerStatus;
  running: boolean;
  paused: boolean;
  restarting: boolean;
  oom_killed: boolean;
  dead: boolean;
  pid: number;
  exit_code: number;
  error: string;
  started_at: string;
  finished_at: string;
}

// Actions
export interface ServiceAction {
  id: string;
  name: string;
  label: string;
  type: 'start' | 'stop' | 'restart' | 'rebuild' | 'logs' | 'shell';
  enabled: boolean;
  loading?: boolean;
}

// Statistics
export interface StackStats {
  total_services: number;
  running_services: number;
  stopped_services: number;
  total_containers: number;
  running_containers: number;
  total_memory_usage: number;
  total_cpu_usage: number;
}
