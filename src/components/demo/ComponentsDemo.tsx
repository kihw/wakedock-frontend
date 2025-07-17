import React, { useState } from 'react';
import {
    Button,
    IconButton,
    Input,
    Badge,
    Icon,
    Spinner,
    Tooltip,
    LoadingSpinner,
    ErrorBoundary,
    EmptyState,
    EmptySearchResults,
    NoServices,
    NetworkError
} from '../ui';
import {
    Search,
    Plus,
    Settings,
    Download,
    Heart,
    Star,
    User,
    Mail
} from 'lucide-react';

const ComponentsDemo: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTestLoading = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 3000);
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
                <div className="max-w-6xl mx-auto space-y-12">
                    <header className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            WakeDock UI Components Demo
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Demonstration of migrated React components from SvelteKit
                        </p>
                    </header>

                    {/* Buttons Section */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Buttons</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Variants</h3>
                                <div className="space-y-2">
                                    <Button variant="primary">Primary</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="success">Success</Button>
                                    <Button variant="warning">Warning</Button>
                                    <Button variant="error">Error</Button>
                                    <Button variant="link">Link</Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Sizes</h3>
                                <div className="space-y-2">
                                    <Button size="xs">Extra Small</Button>
                                    <Button size="sm">Small</Button>
                                    <Button size="md">Medium</Button>
                                    <Button size="lg">Large</Button>
                                    <Button size="xl">Extra Large</Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">States</h3>
                                <div className="space-y-2">
                                    <Button leftIcon={Plus}>With Left Icon</Button>
                                    <Button rightIcon={Download}>With Right Icon</Button>
                                    <Button loading loadingText="Loading...">Loading</Button>
                                    <Button disabled>Disabled</Button>
                                    <Button fullWidth>Full Width</Button>
                                    <IconButton><Settings /></IconButton>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Inputs Section */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Inputs</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Input
                                    label="Default Input"
                                    placeholder="Enter text..."
                                    value={inputValue}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                                    helperText="This is a helper text"
                                />

                                <Input
                                    label="Input with Left Icon"
                                    placeholder="Search..."
                                    leftIcon={Search}
                                    clearable
                                    onClear={() => setInputValue('')}
                                />

                                <Input
                                    label="Password Input"
                                    type="password"
                                    placeholder="Enter password..."
                                    showPasswordToggle
                                />
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Error State"
                                    placeholder="Invalid input..."
                                    error
                                    errorMessage="This field is required"
                                />

                                <Input
                                    label="Success State"
                                    placeholder="Valid input..."
                                    success
                                    successMessage="Looks good!"
                                />

                                <Input
                                    label="Loading State"
                                    placeholder="Processing..."
                                    loading
                                />
                            </div>
                        </div>
                    </section>

                    {/* Badges Section */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Badges</h2>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="primary">Primary</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="success">Success</Badge>
                                <Badge variant="warning">Warning</Badge>
                                <Badge variant="error">Error</Badge>
                                <Badge variant="info">Info</Badge>
                                <Badge variant="neutral">Neutral</Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge size="sm">Small</Badge>
                                <Badge size="md">Medium</Badge>
                                <Badge size="lg">Large</Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge outlined>Outlined</Badge>
                                <Badge rounded>Rounded</Badge>
                                <Badge pulse>Pulsing</Badge>
                                <Badge icon={Star}>With Icon</Badge>
                                <Badge removable onRemove={() => console.log('Badge removed')}>
                                    Removable
                                </Badge>
                                <Badge dot />
                            </div>
                        </div>
                    </section>

                    {/* Avatars Section */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Avatars</h2>

                        <div className="flex flex-wrap gap-4">
                            <Avatar
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
                                alt="John Doe"
                                size="sm"
                            />
                            <Avatar
                                src="https://images.unsplash.com/photo-1494790108755-2616b2e9a280?w=150"
                                alt="Jane Smith"
                                size="md"
                            />
                            <Avatar
                                name="Alex Johnson"
                                size="lg"
                            />
                            <Avatar
                                fallbackIcon={User}
                                size="xl"
                            />
                        </div>
                    </section>

                    {/* Icons and Spinners Section */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Icons & Spinners</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Icons</h3>
                                <div className="flex gap-4">
                                    <Icon name="Heart" size="sm" variant="error" />
                                    <Icon name="Star" size="md" variant="warning" />
                                    <Icon name="Mail" size="lg" variant="primary" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Spinners</h3>
                                <div className="flex gap-4 items-center">
                                    <Spinner size="sm" />
                                    <Spinner size="md" variant="primary" />
                                    <Spinner size="lg" variant="success" />
                                    <LoadingSpinner size="xl" variant="warning" label="Loading..." />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tooltips Section */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Tooltips</h2>

                        <div className="flex gap-4">
                            <Tooltip content="This is a tooltip">
                                <Button>Hover me</Button>
                            </Tooltip>

                            <Tooltip content="Click to toggle" trigger="click" position="bottom">
                                <Button variant="outline">Click me</Button>
                            </Tooltip>

                            <Tooltip
                                content="This is a multiline tooltip with more detailed information about the feature"
                                multiline
                                maxWidth="300px"
                                variant="light"
                            >
                                <Button variant="secondary">Multiline tooltip</Button>
                            </Tooltip>
                        </div>
                    </section>

                    {/* Empty States Section */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Empty States</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                                <EmptySearchResults
                                    query="docker services"
                                    action={{
                                        label: "Clear search",
                                        onClick: () => console.log('Search cleared')
                                    }}
                                />
                            </div>

                            <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                                <NoServices
                                    action={{
                                        label: "Add Service",
                                        onClick: () => console.log('Add service clicked')
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Loading Demo */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Loading Demo</h2>

                        <div className="space-y-4">
                            <Button onClick={handleTestLoading} disabled={loading}>
                                {loading ? 'Loading...' : 'Test Loading Overlay'}
                            </Button>

                            {loading && (
                                <LoadingSpinner
                                    overlay
                                    size="lg"
                                    label="Processing your request..."
                                    overlayColor="bg-black bg-opacity-50"
                                />
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ComponentsDemo;
