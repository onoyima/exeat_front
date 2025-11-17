'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useGetStudentDebtsQuery, useInitializePaymentMutation, useVerifyPaymentQuery } from '@/lib/services/studentApi';
import {
    CreditCard,
    ArrowLeft,
    DollarSign,
    Calendar,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PayDebtPage() {
    const params = useParams();
    const router = useRouter();
    const debtId = parseInt(params.id as string);

    const [paymentNotes, setPaymentNotes] = useState('');
    const [isInitializing, setIsInitializing] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    const { data: debtsData, isLoading } = useGetStudentDebtsQuery({
        page: 1,
        per_page: 1000, // Get all to find the specific debt
    });

    const [initializePayment] = useInitializePaymentMutation();

    const debt = debtsData?.data?.data?.find(d => d.id === debtId);

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

    const handlePaymentInit = async () => {
        if (!debt) return;

        setIsInitializing(true);
        try {
            const result = await initializePayment({
                id: debtId,
                data: { payment_method: 'paystack' }
            }).unwrap();

            if (result.data?.authorization_url) {
                setPaymentUrl(result.data.authorization_url);
                // Navigate to payment page in the same tab
                window.location.href = result.data.authorization_url;

                toast({
                    title: "Redirecting to Payment",
                    description: "You will be redirected to complete your payment.",
                });
            }
        } catch (error: any) {
            console.error('Payment initialization error:', error);
            toast({
                title: "Payment Error",
                description: error?.data?.message || "Failed to initialize payment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsInitializing(false);
        }
    };

    const handleVerifyPayment = () => {
        if (debt?.payment_reference) {
            // Refresh the debt data to check if payment was completed
            window.location.reload();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/student/debts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Pay Debt</h1>
                        <p className="text-muted-foreground mt-1">Loading debt details...</p>
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
                        <Link href="/student/debts">
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
                            The debt you're looking for doesn't exist or has been removed.
                        </p>
                        <Button asChild>
                            <Link href="/student/debts">Back to Debts</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (debt.payment_status === 'cleared') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/student/debts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Debt Cleared</h1>
                        <p className="text-muted-foreground mt-1">This debt has already been cleared.</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="text-center py-12">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Payment Complete</h3>
                        <p className="text-muted-foreground mb-4">
                            This debt has been successfully cleared.
                        </p>
                        <div className="space-y-2">
                            <Button asChild>
                                <Link href="/student/debts">Back to Debts</Link>
                            </Button>
                            {/* <Button variant="outline" asChild>
                                <Link href={`/student/exeats/${debt.exeat_request_id}`}>
                                    View Exeat Request
                                </Link>
                            </Button> */}
                        </div>
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
                    <Link href="/student/debts">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Pay Debt</h1>
                    <p className="text-muted-foreground mt-1">
                        Complete payment for your exeat debt
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Debt Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Debt Details
                        </CardTitle>
                        <CardDescription>
                            Information about the debt you're paying
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Amount */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {formatCurrency(debt.amount)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Total amount to pay
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

                        {/* Exeat Request Info */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Related Exeat Request</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {debt.exeat_request.reason}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {format(new Date(debt.exeat_request.departure_date), 'MMM d')} - {format(new Date(debt.exeat_request.return_date), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overdue Info */}
                        {debt.overdue_hours > 0 && (
                            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-red-800">Overdue</h3>
                                        <p className="text-sm text-red-600">
                                            This debt is {debt.overdue_hours} hours overdue
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Reference */}
                        {debt.payment_reference && (
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-800">
                                    <strong>Payment Reference:</strong> {debt.payment_reference}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Options</CardTitle>
                        <CardDescription>
                            Choose how you want to pay this debt
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {debt.payment_status === 'unpaid' && (
                            <>
                                {/* Paystack Payment */}
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <ExternalLink className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">Pay with Paystack</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Secure online payment with card or bank transfer
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handlePaymentInit}
                                        disabled={isInitializing}
                                        className="w-full"
                                    >
                                        {isInitializing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Initializing...
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Pay with Paystack
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Payment Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Payment Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any notes about this payment..."
                                        value={paymentNotes}
                                        onChange={(e) => setPaymentNotes(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </>
                        )}

                        {debt.payment_status === 'paid' && (
                            <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    <div>
                                        <h3 className="font-semibold text-yellow-800">Payment Pending</h3>
                                        <p className="text-sm text-yellow-600">
                                            Your payment is being processed. Please wait for verification.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleVerifyPayment}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Check Payment Status
                                </Button>
                            </div>
                        )}

                        {/* Payment Instructions */}
                        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                            <h3 className="font-semibold text-blue-800 mb-2">Payment Instructions</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Complete payment through the secure Paystack gateway</li>
                                <li>• You can pay with debit/credit card or bank transfer</li>
                                <li>• Payment will be verified automatically</li>
                                <li>• Once verified, your debt will be cleared</li>
                                <li>• You can then create new exeat requests</li>
                            </ul>
                        </div>

                        {/* Back Button */}
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/student/debts">
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
