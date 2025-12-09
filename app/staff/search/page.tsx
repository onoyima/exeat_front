'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ExeatRequestsTable } from '@/components/staff/ExeatRequestsTable';
import type { StaffExeatRequest } from '@/lib/services/staffApi';
import { useGetExeatRequestsByStudentIdQuery } from '@/lib/services/staffApi';
import { useStaff } from '@/hooks/use-staff';

export default function StaffSearchResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const studentId = (searchParams.get('student_id') || '').trim();
    const [activeStudentId, setActiveStudentId] = useState<string>(studentId);

    const {
        canSignStudents,
        approveExeatRequest,
        rejectExeatRequest,
        signStudentOut,
        signStudentIn,
        sendComment,
    } = useStaff();

    useEffect(() => {
        setActiveStudentId(studentId);
    }, [studentId]);

    const { data, isFetching, refetch } = useGetExeatRequestsByStudentIdQuery(activeStudentId, { skip: !activeStudentId });
    const requests = useMemo(() => (data || []) as StaffExeatRequest[], [data]);

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

    const handleViewDetails = (request: StaffExeatRequest) => {
        router.push(`/staff/exeat-requests/${request.id}`);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Search Results</h1>
                    <p className="text-muted-foreground">Student ID: {activeStudentId || '—'}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Back</Button>
                    <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {isFetching ? (
                <Card>
                    <CardContent className="p-6">Loading...</CardContent>
                </Card>
            ) : requests.length > 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Matching Requests</CardTitle>
                        <CardDescription>Found {requests.length} record{requests.length !== 1 ? 's' : ''}</CardDescription>
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
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <AlertCircle className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2 text-center">No results</h3>
                        <p className="text-slate-600 text-center max-w-md mb-4">We couldn&apos;t find any exeat requests for the provided Student ID.</p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


