// API Models - Request/Response interfaces

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    request_id?: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
}

export interface PaginatedResponse<T = any> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

// Services API
export interface ServiceListRequest {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    stack_id?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface ServiceActionRequest {
    action: 'start' | 'stop' | 'restart' | 'rebuild';
    service_id: string;
    options?: Record<string, any>;
}

export interface ServiceCreateRequest {
    name: string;
    subdomain: string;
    docker_image: string;
    ports: string[];
    stack_id?: string;
    environment?: Record<string, string>;
    volumes?: string[];
    labels?: Record<string, string>;
}

export interface ServiceUpdateRequest {
    id: string;
    name?: string;
    subdomain?: string;
    docker_image?: string;
    ports?: string[];
    environment?: Record<string, string>;
    volumes?: string[];
    labels?: Record<string, string>;
}

// Stacks API
export interface StackListRequest {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface StackActionRequest {
    action: 'start' | 'stop' | 'restart' | 'rebuild' | 'remove';
    stack_id: string;
    options?: {
        remove_volumes?: boolean;
        remove_orphans?: boolean;
    };
}

// Containers API
export interface ContainerListRequest {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    service_id?: string;
    stack_id?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface ContainerActionRequest {
    action: 'start' | 'stop' | 'restart' | 'pause' | 'unpause' | 'remove';
    container_id: string;
    options?: {
        force?: boolean;
        remove_volumes?: boolean;
    };
}

// Logs API
export interface LogsRequest {
    service_id?: string;
    container_id?: string;
    stack_id?: string;
    since?: string;
    until?: string;
    tail?: number;
    follow?: boolean;
    level?: 'debug' | 'info' | 'warn' | 'error';
}

export interface LogEntry {
    timestamp: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    service_id?: string;
    container_id?: string;
    stack_id?: string;
    metadata?: Record<string, any>;
}

// Metrics API
export interface MetricsRequest {
    service_id?: string;
    container_id?: string;
    stack_id?: string;
    from?: string;
    to?: string;
    interval?: string;
    metrics?: string[];
}

export interface MetricPoint {
    timestamp: string;
    value: number;
    metadata?: Record<string, any>;
}

export interface MetricsResponse {
    metrics: Record<string, MetricPoint[]>;
    interval: string;
    from: string;
    to: string;
}

// WebSocket API
export interface WebSocketMessage<T = any> {
    type: string;
    data: T;
    timestamp: string;
    id?: string;
}

export interface WebSocketSubscription {
    type: 'services' | 'containers' | 'stacks' | 'logs' | 'metrics';
    filters?: Record<string, any>;
    interval?: number;
}

// Health Check API
export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    version: string;
    checks: Record<string, HealthCheck>;
}

export interface HealthCheck {
    status: 'healthy' | 'unhealthy';
    message?: string;
    duration: number;
    timestamp: string;
}
