import React, { useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import { Filter, X, ChevronDown } from 'lucide-react';
import { SearchBox } from './SearchBox';

export interface FilterOption {
    label: string;
    value: string | number;
    disabled?: boolean;
    count?: number; // Optional count for showing results
}

export interface FilterConfig {
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'search' | 'date' | 'number';
    options?: FilterOption[];
    placeholder?: string;
    multiple?: boolean;
}

export interface ActiveFilter {
    key: string;
    value: string | number | (string | number)[];
    label: string;
}

export interface FilterControlsProps {
    // Filter configuration
    filters: FilterConfig[];
    values: Record<string, any>;

    // Search integration
    searchValue?: string;
    searchPlaceholder?: string;
    showSearch?: boolean;

    // Layout and styling
    layout?: 'horizontal' | 'vertical' | 'grid';
    size?: 'sm' | 'md' | 'lg';
    className?: string;

    // Features
    showClearAll?: boolean;
    showActiveFilters?: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;

    // Events
    onFilterChange: (key: string, value: any) => void;
    onSearchChange?: (value: string) => void;
    onClearAll?: () => void;
    onClearFilter?: (key: string) => void;

    // Results info
    totalResults?: number;
    filteredResults?: number;
    showResultCount?: boolean;

    // Testing
    'data-testid'?: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
    filters,
    values,

    searchValue = '',
    searchPlaceholder = 'Search...',
    showSearch = true,

    layout = 'horizontal',
    size = 'md',
    className,

    showClearAll = true,
    showActiveFilters = true,
    collapsible = false,
    defaultCollapsed = false,

    onFilterChange,
    onSearchChange,
    onClearAll,
    onClearFilter,

    totalResults,
    filteredResults,
    showResultCount = false,

    'data-testid': testId,
}) => {
    // State for collapsible
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

    // Get active filters
    const activeFilters = useMemo(() => {
        const active: ActiveFilter[] = [];

        filters.forEach(filter => {
            const value = values[filter.key];
            if (value !== undefined && value !== null && value !== '' &&
                !(Array.isArray(value) && value.length === 0)) {

                let label = filter.label;

                if (filter.type === 'select' && filter.options) {
                    const option = filter.options.find(opt => opt.value === value);
                    label = option ? `${filter.label}: ${option.label}` : `${filter.label}: ${value}`;
                } else if (filter.type === 'multiselect' && Array.isArray(value) && filter.options) {
                    const selectedOptions = filter.options.filter(opt => value.includes(opt.value));
                    label = `${filter.label}: ${selectedOptions.map(opt => opt.label).join(', ')}`;
                } else {
                    label = `${filter.label}: ${value}`;
                }

                active.push({
                    key: filter.key,
                    value,
                    label
                });
            }
        });

        return active;
    }, [filters, values]);

    // Check if any filters are active
    const hasActiveFilters = activeFilters.length > 0 || (showSearch && searchValue);

    // Handle filter changes
    const handleFilterChange = useCallback((key: string, value: any) => {
        onFilterChange(key, value);
    }, [onFilterChange]);

    const handleClearFilter = useCallback((key: string) => {
        onFilterChange(key, undefined);
        onClearFilter?.(key);
    }, [onFilterChange, onClearFilter]);

    const handleClearAll = useCallback(() => {
        // Clear all filter values
        filters.forEach(filter => {
            onFilterChange(filter.key, undefined);
        });

        // Clear search if enabled
        if (showSearch && onSearchChange) {
            onSearchChange('');
        }

        onClearAll?.();
    }, [filters, onFilterChange, showSearch, onSearchChange, onClearAll]);

    // Render filter input based on type
    const renderFilterInput = useCallback((filter: FilterConfig) => {
        const value = values[filter.key];

        switch (filter.type) {
            case 'select':
                return (
                    <div className="relative">
                        <select
                            value={value || ''}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
                            className={clsx(
                                'block w-full appearance-none bg-white border border-gray-300 rounded-md shadow-sm',
                                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                                'text-gray-900 placeholder-gray-500',
                                {
                                    'px-2 py-1 text-sm': size === 'sm',
                                    'px-3 py-2 text-sm': size === 'md',
                                    'px-4 py-3 text-base': size === 'lg'
                                }
                            )}
                        >
                            <option value="">
                                {filter.placeholder || `All ${filter.label}`}
                            </option>
                            {filter.options?.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                >
                                    {option.label}
                                    {option.count !== undefined && ` (${option.count})`}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                );

            case 'search':
                return (
                    <SearchBox
                        value={value || ''}
                        placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                        size={size}
                        onValueChange={(newValue) => handleFilterChange(filter.key, newValue)}
                        onSearch={(query) => handleFilterChange(filter.key, query)}
                        clearable
                        className="w-full"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value || ''}
                        placeholder={filter.placeholder}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
                        className={clsx(
                            'block w-full border border-gray-300 rounded-md shadow-sm',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            'text-gray-900 placeholder-gray-500',
                            {
                                'px-2 py-1 text-sm': size === 'sm',
                                'px-3 py-2 text-sm': size === 'md',
                                'px-4 py-3 text-base': size === 'lg'
                            }
                        )}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
                        className={clsx(
                            'block w-full border border-gray-300 rounded-md shadow-sm',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            'text-gray-900',
                            {
                                'px-2 py-1 text-sm': size === 'sm',
                                'px-3 py-2 text-sm': size === 'md',
                                'px-4 py-3 text-base': size === 'lg'
                            }
                        )}
                    />
                );

            default:
                return null;
        }
    }, [values, handleFilterChange, size]);

    // Layout classes
    const containerClasses = clsx(
        'filter-controls',
        {
            'space-y-4': layout === 'vertical',
            'flex flex-wrap gap-4': layout === 'horizontal',
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4': layout === 'grid',
        },
        className
    );

    const filterWrapperClasses = clsx({
        'flex-1 min-w-0': layout === 'horizontal',
        'w-full': layout === 'vertical' || layout === 'grid',
    });

    return (
        <div className="filter-controls-container space-y-4" data-testid={testId}>
            {/* Header with toggle and clear all */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters</span>

                    {collapsible && (
                        <button
                            type="button"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                            aria-label={isCollapsed ? 'Show filters' : 'Hide filters'}
                        >
                            <ChevronDown
                                className={clsx(
                                    'w-4 h-4 transition-transform duration-200',
                                    isCollapsed && 'rotate-180'
                                )}
                            />
                        </button>
                    )}

                    {showResultCount && totalResults !== undefined && (
                        <span className="text-sm text-gray-500">
                            {filteredResults !== undefined ? (
                                `${filteredResults} of ${totalResults} results`
                            ) : (
                                `${totalResults} results`
                            )}
                        </span>
                    )}
                </div>

                {showClearAll && hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Filter Controls */}
            {(!collapsible || !isCollapsed) && (
                <div className={containerClasses}>
                    {/* Search */}
                    {showSearch && (
                        <div className={filterWrapperClasses}>
                            <SearchBox
                                value={searchValue}
                                placeholder={searchPlaceholder}
                                size={size}
                                onValueChange={onSearchChange}
                                onSearch={onSearchChange}
                                clearable
                                className="w-full"
                            />
                        </div>
                    )}

                    {/* Filter inputs */}
                    {filters.map((filter) => (
                        <div key={filter.key} className={filterWrapperClasses}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {filter.label}
                            </label>
                            {renderFilterInput(filter)}
                        </div>
                    ))}
                </div>
            )}

            {/* Active Filters */}
            {showActiveFilters && activeFilters.length > 0 && (
                <div className="active-filters">
                    <div className="flex flex-wrap gap-2">
                        {activeFilters.map((filter) => (
                            <div
                                key={filter.key}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                                <span className="truncate max-w-xs">{filter.label}</span>
                                <button
                                    type="button"
                                    onClick={() => handleClearFilter(filter.key)}
                                    className="flex-shrink-0 ml-1 p-0.5 text-blue-600 hover:text-blue-800 focus:outline-none"
                                    aria-label={`Remove ${filter.label} filter`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export { FilterControls };
export default FilterControls;
