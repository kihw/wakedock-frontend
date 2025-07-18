import React from 'react';
import { clsx } from 'clsx';

export interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    name,
    size = 'md',
    className
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg'
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={clsx(
            'rounded-full flex items-center justify-center bg-gray-300 text-gray-700 font-semibold',
            sizeClasses[size],
            className
        )}>
            {src ? (
                <img
                    src={src}
                    alt={alt || name}
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <span>{name ? getInitials(name) : '?'}</span>
            )}
        </div>
    );
};

export default Avatar;
