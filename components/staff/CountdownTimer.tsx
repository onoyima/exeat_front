"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { getTimeRemaining, formatTimeRemaining, getCountdownColor } from '@/lib/utils/exeat';

interface CountdownTimerProps {
    returnDate: string;
    className?: string;
}

export function CountdownTimer({ returnDate, className = '' }: CountdownTimerProps) {
    const [timeData, setTimeData] = useState(() => getTimeRemaining(returnDate));
    const [formattedTime, setFormattedTime] = useState(() => formatTimeRemaining(timeData));

    useEffect(() => {
        const updateTimer = () => {
            const newTimeData = getTimeRemaining(returnDate);
            setTimeData(newTimeData);
            setFormattedTime(formatTimeRemaining(newTimeData));
        };

        // Update immediately
        updateTimer();

        // Set up interval to update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [returnDate]);

    const getIcon = () => {
        if (timeData.isOverdue) {
            return <AlertTriangle className="h-5 w-5 text-red-600" />;
        }
        if (timeData.days === 0 && timeData.hours < 6) {
            return <AlertTriangle className="h-5 w-5 text-orange-600" />;
        }
        return <Clock className="h-5 w-5 text-green-600" />;
    };

    const getTitle = () => {
        if (timeData.isOverdue) {
            return 'Return Overdue';
        }
        return 'Time Until Return';
    };

    const getDescription = () => {
        if (timeData.isOverdue) {
            return 'The student should have returned by now. Please follow up.';
        }
        if (timeData.days === 0 && timeData.hours < 6) {
            return 'Student should return soon. Monitor closely.';
        }
        return 'Student is expected to return on schedule.';
    };

    return (
        <Card className={`${getCountdownColor(timeData)} border-2 transition-all duration-300 ${timeData.isOverdue ? 'shadow-lg' : ''
            } ${className}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={timeData.isOverdue ? 'animate-bounce' : ''}>
                            {getIcon()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">{getTitle()}</h3>
                            <p className="text-xs opacity-75">{getDescription()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold font-mono ${timeData.isOverdue ? 'text-red-700' : ''
                            }`}>
                            {formattedTime}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                            {timeData.isOverdue ? 'Overdue' : 'Remaining'}
                        </div>
                    </div>
                </div>

                {/* Progress bar for visual indication */}
                {!timeData.isOverdue && (
                    <div className="mt-3">
                        <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full transition-all duration-1000 ${timeData.days === 0 && timeData.hours < 6
                                    ? 'bg-orange-500'
                                    : timeData.days === 0 && timeData.hours < 24
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                    }`}
                                style={{
                                    width: `${Math.min(100, Math.max(0, (timeData.totalMs / (24 * 60 * 60 * 1000)) * 100))}%`
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Overdue warning bar */}
                {timeData.isOverdue && (
                    <div className="mt-3">
                        <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-2 bg-red-600 rounded-full"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <p className="text-xs text-red-700 mt-2 font-medium">
                            ⚠️ Immediate attention required - Student is overdue
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
