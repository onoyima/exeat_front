'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { format, differenceInMinutes, differenceInSeconds, endOfDay, startOfDay } from 'date-fns';
import { AlertCircle, Timer, MapPinned } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExeatCountdownProps {
    departureDate: string;
    returnDate: string;
    variant?: 'student' | 'staff';
    className?: string;
}

export function ExeatCountdown({ departureDate, returnDate, variant = 'student', className }: ExeatCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        totalMinutes: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0 });

    // Check if same-day exeat (daily exeat)
    const isSameDay = useMemo(() => {
        try {
            const dep = new Date(departureDate);
            const ret = new Date(returnDate);
            return (
                dep.getFullYear() === ret.getFullYear() &&
                dep.getMonth() === ret.getMonth() &&
                dep.getDate() === ret.getDate()
            );
        } catch {
            return false;
        }
    }, [departureDate, returnDate]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            try {
                const now = new Date();
                const depDate = new Date(departureDate);
                const retDate = new Date(returnDate);

                if (isNaN(retDate.getTime()) || isNaN(depDate.getTime())) {
                    console.error('Invalid date format:', departureDate, returnDate);
                    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0 });
                    return;
                }

                // Deadline is 11:59 PM (end of day) of the return date itself
                // If return date is Oct 29, deadline is 11:59 PM Oct 29
                const returnDeadline = endOfDay(retDate); // End of the return date

                if (isSameDay) {
                    // For same-day exeats, treat overdue as crossing 11:59 PM of the return date
                    if (now > returnDeadline) {
                        // Overdue - past end of the return date
                        const totalOverdueSeconds = Math.abs(differenceInSeconds(now, returnDeadline));
                        const overdueDays = Math.ceil(totalOverdueSeconds / 86400);
                        const overdueHours = Math.floor(totalOverdueSeconds / 3600) % 24;
                        const overdueMinutes = Math.floor(totalOverdueSeconds / 60) % 60;
                        const overdueSeconds = totalOverdueSeconds % 60;
                        setTimeLeft({
                            days: overdueDays,
                            hours: overdueHours,
                            minutes: overdueMinutes,
                            seconds: overdueSeconds,
                            totalMinutes: -differenceInMinutes(now, returnDeadline)
                        });
                        return;
                    } else {
                        // Not overdue yet - still before end of return date
                        const remainingSeconds = Math.max(0, differenceInSeconds(returnDeadline, now));
                        const days = Math.floor(remainingSeconds / 86400);
                        setTimeLeft({
                            days: Math.max(0, days),
                            hours: 0,
                            minutes: 0,
                            seconds: remainingSeconds % 60,
                            totalMinutes: differenceInMinutes(returnDeadline, now)
                        });
                        return;
                    }
                }

                // For multi-day exeats, use detailed countdown
                const totalMinutes = differenceInMinutes(returnDeadline, now);

                if (totalMinutes <= 0) {
                    // Overdue - calculate overdue duration (counting from end of return date)
                    const totalOverdueSeconds = Math.abs(differenceInSeconds(now, returnDeadline));
                    const overdueDays = Math.ceil(totalOverdueSeconds / 86400);
                    const overdueHours = Math.floor(totalOverdueSeconds / 3600) % 24;
                    const overdueMinutes = Math.floor(totalOverdueSeconds / 60) % 60;
                    const overdueSeconds = totalOverdueSeconds % 60;
                    setTimeLeft({
                        days: overdueDays,
                        hours: overdueHours,
                        minutes: overdueMinutes,
                        seconds: overdueSeconds,
                        totalMinutes
                    });
                    return;
                }

                // Not overdue - show time remaining
                const totalRemainingSeconds = differenceInSeconds(returnDeadline, now);
                const days = Math.floor(totalRemainingSeconds / 86400);
                const hours = Math.floor(totalRemainingSeconds / 3600) % 24;
                const minutes = Math.floor(totalRemainingSeconds / 60) % 60;
                const seconds = totalRemainingSeconds % 60;

                setTimeLeft({ days, hours, minutes, seconds, totalMinutes });
            } catch (error) {
                console.error('Error in countdown calculation:', error);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0 });
            }
        };

        calculateTimeLeft();

        // Update every second when overdue for real-time counting, otherwise every minute
        // Check if currently overdue to set appropriate interval
        const now = new Date();
        const retDate = new Date(returnDate);
        // Deadline is 11:59 PM of the return date itself
        const returnDeadline = endOfDay(retDate);

        let isCurrentlyOverdue = false;
        if (isSameDay) {
            isCurrentlyOverdue = now > returnDeadline;
        } else {
            isCurrentlyOverdue = differenceInMinutes(returnDeadline, now) <= 0;
        }

        const interval = isCurrentlyOverdue ? 1000 : 60000; // Every second if overdue, every minute otherwise
        const timer = setInterval(calculateTimeLeft, interval);

        return () => clearInterval(timer);
    }, [returnDate, departureDate, isSameDay]);

    const isOverdue = timeLeft.totalMinutes <= 0;
    const isUrgent = !isSameDay && timeLeft.totalMinutes <= 1440 && timeLeft.totalMinutes > 0;

    // Calculate penalty amount (for students)
    const penaltyAmount = isOverdue ? timeLeft.days * 10000 : 0;

    // Simplified messaging
    const getTitle = () => {
        if (isOverdue) {
            return variant === 'student' ? 'Overdue' : 'Student Overdue';
        }
        return variant === 'student' ? 'Return Date' : 'Return Date';
    };

    const getReturnDateText = () => format(new Date(returnDate), 'MMM d, yyyy');

    return (
        <Card className={cn(
            "p-3 sm:p-4 border-2 transition-all duration-300",
            isOverdue
                ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-red-100"
                : isUrgent
                    ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-orange-100"
                    : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100",
            className
        )}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={cn(
                        "p-2 rounded-full flex-shrink-0",
                        isOverdue ? "bg-red-100" :
                            isUrgent ? "bg-orange-100" : "bg-green-100"
                    )}>
                        {isOverdue ? (
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                        ) : isUrgent ? (
                            <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                        ) : (
                            <MapPinned className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className={cn(
                            "font-semibold text-sm sm:text-base",
                            isOverdue ? "text-red-900" :
                                isUrgent ? "text-orange-900" : "text-green-900"
                        )}>
                            {getTitle()}
                        </h3>
                        <p className={cn(
                            "text-xs mt-0.5",
                            isOverdue ? "text-red-700" :
                                isUrgent ? "text-orange-700" : "text-green-700"
                        )}>
                            {getReturnDateText()}
                        </p>
                    </div>
                </div>

                {/* Show countdown timer or overdue duration */}
                <div className="flex-shrink-0">
                    {isOverdue ? (
                        // Show overdue duration with seconds (for all exeats - same-day and multi-day)
                        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 w-full sm:w-auto">
                            <div className="text-center min-w-0 px-0.5">
                                <div className="text-lg sm:text-xl font-bold text-red-600">
                                    {timeLeft.days}
                                </div>
                                <div className="text-[10px] text-red-700 mt-0.5">D</div>
                            </div>
                            <div className="text-center min-w-0 px-0.5">
                                <div className="text-lg sm:text-xl font-bold text-red-600">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </div>
                                <div className="text-[10px] text-red-700 mt-0.5">H</div>
                            </div>
                            <div className="text-center min-w-0 px-0.5">
                                <div className="text-lg sm:text-xl font-bold text-red-600">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </div>
                                <div className="text-[10px] text-red-700 mt-0.5">M</div>
                            </div>
                            <div className="text-center min-w-0 px-0.5">
                                <div className="text-lg sm:text-xl font-bold text-red-600">
                                    {String(timeLeft.seconds).padStart(2, '0')}
                                </div>
                                <div className="text-[10px] text-red-700 mt-0.5">S</div>
                            </div>
                        </div>
                    ) : (
                        // Show time remaining (only for multi-day exeats)
                        !isSameDay && (
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full sm:w-auto">
                                <div className="text-center min-w-0 px-0.5">
                                    <div className={cn(
                                        "text-xl sm:text-2xl font-bold",
                                        isUrgent ? "text-orange-600" : "text-green-600"
                                    )}>
                                        {timeLeft.days}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">D</div>
                                </div>
                                <div className="text-center min-w-0 px-0.5">
                                    <div className={cn(
                                        "text-xl sm:text-2xl font-bold",
                                        isUrgent ? "text-orange-600" : "text-green-600"
                                    )}>
                                        {timeLeft.hours}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">H</div>
                                </div>
                                <div className="text-center min-w-0 px-0.5">
                                    <div className={cn(
                                        "text-xl sm:text-2xl font-bold",
                                        isUrgent ? "text-orange-600" : "text-green-600"
                                    )}>
                                        {timeLeft.minutes}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">M</div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Progress Bar - only show for multi-day exeats when not overdue */}
            {!isOverdue && !isSameDay && (
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-1000",
                                isUrgent ? "bg-orange-500" : "bg-green-500"
                            )}
                            style={{
                                width: `${(() => {
                                    try {
                                        const start = startOfDay(new Date(departureDate)).getTime();
                                        const end = endOfDay(new Date(returnDate)).getTime();
                                        const now = Date.now();
                                        if (isNaN(start) || isNaN(end) || end <= start) return 0;
                                        const progress = ((now - start) / (end - start)) * 100;
                                        return Math.max(0, Math.min(100, progress));
                                    } catch {
                                        return 0;
                                    }
                                })()}%`
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Penalty Information - only show for students when overdue */}
            {isOverdue && variant === 'student' && (
                <div className="mt-3 p-2.5 bg-red-100 border border-red-300 rounded-md">
                    <p className="text-xs text-red-800">
                        <span className="font-semibold">Penalty:</span> ₦{penaltyAmount.toLocaleString()} ({timeLeft.days} day{timeLeft.days !== 1 ? 's' : ''} × ₦10,000)
                    </p>
                </div>
            )}

            {/* Overdue warning for staff */}
            {isOverdue && variant === 'staff' && (
                <div className="mt-3 p-2.5 bg-red-100 border border-red-300 rounded-md">
                    <p className="text-xs text-red-800">
                        <span className="font-semibold">Penalty:</span> ₦{penaltyAmount.toLocaleString()}
                    </p>
                </div>
            )}
        </Card>
    );
}
