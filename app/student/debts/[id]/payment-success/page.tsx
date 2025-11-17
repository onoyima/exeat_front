'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useVerifyPaymentQuery } from '@/lib/services/studentApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Download, ArrowLeft, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const debtId = params.id as string;
    const reference = searchParams.get('reference');

    const {
        data: verificationData,
        isLoading,
        error
    } = useVerifyPaymentQuery(
        {
            id: parseInt(debtId),
            reference: reference || ''
        },
        {
            skip: !debtId || !reference,
        }
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-sm text-muted-foreground">Loading payment details...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !verificationData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl text-red-700">Error Loading Payment Details</CardTitle>
                        <CardDescription>
                            Unable to load payment verification details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/student/debts">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Debts
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
                    <CardDescription className="text-lg">
                        Your debt has been successfully cleared and your payment has been verified.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            {verificationData.message}
                        </AlertDescription>
                    </Alert>

                    {/* Payment Details */}
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Receipt className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">Payment Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Payment Reference:</span>
                                    <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                                        {verificationData.data.payment_reference}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Payment Date:</span>
                                    <span className="text-sm">
                                        {formatDate(verificationData.data.payment_date)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Status:</span>
                                    <span className="text-sm text-green-600 font-medium capitalize">
                                        {verificationData.data.payment_status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Cleared Date:</span>
                                    <span className="text-sm">
                                        {formatDate(verificationData.data.cleared_at)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Debt ID:</span>
                                    <span className="text-sm font-mono">
                                        #{verificationData.data.id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exeat Request Details */}
                    {verificationData.data.exeat_request && (
                        <div className="bg-primary/10 p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-primary">Related Exeat Request</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-primary">Matric Number:</span>
                                        <span className="text-sm font-mono">
                                            {verificationData.data.exeat_request.matric_no}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-primary">Destination:</span>
                                        <span className="text-sm">
                                            {verificationData.data.exeat_request.destination}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-primary">Departure Date:</span>
                                        <span className="text-sm">
                                            {new Date(verificationData.data.exeat_request.departure_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-primary">Return Date:</span>
                                        <span className="text-sm">
                                            {new Date(verificationData.data.exeat_request.return_date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-primary">Request Status:</span>
                                        <span className="text-sm capitalize">
                                            {verificationData.data.exeat_request.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-primary">Medical:</span>
                                        <span className="text-sm">
                                            {verificationData.data.exeat_request.is_medical ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild className="flex-1">
                            <Link href="/student/debts">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Debts
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/student/dashboard">
                                Go to Dashboard
                            </Link>
                        </Button>
                    </div>

                    {/* Additional Information */}
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            You can now proceed with your exeat request. If you have any questions,
                            please contact the Student Affairs office.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
