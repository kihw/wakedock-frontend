// UI Models - Interface state and presentation models

export interface NavigationState {
  collapsed: boolean;
  mobile: boolean;
  contextualActions: ContextualAction[];
  breadcrumbs: BreadcrumbItem[];
  activeRoute: string;
}

export interface ContextualAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface CardHierarchy {
  surface: 'elevated' | 'raised' | 'floating' | 'overlay';
  depth: 1 | 2 | 3 | 4 | 5;
  interaction: 'static' | 'hover' | 'clickable' | 'draggable';
  theme: 'default' | 'glass' | 'solid' | 'outlined';
}

export interface ViewComponent<TProps = any> {
  props: TProps;
  render: () => JSX.Element;
  lifecycle: ComponentLifecycle;
}

export interface ComponentLifecycle {
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdate?: (prevProps: any) => void;
}

export interface DynamicComponent {
  lazy: boolean;
  preload: boolean;
  fallback: React.ComponentType;
  errorBoundary: React.ComponentType;
}

export interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  animations: boolean;
  reducedMotion: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  density: 'compact' | 'comfortable' | 'spacious';
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
  error?: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FilterState<T = any> {
  search: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  activeFilters: Filter<T>[];
}

export interface Filter<T = any> {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'range';
  value: any;
  options?: FilterOption[];
  predicate: (item: T) => boolean;
}

export interface FilterOption {
  value: any;
  label: string;
  count?: number;
}

export interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: ToastAction[];
  persistent?: boolean;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary';
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable: boolean;
  persistent: boolean;
  backdrop: boolean;
}

export interface FormState<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}
