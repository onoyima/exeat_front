"use client";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    UserIcon,
    AlertCircle,
    CheckCircle,
    XCircle,
    FileText,
    UserCheck,
    RefreshCw,
    ArrowLeft,
    Home,
    Calendar,
    MapPin,
    Clock,
    MessageSquare,
    PenLine,
    Save,
    Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useStaff } from '@/hooks/use-staff';
import { useGetExeatRequestByIdQuery } from '@/lib/services/staffApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusPill } from '@/components/ui/status-pill';
import { Skeleton } from '@/components/ui/skeleton';
import { ExeatCountdown } from '@/components/ExeatCountdown';
import {
    getDynamicActionTitle,
    getDynamicActionDescription,
    getDynamicCommentLabel,
    getDynamicCommentPlaceholder,
    getDynamicCommentRequirement,
    canTakeAction,
    getCategoryIcon,
    getCategoryName,
    getApprovalConfirmationText,
    getRejectionConfirmationText
} from '@/lib/utils/exeat-ui';

export default function ExeatRequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const exeatId = parseInt(params.id as string);

    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'see_me' | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFields, setEditedFields] = useState<Partial<any>>({});
    const [showEditDialog, setShowEditDialog] = useState(false);

    const { toast } = useToast();
    const {
        approveExeatRequest,
        rejectExeatRequest,
        sendComment,
        editExeatRequestWithAccess,
        hasRole,
    } = useStaff();

    // Fetch the exeat request data using RTK Query
    const { data: request, isLoading: isLoadingRequest, error } = useGetExeatRequestByIdQuery(exeatId, {
        skip: !exeatId || isNaN(exeatId),
    });

    // Extract error message from API response
    const getErrorMessage = (error: any) => {
        if (!error) return null;

        // Check for permission error in the response data
        if (error?.data?.message) return error.data.message;
        if (error?.message) return error.message;
        if (error?.error) return error.error;
        if (typeof error === 'string') return error;

        return 'An unexpected error occurred while loading the request.';
    };

    const avatarUrl = request?.student?.passport ? `data:image/jpeg;base64,${request.student.passport}` : '';

    const handleActionClick = (action: 'approve' | 'reject' | 'see_me') => {
        // For rejections and see_me, require a comment
        if ((action === 'reject' || action === 'see_me') && !comment.trim()) {
            toast({
                title: 'Comment Required',
                description: action === 'reject'
                    ? 'Please provide a reason for rejection.'
                    : 'Please provide a message for the student.',
                variant: 'destructive',
            });
            return;
        }

        setPendingAction(action);
        setShowConfirmDialog(true);
    };

    const handleConfirmAction = async () => {
        if (!request || !pendingAction) return;

        setIsLoading(true);
        try {
            if (pendingAction === 'approve') {
                await approveExeatRequest[0]({ exeat_request_id: request.id, comment: comment.trim() || undefined });
                toast({
                    title: 'Success',
                    description: 'Exeat request approved successfully.',
                });
                // Redirect back to pending page after approval or rejection
                router.push('/staff/pending');
            } else if (pendingAction === 'reject') {
                await rejectExeatRequest[0]({ exeat_request_id: request.id, comment: comment.trim() });
                toast({
                    title: 'Success',
                    description: 'Exeat request rejected successfully.',
                });
                // Redirect back to pending page after approval or rejection
                router.push('/staff/pending');
            } else if (pendingAction === 'see_me') {
                const response = await sendComment[0]({ exeat_request_id: request.id, comment: comment.trim() });

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

                // If we get here, it was successful
                toast({
                    title: 'Success',
                    description: 'Comment sent to student successfully.',
                });
                // Stay on the same page after sending a comment
            }
            setComment('');
            setShowConfirmDialog(false);
            setPendingAction(null);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || `Failed to ${pendingAction === 'see_me' ? 'send comment' : pendingAction} request. Please try again.`,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelAction = () => {
        setShowConfirmDialog(false);
        setPendingAction(null);
    };

    // Check if user can edit exeat
    const canEdit = hasRole('dean') || hasRole('secretary') || hasRole('admin');

    // Debug user roles from localStorage
    try {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
            }
        }
    } catch (e) {
        console.error('Error checking localStorage on page load:', e);
    }

    // Handle edit mode toggle
    const toggleEditMode = () => {
        if (isEditing) {
            // Exit edit mode without saving
            setIsEditing(false);
            setEditedFields({});
        } else {
            // Enter edit mode
            setIsEditing(true);
            // Initialize edited fields with current values
            if (request) {
                setEditedFields({
                    reason: request.reason,
                    destination: request.destination,
                    departure_date: request.departure_date,
                    return_date: request.return_date,
                    parent_surname: request.parent_surname,
                    parent_othernames: request.parent_othernames,
                    parent_phone_no: request.parent_phone_no,
                    parent_phone_no_two: request.parent_phone_no_two,
                    parent_email: request.parent_email,
                });
            }
        }
    };

    // Handle field changes
    const handleFieldChange = (field: string, value: any) => {
        setEditedFields(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle save changes
    const handleSaveChanges = async () => {
        if (!request || Object.keys(editedFields).length === 0) return;

        // Check user from localStorage
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
            }
        } catch (e) {
            console.error('DEBUG: Error checking localStorage:', e);
        }

        setIsLoading(true);
        try {
            const result = await editExeatRequestWithAccess(request.id, editedFields);

            toast({
                title: 'Success',
                description: 'Exeat request updated successfully.',
            });
            setIsEditing(false);
            setEditedFields({});
            // Refetch the request to get updated data
            window.location.reload();
        } catch (error: any) {
            console.error('DEBUG: Edit error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to update exeat request.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Show edit confirmation dialog
    const showSaveConfirmation = () => {
        if (Object.keys(editedFields).length === 0) {
            toast({
                title: 'No Changes',
                description: 'No changes were made to the exeat request.',
            });
            return;
        }

        setShowEditDialog(true);
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <ProtectedRoute requiredRole="staff">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
                {/* Header with Navigation Skeleton */}
                <div className="mb-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-9 w-64" />
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                        </div>
                        <Skeleton className="h-5 w-96" />
                    </div>
                </div>

                {/* Request Summary Skeleton */}
                <div className="mb-6">
                    <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Countdown Timer Skeleton */}
                <div className="mb-4 sm:mb-6 w-full">
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
                                    <Skeleton className="h-3 w-24 sm:w-28" />
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full sm:w-auto">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="text-center min-w-0 px-0.5">
                                            <Skeleton className="h-6 sm:h-8 w-8 sm:w-10 mx-auto" />
                                            <Skeleton className="h-2.5 w-3 mx-auto mt-1" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Skeleton className="h-1.5 w-full rounded-full" />
                        </div>
                    </Card>
                </div>

                {/* Priority Action Section Skeleton */}
                <div className="mb-8">
                    <Card className="bg-gradient-to-r from-orange-50 to-indigo-50 border-orange-200 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Skeleton className="h-6 w-32" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-80" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Information Skeleton */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-40" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="space-y-1">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-5 w-32" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Details Skeleton */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-36" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-5 w-28" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parent Information Skeleton */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-48" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="space-y-1">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-5 w-32" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6">
                        {/* Student Photo Skeleton */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-center">
                                    <Skeleton className="h-6 w-28 mx-auto" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Skeleton className="h-48 w-48 rounded-full" />
                            </CardContent>
                        </Card>

                        {/* Request Metadata Skeleton */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    <Skeleton className="h-6 w-32" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );

    if (isLoadingRequest) {
        return <LoadingSkeleton />;
    }

    if (error || !request) {
        const errorMessage = getErrorMessage(error);

        return (
            <ProtectedRoute requiredRole="staff">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                                <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold text-slate-800">
                                    {error ? 'Access Denied' : 'Request Not Found'}
                                </h2>
                                <p className="text-slate-600 max-w-md">
                                    {errorMessage || 'Unable to load the exeat request details.'}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="mt-4 hover:bg-slate-100 transition-colors"
                                onClick={() => router.push('/staff/pending')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Requests
                            </Button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const duration = Math.ceil(
        (new Date(request.return_date).getTime() - new Date(request.departure_date).getTime()) / (1000 * 60 * 60 * 24)
    );


    return (
        <ProtectedRoute requiredRole="staff">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 h-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
                {/* Header with Navigation */}
                <div className="mb-4 sm:mb-6 lg:mb-8 pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/staff/pending')}
                            className="self-start border-slate-300 hover:bg-slate-100 transition-all duration-200"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                    </div>

                    <div className="mt-4 sm:mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-3xl sm:text-4xl">
                                    {getCategoryIcon(request.category_id || 0, Boolean(request.is_medical))}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 leading-tight">
                                        Exeat Request Review
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <StatusPill status={request.status} size="sm" />
                                        <Badge variant="outline" className="text-xs sm:text-sm">
                                            {getCategoryName(request.category_id || 0, Boolean(request.is_medical))}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
                            Review and take action on this exeat request from <span className="font-semibold">{request.student.fname} {request.student.lname}</span>
                        </p>
                    </div>
                </div>

                {/* Request Summary - Quick Overview */}
                <div className="mb-4 sm:mb-6">
                    <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {/* Reason & Destination */}
                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm font-medium text-slate-600">Reason</Label>
                                    <p className="text-slate-800 font-medium text-base sm:text-lg break-words">{request.reason}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm font-medium text-slate-600">Destination</Label>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-slate-800 font-medium text-base sm:text-lg break-words">{request.destination}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm font-medium text-slate-600">Duration</Label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                        <p className="text-slate-800 font-medium text-base sm:text-lg">{duration} day{duration !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm font-medium text-slate-600">Dates</Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                        <p className="text-slate-800 font-medium text-xs sm:text-sm">
                                            {format(new Date(request.departure_date), 'MMM d')} - {format(new Date(request.return_date), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Countdown Timer - Show only when student has left the school (security_signin) */}
                {request.status === 'security_signin' && request.departure_date && request.return_date && (
                    <div className="mb-4 sm:mb-6 w-full">
                        <ExeatCountdown
                            departureDate={request.departure_date}
                            returnDate={request.return_date}
                            variant="staff"
                            className="w-full"
                        />
                    </div>
                )}

                {/* Priority Action Section - Prominently Displayed */}
                <div className="mb-6 sm:mb-8">
                    <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                {getDynamicActionTitle(request.status)}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                {getDynamicActionDescription(request.status)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Comment Input - Show for actionable statuses */}
                            {canTakeAction(request.status) && (
                                <div className="space-y-2">
                                    <Label htmlFor="comment" className="font-medium text-sm sm:text-base flex items-center gap-2 flex-wrap">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{getDynamicCommentLabel(request.status)}</span>
                                        <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                                            {getDynamicCommentRequirement(request.status)}
                                        </span>
                                    </Label>
                                    <Textarea
                                        id="comment"
                                        placeholder={getDynamicCommentPlaceholder(request.status)}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="min-h-[100px] text-sm sm:text-base resize-none"
                                    />
                                </div>
                            )}

                            {/* Action Buttons - Always show approve, conditional reject, and see me */}
                            <div className={`grid gap-3 sm:gap-4 pt-2 ${canTakeAction(request.status) ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                <Button
                                    onClick={() => handleActionClick('approve')}
                                    disabled={isLoading || ['rejected', 'completed'].includes(request.status)}
                                    className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold disabled:opacity-50"
                                >
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    <span className="truncate">Approve Request</span>
                                </Button>
                                {/* See Me Button - for eligible exeats */}
                                {!['hostel_signout', 'hostel_signin', 'security_signout', 'security_signin', 'completed'].includes(request.status) && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleActionClick('see_me')}
                                        disabled={isLoading}
                                        className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold border-2 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        <span className="truncate">See Me</span>
                                    </Button>
                                )}
                                {canTakeAction(request.status) && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleActionClick('reject')}
                                        disabled={isLoading || ['rejected', 'completed'].includes(request.status)}
                                        className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                                    >
                                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        <span className="truncate">Reject Request</span>
                                    </Button>
                                )}
                            </div>

                            {/* Status-specific content for non-actionable statuses */}
                            {!canTakeAction(request.status) && (
                                <div className="text-center py-4 sm:py-6">
                                    <div className="text-sm sm:text-base text-muted-foreground">
                                        {request.status === 'security_signin' && 'Student is currently away from campus.'}
                                        {request.status === 'approved' && 'This request has been approved and is active.'}
                                        {request.status === 'rejected' && 'This request has been rejected.'}
                                        {request.status === 'completed' && 'This request has been completed successfully.'}
                                        {request.status === 'parent_consent' && 'Awaiting parent/guardian consent.'}
                                        {(request.status === 'hostel_signin' || request.status === 'hostel_signout') && 'Hostel procedures in progress.'}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Request Details - Priority Section */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader className="pb-3 sm:pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Request Details
                                    </CardTitle>
                                    {/* Edit Button - Only show for eligible users */}
                                    {canEdit && (
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={toggleEditMode}
                                                        className="border-slate-300 hover:bg-slate-100"
                                                    >
                                                        <XCircle className="h-4 w-4 sm:mr-2" />
                                                        <span className="hidden sm:inline">Cancel</span>
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={showSaveConfirmation}
                                                    >
                                                        <Save className="h-4 w-4 sm:mr-2" />
                                                        <span className="hidden sm:inline">Save</span>
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={toggleEditMode}
                                                    className="border-slate-300 hover:bg-slate-100"
                                                >
                                                    <PenLine className="h-4 w-4 sm:mr-2" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Reason</Label>
                                        {isEditing ? (
                                            <Textarea
                                                value={editedFields.reason || ''}
                                                onChange={(e) => handleFieldChange('reason', e.target.value)}
                                                className="mt-1 text-sm sm:text-base"
                                                rows={3}
                                            />
                                        ) : (
                                            <p className="text-slate-800 font-medium text-sm sm:text-base break-words">{request.reason}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Destination</Label>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                <Input
                                                    value={editedFields.destination || ''}
                                                    onChange={(e) => handleFieldChange('destination', e.target.value)}
                                                    className="mt-1 text-sm sm:text-base"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-slate-800 font-medium text-sm sm:text-base break-words">{request.destination}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Preferred Contact</Label>
                                        <p className="text-slate-800 text-sm sm:text-base capitalize">{request.preferred_mode_of_contact?.replace('_', ' ') || 'Not specified'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Departure Date</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            {isEditing ? (
                                                <Input
                                                    type="date"
                                                    value={editedFields.departure_date?.split('T')[0] || ''}
                                                    onChange={(e) => handleFieldChange('departure_date', e.target.value)}
                                                    className="mt-1 text-sm sm:text-base"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-medium text-sm sm:text-base">{format(new Date(request.departure_date), 'PPP')}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Return Date</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            {isEditing ? (
                                                <Input
                                                    type="date"
                                                    value={editedFields.return_date?.split('T')[0] || ''}
                                                    onChange={(e) => handleFieldChange('return_date', e.target.value)}
                                                    className="mt-1 text-sm sm:text-base"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-medium text-sm sm:text-base">{format(new Date(request.return_date), 'PPP')}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Duration</Label>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <p className="text-slate-800 font-medium text-sm sm:text-base">{duration} day{duration !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Student Information */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
                                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Student Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Full Name</Label>
                                        <p className="text-slate-800 font-medium text-sm sm:text-base break-words">{request.student.fname} {request.student.lname}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Matric Number</Label>
                                        <p className="text-slate-800 font-mono font-medium text-sm sm:text-base">{request.matric_no}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Student ID</Label>
                                        <p className="text-slate-800 font-medium text-sm sm:text-base">{request.student_id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Accommodation</Label>
                                        <p className="text-slate-800 text-sm sm:text-base">{request.student_accommodation || 'Not specified'}</p>
                                    </div>
                                    <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Phone</Label>
                                        <p className="text-slate-800 text-sm sm:text-base">{request.student.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parent Information */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
                                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Parent/Guardian Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Parent Name</Label>
                                        <p className="text-slate-800 font-medium text-sm sm:text-base break-words">{request.parent_surname} {request.parent_othernames}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Primary Phone</Label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <a href={`tel:${request.parent_phone_no}`} className="text-slate-800 font-medium text-sm sm:text-base hover:text-blue-600 transition-colors">
                                                {request.parent_phone_no}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Secondary Phone</Label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            {request.parent_phone_no_two ? (
                                                <a href={`tel:${request.parent_phone_no_two}`} className="text-slate-800 text-sm sm:text-base hover:text-blue-600 transition-colors">
                                                    {request.parent_phone_no_two}
                                                </a>
                                            ) : (
                                                <p className="text-slate-800 text-sm sm:text-base">Not provided</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs sm:text-sm font-medium text-slate-600">Email</Label>
                                        <a href={`mailto:${request.parent_email}`} className="text-slate-800 text-sm sm:text-base hover:text-blue-600 transition-colors break-all">
                                            {request.parent_email}
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Student Photo */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-center text-slate-800 text-sm sm:text-base">Student Photo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative group flex justify-center">
                                    <Avatar className="size-32 sm:size-40 lg:size-48 border-4 border-slate-200 group-hover:border-blue-300 transition-all duration-300">
                                        <AvatarImage
                                            src={avatarUrl}
                                            alt={`${request.student.fname} ${request.student.lname}`}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                            {request.student.fname?.[0] || request.student.lname?.[0] || 'S'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                {/* Student phone number */}
                                {request.student.phone && (
                                    <div className="flex items-center justify-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`tel:${request.student.phone}`, '_blank')}
                                            className="w-full sm:w-auto"
                                        >
                                            <Phone className="h-4 w-4 mr-2" />
                                            <span className="text-xs sm:text-sm">Call Student</span>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Request Metadata */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-sm sm:text-base lg:text-lg text-slate-800">Request Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4">
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-3 bg-slate-50 rounded-lg">
                                        <span className="text-xs sm:text-sm text-slate-600">Created:</span>
                                        <span className="text-xs sm:text-sm text-slate-800 font-medium">{format(new Date(request.created_at), 'PPp')}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-3 bg-slate-50 rounded-lg">
                                        <span className="text-xs sm:text-sm text-slate-600">Last Updated:</span>
                                        <span className="text-xs sm:text-sm text-slate-800 font-medium">{format(new Date(request.updated_at), 'PPp')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {pendingAction === 'approve' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : pendingAction === 'reject' ? (
                                <XCircle className="h-5 w-5 text-red-600" />
                            ) : (
                                <MessageSquare className="h-5 w-5 text-primary" />
                            )}
                            {pendingAction === 'approve'
                                ? 'Confirm Approval'
                                : pendingAction === 'reject'
                                    ? 'Confirm Rejection'
                                    : 'Send Comment to Student'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            {pendingAction === 'approve' ? (
                                <>
                                    {getApprovalConfirmationText(
                                        request.status,
                                        `${request.student.fname} ${request.student.lname}`,
                                        request.reason,
                                        request.destination,
                                        duration
                                    )}
                                    <br />
                                    <span className="font-medium text-green-700">This action cannot be undone.</span>
                                </>
                            ) : pendingAction === 'reject' ? (
                                <>
                                    {getRejectionConfirmationText(
                                        request.status,
                                        `${request.student.fname} ${request.student.lname}`,
                                        request.reason,
                                        request.destination,
                                        duration
                                    )}
                                    <br />
                                    <span className="font-medium text-red-700">This action cannot be undone.</span>
                                </>
                            ) : (
                                <>
                                    Send a message to {request.student.fname} {request.student.lname} requesting them to see you.
                                    <br />
                                    <span className="font-medium text-primary">The student will be notified of your request.</span>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={handleCancelAction}
                            disabled={isLoading}
                            className="hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            disabled={isLoading || ((pendingAction === 'reject' || pendingAction === 'see_me') && !comment.trim())}
                            variant={
                                pendingAction === 'approve'
                                    ? 'default'
                                    : pendingAction === 'reject'
                                        ? 'destructive'
                                        : 'outline'
                            }
                            className="transition-all duration-200 hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {pendingAction === 'approve' ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Confirm Approve
                                        </>
                                    ) : pendingAction === 'reject' ? (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Confirm Reject
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Send Comment
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Confirmation Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Save className="h-5 w-5 text-green-600" />
                            Save Changes
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Are you sure you want to save the changes to this exeat request for {request?.student.fname} {request?.student.lname}?
                            <br />
                            <span className="font-medium text-amber-600">This will update the exeat request information.</span>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Show summary of changes */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        <h4 className="text-sm font-medium">Changes Summary:</h4>
                        <div className="bg-slate-50 p-3 rounded-md text-sm">
                            {Object.keys(editedFields).map(field => {
                                const originalValue = request?.[field as keyof typeof request];
                                const newValue = editedFields[field];

                                if (originalValue !== newValue) {
                                    return (
                                        <div key={field} className="mb-2 pb-2 border-b border-slate-200 last:border-0">
                                            <div className="font-medium">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <div className="text-red-600 line-through">
                                                    {typeof originalValue === 'object' ? JSON.stringify(originalValue) : String(originalValue || '')}
                                                </div>
                                                <div className="text-green-600">
                                                    {typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue || '')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }).filter(Boolean)}
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                            disabled={isLoading}
                            className="hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveChanges}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ProtectedRoute>
    );
}
