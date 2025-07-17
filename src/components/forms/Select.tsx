import React, { forwardRef, useCallback, useState, useRef, useImperativeHandle } from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';
import { sanitizeInput } from '../../lib/utils/validation';
import { announceToScreenReader } from '../../lib/utils/accessibility';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  // Core props
  label: string;
  id?: string;
  name?: string;
  value?: string | number | string[];
  options?: SelectOption[];
  
  // Behavior props
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  
  // Validation & Help
  error?: string;
  help?: string;
  
  // Styling
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  fullWidth?: boolean;
  
  // Accessibility
  autocomplete?: string;
  ariaLabel?: string;
  
  // Events
  onChange?: (value: string | number | string[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Custom styling
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  
  // Testing
  'data-testid'?: string;
}

export interface SelectRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string | number | string[];
  setValue: (value: string | number | string[]) => void;
}

const Select = forwardRef<SelectRef, SelectProps>(
  (
    {
      // Core props
      label,
      id,
      name,
      value: controlledValue,
      options = [],
      
      // Behavior props
      required = false,
      disabled = false,
      multiple = false,
      
      // Validation & Help
      error = '',
      help = '',
      
      // Styling
      size = 'md',
      placeholder = '',
      fullWidth = true,
      
      // Accessibility
      autocomplete,
      ariaLabel,
      
      // Events
      onChange,
      onFocus,
      onBlur,
      
      // Custom styling
      className,
      containerClassName,
      labelClassName,
      
      // Testing
      'data-testid': testId,
    },
    ref
  ) => {
    // Internal state for uncontrolled component
    const [internalValue, setInternalValue] = useState<string | number | string[]>(
      multiple ? [] : ''
    );
    const selectRef = useRef<HTMLSelectElement>(null);
    
    // Use controlled or uncontrolled value
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const setValue = controlledValue !== undefined 
      ? (newValue: string | number | string[]) => onChange?.(newValue)
      : setInternalValue;
    
    // Select sizing classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm pr-8',
      md: 'px-3 py-2 text-sm pr-10',
      lg: 'px-4 py-3 text-base pr-10',
    };
    
    // Generate unique IDs for accessibility
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const helpId = `${selectId}-help`;
    const errorId = `${selectId}-error`;
    
    // Handle change event with security and accessibility
    const handleChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
      const target = event.target;
      let newValue: string | number | string[];
      
      if (multiple) {
        const selectedValues: string[] = [];
        for (const option of target.selectedOptions) {
          // Sanitize each selected value
          const sanitizedValue = sanitizeInput(option.value);
          selectedValues.push(sanitizedValue);
        }
        newValue = selectedValues;
      } else {
        // Sanitize single value
        newValue = sanitizeInput(target.value);
      }
      
      setValue(newValue);
      
      // Announce selection to screen readers
      const selectedLabel = multiple
        ? `${(newValue as string[]).length} options selected`
        : options.find((opt) => opt.value.toString() === newValue.toString())?.label || newValue;
      
      announceToScreenReader(`Selected: ${selectedLabel}`);
    }, [multiple, options, setValue]);
    
    const handleFocus = useCallback(() => {
      onFocus?.();
    }, [onFocus]);
    
    const handleBlur = useCallback(() => {
      onBlur?.();
    }, [onBlur]);
    
    // Imperative handle for ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        selectRef.current?.focus();
      },
      blur: () => {
        selectRef.current?.blur();
      },
      getValue: () => value,
      setValue: (newValue: string | number | string[]) => {
        setValue(newValue);
      }
    }), [value, setValue]);
    
    // Base select classes
    const selectClasses = clsx(
      'block w-full border rounded-md shadow-sm',
      'focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      'transition-colors duration-200',
      'appearance-none bg-white',
      // Custom dropdown arrow
      'bg-[url("data:image/svg+xml;charset=UTF-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M6 9l6 6 6-6\'/></svg>")] bg-no-repeat bg-[length:1.5em_1.5em] bg-[right_0.5rem_center]',
      sizeClasses[size],
      {
        'border-red-500 focus:border-red-500 focus:ring-red-500': error,
        'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !error,
        'pr-10': error && !multiple,
      },
      className
    );
    
    return (
      <div className={clsx('form-field', fullWidth && 'w-full', containerClassName)}>
        <label
          htmlFor={selectId}
          className={clsx(
            'block text-sm font-medium mb-1',
            error ? 'text-red-700' : 'text-gray-700',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          <select
            ref={selectRef}
            id={selectId}
            name={name}
            required={required}
            disabled={disabled}
            multiple={multiple}
            autoComplete={autocomplete}
            aria-label={ariaLabel}
            className={selectClasses}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-describedby={error ? errorId : help ? helpId : undefined}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            data-testid={testId}
          >
            {placeholder && !multiple && (
              <option value="" disabled={required} hidden>
                {placeholder}
              </option>
            )}
            
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {error && !multiple && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        
        {error ? (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            <span className="sr-only">Error:</span>
            {error}
          </p>
        ) : help ? (
          <p id={helpId} className="mt-1 text-sm text-gray-500">
            {help}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;