'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useGetStudentDebtsQuery, useClearStudentDebtMutation } from '@/lib/services/adminApi';
import type { AdminDebtListItem } from '@/types/student';
import {
    CreditCard,
    ArrowLeft,
    DollarSign,
    Calendar,
    FileText,
    User,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminDebtDetailPage() {
    const params = useParams();
    const router = useRouter();
    const debtId = parseInt(params.id as string);

    const [clearNotes, setClearNotes] = useState('');
    const [isClearing, setIsClearing] = useState(false);

    const { data: debtsData, isLoading } = useGetStudentDebtsQuery({
        page: 1,
        per_page: 1000, // Get all to find the specific debt
    });

    const [clearDebt] = useClearStudentDebtMutation();

    const debt = debtsData?.data?.data?.find((d: AdminDebtListItem) => d.id === debtId);

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(parseFloat(amount));
    };

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

    const handleClearDebt = async () => {
        if (!debt || !clearNotes.trim()) {
            toast({
                title: "Error",
                description: "Please provide notes for clearing this debt.",
                variant: "destructive",
            });
            return;
        }

        setIsClearing(true);
        try {
            await clearDebt({
                id: debtId,
                data: { notes: clearNotes.trim() }
            }).unwrap();

            toast({
                title: "Success",
                description: "Debt cleared successfully.",
            });

            router.push('/staff/admin/student-debts');
        } catch (error: any) {
            console.error('Error clearing debt:', error);
            toast({
                title: "Error",
                description: error?.data?.message || "Failed to clear debt.",
                variant: "destructive",
            });
        } finally {
            setIsClearing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/staff/admin/student-debts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Debt Details</h1>
                        <p className="text-muted-foreground mt-1">Loading debt information...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (!debt) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/staff/admin/student-debts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Debt Not Found</h1>
                        <p className="text-muted-foreground mt-1">The requested debt could not be found.</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="text-center py-12">
                        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Debt Not Found</h3>
                        <p className="text-muted-foreground mb-4">
                            The debt you&apos;re looking for doesn&apos;t exist or has been removed.
                        </p>
                        <Button asChild>
                            <Link href="/staff/admin/student-debts">Back to Debts</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/staff/admin/student-debts">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Debt Details</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage student debt information
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Debt Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Debt Information
                        </CardTitle>
                        <CardDescription>
                            Details about this student debt
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Amount */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {formatCurrency(debt.amount)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Total debt amount
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    {getStatusIcon(debt.payment_status)}
                                </div>
                                <div>
                                    <h3 className="font-semibold">Payment Status</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getStatusBadge(debt.payment_status)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student Information */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        {debt.student.fname} {debt.student.lname}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {debt.exeat_request.matric_no}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Exeat Request Information */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Related Exeat Request</h3>
                                    <p className="text-sm text-muted-foreground">
                                        ID: {debt.exeat_request.id}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {format(new Date(debt.exeat_request.departure_date), 'MMM d, yyyy')} - {format(new Date(debt.exeat_request.return_date), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Accommodation: {debt.exeat_request.student_accommodation || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Manage this debt record
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {debt.payment_status !== 'cleared' ? (
                            <>
                                {/* Clear Debt Form */}
                                <div className="space-y-2">
                                    <Label htmlFor="clear-notes">Clear Debt Notes *</Label>
                                    <Textarea
                                        id="clear-notes"
                                        placeholder="Enter notes for clearing this debt (e.g., 'Student paid via bank transfer - Receipt #12345')"
                                        value={clearNotes}
                                        onChange={(e) => setClearNotes(e.target.value)}
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Provide details about how the debt was cleared for audit purposes.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleClearDebt}
                                    disabled={isClearing || !clearNotes.trim()}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {isClearing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Clearing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Clear Debt
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <div>
                                        <h3 className="font-semibold text-green-800">Debt Cleared</h3>
                                        <p className="text-sm text-green-600">
                                            This debt has already been cleared.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* View Exeat Request */}
                        {/* <Button
                            variant="outline"
                            asChild
                            className="w-full"
                        >
                            <Link href={`/student/exeats/${debt.exeat_request.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Exeat Request
                            </Link>
                        </Button> */}

                        {/* Back Button */}
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/staff/admin/student-debts">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Debts
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
