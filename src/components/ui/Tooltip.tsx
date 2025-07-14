import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

export interface TooltipProps {
    content: string | React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
    variant?: 'dark' | 'light' | 'primary' | 'success' | 'warning' | 'error';
    delay?: number;
    disabled?: boolean;
    arrow?: boolean;
    multiline?: boolean;
    maxWidth?: string;
    offset?: number;
    trigger?: 'hover' | 'click' | 'focus';
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    size = 'md',
    variant = 'dark',
    delay = 200,
    disabled = false,
    arrow = true,
    multiline = false,
    maxWidth = '200px',
    offset = 8,
    trigger = 'hover',
    className,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const showTooltip = () => {
        if (disabled || !content) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const toggleTooltip = () => {
        if (disabled || !content) return;
        setIsVisible(!isVisible);
    };

    useEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let x = 0;
            let y = 0;

            switch (position) {
                case 'top':
                    x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                    y = triggerRect.top - tooltipRect.height - offset;
                    break;
                case 'bottom':
                    x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                    y = triggerRect.bottom + offset;
                    break;
                case 'left':
                    x = triggerRect.left - tooltipRect.width - offset;
                    y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                    break;
                case 'right':
                    x = triggerRect.right + offset;
                    y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                    break;
            }

            // Boundary checks
            const padding = 8;
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight,
            };

            if (x < padding) x = padding;
            if (x + tooltipRect.width > viewport.width - padding) {
                x = viewport.width - tooltipRect.width - padding;
            }
            if (y < padding) y = padding;
            if (y + tooltipRect.height > viewport.height - padding) {
                y = viewport.height - tooltipRect.height - padding;
            }

            setTooltipPosition({ x, y });
        }
    }, [isVisible, position, offset]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const variantClasses = {
        dark: 'bg-gray-900 text-white border-gray-700',
        light: 'bg-white text-gray-900 border-gray-200 shadow-lg',
        primary: 'bg-blue-600 text-white border-blue-500',
        success: 'bg-green-600 text-white border-green-500',
        warning: 'bg-yellow-600 text-white border-yellow-500',
        error: 'bg-red-600 text-white border-red-500',
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
    };

    const arrowClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-4 border-l-4 border-r-4 border-transparent',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-transparent',
        left: 'right-full top-1/2 transform -translate-y-1/2 border-r-4 border-t-4 border-b-4 border-transparent',
        right: 'left-full top-1/2 transform -translate-y-1/2 border-l-4 border-t-4 border-b-4 border-transparent',
    };

    const getArrowBorderColor = () => {
        switch (variant) {
            case 'dark': return 'border-b-gray-900 border-t-gray-900 border-l-gray-900 border-r-gray-900';
            case 'light': return 'border-b-white border-t-white border-l-white border-r-white';
            case 'primary': return 'border-b-blue-600 border-t-blue-600 border-l-blue-600 border-r-blue-600';
            case 'success': return 'border-b-green-600 border-t-green-600 border-l-green-600 border-r-green-600';
            case 'warning': return 'border-b-yellow-600 border-t-yellow-600 border-l-yellow-600 border-r-yellow-600';
            case 'error': return 'border-b-red-600 border-t-red-600 border-l-red-600 border-r-red-600';
            default: return 'border-b-gray-900 border-t-gray-900 border-l-gray-900 border-r-gray-900';
        }
    };

    const triggerProps = {
        ref: triggerRef,
        ...(trigger === 'hover' && {
            onMouseEnter: showTooltip,
            onMouseLeave: hideTooltip,
        }),
        ...(trigger === 'click' && {
            onClick: toggleTooltip,
        }),
        ...(trigger === 'focus' && {
            onFocus: showTooltip,
            onBlur: hideTooltip,
        }),
    };

    if (disabled || !content) {
        return <>{children}</>;
    }

    return (
        <>
            <div {...triggerProps} className="inline-block">
                {children}
            </div>

            {isVisible && (
                <>
                    {/* Backdrop for click trigger */}
                    {trigger === 'click' && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={hideTooltip}
                        />
                    )}

                    {/* Tooltip */}
                    <div
                        ref={tooltipRef}
                        className={clsx(
                            'fixed z-50 rounded-md border font-medium transition-opacity duration-200',
                            variantClasses[variant],
                            sizeClasses[size],
                            multiline ? 'whitespace-pre-wrap' : 'whitespace-nowrap',
                            className
                        )}
                        style={{
                            left: tooltipPosition.x,
                            top: tooltipPosition.y,
                            maxWidth: multiline ? maxWidth : undefined,
                        }}
                        role="tooltip"
                    >
                        {content}

                        {/* Arrow */}
                        {arrow && (
                            <div
                                className={clsx(
                                    'absolute w-0 h-0',
                                    arrowClasses[position],
                                    getArrowBorderColor()
                                )}
                            />
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default Tooltip;
