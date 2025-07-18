import React from 'react';
import { cn } from '../../lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'warning' | 'success';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = 'default', ...props }, ref) => (
        <div
            ref={ref}
            role="alert"
            className={cn(
                'relative w-full rounded-lg border p-4',
                {
                    'border-gray-200 bg-gray-50 text-gray-900': variant === 'default',
                    'border-red-200 bg-red-50 text-red-900': variant === 'destructive',
                    'border-yellow-200 bg-yellow-50 text-yellow-900': variant === 'warning',
                    'border-green-200 bg-green-50 text-green-900': variant === 'success',
                },
                className
            )}
            {...props}
        />
    )
);
Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm [&_p]:leading-relaxed', className)}
        {...props}
    />
));
AlertDescription.displayName = 'AlertDescription';

const AlertTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn('mb-1 font-medium leading-none tracking-tight', className)}
        {...props}
    />
));
AlertTitle.displayName = 'AlertTitle';

export { Alert, AlertDescription, AlertTitle };
