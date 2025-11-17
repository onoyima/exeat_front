'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useGetHostelAssignmentsQuery,
    useUpdateHostelAssignmentStatusMutation,
    useRemoveHostelAssignmentMutation,
    useGetStaffListQuery
} from '@/lib/services/adminApi';
import {
    Building2,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    User,
    Calendar,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Users
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export default function HostelAssignmentsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);

    const router = useRouter();

    const { data: assignmentsData, isLoading, refetch } = useGetHostelAssignmentsQuery({
        status: statusFilter === 'all' ? undefined : statusFilter as 'active' | 'inactive',
        page,
        per_page: perPage,
    });
    const { data: staffList } = useGetStaffListQuery();

    const [updateStatus] = useUpdateHostelAssignmentStatusMutation();
    const [removeAssignment] = useRemoveHostelAssignmentMutation();

    const assignments = assignmentsData?.data?.data || [];
    const total = assignmentsData?.data?.total || 0;

    // Helper function to get staff name by ID
    const getStaffNameById = (staffId: number) => {
        const staff = staffList?.find(s => s.id === staffId);
        return staff ? `${staff.fname} ${staff.lname}` : `Staff ID: ${staffId}`;
    };

    // Filter assignments by search term
    const filteredAssignments = assignments.filter((assignment) => {
        const searchTerm = search.toLowerCase();
        return (
            search === '' ||
            assignment.hostel.name.toLowerCase().includes(searchTerm) ||
            `${assignment.staff.fname} ${assignment.staff.lname}`.toLowerCase().includes(searchTerm) ||
            assignment.staff.fname.toLowerCase().includes(searchTerm) ||
            assignment.staff.lname.toLowerCase().includes(searchTerm)
        );
    });

    // Calculate statistics
    const activeCount = assignments.filter(a => a.status === 'active').length;
    const inactiveCount = assignments.filter(a => a.status === 'inactive').length;

    const handleStatusUpdate = async (id: number, newStatus: 'active' | 'inactive') => {
        try {
            await updateStatus({ id, status: newStatus }).unwrap();
            toast({
                title: "Success",
                description: `Assignment ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
            });
            refetch();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update assignment status.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteClick = (id: number) => {
        setAssignmentToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!assignmentToDelete) return;

        try {
            await removeAssignment(assignmentToDelete).unwrap();
            toast({
                title: "Success",
                description: "Assignment removed successfully.",
            });
            refetch();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove assignment.",
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setAssignmentToDelete(null);
        }
    };

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

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Hostel Assignments</h1>
                    <p className="text-muted-foreground mt-1">Manage staff assignments to hostels</p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/staff/admin/hostel-assignments/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Assignment
                    </Link>
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground">
                            All hostel assignments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
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
                        <CardTitle className="text-sm font-medium">Inactive Assignments</CardTitle>
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

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by hostel name or staff name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="w-full">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assignments List */}
            <Card>
                <CardHeader>
                    <CardTitle>Assignments</CardTitle>
                    <CardDescription>
                        {filteredAssignments.length} of {total} assignments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
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
                    ) : filteredAssignments.length === 0 ? (
                        <div className="text-center py-8">
                            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No assignments found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {search || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters.'
                                    : 'Get started by creating a new assignment.'}
                            </p>
                            {!search && statusFilter === 'all' && (
                                <div className="mt-6">
                                    <Button asChild>
                                        <Link href="/staff/admin/hostel-assignments/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            New Assignment
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAssignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    {/* Staff Avatar / Passport */}
                                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {assignment.staff.passport ? (
                                            <Image
                                                src={`data:image/jpeg;base64,${assignment.staff.passport}`}
                                                alt={`${assignment.staff.fname} ${assignment.staff.lname}'s passport`}
                                                width={48}
                                                height={48}
                                                className="h-full w-full object-contain"
                                                unoptimized
                                            />
                                        ) : (
                                            <User className="h-6 w-6 text-primary" />
                                        )}
                                    </div>

                                    {/* Assignment Info */}
                                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">{assignment.hostel.name}</h3>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(assignment.status)}
                                                {getStatusBadge(assignment.status)}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                <span>{assignment.staff.fname} {assignment.staff.lname}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>Assigned: {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                <span>Assigned by: {getStaffNameById(assignment.assigned_by)}</span>
                                            </div>
                                            {assignment.notes && (
                                                <p className="text-xs text-muted-foreground italic">
                                                    Note: {assignment.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 w-full sm:w-auto">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-full sm:w-auto">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/staff/admin/hostel-assignments/hostel/${assignment.vuna_accomodation_id}/staff`)}
                                                >
                                                    <Building2 className="mr-2 h-4 w-4" />
                                                    View Hostel
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/staff/admin/hostel-assignments/${assignment.id}/edit`)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusUpdate(
                                                        assignment.id,
                                                        assignment.status === 'active' ? 'inactive' : 'active'
                                                    )}
                                                >
                                                    {assignment.status === 'active' ? (
                                                        <>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClick(assignment.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this hostel assignment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}