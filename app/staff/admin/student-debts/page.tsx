'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useGetStudentDebtsQuery, useClearStudentDebtMutation } from '@/lib/services/adminApi';
import type { AdminDebtListItem } from '@/types/student';
import {
    CreditCard,
    Search,
    Calendar,
    DollarSign,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    User,
    FileText,
    MoreHorizontal,
    Trash2,
    CheckCircle,
    Phone,
    Mail,
    MapPin,
    Building,
    UserCheck,
    CalendarDays,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
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
    { value: "unpaid", label: "Unpaid" },
    { value: "paid", label: "Paid" },
    { value: "cleared", label: "Cleared" },
];

export default function AdminStudentDebtsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [debtToClear, setDebtToClear] = useState<number | null>(null);

    const router = useRouter();

    const { data: debtsData, isLoading, refetch } = useGetStudentDebtsQuery({
        payment_status: statusFilter === 'all' ? undefined : statusFilter as 'unpaid' | 'paid' | 'cleared',
        page,
        per_page: perPage,
    });

    const [clearDebt] = useClearStudentDebtMutation();

    const debts = debtsData?.data?.data || [];
    const total = debtsData?.data?.total || 0;

    // Filter debts by search term
    const filteredDebts = debts.filter((debt: AdminDebtListItem) => {
        const searchTerm = search.toLowerCase();
        return (
            search === '' ||
            debt.student.fname.toLowerCase().includes(searchTerm) ||
            debt.student.lname.toLowerCase().includes(searchTerm) ||
            debt.exeat_request.matric_no.toLowerCase().includes(searchTerm) ||
            debt.amount.includes(searchTerm) ||
            debt.exeat_request.reason.toLowerCase().includes(searchTerm) ||
            debt.exeat_request.destination.toLowerCase().includes(searchTerm) ||
            debt.student.phone.includes(searchTerm) ||
            debt.student.email.toLowerCase().includes(searchTerm) ||
            `${debt.student.fname} ${debt.student.lname}`.toLowerCase().includes(searchTerm)
        );
    });

    // Calculate statistics
    const unpaidCount = debts.filter(d => d.payment_status === 'unpaid').length;
    const paidCount = debts.filter(d => d.payment_status === 'paid').length;
    const clearedCount = debts.filter(d => d.payment_status === 'cleared').length;
    const totalAmount = debts.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
    const overdueCount = debts.filter(d => d.overdue_hours > 0).length;
    const medicalCount = debts.filter(d => d.exeat_request.is_medical).length;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'unpaid':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'paid':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case 'cleared':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'unpaid':
                return <Badge variant="destructive">Unpaid</Badge>;
            case 'paid':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Paid</Badge>;
            case 'cleared':
                return <Badge variant="default" className="bg-green-100 text-green-800">Cleared</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(parseFloat(amount));
    };

    const handleClearClick = (id: number) => {
        setDebtToClear(id);
        setClearDialogOpen(true);
    };

    const handleClearConfirm = async () => {
        if (!debtToClear) return;

        try {
            await clearDebt({
                id: debtToClear,
                data: { notes: 'Manually cleared by admin' }
            }).unwrap();

            toast({
                title: "Success",
                description: "Debt cleared successfully.",
            });
            refetch();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.data?.message || "Failed to clear debt.",
                variant: "destructive",
            });
        } finally {
            setClearDialogOpen(false);
            setDebtToClear(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Student Debts</h1>
                <p className="text-muted-foreground mt-1">Manage student exeat-related debts</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Debts</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground">
                            All debt records
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Require payment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{paidCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Pending verification
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{overdueCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Past due date
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Medical</CardTitle>
                        <UserCheck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{medicalCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Medical exeats
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalAmount.toString())}</div>
                        <p className="text-xs text-muted-foreground">
                            All debts combined
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search & Filter
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by name, matric, amount, reason, destination, phone, or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                            >
                                {statuses.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Debts List */}
            <Card>
                <CardHeader>
                    <CardTitle>Debt Records</CardTitle>
                    <CardDescription>
                        {filteredDebts.length} of {total} debt records
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
                    ) : filteredDebts.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No debts found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {search || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters.'
                                    : 'No student debt records found.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDebts.map((debt) => (
                                <div
                                    key={debt.id}
                                    className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    {/* Student Avatar / Passport */}
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {debt.student.passport ? (
                                            <Image
                                                src={`data:image/jpeg;base64,${debt.student.passport}`}
                                                alt={`${debt.student.fname} ${debt.student.lname}'s passport`}
                                                width={64}
                                                height={64}
                                                className="h-full w-full object-contain"
                                                unoptimized
                                            />
                                        ) : (
                                            <User className="h-8 w-8 text-primary" />
                                        )}
                                    </div>

                                    {/* Debt Info */}
                                    <div className="flex-1 min-w-0 w-full lg:w-auto">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">
                                                {debt.student.fname} {debt.student.lname}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(debt.payment_status)}
                                                {getStatusBadge(debt.payment_status)}
                                            </div>
                                        </div>

                                        {/* Primary Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">{debt.exeat_request.matric_no}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-green-600">{formatCurrency(debt.amount)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {format(new Date(debt.exeat_request.departure_date), 'MMM d')} - {format(new Date(debt.exeat_request.return_date), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                <span>{debt.student.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                <span className="break-all">{debt.student.email}</span>
                                            </div>
                                        </div>

                                        {/* Exeat Details */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="font-medium">{debt.exeat_request.reason}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{debt.exeat_request.destination}</span>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                            {debt.overdue_hours > 0 && (
                                                <div className="flex items-center gap-1 text-red-600">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{debt.overdue_hours}h overdue</span>
                                                </div>
                                            )}
                                            {debt.exeat_request.is_medical && (
                                                <div className="flex items-center gap-1 text-blue-600">
                                                    <UserCheck className="h-3 w-3" />
                                                    <span>Medical</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <CalendarDays className="h-3 w-3" />
                                                <span>Created: {format(new Date(debt.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                            {debt.exeat_request.student_accommodation && (
                                                <div className="flex items-center gap-1">
                                                    <Building className="h-3 w-3" />
                                                    <span>{debt.exeat_request.student_accommodation}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 w-full lg:w-auto">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-full lg:w-auto">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/staff/admin/student-debts/${debt.id}`)}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {/* <DropdownMenuItem
                                                    onClick={() => router.push(`/student/exeats/${debt.exeat_request.id}`)}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Exeat Request
                                                </DropdownMenuItem> */}
                                                {debt.payment_status !== 'cleared' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleClearClick(debt.id)}
                                                        className="text-green-600"
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Clear Debt
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Clear Debt Confirmation Dialog */}
            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear Student Debt</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to manually clear this student&apos;s debt? This action will mark the debt as cleared and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClearConfirm}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            Clear Debt
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
