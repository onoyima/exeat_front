'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useGetHostelAssignedStaffQuery, useGetHostelAssignmentOptionsQuery, useGetStaffListQuery } from '@/lib/services/adminApi';
import {
    Building2,
    Search,
    ArrowLeft,
    User,
    Mail,
    Calendar,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Users
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HostelAssignedStaffPage() {
    const params = useParams();
    const router = useRouter();
    const hostelId = parseInt(params.hostelId as string);

    const [search, setSearch] = useState('');

    const { data: assignedStaffData, isLoading, error } = useGetHostelAssignedStaffQuery(hostelId);
    const { data: optionsData } = useGetHostelAssignmentOptionsQuery({ per_page: 100, page: 1 });
    const { data: staffList } = useGetStaffListQuery();

    const assignedStaff = assignedStaffData?.data || [];
    const hostels = optionsData?.hostels?.data || [];
    const currentHostel = hostels.find(h => h.id === hostelId);

    // Helper function to get staff name by ID
    const getStaffNameById = (staffId: number) => {
        const staff = staffList?.find(s => s.id === staffId);
        return staff ? `${staff.fname} ${staff.lname}` : `Staff ID: ${staffId}`;
    };

    // Filter staff by search term
    const filteredStaff = assignedStaff.filter((assignment) => {
        const searchTerm = search.toLowerCase();
        return (
            search === '' ||
            assignment.staff.fname.toLowerCase().includes(searchTerm) ||
            assignment.staff.lname.toLowerCase().includes(searchTerm) ||
            assignment.staff.email.toLowerCase().includes(searchTerm) ||
            `${assignment.staff.fname} ${assignment.staff.lname}`.toLowerCase().includes(searchTerm)
        );
    });

    // Calculate statistics
    const activeCount = assignedStaff.filter(a => a.status === 'active').length;
    const inactiveCount = assignedStaff.filter(a => a.status === 'inactive').length;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'inactive':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    if (error) {
        return (
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="self-start">
                        <Link href="/staff/admin/hostel-assignments">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Error Loading Staff</h1>
                        <p className="text-muted-foreground mt-1">Failed to load assigned staff for this hostel</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                        <p className="text-muted-foreground mb-4">
                            There was an error loading the assigned staff for this hostel.
                        </p>
                        <Button asChild>
                            <Link href="/staff/admin/hostel-assignments">Back to Assignments</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="self-start">
                    <Link href="/staff/admin/hostel-assignments">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        {currentHostel ? `${currentHostel.name} - Assigned Staff` : 'Assigned Staff'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {currentHostel
                            ? `Staff members assigned to ${currentHostel.name} (${currentHostel.gender})`
                            : 'Staff members assigned to this hostel'
                        }
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignedStaff.length}</div>
                        <p className="text-xs text-muted-foreground">
                            All assigned staff
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{inactiveCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently inactive
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Staff
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Staff List */}
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Staff</CardTitle>
                    <CardDescription>
                        {filteredStaff.length} of {assignedStaff.length} staff members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded w-16" />
                                </div>
                            ))}
                        </div>
                    ) : filteredStaff.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No staff found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {search
                                    ? 'Try adjusting your search terms.'
                                    : 'No staff members are currently assigned to this hostel.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredStaff.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    {/* Staff Avatar / Passport */}
                                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {assignment.staff.passport ? (
                                            <Image
                                                src={`data:image/jpeg;base64,${assignment.staff.passport}`}
                                                alt={`${assignment.staff.fname} ${assignment.staff.lname}'s passport`}
                                                width={64}
                                                height={64}
                                                className="h-full w-full object-contain"
                                                unoptimized
                                            />
                                        ) : (
                                            <User className="h-8 w-8 text-primary" />
                                        )}
                                    </div>

                                    {/* Staff Info */}
                                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">
                                                {assignment.staff.fname} {assignment.staff.lname}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(assignment.status)}
                                                {getStatusBadge(assignment.status)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                <span className="break-all">{assignment.staff.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3 w-3" />
                                                <span>ID: {assignment.id}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3" />
                                                <span>Assigned by: {getStaffNameById(assignment.assigned_by)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 w-full sm:w-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/staff/admin/hostel-assignments/${assignment.id}/edit`)}
                                            className="w-full sm:w-auto"
                                        >
                                            View Assignment
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
