'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetAdminDashboardStatsQuery, useGetStaffAssignmentsQuery } from '@/lib/services/adminApi';
import { useGetExeatRequestsQuery } from '@/lib/services/exeatApi';
import { useDeanBulkApproveExeatsMutation } from '@/lib/services/staffApi';
import ConfirmModal from '@/components/ui/confirm-modal';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useGetCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import {
    Users,
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    ArrowRight,
    Plus,
    Activity,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { extractRoleName } from '@/lib/utils/csrf';
import type { AdminDashboardResponse } from '@/types/staff';

export default function AdminDashboard() {
    const { user } = useGetCurrentUser();
    const router = useRouter();
    const { data: staffAssignments, isLoading: staffLoading } = useGetStaffAssignmentsQuery();
    const { data: exeatData, isLoading: exeatLoading } = useGetExeatRequestsQuery();
    const [bulkApprove, { isLoading: bulkApproving }] = useDeanBulkApproveExeatsMutation();
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const handleBulkApprove = () => setShowBulkConfirm(true);
    const runBulkApprove = async () => {
        try {
            const result = await bulkApprove().unwrap();
            toast({ variant: 'success', title: 'Bulk Approval', description: result?.message || 'Bulk approval completed successfully' });
            setShowBulkConfirm(false);
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Bulk Approval Failed', description: e?.data?.message || 'Bulk approval failed' });
            // keep modal open to allow retry or cancel
        }
    };
    const { data: dashboardStats } = useGetAdminDashboardStatsQuery() as {
        data: AdminDashboardResponse['data'] | undefined;
        isLoading: boolean;
    };

    // Get recent staff assignments
    const recentAssignments = staffAssignments?.slice(0, 5) || [];

    return (
        <div className="space-y-6 p-4">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, {user?.fname} {user?.lname}</p>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                    <CardDescription>
                        Common administrative tasks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/staff/assign-exeat-role">
                                <Users className="h-6 w-6" />
                                <span>Assign Roles</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/staff/pending">
                                <FileText className="h-6 w-6" />
                                <span>View Exeats</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/staff/admin/exeats/create">
                                <Plus className="h-6 w-6" />
                                <span>Apply Exeat For Student</span>
                            </Link>
                        </Button>
                        <Button onClick={handleBulkApprove} variant="outline" className="h-20 flex-col gap-2" disabled={bulkApproving}>
                            <CheckCircle2 className="h-6 w-6" />
                            <span>{bulkApproving ? 'Approving…' : 'Bulk Approve (Dean)'}</span>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/staff/admin/analytics">
                                <TrendingUp className="h-6 w-6" />
                                <span>Analytics</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* System Overview Stats */}
            {
                dashboardStats && (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <StatsCard
                            title="Pending Exeats"
                            value={dashboardStats.overview.active_exeats}
                            description="Currently active"
                            icon={Clock}
                            className="border-l-4 border-l-blue-500"
                        />
                        <StatsCard
                            title="Students on Exeat"
                            value={dashboardStats.overview.student_away}
                            description="Students on exeat"
                            icon={Users}
                            className="border-l-4 border-l-purple-500"
                        />
                        <StatsCard
                            title="Total Requests"
                            value={dashboardStats.exeat_statistics.total_requests}
                            description="All time requests"
                            icon={FileText}
                            className="border-l-4 border-l-primary"
                        />
                        <StatsCard
                            title="Approved Requests"
                            value={dashboardStats.overview.approved_exeats}
                            description="Successfully approved"
                            icon={CheckCircle2}
                            className="border-l-4 border-l-green-500"
                        />
                        <StatsCard
                            title="Rejected Requests"
                            value={dashboardStats.exeat_statistics.rejected_requests}
                            description="Not approved"
                            icon={XCircle}
                            className="border-l-4 border-l-red-500"
                        />
                    </div>
                )
            }

            {/* Audit Trail & Recent Activities */}
            {
                dashboardStats && (
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {/* Audit Trail */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Recent Audit Activity</CardTitle>
                                    <CardDescription>
                                        Latest system actions and changes
                                    </CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/staff/admin/audit-trail">
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        View All
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {dashboardStats.audit_trail.audit_logs.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p>No recent audit activity</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardStats.audit_trail.audit_logs.slice(0, 5).map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Activity className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {log.action} - {log.target_type}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        by {log.actor.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {log.formatted_time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Recent Exeat Activities</CardTitle>
                                    <CardDescription>
                                        Latest exeat request activities
                                    </CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/staff/pending">
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        View All
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {dashboardStats.recent_activities.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p>No recent activities</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardStats.recent_activities.slice(0, 10).map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Activity className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {activity.action}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        by {activity.actor} ({activity.actor_type})
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {activity.formatted_time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {/* Main Content Grid */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {/* Recent Staff Assignments */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Recent Staff Assignments</CardTitle>
                            <CardDescription>
                                Latest role assignments and updates
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/staff/assign-exeat-role">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                View All Assignments
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {staffLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-muted rounded animate-pulse" />
                                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentAssignments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p>No staff assignments yet</p>
                                <Button asChild variant="outline" className="mt-4">
                                    <Link href="/staff/assign-exeat-role">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Assign First Role
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentAssignments.map((assignment) => (
                                    <div
                                        key={`${assignment.staff_id}-${extractRoleName(assignment)}`}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {assignment.staff_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {assignment.staff_email}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant="secondary" className="text-xs">
                                                {assignment.role_display_name}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(assignment.assigned_at), 'MMM d')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>


            <ConfirmModal
                isOpen={showBulkConfirm}
                onClose={() => setShowBulkConfirm(false)}
                title="Confirm Bulk Approval"
                description="Approve all exeat requests that have passed secretary review and parent consent. This action cannot be undone."
                confirmLabel={bulkApproving ? 'Approving…' : 'Approve All'}
                cancelLabel="Cancel"
                onConfirm={runBulkApprove}
            />
        </div >
    );
}

interface StatsCardProps {
    title: string;
    value: number | string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
}

function StatsCard({ title, value, description, icon: Icon, className, trend, trendValue }: StatsCardProps) {
    return (
        <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                    {trend && trendValue && (
                        <div className={cn(
                            "flex items-center gap-1 text-sm font-medium",
                            trend === 'up' ? 'text-green-600' : 'text-red-600'
                        )}>
                            {trend === 'up' ? (
                                <TrendingUp className="h-4 w-4" />
                            ) : (
                                <TrendingUp className="h-4 w-4 rotate-180" />
                            )}
                            {trendValue}
                        </div>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

