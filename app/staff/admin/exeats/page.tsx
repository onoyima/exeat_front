'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusPill } from '@/components/ui/status-pill';
import { useGetExeatRequestsQuery, useGetCategoriesQuery } from '@/lib/services/exeatApi';
import { FileText, Search, Filter, Calendar, MapPin, User, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "cmd_review", label: "CMD Review" },
    { value: "secretary_review", label: "Secretary Review" },
    { value: "parent_consent", label: "Parent Consent" },
    { value: "dean_review", label: "Dean/Deputy Dean Review" },
    { value: "hostel_signin", label: "Hostel Sign In" },
    { value: "hostel_signout", label: "Hostel Sign Out" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
];

// categories fetched dynamically

export default function AdminExeatsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const router = useRouter();

    const { data: exeatData, isLoading } = useGetExeatRequestsQuery();
    const { data: categoriesData } = useGetCategoriesQuery();
    const apiCategories = categoriesData?.categories || [];
    const categoryIconById: Record<number, string> = Object.fromEntries(
        apiCategories.map((c) => [
            c.id,
            c.name.toLowerCase() === 'medical' ? '🏥' :
                c.name.toLowerCase() === 'family' ? '👪' :
                    c.name.toLowerCase() === 'exigency' ? '⚡' : '📋'
        ])
    );
    const exeatRequests = exeatData?.exeat_requests || [];

    // Filter exeat requests
    const filteredRequests = exeatRequests.filter((request) => {
        const searchTerm = search.toLowerCase();
        const matchesSearch =
            search === '' ||
            request.reason.toLowerCase().includes(searchTerm) ||
            request.destination.toLowerCase().includes(searchTerm) ||
            request.matric_no.toLowerCase().includes(searchTerm);

        const matchesStatus =
            statusFilter === 'all' || request.status === statusFilter;
        const matchesCategory =
            categoryFilter === 'all' ||
            request.category_id === Number(categoryFilter);

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort requests by creation date (newest first)
    const sortedRequests = [...filteredRequests].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
    });

    // Calculate statistics
    const totalRequests = exeatRequests.length;
    const pendingCount = exeatRequests.filter(r => r.status === 'pending').length;
    const approvedCount = exeatRequests.filter(r => r.status === 'approved').length;
    const rejectedCount = exeatRequests.filter(r => r.status === 'rejected').length;
    const completedCount = exeatRequests.filter(r => r.status === 'completed').length;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Exeat Requests</h1>
                    <p className="text-lg text-muted-foreground">
                        Overview of all student exeat applications
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                <StatsCard
                    title="Total Requests"
                    value={totalRequests}
                    description="All time"
                    icon={FileText}
                    className="border-l-4 border-l-blue-500"
                />
                <StatsCard
                    title="Pending"
                    value={pendingCount}
                    description="Awaiting review"
                    icon={Clock}
                    className="border-l-4 border-l-yellow-500"
                />
                <StatsCard
                    title="Approved"
                    value={approvedCount}
                    description="Successfully approved"
                    icon={CheckCircle2}
                    className="border-l-4 border-l-green-500"
                />
                <StatsCard
                    title="Rejected"
                    value={rejectedCount}
                    description="Not approved"
                    icon={XCircle}
                    className="border-l-4 border-l-red-500"
                />
                <StatsCard
                    title="Completed"
                    value={completedCount}
                    description="Successfully returned"
                    icon={CheckCircle2}
                    className="border-l-4 border-l-emerald-500"
                />
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Filters & Search</CardTitle>
                    <CardDescription>
                        Find specific exeat requests or filter by criteria
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by reason, destination..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {apiCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {categoryIconById[category.id]} {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        <span>{sortedRequests.length} requests found</span>
                    </div>
                </CardContent>
            </Card>

            {/* Exeat Requests List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">All Exeat Requests</CardTitle>
                    <CardDescription>
                        Detailed view of all student exeat applications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                                    </div>
                                    <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : sortedRequests.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No exeat requests found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="lg:hidden space-y-4">
                                {sortedRequests.map((request) => (
                                    <Card key={request.id} className="p-4 space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-2xl">{categoryIconById[request.category_id] || '📋'}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg truncate">
                                                        {request.reason}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground font-mono">{request.matric_no}</p>
                                                </div>
                                            </div>
                                            <StatusPill status={request.status} size="sm" />
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Destination</h4>
                                                <p className="text-sm">{request.destination}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Departure</h4>
                                                    <p className="text-sm">{format(new Date(request.departure_date), 'MMM d')}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Return</h4>
                                                    <p className="text-sm">{format(new Date(request.return_date), 'MMM d')}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Created</h4>
                                                <p className="text-sm">{format(new Date(request.created_at), 'MMM d, yyyy')}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-2 border-t">
                                            <Button asChild variant="outline" size="sm" className="w-full">
                                                <Link href={`/staff/exeat-requests/${request.id}`}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden lg:block">
                                <div className="space-y-4">
                                    {sortedRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/staff/exeat-requests/${request.id}`)}
                                        >
                                            {/* Category Icon */}
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-2xl">{categoryIconById[request.category_id] || '📋'}</span>
                                            </div>

                                            {/* Request Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg truncate">
                                                        {request.reason}
                                                    </h3>
                                                    <StatusPill status={request.status} size="sm" />
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        <span>{request.matric_no}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span className="truncate max-w-[200px]">{request.destination}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {format(new Date(request.departure_date), 'MMM d')} - {format(new Date(request.return_date), 'MMM d')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Created: {format(new Date(request.created_at), 'MMM d, yyyy')}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/staff/exeat-requests/${request.id}`}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value: number;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
}

function StatsCard({ title, value, description, icon: Icon, className }: StatsCardProps) {
    return (
        <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

