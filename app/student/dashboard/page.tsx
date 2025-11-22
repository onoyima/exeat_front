'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCurrentUser } from '@/hooks/use-current-user';
import { format } from 'date-fns';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Home,
  GraduationCap,
  Users,
  Phone,
  FileText,
  History,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useGetExeatRequestsQuery, useGetCategoriesQuery } from '@/lib/services/exeatApi';
import { useGetExeatCommentsQuery } from '@/lib/services/studentApi';
import { DashboardSkeleton } from '@/components/student/DashboardSkeletons';
import { useRouter } from 'next/navigation';
import { StatusPill } from '@/components/ui/status-pill';
import { cn } from '@/lib/utils';
import { ActionableInsights } from '@/components/student/ActionableInsights';
import { extractMatricFromEmail, formatMatricNumber } from '@/lib/utils/student';
import { ExeatCountdown } from '@/components/ExeatCountdown';
import { getStatusText } from '@/lib/utils/exeat';

export default function StudentDashboard() {
  const { user, isLoading: userLoading } = useGetCurrentUser();
  const router = useRouter()

  const { data: exeatData, isLoading: loadingExeats } = useGetExeatRequestsQuery();
  const exeatRequests = exeatData?.exeat_requests || [];
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: commentsData } = useGetExeatCommentsQuery();
  const comments = commentsData?.comments || [];
  const categoryNameById: Record<number, string> = Object.fromEntries(
    (categoriesData?.categories || []).map((c) => [c.id, c.name.charAt(0).toUpperCase() + c.name.slice(1)])
  );

  // Show skeleton loading if user data or exeat data is still loading
  if (userLoading || loadingExeats) {
    return <DashboardSkeleton />;
  }

  // Helper function to determine if an exeat is currently approved (ready for departure)
  const isCurrentlyApproved = (exeat: any) => {
    // Only count exeats that are approved but not yet departed
    return exeat.status === 'approved';
  };

  // Helper function to determine if an exeat is active (user is currently out)
  const isActiveExeat = (exeat: any) => {
    // User has departed and is currently away from school
    return ['hostel_signout', 'security_signout', 'security_signin'].includes(exeat.status);
  };

  // Helper function to determine if an exeat is completed
  const isCompletedExeat = (exeat: any) => {
    return exeat.status === 'completed';
  };

  // Calculate counts for different statuses with progressive disclosure priority
  const inReviewCount = exeatRequests.filter(r =>
    ['cmd_review', 'secretary_review', 'dean_review'].includes(r.status)
  ).length;
  const parentConsentCount = exeatRequests.filter(r => r.status === 'parent_consent').length;
  const hostelCount = exeatRequests.filter(r =>
    ['hostel_signin', 'hostel_signout'].includes(r.status)
  ).length;
  const approvedCount = exeatRequests.filter(r => isCurrentlyApproved(r)).length;
  const activeOutCount = exeatRequests.filter(r => isActiveExeat(r)).length;
  const completedCount = exeatRequests.filter(r => isCompletedExeat(r)).length;
  const rejectedCount = exeatRequests.filter(r => r.status === 'rejected').length;

  // Calculate active requests (all except completed and rejected) - Priority metric
  const activeCount = exeatRequests.filter(r =>
    !['completed', 'rejected'].includes(r.status)
  ).length;

  // Find active exeat (user is currently out of school)
  const activeExeat = exeatRequests.find(r => {
    try {
      // Skip completed exeats - they shouldn't show countdown
      if (r.status === 'completed') {
        return false;
      }

      // Show countdown when status is security_signin (student has left school)
      if (r.status !== 'security_signin') {
        return false;
      }

      const returnDate = new Date(r.return_date);

      // Handle invalid dates
      if (isNaN(returnDate.getTime())) {
        console.warn('Invalid return date format for exeat:', r.id, r.return_date);
        return false;
      }

      // Student has left (security_signin) - show countdown regardless of overdue status
      // The countdown component will handle displaying overdue state
      return true;
    } catch (error) {
      console.error('Error processing exeat dates:', error, r);
      return false;
    }
  });

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      {/* Welcome Section - Enhanced Mobile-First Responsive Design */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Mobile-first layout with improved stacking */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
            <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
              {user?.passport ? (
                <Image
                  src={`data:image/jpeg;base64,${user.passport}`}
                  alt={`${user.fname} ${user.lname}`}
                  fill
                  className="object-cover object-top"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-medium text-primary">
                    {user?.fname?.[0]?.toUpperCase()}{user?.lname?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">Welcome back, {user?.fname}! 👋</h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Here&apos;s an overview of your exeat requests and important information
              </p>
            </div>
          </div>

          {/* Mobile-optimized button placement */}
          <Button
            size="lg"
            className="h-12 md:h-14 w-full sm:w-auto sm:max-w-[200px] md:max-w-[220px] transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation text-base px-4 sm:px-6"
            onClick={() => router.push("/student/apply-exeat")}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            <span>New Exeat Request</span>
          </Button>
        </div>
      </Card>



      {/* Statistics Grid with Enhanced Mobile-First Progressive Disclosure */}
      <div className="space-y-4 md:space-y-6">
        {/* Priority Stats - Most Important Information - Mobile-First Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active Requests"
            value={activeCount}
            description="Currently in process"
            icon={Clock}
            className="border-l-4 border-l-blue-500 h-full"
            priority="high"
          />
          <StatsCard
            title="Pending Review"
            value={inReviewCount}
            description="Under staff review"
            icon={FileText}
            className="border-l-4 border-l-yellow-500 h-full"
            priority="high"
          />
          <StatsCard
            title="Parent Consent"
            value={parentConsentCount}
            description="Awaiting parent approval"
            icon={Users}
            className="border-l-4 border-l-purple-500 h-full"
            priority="high"
          />
          <StatsCard
            title="Hostel Process"
            value={hostelCount}
            description="Sign in/out pending"
            icon={Home}
            className="border-l-4 border-l-orange-500 h-full"
            priority="high"
          />
        </div>

        {/* Outcome Stats - Secondary Information - Mobile-First Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Approved"
            value={approvedCount}
            description="Ready for departure"
            icon={CheckCircle2}
            className="border-l-4 border-l-green-500 h-full"
            priority="medium"
          />
          <StatsCard
            title="Currently Out"
            value={activeOutCount}
            description="Student away from school"
            icon={MapPin}
            className="border-l-4 border-l-indigo-500 h-full"
            priority="medium"
          />
          <StatsCard
            title="Completed"
            value={completedCount}
            description="Successfully returned"
            icon={CheckCircle2}
            className="border-l-4 border-l-emerald-500 h-full"
            priority="medium"
          />
          <StatsCard
            title="Rejected"
            value={rejectedCount}
            description="Not approved"
            icon={XCircle}
            className="border-l-4 border-l-red-500 h-full"
            priority="medium"
          />
        </div>
      </div>

      {/* Actionable Insights */}
      <ActionableInsights exeatRequests={exeatRequests} isLoading={loadingExeats} />

      {/* Staff Messages/Comments */}
      {comments.length > 0 && (
        <Card className="p-4 md:p-6">
          <CardHeader className="pb-2 md:pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages from Staff
                </CardTitle>
                <CardDescription className="text-base md:text-lg">
                  {comments.length} new message{comments.length !== 1 ? 's' : ''} from staff members
                </CardDescription>
              </div>
              <Link href="/student/comments">
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y rounded-md border border-border/50 overflow-hidden">
              {comments.slice(0, 3).map((comment, index) => (
                <Link
                  href="/student/comments"
                  key={index}
                  className={cn(
                    "block p-4 sm:p-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-muted/50 transition-colors"
                  )}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Badge variant="outline" className="capitalize">
                        {getStatusText(comment.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 break-words">
                      {comment.raw_comment}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {comments.length > 3 && (
              <div className="p-4 text-center border-t">
                <Link href="/student/comments">
                  <Button variant="ghost" size="sm">
                    View {comments.length - 3} more message{comments.length - 3 !== 1 ? 's' : ''}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Countdown & Student Info - Enhanced Mobile-First Layout */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          {activeExeat ? (
            <ExeatCountdown
              departureDate={activeExeat.departure_date}
              returnDate={activeExeat.return_date}
              variant="student"
            />
          ) : (
            <Card className="p-4 md:p-6">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl font-semibold">No Active Exeat</CardTitle>
                <CardDescription className="text-base md:text-lg">You have no active exeat at the moment.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/student/apply-exeat">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" /> Apply for Exeat
                    </Button>
                  </Link>
                  <Link href="/student/exeats">
                    <Button variant="outline">
                      <History className="mr-2 h-4 w-4" /> View History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-3 p-4 md:p-6">
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl font-semibold">Your Information</CardTitle>
            <CardDescription className="text-base md:text-lg">
              Essential academic and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            {/* Essential Information - Always Visible (Progressive Disclosure Level 1) */}
            <div className="space-y-4" role="region" aria-label="Essential student information">
              <InfoItem
                icon={GraduationCap}
                label="Matric Number"
                value={formatMatricNumber(extractMatricFromEmail(user?.email)) || user?.matric_no || 'Not available'}
              />
              <InfoItem
                icon={Phone}
                label="Contact"
                value={user?.phone}
                fallback="Not specified"
              />
            </div>

            {/* Progressive Disclosure - Additional Details (Level 2) */}
            <div
              className="pt-4 md:pt-6 space-y-4 border-t border-border/50"
              role="region"
              aria-label="Additional student details"
            >
              <InfoItem
                icon={MapPin}
                label="Address"
                value={user?.address}
                fallback="Not specified"
              />
              {user?.email && (
                <InfoItem
                  icon={Users}
                  label="Email"
                  value={user.email}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        <CardHeader className="pb-2 md:pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg md:text-xl font-semibold">Recent Requests</CardTitle>
              <CardDescription className="text-base md:text-lg">
                Latest applications and status
              </CardDescription>
            </div>
            {exeatRequests.length > 10 && (
              <Link href="/student/exeats">
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <History className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {exeatRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-base">No exeat requests found</p>
            </div>
          ) : (
            <div className="divide-y rounded-md border border-border/50 overflow-hidden">
              {exeatRequests.slice(0, 10).map((request) => (
                <Link
                  href={`/student/exeats/${request.id}`}
                  key={request.id}
                  className={cn(
                    "block p-4 sm:p-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  )}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold capitalize truncate">
                          {categoryNameById[request.category_id] || (request.is_medical ? 'Medical' : 'Unknown')}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <StatusPill status={request.status} size="sm" />
                    </div>

                    {request.reason && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 break-words">
                        {request.reason}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="truncate max-w-[180px] sm:max-w-[260px] font-medium">
                        {request.destination}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-medium">
                        {format(new Date(request.departure_date), 'MMM d')} - {format(new Date(request.return_date), 'MMM d')}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-medium capitalize break-words">
                        {request.preferred_mode_of_contact}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div >
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

function StatsCard({ title, value, description, icon: Icon, className, priority = 'medium' }: StatsCardProps) {
  return (
    <Card className={cn(
      "flex flex-col transition-all duration-200 hover:shadow-md touch-manipulation min-h-[120px] md:min-h-[140px]",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 flex-shrink-0 p-4 md:p-6">
        <CardTitle className={cn(
          "font-medium leading-tight",
          priority === 'high' ? "text-sm md:text-base" : "text-xs md:text-sm"
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(
          "text-muted-foreground flex-shrink-0",
          priority === 'high' ? "h-4 w-4 md:h-5 md:w-5" : "h-4 w-4"
        )} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-4 md:p-6 pt-0">
        <div className={cn(
          "font-bold mb-2 md:mb-3",
          priority === 'high' ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
        )}>
          {value}
        </div>
        <p className="text-xs md:text-sm text-muted-foreground leading-tight">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  fallback?: string;
}

function InfoItem({ icon: Icon, label, value, fallback = 'Not available' }: InfoItemProps) {
  const displayValue = value || fallback;
  const isValueMissing = !value;

  return (
    <div className="flex items-center gap-3 md:gap-4 min-h-[48px] touch-manipulation">
      <Icon
        className="h-5 w-5 text-muted-foreground flex-shrink-0"
        aria-hidden="true"
      />
      <div className="space-y-1 min-w-0 flex-1">
        <p
          className={cn(
            "text-sm md:text-base font-medium leading-none truncate",
            isValueMissing && "text-muted-foreground"
          )}
          title={displayValue}
        >
          {displayValue}
        </p>
        <p className="text-xs md:text-sm text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}
