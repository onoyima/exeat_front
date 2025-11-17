'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentErrorPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const debtId = params.id as string;
    const reference = searchParams.get('reference');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    const handleRetryPayment = () => {
        // Redirect back to the payment page for this debt
        window.location.href = `/student/debts/${debtId}/pay`;
    };

    const handleContactSupport = () => {
        // This could open a support chat or redirect to contact page
        window.open('mailto:support@veritas.edu.ng?subject=Payment Verification Issue', '_blank');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                        <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-red-700">Payment Verification Failed</CardTitle>
                    <CardDescription className="text-lg">
                        We encountered an issue while verifying your payment. Don't worry, we're here to help.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                            {message || 'Payment verification could not be completed. This could be due to a network issue or payment processing delay.'}
                        </AlertDescription>
                    </Alert>

                    {/* Error Details */}
                    <div className="bg-red-50 p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold text-red-900">Error Details</h3>

                        <div className="space-y-3">
                            {debtId && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-red-700">Debt ID:</span>
                                    <span className="text-sm font-mono">
                                        #{debtId}
                                    </span>
                                </div>
                            )}

                            {reference && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-red-700">Payment Reference:</span>
                                    <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                                        {reference}
                                    </span>
                                </div>
                            )}

                            {error && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-red-700">Error Code:</span>
                                    <span className="text-sm font-mono">
                                        {error}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Possible Causes */}
                    <div className="bg-yellow-50 p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold text-yellow-900">Possible Causes</h3>

                        <ul className="space-y-2 text-sm text-yellow-800">
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>Payment is still being processed by your bank or payment provider</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>Network connectivity issues during verification</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>Payment was cancelled or failed at the payment gateway</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>Insufficient funds or card declined</span>
                            </li>
                        </ul>
                    </div>

                    {/* What to Do Next */}
                    <div className="bg-primary/10 p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold text-primary">What to Do Next</h3>

                        <div className="space-y-3 text-sm text-primary">
                            <div className="flex items-start gap-2">
                                <span className="text-primary mt-1">1.</span>
                                <span>Wait a few minutes and try verifying again - payments can take time to process</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-primary mt-1">2.</span>
                                <span>Check your bank account or payment method to confirm the transaction</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-primary mt-1">3.</span>
                                <span>If the payment was successful, try the verification again</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-primary mt-1">4.</span>
                                <span>If the issue persists, contact our support team</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleRetryPayment} className="flex-1">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>

                        <Button onClick={handleContactSupport} variant="outline" className="flex-1">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contact Support
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild variant="outline" className="flex-1">
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

                    {/* Support Information */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Need immediate assistance? Contact the Student Affairs office
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
