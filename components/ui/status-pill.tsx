import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusText } from '@/lib/utils/exeat';
import { cn } from '@/lib/utils';

interface StatusPillProps {
    status: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const StatusPill: React.FC<StatusPillProps> = ({
    status,
    className,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    return (
        <Badge
            className={cn(
                'whitespace-nowrap font-medium',
                sizeClasses[size],
                getStatusColor(status),
                className
            )}
        >
            {getStatusText(status)}
        </Badge>
    );
};
