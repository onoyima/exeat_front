'use client';

/**
 * Dashboard Skeleton Components
 * 
 * Comprehensive collection of skeleton components for the student dashboard.
 * Each skeleton component matches the exact dimensions and layout of its corresponding component.
 * 
 * Features:
 * - Consistent spacing using design philosophy standards (space-y-4, space-y-6)
 * - Proper visual hierarchy maintained in loading states
 * - Semantic structure for accessibility
 * - Modular components for reusability
 * - Responsive design matching actual components
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Main Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden" role="status" aria-label="Loading dashboard content">
      <WelcomeSectionSkeleton />
      <ReturnCountdownSkeleton />
      <StatisticsGridSkeleton />
      <ActionableInsightsSkeleton />
      <QuickActionsAndInfoSkeleton />
      <RecentExeatsSkeleton />
      {/* Screen reader announcement */}
      <span className="sr-only">Loading dashboard content, please wait...</span>
    </div>
  );
}

// Welcome Section Skeleton
export function WelcomeSectionSkeleton() {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
          {/* Enhanced avatar skeleton matching responsive h-16 w-16 md:h-20 md:w-20 sizing */}
          <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-lg flex-shrink-0" />
          <div className="space-y-2 min-w-0 flex-1">
            {/* Enhanced typography hierarchy matching responsive text-2xl md:text-3xl font-bold */}
            <Skeleton className="h-7 md:h-9 w-48 md:w-64" />
            {/* Enhanced description matching responsive text-base md:text-lg */}
            <Skeleton className="h-5 md:h-6 w-64 md:w-80" />
          </div>
        </div>
        {/* Enhanced button skeleton matching responsive size with proper mobile width */}
        <Skeleton className="h-12 md:h-14 w-full sm:w-48 md:w-56 rounded-md" />
      </div>
    </Card>
  );
}

// Return Countdown Skeleton
export function ReturnCountdownSkeleton() {
  return (
    <Card className={cn(
      "p-4 md:p-6 border-2 transition-all duration-300",
      "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon skeleton */}
          <div className="p-3 rounded-full bg-green-100">
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <div className="space-y-2">
            {/* Title skeleton */}
            <Skeleton className="h-6 md:h-7 w-48 md:w-56" />
            {/* Description skeleton */}
            <Skeleton className="h-4 md:h-5 w-64 md:w-80" />
          </div>
        </div>

        {/* Countdown timer skeleton */}
        <div className="text-right">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="text-center">
              <Skeleton className="h-8 md:h-9 w-8 md:w-10 mx-auto mb-1" />
              <div className="text-xs md:text-sm text-muted-foreground">
                <Skeleton className="h-3 w-8 mx-auto" />
              </div>
            </div>
            <div className="text-center">
              <Skeleton className="h-8 md:h-9 w-8 md:w-10 mx-auto mb-1" />
              <div className="text-xs md:text-sm text-muted-foreground">
                <Skeleton className="h-3 w-10 mx-auto" />
              </div>
            </div>
            <div className="text-center">
              <Skeleton className="h-8 md:h-9 w-8 md:w-10 mx-auto mb-1" />
              <div className="text-xs md:text-sm text-muted-foreground">
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="mt-4">
        <Skeleton className="w-full h-2 rounded-full" />
        <Skeleton className="h-3 w-48 mt-1 mx-auto" />
      </div>
    </Card>
  );
}

// Statistics Grid Skeleton with Progressive Disclosure
export function StatisticsGridSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Priority Stats Skeleton - Most Important */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <PriorityStatsCardSkeleton key={`priority-${i}`} />
        ))}
      </div>

      {/* Outcome Stats Skeleton - Secondary Information */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <OutcomeStatsCardSkeleton key={`outcome-${i}`} />
        ))}
      </div>
    </div>
  );
}

