'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ExeatRequestsTable } from '@/components/staff/ExeatRequestsTable';
import type { StaffExeatRequest } from '@/lib/services/staffApi';
import { useGetExeatRequestsByStudentIdQuery } from '@/lib/services/staffApi';

export default function StaffSearchResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const studentId = (searchParams.get('student_id') || '').trim();
    const [activeStudentId, setActiveStudentId] = useState<string>(studentId);

    useEffect(() => {
        setActiveStudentId(studentId);
    }, [studentId]);

    const { data, isFetching, refetch } = useGetExeatRequestsByStudentIdQuery(activeStudentId, { skip: !activeStudentId });
    const requests = useMemo(() => (data || []) as StaffExeatRequest[], [data]);

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
                            onApprove={async () => { }}
                            onReject={async () => { }}
                            onViewDetails={(r) => router.push(`/staff/exeat-requests/${r.id}`)}
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
                        <p className="text-slate-600 text-center max-w-md mb-4">We couldn't find any exeat requests for the provided Student ID.</p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


