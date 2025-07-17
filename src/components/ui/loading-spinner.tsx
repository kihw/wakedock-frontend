'use client';

import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'white' | 'gray';
    className?: string;
    text?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
};

const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
};

export function LoadingSpinner({
    size = 'md',
    color = 'primary',
    className,
    text
}: LoadingSpinnerProps) {
    return (
        <div className={cn('flex items-center justify-center', className)}>
            <div className="flex flex-col items-center space-y-2">
                <svg
                    className={cn(
                        'animate-spin',
                        sizeClasses[size],
                        colorClasses[color]
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                {text && (
                    <p className={cn(
                        'text-sm font-medium',
                        colorClasses[color]
                    )}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}

// Loading components for different UI contexts
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <LoadingSpinner size="xl" text={text} />
        </div>
    );
}

export function ComponentLoader({ text }: { text?: string }) {
    return (
        <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}

export function InlineLoader({ size = 'sm' }: { size?: 'sm' | 'md' }) {
    return <LoadingSpinner size={size} />;
}

// Skeleton loaders for better UX
export function CardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="animate-pulse space-y-2">
            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="flex space-x-4 p-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                </div>
            ))}
        </div>
    );
}
