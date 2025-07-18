// Enhanced Card Component - Atom
'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CardHierarchy } from '@/models/ui/interface';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'solid' | 'outlined';
    surface?: 'elevated' | 'raised' | 'floating' | 'overlay';
    depth?: 1 | 2 | 3 | 4 | 5;
    interaction?: 'static' | 'hover' | 'clickable' | 'draggable';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    animate?: boolean;
    glow?: boolean;
    gradient?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({
        className,
        variant = 'default',
        surface = 'elevated',
        depth = 1,
        interaction = 'static',
        padding = 'md',
        animate = true,
        glow = false,
        gradient = false,
        children,
        ...props
    }, ref) => {
        const baseClasses = `
      relative rounded-xl border transition-all duration-300
      ${interaction === 'clickable' ? 'cursor-pointer' : ''}
      ${interaction === 'draggable' ? 'cursor-move' : ''}
    `;

        const variantClasses = {
            default: `
        bg-white border-gray-200
        dark:bg-gray-800 dark:border-gray-700
      `,
            glass: `
        bg-white/80 backdrop-blur-md border-white/20
        dark:bg-gray-800/80 dark:border-gray-700/20
      `,
            solid: `
        bg-white border-gray-300
        dark:bg-gray-900 dark:border-gray-600
      `,
            outlined: `
        bg-transparent border-2 border-gray-300
        dark:border-gray-600
      `,
        };

        const surfaceClasses = {
            elevated: '',
            raised: 'transform translate-y-[-2px]',
            floating: 'transform translate-y-[-4px]',
            overlay: 'transform translate-y-[-8px]',
        };

        const depthClasses = {
            1: 'shadow-sm',
            2: 'shadow-md',
            3: 'shadow-lg',
            4: 'shadow-xl',
            5: 'shadow-2xl',
        };

        const paddingClasses = {
            none: '',
            sm: 'p-3',
            md: 'p-4',
            lg: 'p-6',
            xl: 'p-8',
        };

        const hoverClasses = {
            static: '',
            hover: 'hover:shadow-lg hover:transform hover:translate-y-[-1px]',
            clickable: 'hover:shadow-lg hover:transform hover:translate-y-[-2px] active:transform active:translate-y-[0px]',
            draggable: 'hover:shadow-xl hover:transform hover:translate-y-[-4px]',
        };

        const glowClasses = glow ? `
      ring-1 ring-indigo-500/20
      shadow-lg shadow-indigo-500/20
      dark:ring-indigo-400/20
      dark:shadow-indigo-400/20
    ` : '';

        const gradientClasses = gradient ? `
      bg-gradient-to-br from-white to-gray-50
      dark:from-gray-800 dark:to-gray-900
    ` : '';

        const CardComponent = (
            <div
                ref={ref}
                className={cn(
                    baseClasses,
                    variantClasses[variant],
                    surfaceClasses[surface],
                    depthClasses[depth],
                    paddingClasses[padding],
                    hoverClasses[interaction],
                    glowClasses,
                    gradientClasses,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );

        if (animate) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={
                        interaction === 'hover' || interaction === 'clickable'
                            ? {
                                scale: 1.02,
                                transition: { duration: 0.2 },
                            }
                            : {}
                    }
                    whileTap={
                        interaction === 'clickable'
                            ? {
                                scale: 0.98,
                                transition: { duration: 0.1 },
                            }
                            : {}
                    }
                >
                    {CardComponent}
                </motion.div>
            );
        }

        return CardComponent;
    }
);

Card.displayName = 'Card';

// Card Sub-components
const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5 p-6', className)}
            {...props}
        />
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('font-semibold leading-none tracking-tight', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
            {...props}
        />
    )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('p-6 pt-0', className)}
            {...props}
        />
    )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex items-center p-6 pt-0', className)}
            {...props}
        />
    )
);
CardFooter.displayName = 'CardFooter';

export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
};
