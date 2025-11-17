'use client';

/**
 * ActionableInsights Component
 * 
 * Displays a prioritized list of items requiring student attention based on their exeat requests.
 * Implements progressive disclosure by showing only the most important actionable items.
 * 
 * Features:
 * - Priority-based sorting (high -> medium -> low)
 * - Clean card layout with clear call-to-action items
 * - Semantic color coding for different priority levels
 * - Proper accessibility with keyboard navigation and ARIA labels
 * - Responsive design following the design philosophy
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Clock,
  Users,
  Home,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ActionableInsightsSkeleton } from './DashboardSkeletons';

interface ExeatRequest {
  id: number;
  status: string;
  category_id: number;
  is_medical: number;
  reason: string;
  departure_date: string;
  return_date: string;
  created_at: string;
  destination?: string;
}

interface ActionableInsightsProps {
  exeatRequests: ExeatRequest[];
  className?: string;
  isLoading?: boolean;
}

interface ActionableItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  count?: number;
  href?: string;
  onClick?: () => void;
}

export function ActionableInsights({ exeatRequests, className, isLoading = false }: ActionableInsightsProps) {
  // Show skeleton while loading
  if (isLoading) {
    return <ActionableInsightsSkeleton className={className} />;
  }

  // Generate actionable items based on exeat requests
  const actionableItems = generateActionableItems(exeatRequests);

  if (actionableItems.length === 0) {
    return null; // Don't show the component if there are no actionable items
  }

  return (
    <Card className={cn("p-4 md:p-6 overflow-x-hidden", className)} role="region" aria-labelledby="actionable-insights-title">
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle
          id="actionable-insights-title"
          className="text-lg md:text-xl font-semibold flex items-center gap-3 overflow-x-hidden"
        >
          <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Needs Your Attention</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div role="list" aria-label="Actionable items requiring your attention">
          {actionableItems.map((item) => (
            <div key={item.id} role="listitem">
              <ActionableItemCard item={item} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActionableItemCardProps {
  item: ActionableItem;
}

function ActionableItemCard({ item }: ActionableItemCardProps) {
  const { icon: Icon, title, description, action, priority, count, href, onClick } = item;

  const priorityColors = {
    high: 'border-l-red-500 bg-red-50/50 hover:bg-red-50/70',
    medium: 'border-l-orange-500 bg-orange-50/50 hover:bg-orange-50/70',
    low: 'border-l-blue-500 bg-blue-50/50 hover:bg-blue-50/70',
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-orange-100 text-orange-800 border-orange-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const priorityIconColors = {
    high: 'text-red-600 bg-red-100',
    medium: 'text-orange-600 bg-orange-100',
    low: 'text-blue-600 bg-blue-100',
  };

  const cardContent = (
    <div className={cn(
      "group relative p-4 md:p-6 rounded-lg border-l-4 transition-all duration-200",
      "hover:shadow-md hover:-translate-y-0.5 cursor-pointer overflow-x-hidden",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      "touch-manipulation min-h-[100px] md:min-h-[120px]",
      priorityColors[priority]
    )}>
      <div className="flex items-start gap-4 md:gap-6">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 p-3 md:p-4 rounded-lg transition-colors duration-200",
          priorityIconColors[priority]
        )}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4 overflow-x-hidden">
          <div className="flex items-start justify-between gap-3 md:gap-4 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap min-w-0 flex-1">
              <h3 className="text-sm md:text-base font-semibold text-foreground leading-tight truncate">
                {title}
              </h3>
              {count && count > 0 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs md:text-sm font-medium px-2 md:px-3 py-1 md:py-1.5 self-start sm:self-auto",
                    priorityBadgeColors[priority]
                  )}
                >
                  {count}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed break-words overflow-wrap-anywhere">
            {description}
          </p>

          <div className="flex items-center justify-between pt-2 md:pt-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm md:text-base font-medium p-0 h-auto transition-colors duration-200",
                "hover:text-primary/80 focus:text-primary/80 touch-manipulation min-h-[48px] flex items-center",
                priority === 'high' ? 'text-red-600 hover:text-red-700' :
                  priority === 'medium' ? 'text-orange-600 hover:text-orange-700' :
                    'text-blue-600 hover:text-blue-700'
              )}
            >
              {action}
            </Button>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ArrowRight className={cn(
                "h-4 w-4 md:h-5 md:w-5",
                priority === 'high' ? 'text-red-600' :
                  priority === 'medium' ? 'text-orange-600' :
                    'text-blue-600'
              )} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block"
        aria-label={`${title}: ${description}`}
      >
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`${title}: ${description}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div aria-label={`${title}: ${description}`}>
      {cardContent}
    </div>
  );
}

function generateActionableItems(exeatRequests: ExeatRequest[]): ActionableItem[] {
  const items: ActionableItem[] = [];

  // Parent consent needed - High Priority
  const parentConsentRequests = exeatRequests.filter(r => r.status === 'parent_consent');
  if (parentConsentRequests.length > 0) {
    items.push({
      id: 'parent-consent',
      icon: Users,
      title: 'Parent consent required',
      description: `${parentConsentRequests.length} request${parentConsentRequests.length > 1 ? 's' : ''} awaiting parent approval. Contact your parents to approve these requests.`,
      action: 'View Requests',
      priority: 'high',
      count: parentConsentRequests.length,
      href: '/student/exeats?filter=parent_consent',
    });
  }

  // Hostel sign-in/sign-out required - High Priority
  const hostelRequests = exeatRequests.filter(r =>
    ['hostel_signin', 'hostel_signout'].includes(r.status)
  );

  if (hostelRequests.length > 0) {
    const signOutRequests = hostelRequests.filter(r => r.status === 'hostel_signout');
    const signInRequests = hostelRequests.filter(r => r.status === 'hostel_signin');

    if (signOutRequests.length > 0) {
      items.push({
        id: 'hostel-signout',
        icon: Home,
        title: 'Hostel sign-out required',
        description: `${signOutRequests.length} approved request${signOutRequests.length > 1 ? 's' : ''} ready for departure. Visit the hostel office to sign out.`,
        action: 'Visit Hostel Office',
        priority: 'high',
        count: signOutRequests.length,
        href: '/student/exeats?filter=hostel_signout',
      });
    }

    if (signInRequests.length > 0) {
      items.push({
        id: 'hostel-signin',
        icon: Home,
        title: 'Hostel sign-in required',
        description: `${signInRequests.length} request${signInRequests.length > 1 ? 's' : ''} awaiting your return. Visit the hostel office to sign in.`,
        action: 'Complete Sign-in',
        priority: 'high',
        count: signInRequests.length,
        href: '/student/exeats?filter=hostel_signin',
      });
    }
  }

  // Requests under review that might need follow-up - Medium Priority
  const reviewRequests = exeatRequests.filter(r =>
    ['cmd_review', 'secretary_review', 'dean_review'].includes(r.status)
  );

  // Check for requests older than 5 days in review
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const oldReviewRequests = reviewRequests.filter(r =>
    new Date(r.created_at) < fiveDaysAgo
  );

  if (oldReviewRequests.length > 0) {
    items.push({
      id: 'long-review',
      icon: Clock,
      title: 'Requests under extended review',
      description: `${oldReviewRequests.length} request${oldReviewRequests.length > 1 ? 's' : ''} have been under review for over 5 days. Consider following up if urgent.`,
      action: 'Check Status',
      priority: 'medium',
      count: oldReviewRequests.length,
      href: '/student/exeats?filter=review',
    });
  }

  // Medical requests that might need documentation - Medium Priority
  const medicalRequests = exeatRequests.filter(r =>
    r.is_medical === 1 && ['pending', 'cmd_review'].includes(r.status)
  );

  if (medicalRequests.length > 0) {
    items.push({
      id: 'medical-docs',
      icon: FileText,
      title: 'Medical documentation may be needed',
      description: `${medicalRequests.length} medical request${medicalRequests.length > 1 ? 's' : ''} in process. Ensure you have proper medical documentation ready.`,
      action: 'Review Requests',
      priority: 'medium',
      count: medicalRequests.length,
      href: '/student/exeats?filter=medical',
    });
  }

  // Upcoming departure dates - Medium Priority
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingDepartures = exeatRequests.filter(r => {
    const departureDate = new Date(r.departure_date);
    return r.status === 'approved' && departureDate >= tomorrow && departureDate <= nextWeek;
  });

  if (upcomingDepartures.length > 0) {
    items.push({
      id: 'upcoming-departures',
      icon: Clock,
      title: 'Upcoming approved departures',
      description: `${upcomingDepartures.length} approved request${upcomingDepartures.length > 1 ? 's' : ''} with departure dates in the next week. Prepare for your trip.`,
      action: 'View Details',
      priority: 'medium',
      count: upcomingDepartures.length,
      href: '/student/exeats?filter=approved',
    });
  }

  // Sort by priority (high -> medium -> low) and limit to most important items
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return items
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 4); // Limit to 4 most important items for clean UI
}