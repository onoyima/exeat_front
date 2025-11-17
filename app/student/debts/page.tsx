'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useGetStudentDebtsQuery } from '@/lib/services/studentApi';
import {
    CreditCard,
    Search,
    Calendar,
    DollarSign,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ExternalLink,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "unpaid", label: "Unpaid" },
    { value: "paid", label: "Paid" },
    { value: "cleared", label: "Cleared" },
];

export default function StudentDebtsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);

    const router = useRouter();

    const { data: debtsData, isLoading, error } = useGetStudentDebtsQuery({
        page,
        per_page: perPage,
    });

    const debts = debtsData?.data?.data || [];
    const total = debtsData?.data?.total || 0;

    // Filter debts by search term and status
    const filteredDebts = debts.filter((debt) => {
        const searchTerm = search.toLowerCase();
        const matchesSearch = search === '' ||
            debt.exeat_request.reason.toLowerCase().includes(searchTerm) ||
            debt.amount.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || debt.payment_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate statistics
    const unpaidCount = debts.filter(d => d.payment_status === 'unpaid').length;
    const paidCount = debts.filter(d => d.payment_status === 'paid').length;
    const clearedCount = debts.filter(d => d.payment_status === 'cleared').length;
    const totalAmount = debts.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);

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

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">My Debts</h1>
                    <p className="text-muted-foreground mt-1">Manage your exeat-related debts</p>
                </div>
                <Card>
                    <CardContent className="text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Debts</h3>
                        <p className="text-muted-foreground mb-4">
                            There was an error loading your debts. Please try again.
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Debts</h1>
                <p className="text-muted-foreground mt-1">Manage your exeat-related debts</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Debts</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{debts.length}</div>
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
                                    placeholder="Search by reason or amount..."
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
                    ) : filteredDebts.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No debts found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {search || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters.'
                                    : 'You have no debt records at this time.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDebts.map((debt) => (
                                <div
                                    key={debt.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    {/* Debt Icon */}
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="h-6 w-6 text-primary" />
                                    </div>

                                    {/* Debt Info */}
                                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">
                                                {formatCurrency(debt.amount)}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(debt.payment_status)}
                                                {getStatusBadge(debt.payment_status)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span>{debt.exeat_request.reason}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {format(new Date(debt.exeat_request.departure_date), 'MMM d')} - {format(new Date(debt.exeat_request.return_date), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            {debt.overdue_hours > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-red-600">
                                                        {debt.overdue_hours}h overdue
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {debt.payment_reference && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Reference: {debt.payment_reference}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 w-full sm:w-auto">
                                        {debt.payment_status === 'unpaid' ? (
                                            <Button
                                                onClick={() => router.push(`/student/debts/${debt.id}/pay`)}
                                                className="w-full sm:w-auto"
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Pay Now
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push(`/student/exeats/${debt.exeat_request.id}`)}
                                                className="w-full sm:w-auto"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                View Exeat
                                            </Button>
                                        )}
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
