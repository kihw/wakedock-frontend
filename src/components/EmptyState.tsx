import React from 'react';
import { clsx } from 'clsx';
import {
    FileText,
    Search,
    Database,
    AlertCircle,
    Plus,
    RefreshCw,
    Inbox,
    WifiOff,
    Settings,
    Users
} from 'lucide-react';

export interface EmptyStateProps {
    icon?: 'file' | 'search' | 'database' | 'error' | 'inbox' | 'offline' | 'settings' | 'users' | React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'outline';
        icon?: React.ComponentType<{ className?: string }>;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'outline';
        icon?: React.ComponentType<{ className?: string }>;
    };
    size?: 'sm' | 'md' | 'lg';
    layout?: 'center' | 'left';
    illustration?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'inbox',
    title,
    description,
    action,
    secondaryAction,
    size = 'md',
    layout = 'center',
    illustration,
    className,
    children,
}) => {
    const iconMap = {
        file: FileText,
        search: Search,
        database: Database,
        error: AlertCircle,
        inbox: Inbox,
        offline: WifiOff,
        settings: Settings,
        users: Users,
    };

    const IconComponent = typeof icon === 'string' ? iconMap[icon] : icon;

    const sizeClasses = {
        sm: {
            container: 'py-8',
            icon: 'w-8 h-8 mb-3',
            title: 'text-lg font-medium',
            description: 'text-sm',
            button: 'px-3 py-2 text-sm',
        },
        md: {
            container: 'py-12',
            icon: 'w-12 h-12 mb-4',
            title: 'text-xl font-semibold',
            description: 'text-base',
            button: 'px-4 py-2 text-sm',
        },
        lg: {
            container: 'py-16',
            icon: 'w-16 h-16 mb-6',
            title: 'text-2xl font-bold',
            description: 'text-lg',
            button: 'px-6 py-3 text-base',
        },
    };

    const layoutClasses = {
        center: 'text-center',
        left: 'text-left',
    };

    const buttonVariants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
        outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 dark:hover:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    };

    const renderButton = (buttonConfig: typeof action, isPrimary = true) => {
        if (!buttonConfig) return null;

        const ButtonIcon = buttonConfig.icon;
        const variant = buttonConfig.variant || (isPrimary ? 'primary' : 'outline');

        return (
            <button
                onClick={buttonConfig.onClick}
                className={clsx(
                    'inline-flex items-center justify-center font-medium rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    sizeClasses[size].button,
                    buttonVariants[variant],
                    !isPrimary && 'ml-3'
                )}
            >
                {ButtonIcon && (
                    <ButtonIcon className={clsx(
                        size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
                        'mr-2'
                    )} />
                )}
                {buttonConfig.label}
            </button>
        );
    };

    return (
        <div className={clsx(
            'flex flex-col items-center justify-center',
            sizeClasses[size].container,
            layoutClasses[layout],
            className
        )}>
            {/* Illustration or Icon */}
            {illustration ? (
                <div className="mb-4">
                    {illustration}
                </div>
            ) : IconComponent ? (
                <div className={clsx(
                    'flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500',
                    sizeClasses[size].icon,
                    layout === 'center' ? 'mx-auto' : ''
                )}>
                    <IconComponent className={clsx(
                        size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
                    )} />
                </div>
            ) : null}

            {/* Content */}
            <div className={clsx(
                layout === 'center' ? 'max-w-md' : 'max-w-2xl'
            )}>
                <h3 className={clsx(
                    'text-gray-900 dark:text-white mb-2',
                    sizeClasses[size].title
                )}>
                    {title}
                </h3>

                {description && (
                    <p className={clsx(
                        'text-gray-600 dark:text-gray-400 mb-6',
                        sizeClasses[size].description
                    )}>
                        {description}
                    </p>
                )}

                {/* Actions */}
                {(action || secondaryAction) && (
                    <div className={clsx(
                        'flex',
                        layout === 'center' ? 'justify-center' : 'justify-start'
                    )}>
                        {renderButton(action, true)}
                        {renderButton(secondaryAction, false)}
                    </div>
                )}

                {/* Custom children */}
                {children && (
                    <div className="mt-6">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmptyState;

// Predefined empty states for common scenarios
export const EmptySearchResults: React.FC<Omit<EmptyStateProps, 'icon' | 'title'> & { query?: string }> = ({
    query,
    description,
    ...props
}) => (
    <EmptyState
        icon="search"
        title={query ? `No results for "${query}"` : 'No results found'}
        description={description || 'Try adjusting your search criteria or check your spelling.'}
        {...props}
    />
);

export const EmptyDataTable: React.FC<Omit<EmptyStateProps, 'icon' | 'title'>> = ({
    description,
    ...props
}) => (
    <EmptyState
        icon="database"
        title="No data available"
        description={description || 'There is no data to display at the moment.'}
        {...props}
    />
);

export const NoServices: React.FC<Omit<EmptyStateProps, 'icon' | 'title'>> = ({
    description,
    ...props
}) => (
    <EmptyState
        icon="database"
        title="No services found"
        description={description || 'Get started by creating your first service.'}
        action={{
            label: 'Add Service',
            onClick: () => { },
            icon: Plus,
        }}
        {...props}
    />
);

export const NetworkError: React.FC<Omit<EmptyStateProps, 'icon' | 'title'>> = ({
    description,
    ...props
}) => (
    <EmptyState
        icon="offline"
        title="Connection Error"
        description={description || 'Unable to connect to the server. Please check your connection and try again.'}
        action={{
            label: 'Retry',
            onClick: () => window.location.reload(),
            icon: RefreshCw,
        }}
        {...props}
    />
);
