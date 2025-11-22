"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Clock,
    RefreshCw,
    AlertCircle,
    User,
    Filter,
    FileText,
    Stethoscope,
    CheckCircle2,
    MapPin,
    XCircle,
    CheckCircle,
} from 'lucide-react';
import { useStaff, useStaffExeatRequests } from '@/hooks/use-staff';
import { useGetCategoriesQuery } from '@/lib/services/exeatApi';
import { ExeatRequestsTable } from '@/components/staff/ExeatRequestsTable';
import { ExeatRequestFilters } from '@/components/staff/ExeatRequestFilters';
import { extractRoleName } from '@/lib/utils/csrf';
import type { StaffExeatRequest } from '@/lib/services/staffApi';


export default function PendingExeatRequestsPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [gateFilter, setGateFilter] = useState<string>('all');

    const {
        profile,
        allRoles,
        canSignStudents,
        approveExeatRequest,
        rejectExeatRequest,
        signStudentOut,
        signStudentIn,
        sendComment,
    } = useStaff();

    const { data: allRequests, isLoading, refetch } = useStaffExeatRequests();
    const { data: categoriesData } = useGetCategoriesQuery();
    const nameToId: Record<string, number> = Object.fromEntries(
        (categoriesData?.categories || []).map((c) => [c.name.toLowerCase(), c.id])
    );


    // Derive filtered and dated requests
    const requests = (allRequests || [])
        .filter((request: StaffExeatRequest) => {
            if (!searchTerm) return true;
            const s = searchTerm.toLowerCase();
            return (
                request.student.fname.toLowerCase().includes(s) ||
                request.student.lname.toLowerCase().includes(s) ||
                request.matric_no.toLowerCase().includes(s) ||
                request.destination.toLowerCase().includes(s) ||
                request.reason.toLowerCase().includes(s) ||
                request.parent_surname.toLowerCase().includes(s) ||
                request.parent_othernames.toLowerCase().includes(s)
            );
        })
        .filter((request: StaffExeatRequest) => {
            // Status filter - using grouped logic matching the stats cards
            if (statusFilter !== 'all') {
                const status = request.status;
                const statusGroups = {
                    pending: ['pending', 'recommendation1', 'recommendation2'],
                    medical: ['cmd_review'],
                    dean: ['secretary_review', 'parent_consent', 'dean_review'],
                    approved: ['approved', 'hostel_signin', 'hostel_signout', 'security_signout'],
                    active: ['signed_out', 'security_signin'],
                    rejected: ['rejected'],
                    completed: ['completed']
                };

                return statusGroups[statusFilter as keyof typeof statusGroups]?.includes(status) ?? true;
            }
            return true;
        })
        .filter((request: StaffExeatRequest) => {
            if (gateFilter === 'all') return true;
            if (gateFilter === 'overdue') {
                const today = new Date();
                const returnDate = new Date(request.return_date);
                const isBack = ['security_signin', 'hostel_signin', 'completed'].includes(request.status);
                return returnDate < today && !isBack && !request.is_expired;
            }
            if (gateFilter === 'signed_out') {
                return request.status === 'security_signout';
            }
            if (gateFilter === 'signed_in') {
                return request.status === 'security_signin';
            }
            return true;
        })
        .filter((request: StaffExeatRequest) => {
            if (dateFilter === 'all') return true;
            const created = new Date(request.created_at);
            const now = new Date();
            if (dateFilter === 'today') {
                return created.toDateString() === now.toDateString();
            }
            if (dateFilter === 'week') {
                const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
                return diff <= 7;
            }
            if (dateFilter === 'month') {
                return (
                    created.getFullYear() === now.getFullYear() &&
                    created.getMonth() === now.getMonth()
                );
            }
            if (dateFilter === 'quarter') {
                const quarter = Math.floor(now.getMonth() / 3);
                return (
                    created.getFullYear() === now.getFullYear() &&
                    Math.floor(created.getMonth() / 3) === quarter
                );
            }
            return true;
        })
        .filter((request: StaffExeatRequest) => {
            if (categoryFilter === 'all') return true;
            const id = nameToId[categoryFilter];
            if (!id) return true; // unknown filter value, do not exclude
            return request.category_id === id;
        })
        .sort((a: StaffExeatRequest, b: StaffExeatRequest) => {
            // Default sort by creation date (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    const handleApprove = async (exeat_request_id: number, comment?: string) => {
        try {
            await approveExeatRequest[0]({ exeat_request_id, comment });
            refetch();
        } catch (error) {
            console.error('Error approving request:', error);
            throw error;
        }
    };

    const handleReject = async (exeat_request_id: number, comment?: string) => {
        try {
            await rejectExeatRequest[0]({ exeat_request_id, comment });
            refetch();
        } catch (error) {
            console.error('Error rejecting request:', error);
            throw error;
        }
    };

    const handleSignOut = async (exeat_request_id: number, comment?: string) => {
        try {
            await signStudentOut[0]({ exeat_request_id, comment });
            refetch();
        } catch (error) {
            console.error('Error signing student out:', error);
            throw error;
        }
    };

    const handleSignIn = async (exeat_request_id: number, comment?: string) => {
        try {
            await signStudentIn[0]({ exeat_request_id, comment });
            refetch();
        } catch (error) {
            console.error('Error signing student in:', error);
            throw error;
        }
    };

    const handleSendComment = async (exeat_request_id: number, comment?: string) => {
        try {
            const response = await sendComment[0]({ exeat_request_id, comment: comment! });

            console.log('DEBUG: Send comment response:', response);

            // Check if there's an error in the response
            if (response.error) {
                console.error('Error sending comment:', response.error);

                let errorMessage = 'Failed to send comment. Please try again.';

                // Extract error details from the error object
                if ('data' in response.error && response.error.data) {
                    const errorData = response.error.data as any;
                    if (errorData.message) {
                        errorMessage = errorData.message;

                        // If there's info about previous comment, add it to the error message
                        if (errorData.previous_comment) {
                            const prevComment = errorData.previous_comment;
                            errorMessage += `\n\nPrevious comment: "${prevComment.message}" sent by ${prevComment.sent_by} at ${prevComment.sent_at}`;
                        }
                    }
                }

                throw new Error(errorMessage);
            }

            refetch();
        } catch (error) {
            console.error('Error sending comment:', error);
            throw error;
        }
    };

    const getRoleDisplayName = (roleName: string) => {
        const roleMap: Record<string, string> = {
            dean: 'Dean of Students',
            secretary: 'Secretary',
            cmd: 'Chief Medical Director',
            hostel_admin: 'Hostel Admin',
        };
        return roleMap[roleName] || roleName.replace('_', ' ').toUpperCase();
    };

    const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || categoryFilter !== 'all';

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter('all');
        setCategoryFilter('all');
    };

    const handleViewDetails = (request: StaffExeatRequest) => {
        // Redirect to the dedicated exeat details page
        router.push(`/staff/exeat-requests/${request.id}`);
    };

    return (
        <ProtectedRoute requiredRole="staff">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 h-full min-h-screen">
                {/* Header */}
                <div className="mb-6 lg:mb-8 pt-4 lg:pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
                        <div className="space-y-2 flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                                Pending Exeat Requests
                            </h1>
                        </div>
                    </div>

                    {/* Role Badges */}
                    {profile?.exeat_roles && (
                        <div className="mt-3 lg:mt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3">
                                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Your Roles:</span>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {profile.exeat_roles.map((role: any) => (
                                        <Badge
                                            key={role.id}
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-1 text-xs"
                                        >
                                            {getRoleDisplayName(extractRoleName(role))}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters Toolbar */}
        <div className="mb-4 lg:mb-6">
            <div className="w-full">
                <ExeatRequestFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    gateFilter={gateFilter}
                    setGateFilter={setGateFilter}
                    onClearFilters={handleClearFilters}
                    onDownload={async () => {
                        try {
                            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                            const params = new URLSearchParams();
                            if (statusFilter !== 'all') params.set('status', statusFilter);
                            if (gateFilter !== 'all') params.set('filter', gateFilter);
                            const url = `http://localhost:8000/api/staff/exeat-requests/export?${params.toString()}`;
                            // const url = `https://attendance.veritas.edu.ng/api/staff/exeat-requests/export?${params.toString()}`;
                            // const url = `https://testexeat.veritas.edu.ng/api/staff/exeat-requests/export?${params.toString()}`;
                            const res = await fetch(url, {
                                headers: token ? { Authorization: `Bearer ${token}` } : {}
                            });
                            const blob = await res.blob();
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = 'exeat_requests.csv';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        } catch (e) {
                            console.error('Failed to download CSV', e);
                        }
                    }}
                />
            </div>
        </div>

                {/* Content */}
                <div className="space-y-4 lg:space-y-6">
                    {isLoading ? (
                        <div className="space-y-3 lg:space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Card key={i} className="bg-white/80 backdrop-blur-sm border-slate-200">
                                    <CardContent className="p-4 lg:p-6">
                                        <div className="flex items-center space-x-4">
                                            <Skeleton className="h-10 w-10 lg:h-12 lg:w-12 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-1/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-6 lg:h-8 w-16 lg:w-20" />
                                                <Skeleton className="h-6 lg:h-8 w-16 lg:w-20" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : requests && requests.length > 0 ? (
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader className="pb-3 lg:pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <CardDescription className="text-slate-600 text-sm">
                                            Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
                                            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ExeatRequestsTable
                                    requests={requests}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onSignOut={canSignStudents ? handleSignOut : undefined}
                                    onSignIn={canSignStudents ? handleSignIn : undefined}
                                    onViewDetails={handleViewDetails}
                                    onSendComment={handleSendComment}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 px-4">
                                <div className="p-3 sm:p-4 bg-slate-100 rounded-full mb-3 sm:mb-4 lg:mb-6">
                                    <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-slate-400" />
                                </div>
                                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-800 mb-2 text-center">
                                    {hasActiveFilters ? 'No requests match your filters' : 'All caught up! 🎉'}
                                </h3>
                                <p className="text-slate-600 text-center max-w-md lg:max-w-lg mb-4 lg:mb-6 text-sm lg:text-base px-2">
                                    {hasActiveFilters
                                        ? 'No requests match your current search criteria. Try adjusting your filters to see more results, or clear all filters to view all requests.'
                                        : 'You currently have no exeat requests requiring your attention. All requests have been processed or are being handled by other staff members. New requests will appear here automatically.'
                                    }
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    {hasActiveFilters && (
                                        <Button
                                            variant="outline"
                                            onClick={handleClearFilters}
                                            className="border-slate-300 hover:bg-slate-100 w-full sm:w-auto"
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => refetch()}
                                        className="border-slate-300 hover:bg-slate-100 w-full sm:w-auto"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
