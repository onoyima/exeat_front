'use client';

import { useGetRejectedExeatRequestsQuery } from '@/lib/services/staffApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import { format } from 'date-fns';
import { FileText, Search, Calendar, MapPin, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function StaffRejectedPage() {
    const [page, setPage] = useState(1);
    const [perPage] = useState(50);
    const [search, setSearch] = useState('');
    const router = useRouter();

    const { data: rejectedExeatRequests, isLoading: rejectedExeatRequestsLoading } = useGetRejectedExeatRequestsQuery({
        page,
        per_page: perPage,
    });

    const handleViewDetails = (requestId: number) => {
        router.push(`/staff/exeat-requests/rejected/${requestId}`);
    };

    // The data array is nested in data.data according to the new API structure
    const requests = rejectedExeatRequests?.data?.data || [];
    const pagination = rejectedExeatRequests?.pagination;

    // Filter requests based on search (client-side filtering on current page)
    const filteredRequests = requests.filter(request => {
        const searchLower = search.toLowerCase();
        return (
            request.student.name.toLowerCase().includes(searchLower) ||
            request.student.email.toLowerCase().includes(searchLower) ||
            request.reason.toLowerCase().includes(searchLower) ||
            request.destination.toLowerCase().includes(searchLower)
        );
    });

    // Generate pagination page numbers
    const generatePageNumbers = () => {
        if (!pagination) return [];
        const pages: (number | 'ellipsis')[] = [];
        const totalPages = pagination.last_page;
        const currentPage = pagination.current_page;

        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'PP');
        } catch {
            return dateStr;
        }
    };

    if (rejectedExeatRequestsLoading) {
        return (
            <ProtectedRoute requiredRole="staff">
                <div className="min-h-screen">
                    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-96" />
                        </div>
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="staff">
            <div className="min-h-screen">
                <div className="w-full p-4">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rejected Exeat Requests</h1>
                                <p className="text-muted-foreground mt-1">
                                    View all rejected exeat requests and their details
                                </p>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        {rejectedExeatRequests?.status_summary && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Total Rejected</p>
                                                <p className="text-2xl font-bold">{rejectedExeatRequests.status_summary.total_count}</p>
                                            </div>
                                            <XCircle className="h-8 w-8 text-red-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Medical Requests</p>
                                                <p className="text-2xl font-bold">{rejectedExeatRequests.status_summary.medical_count}</p>
                                            </div>
                                            <XCircle className="h-8 w-8 text-red-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Regular Requests</p>
                                                <p className="text-2xl font-bold">{rejectedExeatRequests.status_summary.regular_count}</p>
                                            </div>
                                            <XCircle className="h-8 w-8 text-orange-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student name, email, reason, or destination..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    // Reset to first page when searching
                                    if (page !== 1) {
                                        setPage(1);
                                    }
                                }}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Requests Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejected Exeat Requests</CardTitle>
                            <CardDescription>
                                {pagination ? (
                                    <>
                                        Showing {pagination.from ?? 0} to {pagination.to ?? 0} of {pagination.total} rejected requests
                                        {search && ` (${filteredRequests.length} match${filteredRequests.length !== 1 ? 'es' : ''} on this page)`}
                                    </>
                                ) : (
                                    `${filteredRequests.length} of ${requests.length} requests`
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredRequests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No rejected requests found</p>
                                    <p className="text-sm">Rejected exeat requests will appear here</p>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Card View */}
                                    <div className="lg:hidden space-y-4">
                                        {filteredRequests.map((request) => (
                                            <Card key={request.id} className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => handleViewDetails(request.id)}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                                            <AvatarFallback className="text-xs">
                                                                {getInitials(request.student.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-base truncate">
                                                                {request.student.name}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground truncate">{request.student.email}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                                                        {request.status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>{formatDate(request.departure_date)} - {formatDate(request.return_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{request.destination}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Badge variant={request.is_medical ? "destructive" : "default"} className="text-xs">
                                                            {request.category}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                    {request.reason}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-muted-foreground">
                                                        Rejected on {formatDate(request.updated_at)}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetails(request.id);
                                                        }}
                                                        className="text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View Details
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden lg:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Student</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Dates</TableHead>
                                                    <TableHead>Destination</TableHead>
                                                    <TableHead>Rejected</TableHead>
                                                    <TableHead className="w-[120px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRequests.map((request) => (
                                                    <TableRow key={request.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleViewDetails(request.id)}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback className="text-xs">
                                                                        {getInitials(request.student.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">{request.student.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{request.student.email}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-1">
                                                                <Badge variant={request.is_medical ? "destructive" : "default"}>
                                                                    {request.category}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <p>{formatDate(request.departure_date)}</p>
                                                                <p className="text-muted-foreground">to {formatDate(request.return_date)}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{request.destination}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {formatDate(request.updated_at)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewDetails(request.id);
                                                                }}
                                                                className="text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                                                            >
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                View
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}

                            {/* Pagination */}
                            {pagination && pagination.last_page > 1 && (
                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page {pagination.current_page} of {pagination.last_page}
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPage(Math.max(1, page - 1))}
                                                    disabled={page === 1}
                                                    className="gap-1"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    Previous
                                                </Button>
                                            </PaginationItem>

                                            {generatePageNumbers().map((pageNum, index) => (
                                                <PaginationItem key={index}>
                                                    {pageNum === 'ellipsis' ? (
                                                        <PaginationEllipsis />
                                                    ) : (
                                                        <Button
                                                            variant={pageNum === pagination.current_page ? 'outline' : 'ghost'}
                                                            size="sm"
                                                            onClick={() => setPage(pageNum)}
                                                            className="min-w-[40px]"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    )}
                                                </PaginationItem>
                                            ))}

                                            <PaginationItem>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPage(Math.min(pagination.last_page, page + 1))}
                                                    disabled={page === pagination.last_page}
                                                    className="gap-1"
                                                >
                                                    Next
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}