// Priority Stats Card Skeleton
export function PriorityStatsCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-blue-500 h-full flex flex-col transition-all duration-200 min-h-[120px] md:min-h-[140px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 flex-shrink-0 p-4 md:p-6">
        {/* Enhanced title skeleton matching responsive text-sm md:text-base */}
        <Skeleton className="h-3 md:h-4 w-16 sm:w-20 md:w-28" />
        {/* Enhanced icon skeleton matching responsive h-4 w-4 md:h-5 md:w-5 */}
        <Skeleton className="h-4 w-4 md:h-5 md:w-5 rounded flex-shrink-0" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-4 md:p-6 pt-0">
        {/* Enhanced value skeleton matching responsive text-2xl md:text-3xl */}
        <Skeleton className="h-7 md:h-9 w-10 md:w-12 mb-2 md:mb-3" />
        {/* Enhanced description skeleton matching responsive text-xs md:text-sm */}
        <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
      </CardContent>
    </Card>
  );
}

// Outcome Stats Card Skeleton
export function OutcomeStatsCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-green-500 h-full flex flex-col transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 flex-shrink-0 p-4 md:p-6">
        {/* Enhanced title skeleton matching responsive text-xs md:text-sm */}
        <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
        {/* Enhanced icon skeleton matching responsive h-3 w-3 md:h-4 md:w-4 */}
        <Skeleton className="h-3 w-3 md:h-4 md:w-4 rounded flex-shrink-0" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-4 md:p-6 pt-0">
        {/* Enhanced value skeleton matching responsive text-xl md:text-2xl */}
        <Skeleton className="h-6 md:h-8 w-10 md:w-12 mb-2" />
        {/* Enhanced description skeleton matching responsive text-xs md:text-sm */}
        <Skeleton className="h-3 md:h-4 w-20 md:w-28" />
      </CardContent>
    </Card>
  );
}

