/**
 * Types pour la gestion des containers Docker
 */

export interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: string;
  ports?: Record<string, any>;
  environment?: Record<string, string>;
  volumes?: Array<{
    source: string;
    destination: string;
    mode: string;
  }>;
}

export interface ContainerCreate {
  name: string;
  image: string;
  environment?: Record<string, string>;
  ports?: Record<string, number>;
  volumes?: Record<string, string>;
  command?: string;
  working_dir?: string;
  restart_policy?: string;
}

export interface ContainerUpdate {
  name?: string;
  environment?: Record<string, string>;
}

export interface ContainerStats {
  cpu_percent: number;
  memory_usage: number;
  memory_limit: number;
  memory_percent: number;
  network_rx: number;
  network_tx: number;
  block_read: number;
  block_write: number;
}

export interface DockerImage {
  id: string;
  tags: string[];
  size: number;
  created: string;
  repository_tags?: string[];
}

export interface ImagePull {
  image: string;
  tag?: string;
}

export interface ContainerLog {
  timestamp: string;
  container_id: string;
  message: string;
}

export interface ContainerAction {
  timeout?: number;
}

export type ContainerStatus = 'running' | 'stopped' | 'paused' | 'created' | 'exited' | 'dead' | 'restarting';

export interface ContainerFormData {
  name: string;
  image: string;
  environment: Array<{ key: string; value: string }>;
  ports: Array<{ containerPort: string; hostPort: number }>;
  volumes: Array<{ hostPath: string; containerPath: string }>;
  command?: string;
  workingDir?: string;
  restartPolicy: string;
}
