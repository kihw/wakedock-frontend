// Service types for consistency with existing API
export interface Service {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'restarting' | 'error';
  health_status: 'healthy' | 'unhealthy' | 'starting' | 'unknown';
  ports: Port[];
  environment: Record<string, string>;
  volumes: Volume[];
  networks: string[];
  labels: Record<string, string>;
  restart_policy: 'no' | 'always' | 'unless-stopped' | 'on-failure';
  resource_usage?: ResourceUsage;
  created_at: string;
  updated_at: string;
  container_id?: string;
  log_driver?: string;
  log_options?: Record<string, string>;
}

export interface Port {
  container_port: number;
  host_port?: number;
  protocol: 'tcp' | 'udp';
  host_ip?: string;
}

export interface Volume {
  source: string;
  target: string;
  type: 'bind' | 'volume' | 'tmpfs';
  read_only?: boolean;
}

export interface ResourceUsage {
  cpu_usage: number;
  memory_usage: number;
  memory_limit?: number;
  network_io: {
    rx_bytes: number;
    tx_bytes: number;
  };
  block_io?: {
    read_bytes: number;
    write_bytes: number;
  };
}

export interface SystemOverview {
  services: {
    total: number;
    running: number;
    stopped: number;
    error: number;
  };
  system: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    uptime: number;
  };
  docker: {
    version: string;
    api_version: string;
    status: 'healthy' | 'unhealthy';
  };
  caddy: {
    version: string;
    status: 'healthy' | 'unhealthy';
    active_routes: number;
  };
}