// Actionable Insights Skeleton
export function ActionableInsightsSkeleton({
  className,
  itemCount = 2
}: {
  className?: string;
  itemCount?: number;
}) {
  return (
    <Card className={cn("p-4 md:p-6", className)} role="region" aria-label="Loading actionable insights">
      <CardHeader className="pb-4 md:pb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 md:h-6 w-36 md:w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div role="list" aria-label="Loading actionable items">
          {[...Array(itemCount)].map((_, i) => (
            <div key={`insight-skeleton-${i}`} role="listitem">
              <ActionableItemSkeleton priority={i === 0 ? 'high' : 'medium'} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Actionable Item Skeleton
export function ActionableItemSkeleton({
  priority = 'medium'
}: {
  priority?: 'high' | 'medium' | 'low';
}) {
  const priorityColors = {
    high: 'border-l-red-500 bg-red-50/50',
    medium: 'border-l-orange-500 bg-orange-50/50',
    low: 'border-l-blue-500 bg-blue-50/50',
  };

  const priorityIconColors = {
    high: 'bg-red-100',
    medium: 'bg-orange-100',
    low: 'bg-blue-100',
  };

  return (
    <div className={cn(
      "group relative p-4 md:p-6 rounded-lg border-l-4 transition-all duration-200",
      "min-h-[100px] md:min-h-[120px]",
      priorityColors[priority]
    )}>
      <div className="flex items-start gap-4 md:gap-6">
        {/* Enhanced Icon Skeleton matching ActionableInsights structure */}
        <div className={cn(
          "flex-shrink-0 p-3 md:p-4 rounded-lg transition-colors duration-200",
          priorityIconColors[priority]
        )}>
          <Skeleton className="h-5 w-5 rounded" />
        </div>

        {/* Enhanced Content Skeleton matching ActionableInsights layout */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
          <div className="flex items-start justify-between gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
              {/* Enhanced title skeleton matching responsive text-sm md:text-base font-semibold */}
              <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
              {/* Enhanced count badge skeleton */}
              <Skeleton className="h-4 md:h-5 w-6 md:w-8 rounded-full" />
            </div>
          </div>

          {/* Enhanced description skeleton matching responsive text-sm md:text-base leading-relaxed */}
          <Skeleton className="h-4 md:h-5 w-full" />
          <Skeleton className="h-4 md:h-5 w-3/4" /> {/* Second line for longer descriptions */}

          <div className="flex items-center justify-between pt-2 md:pt-3">
            {/* Enhanced action button skeleton matching responsive text-sm md:text-base */}
            <Skeleton className="h-4 md:h-5 w-20 md:w-24" />
            {/* Enhanced arrow skeleton with opacity animation */}
            <div className="opacity-0 transition-opacity duration-200">
              <Skeleton className="h-4 w-4 md:h-5 md:w-5 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Actions and Student Info Skeleton
export function QuickActionsAndInfoSkeleton() {
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7">
      <QuickActionsSkeleton />
      <StudentInfoSkeleton />
    </div>
  );
}

// Quick Actions Skeleton
export function QuickActionsSkeleton() {
  return (
    <Card className="lg:col-span-4 p-4 md:p-6">
      <CardHeader className="pb-4 md:pb-6">
        {/* Enhanced title skeleton matching responsive text-lg md:text-xl font-semibold */}
        <Skeleton className="h-5 md:h-6 w-28 md:w-32 mb-2" />
        {/* Enhanced description skeleton matching responsive text-base md:text-lg */}
        <Skeleton className="h-4 md:h-5 w-48 md:w-64" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Enhanced button skeletons matching responsive h-12 md:h-14 with proper spacing */}
          <Skeleton className="h-12 md:h-14 w-full rounded-md" />
          <Skeleton className="h-12 md:h-14 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

// Student Info Skeleton
export function StudentInfoSkeleton() {
  return (
    <Card className="lg:col-span-3 p-4 md:p-6">
      <CardHeader className="pb-4 md:pb-6">
        {/* Enhanced title skeleton matching responsive text-lg md:text-xl font-semibold */}
        <Skeleton className="h-5 md:h-6 w-32 md:w-36 mb-2" />
        {/* Enhanced description skeleton matching responsive text-base md:text-lg */}
        <Skeleton className="h-4 md:h-5 w-40 md:w-48" />
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        {/* Essential Information Skeleton - Progressive Disclosure Level 1 */}
        <div className="space-y-4" role="region" aria-label="Loading essential student information">
          {[...Array(2)].map((_, i) => (
            <InfoItemSkeleton key={`essential-${i}`} />
          ))}
        </div>

        {/* Progressive Disclosure Section Skeleton - Level 2 */}
        <div className="pt-4 md:pt-6 space-y-4 border-t border-border/50" role="region" aria-label="Loading additional student details">
          {[...Array(2)].map((_, i) => (
            <InfoItemSkeleton key={`additional-${i}`} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Info Item Skeleton
export function InfoItemSkeleton() {
  return (
    <div className="flex items-center gap-3 md:gap-4 min-h-[48px]">
      {/* Enhanced icon skeleton matching responsive h-5 w-5 consistent sizing */}
      <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
      <div className="space-y-1 min-w-0 flex-1">
        {/* Enhanced value skeleton matching responsive text-sm md:text-base font-medium */}
        <Skeleton className="h-4 md:h-5 w-28 md:w-32" />
        {/* Enhanced label skeleton matching responsive text-xs md:text-sm */}
        <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
      </div>
    </div>
  );
}

// Recent Exeats Skeleton
export function RecentExeatsSkeleton() {
  return (
    <Card className="p-4 md:p-6">
      <CardHeader className="pb-4 md:pb-6">
        {/* Enhanced title skeleton matching responsive text-lg md:text-xl font-semibold */}
        <Skeleton className="h-5 md:h-6 w-32 md:w-40 mb-2" />
        {/* Enhanced description skeleton matching responsive text-base md:text-lg */}
        <Skeleton className="h-4 md:h-5 w-56 md:w-72" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] md:h-[450px] w-full rounded-md border">
          <div className="space-y-4 p-4 md:p-6">
            {/* Enhanced skeleton count to match typical display */}
            {[...Array(3)].map((_, i) => (
              <ExeatRequestCardSkeleton key={`exeat-${i}`} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Exeat Request Card Skeleton
export function ExeatRequestCardSkeleton() {
  return (
    <div className={cn(
      "group relative p-4 md:p-6 rounded-lg transition-all duration-200",
      "border border-border/50 hover:border-border overflow-x-hidden",
      "animate-pulse min-h-[120px] md:min-h-[140px]"
    )}>
      <div className="flex items-start gap-4 md:gap-6">
        {/* Category Icon Skeleton with Enhanced Visual Hierarchy */}
        <div className={cn(
          "flex-shrink-0 p-3 md:p-4 rounded-lg transition-all duration-200",
          "bg-primary/5 border border-primary/10"
        )}>
          <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded" />
        </div>

        {/* Content Skeleton with Improved Visual Hierarchy */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
          {/* Header Skeleton with Better Typography Hierarchy */}
          <div className="flex items-start justify-between gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <Skeleton className="h-4 md:h-5 w-16 md:w-20" /> {/* Category title */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full hidden sm:block" /> {/* Separator */}
                  <Skeleton className="h-3 md:h-4 w-20 md:w-24" /> {/* Date */}
                </div>
              </div>
            </div>
            {/* Enhanced Status Badge Skeleton Following Design Philosophy */}
            <Skeleton className="h-5 md:h-6 w-20 md:w-24 rounded-full flex-shrink-0" />
          </div>

          {/* Reason Skeleton with Better Typography */}
          <Skeleton className="h-3 md:h-4 w-full" />
          <Skeleton className="h-3 md:h-4 w-3/4" /> {/* Second line for longer reasons */}

          {/* Details Skeleton with Improved Spacing and Visual Hierarchy - Mobile-First */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-x-6 md:gap-x-8 sm:gap-y-3 pt-2">
            <div className="flex items-center gap-2 md:gap-3 min-h-[44px]">
              <Skeleton className="h-4 w-4 md:h-5 md:w-5 rounded flex-shrink-0" />
              <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
            </div>
            <div className="flex items-center gap-2 md:gap-3 min-h-[44px]">
              <Skeleton className="h-4 w-4 md:h-5 md:w-5 rounded flex-shrink-0" />
              <Skeleton className="h-3 md:h-4 w-20 md:w-28" />
            </div>
            <div className="flex items-center gap-2 md:gap-3 min-h-[44px]">
              <Skeleton className="h-4 w-4 md:h-5 md:w-5 rounded flex-shrink-0" />
              <Skeleton className="h-3 md:h-4 w-18 md:w-24" />
            </div>
          </div>
        </div>

        {/* Enhanced Arrow Skeleton with Better Animation */}
        <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2">
          <div className={cn(
            "p-2 md:p-3 rounded-full transition-all duration-200",
            "opacity-0 bg-primary/10 border border-primary/20"
          )}>
            <Skeleton className="h-4 w-4 md:h-5 md:w-5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional Utility Skeleton Components for Enhanced Loading States

// Generic Card Skeleton for consistent loading states
export function GenericCardSkeleton({
  className,
  hasHeader = true,
  hasDescription = true,
  contentLines = 3
}: {
  className?: string;
  hasHeader?: boolean;
  hasDescription?: boolean;
  contentLines?: number;
}) {
  return (
    <Card className={cn("p-6", className)}>
      {hasHeader && (
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-32 mb-2" />
          {hasDescription && <Skeleton className="h-5 w-48" />}
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {[...Array(contentLines)].map((_, i) => (
          <Skeleton key={i} className={cn(
            "h-4",
            i === contentLines - 1 ? "w-3/4" : "w-full"
          )} />
        ))}
      </CardContent>
    </Card>
  );
}

// Button Skeleton for consistent button loading states
export function ButtonSkeleton({
  size = 'default',
  className
}: {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-9 w-20',
    default: 'h-10 w-24',
    lg: 'h-12 w-32'
  };

  return (
    <Skeleton className={cn(
      "rounded-md",
      sizeClasses[size],
      className
    )} />
  );
}

// Badge Skeleton for consistent badge loading states
export function BadgeSkeleton({
  size = 'default',
  className
}: {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-12',
    default: 'h-5 w-16',
    lg: 'h-6 w-20'
  };

  return (
    <Skeleton className={cn(
      "rounded-full",
      sizeClasses[size],
      className
    )} />
  );
}

// Avatar Skeleton for consistent avatar loading states
export function AvatarSkeleton({
  size = 'default',
  className
}: {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <Skeleton className={cn(
      "rounded-lg",
      sizeClasses[size],
      className
    )} />
  );
}

// Text Skeleton for consistent text loading states
export function TextSkeleton({
  lines = 1,
  className,
  variant = 'body'
}: {
  lines?: number;
  className?: string;
  variant?: 'heading' | 'subheading' | 'body' | 'caption';
}) {
  const variantClasses = {
    heading: 'h-8',
    subheading: 'h-6',
    body: 'h-4',
    caption: 'h-3'
  };

  if (lines === 1) {
    return <Skeleton className={cn(variantClasses[variant], "w-full", className)} />;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            variantClasses[variant],
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}