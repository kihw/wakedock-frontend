import React, { forwardRef, useCallback, useState, useEffect, useImperativeHandle, useRef } from 'react';
import { clsx } from 'clsx';
import Input, { InputProps } from '../ui/Input';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export interface ValidationRule {
    rule: (value: any) => boolean;
    message: string;
}

export interface FormFieldProps extends Omit<InputProps, 'variant' | 'error' | 'success' | 'errorMessage' | 'successMessage'> {
    // Core field props
    name: string;
    label: string;
    value?: string | number;
    defaultValue?: string | number;

    // Field types
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'textarea' | 'select';

    // Layout and styling
    inputSize?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'error';
    fullWidth?: boolean;

    // Validation
    required?: boolean;
    validationRules?: ValidationRule[];
    validateOnBlur?: boolean;
    validateOnInput?: boolean;
    showValidationIcon?: boolean;
    errorText?: string;
    successText?: string;
    helpText?: string;

    // Select options
    options?: Array<{ value: string | number; label: string; disabled?: boolean }>;

    // Textarea specific
    rows?: number;

    // Events
    onValueChange?: (value: string | number) => void;
    onValidate?: (isValid: boolean, errors: string[]) => void;
    onTogglePassword?: (isVisible: boolean) => void;

    // Styling overrides
    containerClassName?: string;
    labelClassName?: string;
    fieldClassName?: string;
    helpTextClassName?: string;

    // Testing
    'data-testid'?: string;
}

export interface FormFieldRef {
    focus: () => void;
    blur: () => void;
    validate: () => { valid: boolean; errors: string[] };
    reset: () => void;
    getValue: () => string | number;
    setValue: (value: string | number) => void;
}

