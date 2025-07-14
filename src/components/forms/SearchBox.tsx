import React, { forwardRef, useCallback, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { clsx } from 'clsx';
import { Search, X, Loader2 } from 'lucide-react';
import Input from '../ui/Input';

export interface SearchBoxProps {
    // Core props
    value?: string;
    defaultValue?: string;
    placeholder?: string;

    // Styling
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'filled' | 'outlined';
    disabled?: boolean;
    fullWidth?: boolean;
    className?: string;

    // Search behavior
    loading?: boolean;
    debounceMs?: number;
    searchOnEnter?: boolean;
    clearable?: boolean;

    // Suggestions
    suggestions?: string[];
    showSuggestions?: boolean;
    maxSuggestions?: number;

    // Events
    onSearch?: (query: string) => void;
    onClear?: () => void;
    onSelect?: (suggestion: string) => void;
    onValueChange?: (value: string) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

    // Testing
    'data-testid'?: string;
}

export interface SearchBoxRef {
    focus: () => void;
    blur: () => void;
    clear: () => void;
    getValue: () => string;
    setValue: (value: string) => void;
}

const SearchBox = forwardRef<SearchBoxRef, SearchBoxProps>(
    (
        {
            value: controlledValue,
            defaultValue = '',
            placeholder = 'Search...',
            size = 'md',
            variant = 'default',
            disabled = false,
            fullWidth = false,
            className,

            loading = false,
            debounceMs = 300,
            searchOnEnter = false,
            clearable = true,

            suggestions = [],
            showSuggestions = false,
            maxSuggestions = 5,

            onSearch,
            onClear,
            onSelect,
            onValueChange,
            onFocus,
            onBlur,

            'data-testid': testId,
        },
        ref
    ) => {
        // Internal state
        const [internalValue, setInternalValue] = useState(defaultValue);
        const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
        const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
        const [isFocused, setIsFocused] = useState(false);

        // Refs
        const inputRef = useRef<HTMLInputElement>(null);
        const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();
        const suggestionsRef = useRef<HTMLDivElement>(null);

        // Use controlled or uncontrolled value
        const value = controlledValue !== undefined ? controlledValue : internalValue;
        const setValue = controlledValue !== undefined ?
            (newValue: string) => onValueChange?.(newValue) :
            setInternalValue;

        // Computed values
        const lowerValue = value.toLowerCase();
        const filteredSuggestions = lowerValue
            ? suggestions
                .filter((s) => s.toLowerCase().includes(lowerValue))
                .slice(0, maxSuggestions)
            : [];

        const shouldShowSuggestions =
            showSuggestions &&
            showSuggestionsDropdown &&
            filteredSuggestions.length > 0 &&
            value.length > 0;

        // Debounced search function
        const debouncedSearch = useCallback((query: string) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                if (query.trim()) {
                    onSearch?.(query.trim());
                }
            }, debounceMs);
        }, [onSearch, debounceMs]);

        // Event handlers
        const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setValue(newValue);

            // Reset suggestion selection
            setSelectedSuggestionIndex(-1);

            // Show suggestions if enabled
            if (showSuggestions && newValue.length > 0) {
                setShowSuggestionsDropdown(true);
            } else {
                setShowSuggestionsDropdown(false);
            }

            // Debounced search
            if (!searchOnEnter) {
                debouncedSearch(newValue);
            }
        }, [setValue, showSuggestions, searchOnEnter, debouncedSearch]);

        const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();

                if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
                    // Select suggestion
                    selectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
                } else if (value.trim()) {
                    // Perform search
                    onSearch?.(value.trim());
                    setShowSuggestionsDropdown(false);
                }
            } else if (e.key === 'Escape') {
                setShowSuggestionsDropdown(false);
                setSelectedSuggestionIndex(-1);
                inputRef.current?.blur();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (shouldShowSuggestions) {
                    setSelectedSuggestionIndex(prev =>
                        Math.min(prev + 1, filteredSuggestions.length - 1)
                    );
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (shouldShowSuggestions) {
                    setSelectedSuggestionIndex(prev => Math.max(prev - 1, -1));
                }
            }
        }, [selectedSuggestionIndex, filteredSuggestions, shouldShowSuggestions, value, onSearch]);

        const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);

            // Show suggestions if there are any and value is not empty
            if (showSuggestions && value.length > 0 && filteredSuggestions.length > 0) {
                setShowSuggestionsDropdown(true);
            }

            onFocus?.(e);
        }, [showSuggestions, value, filteredSuggestions.length, onFocus]);

        const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);

            // Delay hiding suggestions to allow for clicks
            setTimeout(() => {
                setShowSuggestionsDropdown(false);
                setSelectedSuggestionIndex(-1);
            }, 150);

            onBlur?.(e);
        }, [onBlur]);

        const handleClear = useCallback(() => {
            setValue('');
            setShowSuggestionsDropdown(false);
            setSelectedSuggestionIndex(-1);

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            onClear?.();
            inputRef.current?.focus();
        }, [setValue, onClear]);

        const selectSuggestion = useCallback((suggestion: string) => {
            setValue(suggestion);
            setShowSuggestionsDropdown(false);
            setSelectedSuggestionIndex(-1);
            onSelect?.(suggestion);
            onSearch?.(suggestion);
        }, [setValue, onSelect, onSearch]);

        const handleSuggestionClick = useCallback((suggestion: string) => {
            selectSuggestion(suggestion);
        }, [selectSuggestion]);

        const handleSuggestionMouseEnter = useCallback((index: number) => {
            setSelectedSuggestionIndex(index);
        }, []);

        // Ref methods
        useImperativeHandle(ref, () => ({
            focus: () => {
                inputRef.current?.focus();
            },
            blur: () => {
                inputRef.current?.blur();
            },
            clear: () => {
                handleClear();
            },
            getValue: () => value,
            setValue: (newValue: string) => {
                setValue(newValue);
            }
        }), [value, setValue, handleClear]);

        // Cleanup timeout on unmount
        useEffect(() => {
            return () => {
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }
            };
        }, []);

        return (
            <div className={clsx('relative', fullWidth && 'w-full', className)}>
                <Input
                    ref={inputRef}
                    type="search"
                    value={value}
                    placeholder={placeholder}
                    inputSize={size}
                    variant={variant}
                    disabled={disabled}
                    leftIcon={Search}
                    rightIcon={loading ? Loader2 : clearable && value ? X : undefined}
                    clearable={clearable && !!value}
                    onClear={clearable && value ? handleClear : undefined}
                    data-testid={testId}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={clsx(
                        fullWidth && 'w-full',
                        className
                    )}
                />

                {/* Clear button for when Input doesn't handle it */}
                {clearable && value && !loading && (
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                        onClick={handleClear}
                        aria-label="Clear search"
                        tabIndex={-1}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Loading spinner */}
                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                )}

                {/* Suggestions dropdown */}
                {shouldShowSuggestions && (
                    <div
                        ref={suggestionsRef}
                        className={clsx(
                            'absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto',
                            'animate-in fade-in-0 zoom-in-95 duration-150'
                        )}
                    >
                        <ul className="py-1">
                            {filteredSuggestions.map((suggestion, index) => (
                                <li key={suggestion}>
                                    <button
                                        type="button"
                                        className={clsx(
                                            'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors',
                                            {
                                                'bg-blue-50 text-blue-600': index === selectedSuggestionIndex,
                                                'text-gray-900': index !== selectedSuggestionIndex
                                            }
                                        )}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        onMouseEnter={() => handleSuggestionMouseEnter(index)}
                                    >
                                        <div className="flex items-center">
                                            <Search className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{suggestion}</span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
);

SearchBox.displayName = 'SearchBox';

export { SearchBox };
export default SearchBox;
