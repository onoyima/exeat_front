import React, { useMemo } from 'react'
import { useStaff } from '@/hooks/use-staff';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Users,
    BarChart3,
    Settings,
    ClipboardList,
    Shield,
    Building2,
    ArrowRight,
    Wallet,
    History,
    UserCog
} from 'lucide-react';

interface NavigationCard {
    title: string;
    description: string;
    icon: any;
    href: string;
    roles: string[];
    color: string;
}

const StaffDashboard = () => {
    const { profile, profileLoading, allRoles } = useStaff();

    // Define navigation cards based on roles
    const navigationCards: NavigationCard[] = useMemo(() => [
        {
            title: 'Pending Requests',
            description: 'Review and approve pending exeat requests',
            icon: Clock,
            href: '/staff/pending',
            roles: ['dean', 'secretary', 'hostel_admin', 'security', 'admin'],
            color: 'border-l-yellow-500'
        },
        // {
        //     title: 'Exeat Requests',
        //     description: 'View all exeat requests assigned to you',
        //     icon: FileText,
        //     href: '/staff/exeat-requests',
        //     roles: ['dean', 'secretary', 'hostel_admin', 'security', 'admin'],
        //     color: 'border-l-blue-500'
        // },
        {
            title: 'Request History',
            description: 'View completed and processed requests',
            icon: History,
            href: '/staff/history',
            roles: ['dean', 'secretary', 'hostel_admin', 'security', 'admin'],
            color: 'border-l-green-500'
        },
        {
            title: 'Rejected Requests',
            description: 'View all rejected exeat requests',
            icon: XCircle,
            href: '/staff/rejected',
            roles: ['dean', 'secretary', 'hostel_admin', 'security', 'admin'],
            color: 'border-l-red-500'
        },
        {
            title: 'Admin Dashboard',
            description: 'Analytics, reports, and system overview',
            icon: BarChart3,
            href: '/staff/admin',
            roles: ['admin'],
            color: 'border-l-purple-500'
        },
        {
            title: 'Student Debts',
            description: 'Manage and clear student debts',
            icon: Wallet,
            href: '/staff/admin/student-debts',
            roles: ['admin'],
            color: 'border-l-orange-500'
        },
        {
            title: 'Hostel Assignments',
            description: 'Manage hostel staff assignments',
            icon: Building2,
            href: '/staff/admin/hostel-assignments',
            roles: ['admin'],
            color: 'border-l-indigo-500'
        },
        {
            title: 'Assign Roles',
            description: 'Assign exeat roles to staff members',
            icon: UserCog,
            href: '/staff/assign-exeat-role',
            roles: ['admin'],
            color: 'border-l-pink-500'
        },
        {
            title: 'Analytics',
            description: 'View detailed analytics and insights',
            icon: BarChart3,
            href: '/staff/admin/analytics',
            roles: ['admin'],
            color: 'border-l-cyan-500'
        },
        {
            title: 'Audit Trail',
            description: 'System activity logs and audit trail',
            icon: ClipboardList,
            href: '/staff/admin/audit-trail',
            roles: ['admin'],
            color: 'border-l-teal-500'
        },
        {
            title: 'Settings',
            description: 'System settings and configurations',
            icon: Settings,
            href: '/staff/admin/settings',
            roles: ['admin'],
            color: 'border-l-gray-500'
        },
    ], []);

    // Get user roles from staff profile
    const userRoles = useMemo<string[]>(() => {
        if (!allRoles || allRoles.length === 0) return [] as string[];
        return allRoles.map((role: any) => String(role.name));
    }, [allRoles]);

    const assignedHostels = useMemo(() => {
        if (!profile) return [] as string[];
        const p: any = profile as any;
        if (Array.isArray(p.assigned_hostels)) return p.assigned_hostels as string[];
        if (p.personal && Array.isArray(p.personal.assigned_hostels)) return p.personal.assigned_hostels as string[];
        return [] as string[];
    }, [profile]);

    const displayBadges = useMemo<string[]>(() => {
        if (userRoles.length === 0) return [] as string[];
        const others = userRoles.filter((r: string) => r !== 'hostel_admin');
        const hostelLabels = assignedHostels.length > 0
            ? assignedHostels.map((h: string) => `hostel_admin - ${h}`)
            : (userRoles.includes('hostel_admin') ? ['hostel_admin'] : []);
        return [...others, ...hostelLabels];
    }, [userRoles, assignedHostels]);

    // Check if user is admin
    const isAdmin = userRoles.includes('admin');

    // Filter cards based on user roles
    const availableCards = useMemo(() => {
        return navigationCards.filter(card =>
            card.roles.some(role => userRoles.includes(role) || isAdmin)
        );
    }, [navigationCards, userRoles, isAdmin]);


    // Loading state
    if (profileLoading) {
        return (
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <div className="flex gap-2 mt-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                </div>
                <div>
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Staff Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, <span className="font-medium">{profile?.fname} {profile?.lname}</span>
                </p>
                {displayBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {displayBadges.map((role: string, index: number) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                                <Shield className="h-3 w-3 mr-1" />
                                {role.replace('_', ' ').toUpperCase()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions / Navigation Cards */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {availableCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <Link key={index} href={card.href}>
                                <Card className={`h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-l-4 ${card.color}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                        </div>
                                        <CardTitle className="text-base mt-3">{card.title}</CardTitle>
                                        <CardDescription className="text-xs line-clamp-2">
                                            {card.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Help Section */}
            {availableCards.length === 0 && (
                <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                    No Roles Assigned
                                </h3>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    You don&apos;t have any exeat roles assigned yet. Please contact an administrator to get access to the system.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default StaffDashboard