const FormField = forwardRef<FormFieldRef, FormFieldProps>(
    (
        {
            // Core props
            name,
            label,
            value: controlledValue,
            defaultValue = '',
            type = 'text',
            placeholder = '',

            // Layout
            inputSize = 'md',
            variant = 'default',
            fullWidth = true,

            // Validation
            required = false,
            validationRules = [],
            validateOnBlur = true,
            validateOnInput = false,
            showValidationIcon = true,
            errorText,
            successText,
            helpText,

            // Form control
            disabled = false,
            readOnly = false,

            // Input specific
            minLength,
            maxLength,
            min,
            max,
            step,
            pattern,
            autoComplete,

            // Icons and addons
            leftIcon,
            rightIcon,
            clearable = false,
            showPasswordToggle = false,

            // Select/textarea
            options = [],
            rows = 3,

            // Events
            onChange,
            onValueChange,
            onFocus,
            onBlur,
            onValidate,
            onTogglePassword,
            onClear,

            // Styling
            className,
            containerClassName,
            labelClassName,
            fieldClassName,
            helpTextClassName,

            // Testing
            'data-testid': testId,

            ...rest
        },
        ref
    ) => {
        // Internal state
        const [internalValue, setInternalValue] = useState<string | number>(defaultValue);
        const [touched, setTouched] = useState(false);
        const [focused, setFocused] = useState(false);
        const [validationErrors, setValidationErrors] = useState<string[]>([]);
        const [isValid, setIsValid] = useState(true);
        const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

        // Use controlled or uncontrolled value
        const value = controlledValue !== undefined ? controlledValue : internalValue;
        const setValue = controlledValue !== undefined ?
            (newValue: string | number) => onValueChange?.(newValue) :
            setInternalValue;

        // Computed states
        const hasError = variant === 'error' || !!errorText || validationErrors.length > 0;
        const hasSuccess = variant === 'success' || !!successText;
        const hasWarning = variant === 'warning';

        const currentVariant = hasError ? 'error' : hasSuccess ? 'success' : hasWarning ? 'warning' : 'default';
        const displayErrorText = errorText || validationErrors[0];
        const displaySuccessText = successText;
        const displayHelpText = helpText;

        // IDs for accessibility
        const fieldId = `field-${name}`;
        const helperId = `${fieldId}-helper`;
        const errorId = `${fieldId}-error`;
        const successId = `${fieldId}-success`;

        // Validation function
        const validateField = useCallback((val: string | number): { valid: boolean; errors: string[] } => {
            const errors: string[] = [];

            // Required validation
            if (required && (!val || val.toString().trim() === '')) {
                errors.push(`${label} is required`);
            }

            // Length validation for strings
            if (val && typeof val === 'string') {
                if (minLength && val.length < minLength) {
                    errors.push(`${label} must be at least ${minLength} characters`);
                }
                if (maxLength && val.length > maxLength) {
                    errors.push(`${label} must be no more than ${maxLength} characters`);
                }
            }

            // Number validation
            if (val && type === 'number') {
                const numVal = Number(val);
                if (min !== undefined && numVal < Number(min)) {
                    errors.push(`${label} must be at least ${min}`);
                }
                if (max !== undefined && numVal > Number(max)) {
                    errors.push(`${label} must be no more than ${max}`);
                }
            }

            // Pattern validation
            if (val && pattern && typeof val === 'string') {
                const regex = new RegExp(pattern);
                if (!regex.test(val)) {
                    errors.push(`${label} format is invalid`);
                }
            }

            // Custom validation rules
            if (val) {
                validationRules.forEach((rule) => {
                    if (!rule.rule(val)) {
                        errors.push(rule.message);
                    }
                });
            }

            return { valid: errors.length === 0, errors };
        }, [label, required, minLength, maxLength, min, max, pattern, type, validationRules]);

        // Validate and update state
        const performValidation = useCallback((val: string | number) => {
            const validation = validateField(val);
            setValidationErrors(validation.errors);
            setIsValid(validation.valid);
            onValidate?.(validation.valid, validation.errors);
            return validation;
        }, [validateField, onValidate]);

        // Event handlers
        const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
            setValue(newValue);

            // Validate on input if enabled
            if (validateOnInput || touched) {
                performValidation(newValue);
            }

            // Cast to appropriate type for onChange callback
            if (onChange) {
                onChange(e as any);
            }
        }, [type, setValue, validateOnInput, touched, performValidation, onChange]);

        const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setFocused(true);
            if (onFocus) {
                onFocus(e as any);
            }
        }, [onFocus]);

        const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setFocused(false);
            setTouched(true);

            // Validate on blur if enabled
            if (validateOnBlur) {
                performValidation(value);
            }

            if (onBlur) {
                onBlur(e as any);
            }
        }, [validateOnBlur, performValidation, value, onBlur]);

        const handleClear = useCallback(() => {
            setValue('');
            setValidationErrors([]);
            setIsValid(true);
            onClear?.();
        }, [setValue, onClear]);

        const handleTogglePassword = useCallback((isVisible: boolean) => {
            onTogglePassword?.(isVisible);
        }, [onTogglePassword]);

        // Ref methods
        useImperativeHandle(ref, () => ({
            focus: () => {
                inputRef.current?.focus();
            },
            blur: () => {
                inputRef.current?.blur();
            },
            validate: () => {
                const validation = performValidation(value);
                setTouched(true);
                return validation;
            },
            reset: () => {
                setValue('');
                setValidationErrors([]);
                setIsValid(true);
                setTouched(false);
                setFocused(false);
            },
            getValue: () => value,
            setValue: (newValue: string | number) => {
                setValue(newValue);
                if (touched) {
                    performValidation(newValue);
                }
            }
        }), [performValidation, value, setValue, touched]);

        // Effect to validate on external value changes
        useEffect(() => {
            if (touched && (validateOnInput || validateOnBlur)) {
                performValidation(value);
            }
        }, [value, touched, validateOnInput, validateOnBlur, performValidation]);

        // Label classes
        const labelClasses = clsx(
            'block text-sm font-medium mb-1',
            {
                'text-red-700': hasError,
                'text-green-700': hasSuccess,
                'text-gray-700': !hasError && !hasSuccess
            },
            labelClassName
        );

        // Character count for text inputs
        const showCharacterCount = maxLength && type !== 'number' && typeof value === 'string';

        // Render validation icon
        const ValidationIcon = hasError ? AlertCircle : hasSuccess ? CheckCircle : hasWarning ? AlertTriangle : null;

        return (
            <div className={clsx('form-field', fullWidth && 'w-full', containerClassName)} data-testid={testId}>
                {/* Label */}
                <label htmlFor={fieldId} className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                    {showCharacterCount && (
                        <span className="text-xs text-gray-500 ml-2">
                            {value.length}/{maxLength}
                        </span>
                    )}
                </label>

                {/* Input Field */}
                <div className="mt-1">
                    {type === 'textarea' ? (
                        <textarea
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            id={fieldId}
                            name={name}
                            value={value}
                            placeholder={placeholder}
                            disabled={disabled}
                            readOnly={readOnly}
                            required={required}
                            minLength={minLength}
                            maxLength={maxLength}
                            rows={rows}
                            className={clsx(
                                'block w-full transition-all duration-200 ease-in-out',
                                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                                'border rounded-md shadow-sm',
                                'placeholder-gray-400 text-gray-900',
                                'resize-y',
                                {
                                    'border-red-500 focus:border-red-500 focus:ring-red-500': hasError,
                                    'border-green-500 focus:border-green-500 focus:ring-green-500': hasSuccess,
                                    'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500': hasWarning,
                                    'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !hasError && !hasSuccess && !hasWarning,
                                    'bg-gray-50 cursor-not-allowed text-gray-500': disabled,
                                    'px-3 py-1.5 text-sm': inputSize === 'sm',
                                    'px-4 py-2 text-sm': inputSize === 'md',
                                    'px-4 py-3 text-base': inputSize === 'lg'
                                },
                                fieldClassName
                            )}
                            aria-describedby={[
                                displayHelpText ? helperId : '',
                                displayErrorText ? errorId : '',
                                displaySuccessText ? successId : ''
                            ].filter(Boolean).join(' ') || undefined}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    ) : type === 'select' ? (
                        <select
                            ref={inputRef as React.RefObject<HTMLSelectElement>}
                            id={fieldId}
                            name={name}
                            value={value}
                            disabled={disabled}
                            required={required}
                            className={clsx(
                                'block w-full transition-all duration-200 ease-in-out',
                                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                                'border rounded-md shadow-sm',
                                'bg-white appearance-none',
                                'bg-[url("data:image/svg+xml;charset=UTF-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M6 9l6 6 6-6\'/></svg>")] bg-no-repeat bg-[length:1.5em_1.5em] bg-[right_0.5rem_center]',
                                {
                                    'border-red-500 focus:border-red-500 focus:ring-red-500': hasError,
                                    'border-green-500 focus:border-green-500 focus:ring-green-500': hasSuccess,
                                    'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500': hasWarning,
                                    'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !hasError && !hasSuccess && !hasWarning,
                                    'bg-gray-50 cursor-not-allowed text-gray-500': disabled,
                                    'px-3 py-1.5 text-sm pr-8': inputSize === 'sm',
                                    'px-4 py-2 text-sm pr-10': inputSize === 'md',
                                    'px-4 py-3 text-base pr-10': inputSize === 'lg'
                                },
                                fieldClassName
                            )}
                            aria-describedby={[
                                displayHelpText ? helperId : '',
                                displayErrorText ? errorId : '',
                                displaySuccessText ? successId : ''
                            ].filter(Boolean).join(' ') || undefined}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        >
                            {placeholder && (
                                <option value="" disabled>
                                    {placeholder}
                                </option>
                            )}
                            {options.map((option) => (
                                <option key={option.value} value={option.value} disabled={option.disabled}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <Input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            id={fieldId}
                            name={name}
                            type={type}
                            value={value as string}
                            placeholder={placeholder}
                            disabled={disabled}
                            readOnly={readOnly}
                            required={required}
                            autoComplete={autoComplete}
                            minLength={minLength}
                            maxLength={maxLength}
                            min={min}
                            max={max}
                            step={step}
                            pattern={pattern}
                            inputSize={inputSize}
                            error={hasError}
                            success={hasSuccess}
                            errorMessage={displayErrorText}
                            successMessage={displaySuccessText}
                            leftIcon={leftIcon}
                            rightIcon={rightIcon}
                            clearable={clearable}
                            showPasswordToggle={showPasswordToggle}
                            className={clsx(fieldClassName, className)}
                            aria-describedby={[
                                displayHelpText ? helperId : '',
                                displayErrorText ? errorId : '',
                                displaySuccessText ? successId : ''
                            ].filter(Boolean).join(' ') || undefined}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onClear={handleClear}
                        />
                    )}
                </div>

                {/* Help/Error/Success Text */}
                <div className="mt-1 min-h-[1.25rem]">
                    {displayErrorText ? (
                        <div className="flex items-center space-x-1">
                            {showValidationIcon && ValidationIcon && (
                                <ValidationIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                            <p className={clsx('text-sm text-red-600', helpTextClassName)} id={errorId}>
                                {displayErrorText}
                            </p>
                        </div>
                    ) : displaySuccessText ? (
                        <div className="flex items-center space-x-1">
                            {showValidationIcon && ValidationIcon && (
                                <ValidationIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                            <p className={clsx('text-sm text-green-600', helpTextClassName)} id={successId}>
                                {displaySuccessText}
                            </p>
                        </div>
                    ) : displayHelpText ? (
                        <p className={clsx('text-sm text-gray-600', helpTextClassName)} id={helperId}>
                            {displayHelpText}
                        </p>
                    ) : null}
                </div>

                {/* Additional validation badges for multiple errors */}
                {validationErrors.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {validationErrors.slice(1).map((error, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                                {error}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);

FormField.displayName = 'FormField';

export default FormField;

// Form validation helpers
export const validateRequired = (value: any): string | undefined => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return 'This field is required';
    }
    return undefined;
};

export const validateEmail = (email: string): string | undefined => {
    if (!email) return undefined;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return undefined;
};

export const validateMinLength = (minLength: number) => (value: string): string | undefined => {
    if (!value) return undefined;

    if (value.length < minLength) {
        return `Must be at least ${minLength} characters long`;
    }
    return undefined;
};

export const validatePattern = (pattern: RegExp, message: string) => (value: string): string | undefined => {
    if (!value) return undefined;

    if (!pattern.test(value)) {
        return message;
    }
    return undefined;
};

// Compose multiple validators
export const composeValidators = (...validators: Array<(value: any) => string | undefined>) => {
    return (value: any): string | undefined => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) return error;
        }
        return undefined;
    };
};
