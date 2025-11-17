'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVerifyPaymentQuery } from '@/lib/services/studentApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Extract parameters from URL
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const debtId = searchParams.get('debt_id');
    const reference = searchParams.get('reference');
    const amount = searchParams.get('amount');
    const paymentDate = searchParams.get('payment_date');

    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const {
        data: verificationData,
        error,
        isLoading,
        isError,
        isSuccess
    } = useVerifyPaymentQuery(
        {
            id: parseInt(debtId || '0'),
            reference: reference || ''
        },
        {
            skip: !debtId || !reference,
            refetchOnMountOrArgChange: true,
        }
    );

    useEffect(() => {
        if (isLoading) {
            setVerificationStatus('loading');
        } else if (isError) {
            setVerificationStatus('error');
            const errorMsg = 'data' in error ? String(error.data) : ('message' in error ? error.message : 'Payment verification failed');
            setErrorMessage(errorMsg || 'Payment verification failed');
            // Redirect to error page after 3 seconds
            setTimeout(() => {
                router.push(`/student/debts/${debtId}/payment-error?reference=${reference}&error=${encodeURIComponent(errorMsg || 'verification_failed')}`);
            }, 3000);
        } else if (isSuccess && verificationData) {
            if (verificationData.status === 'success') {
                setVerificationStatus('success');
                // Redirect to success page after 3 seconds
                setTimeout(() => {
                    router.push(`/student/debts/${debtId}/payment-success?reference=${reference}`);
                }, 3000);
            } else {
                setVerificationStatus('error');
                setErrorMessage(verificationData.message || 'Payment verification failed');
                // Redirect to error page after 3 seconds
                setTimeout(() => {
                    router.push(`/student/debts/${debtId}/payment-error?reference=${reference}&message=${encodeURIComponent(verificationData.message || 'Payment verification failed')}`);
                }, 3000);
            }
        }
    }, [isLoading, isError, isSuccess, verificationData, error, debtId, reference, router]);

    const handleRetry = () => {
        window.location.reload();
    };

    const handleGoToDebts = () => {
        router.push('/student/debts');
    };

    if (!debtId || !reference) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <CardTitle className="text-xl">Invalid Payment Verification</CardTitle>
                        <CardDescription>
                            Missing required parameters for payment verification.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                The payment verification link is missing required parameters. Please try again from the payment page.
                            </AlertDescription>
                        </Alert>
                        <div className="flex flex-col gap-2">
                            <Button asChild className="w-full">
                                <Link href="/student/debts">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Debts
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    {verificationStatus === 'loading' && (
                        <>
                            <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                            <CardTitle className="text-xl">Verifying Payment</CardTitle>
                            <CardDescription>
                                Please wait while we verify your payment...
                            </CardDescription>
                        </>
                    )}

                    {verificationStatus === 'success' && (
                        <>
                            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                            <CardTitle className="text-xl text-primary">Payment Verified!</CardTitle>
                            <CardDescription>
                                Your payment has been successfully verified and your debt has been cleared.
                            </CardDescription>
                        </>
                    )}

                    {verificationStatus === 'error' && (
                        <>
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <CardTitle className="text-xl text-red-700">Verification Failed</CardTitle>
                            <CardDescription>
                                We were unable to verify your payment.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent className="space-y-4">
                    {verificationStatus === 'loading' && (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                This may take a few moments...
                            </p>
                        </div>
                    )}

                    {verificationStatus === 'success' && verificationData && (
                        <div className="space-y-4">
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {verificationData.message}
                                </AlertDescription>
                            </Alert>

                            <div className="bg-green-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Payment Reference:</span>
                                    <span className="font-mono text-xs sm:text-sm break-all">{verificationData.data.payment_reference}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Amount:</span>
                                    <span className="font-semibold">₦{parseFloat(verificationData.data.total_amount_with_charge).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Payment Date:</span>
                                    <span>{new Date(verificationData.data.payment_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Status:</span>
                                    <span className="text-green-600 font-medium capitalize">
                                        {verificationData.data.payment_status}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground text-center">
                                Redirecting to success page in a few seconds...
                            </p>
                        </div>
                    )}

                    {verificationStatus === 'error' && (
                        <div className="space-y-4">
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {errorMessage}
                                </AlertDescription>
                            </Alert>

                            <div className="flex flex-col gap-2">
                                <Button onClick={handleRetry} variant="outline" className="w-full">
                                    Try Again
                                </Button>
                                <Button onClick={handleGoToDebts} className="w-full">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Debts
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Loading component for Suspense fallback
function PaymentResultLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                    <CardTitle className="text-xl">Loading Payment Details</CardTitle>
                    <CardDescription>
                        Please wait while we load your payment information...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Main export with Suspense boundary
export default function PaymentResultPage() {
    return (
        <Suspense fallback={<PaymentResultLoading />}>
            <PaymentResultContent />
        </Suspense>
    );
}

