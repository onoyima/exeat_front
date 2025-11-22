'use client';

import { useGetExeatCommentsQuery } from '@/lib/services/studentApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { getStatusText } from '@/lib/utils/exeat';
import { format } from 'date-fns';

export default function StudentCommentsPage() {
    const { data: commentsData, isLoading, error } = useGetExeatCommentsQuery();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Messages from Staff</h1>
                    <p className="text-muted-foreground mt-1">
                        View comments and messages sent to you by staff members
                    </p>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load comments. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const comments = commentsData?.comments || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Messages from Staff</h1>
                <p className="text-muted-foreground mt-1">
                    Comments and messages sent to you by staff members regarding your exeat requests
                </p>
            </div>

            {/* Comments List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Staff Messages
                    </CardTitle>
                    <CardDescription>
                        {comments.length === 0
                            ? 'No messages from staff yet'
                            : `${comments.length} message${comments.length !== 1 ? 's' : ''} from staff`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {comments.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Messages</h3>
                            <p className="text-sm text-muted-foreground">
                                You don&apos;t have any messages from staff members yet. Messages will appear here when staff members send you comments about your exeat requests.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <Badge variant="outline" className="capitalize">
                                            {getStatusText(comment.status)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {comment.raw_comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

