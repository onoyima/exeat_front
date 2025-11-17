import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    PhoneIcon,
    MailIcon,
    MapPinIcon,
    AlertCircle,
    CheckCircle,
    XCircle,
    FileText,
    UserCheck,
    Building,
    RefreshCw,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { StaffExeatRequest } from '@/lib/services/staffApi';

interface ExeatRequestDetailProps {
    request: StaffExeatRequest | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (exeat_request_id: number, comment?: string) => Promise<void>;
    onReject: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSendComment?: (exeat_request_id: number, comment: string) => Promise<void>;
    userRole: string;
}

export const ExeatRequestDetail: React.FC<ExeatRequestDetailProps> = ({
    request,
    isOpen,
    onClose,
    onApprove,
    onReject,
    onSendComment,
    userRole,
}) => {
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'see_me' | null>(null);
    const { toast } = useToast();

    if (!request) return null;

    const handleAction = async (action: 'approve' | 'reject' | 'see_me') => {
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

        setIsLoading(true);
        try {
            if (action === 'approve') {
                await onApprove(request.id, comment.trim() || undefined);
                toast({
                    title: 'Success',
                    description: 'Exeat request approved successfully.',
                });
            } else if (action === 'reject') {
                await onReject(request.id, comment.trim());
                toast({
                    title: 'Success',
                    description: 'Exeat request rejected successfully.',
                });
            } else if (action === 'see_me' && onSendComment) {
                await onSendComment(request.id, comment.trim());
                toast({
                    title: 'Success',
                    description: 'Comment sent to student successfully.',
                });
            }
            setComment('');
            setActionType(null);
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: `Failed to ${action === 'see_me' ? 'send comment' : action} request. Please try again.`,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'default',
            approved: 'secondary',
            rejected: 'destructive',
            signed_out: 'outline',
            signed_in: 'secondary',
            completed: 'secondary',
            cmd_review: 'default',
            'secretary_review': 'default',
        };

        return (
            <Badge variant={statusColors[status] || 'default'}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    // Check permissions based on user role
    const canApprove = userRole === 'dean' || userRole === 'secretary';
    const canVetMedical = userRole === 'cmd';
    const isPending = request.status === 'pending' || request.status === 'cmd_review' || request.status === 'secretary_review';

    // Check if the request status is eligible for "See me" button
    // Exclude hostel signout, hostel sign in, security sign out, security sign in, and completed statuses
    const excludedStatuses = ['hostel_signout', 'hostel_signin', 'security_signout', 'security_signin', 'completed'];
    const canSendComment = !excludedStatuses.includes(request.status);

    // Determine if user can take action on this specific request
    const canTakeAction = isPending && (
        (canApprove && (request.status === 'pending' || request.status === 'secretary_review')) ||
        (canVetMedical && request.status === 'cmd_review')
    );

    const duration = Math.ceil(
        (new Date(request.return_date).getTime() - new Date(request.departure_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const handleClose = () => {
        setComment('');
        setActionType(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Exeat Request Details
                    </DialogTitle>
                    <DialogDescription>
                        Review the complete exeat request information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header with Status */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">
                                {request.student.fname} {request.student.lname}
                            </h3>
                            <p className="text-muted-foreground">{request.matric_no}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(request.status)}
                            {request.is_medical && (
                                <Badge variant="destructive">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Medical
                                </Badge>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Student Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                Student Information
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name:</span>
                                    <span>{request.student.fname} {request.student.lname}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Matric No:</span>
                                    <span>{request.matric_no}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Student ID:</span>
                                    <span>{request.student_id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Accommodation
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Accommodation:</span>
                                    <span>{request.student_accommodation || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Trip Details */}
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Trip Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Departure Date:</span>
                                </div>
                                <p className="text-sm">{format(new Date(request.departure_date), 'PPP')}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Return Date:</span>
                                </div>
                                <p className="text-sm">{format(new Date(request.return_date), 'PPP')}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Duration:</span>
                                </div>
                                <p className="text-sm">{duration} days</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Destination:</span>
                                </div>
                                <p className="text-sm">{request.destination}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Parent Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Parent/Guardian Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Name:</span>
                                </div>
                                <p className="text-sm">{request.parent_surname} {request.parent_othernames}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Phone:</span>
                                </div>
                                <p className="text-sm">{request.parent_phone_no}</p>
                                {request.parent_phone_no_two && (
                                    <p className="text-sm text-muted-foreground">Alt: {request.parent_phone_no_two}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MailIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Email:</span>
                                </div>
                                <p className="text-sm">{request.parent_email}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Contact Preference:</span>
                                </div>
                                <p className="text-sm capitalize">{request.preferred_mode_of_contact.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Reason */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Reason for Exeat</h4>
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm">{request.reason}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Request Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Category ID:</span>
                            <span className="ml-2">{request.category_id}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Created:</span>
                            <span className="ml-2">{format(new Date(request.created_at), 'PPp')}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span className="ml-2">{format(new Date(request.updated_at), 'PPp')}</span>
                        </div>
                    </div>

                    {/* Action Section */}
                    {/* {canTakeAction && ( */}
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Take Action
                            </h4>

                            {/* Comment Input */}
                            <div className="space-y-2">
                                <Label htmlFor="comment">
                                    Comment {actionType === 'reject' && <span className="text-destructive">*</span>}
                                </Label>
                                <Textarea
                                    id="comment"
                                    placeholder={
                                        actionType === 'reject'
                                            ? "Please provide a reason for rejection (required)"
                                            : "Add a comment (optional)"
                                    }
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[100px]"
                                    required={actionType === 'reject'}
                                />
                                {actionType === 'reject' && !comment.trim() && (
                                    <p className="text-sm text-destructive">
                                        A comment is required when rejecting a request
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    onClick={() => setActionType('approve')}
                                    disabled={isLoading}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    variant="default"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Request
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setActionType('reject')}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Request
                                </Button>
                                {canSendComment && onSendComment && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setActionType('see_me')}
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        See Me
                                    </Button>
                                )}
                            </div>

                            {/* Confirmation Buttons */}
                            {actionType && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <div className="flex-1 text-center">
                                        <p className="text-sm font-medium mb-2">
                                            {actionType === 'approve'
                                                ? 'Confirm Approval'
                                                : actionType === 'reject'
                                                    ? 'Confirm Rejection'
                                                    : 'Confirm Send Comment'
                                            }
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleAction(actionType)}
                                                disabled={isLoading || ((actionType === 'reject' || actionType === 'see_me') && !comment.trim())}
                                                className="flex-1"
                                                variant={
                                                    actionType === 'approve'
                                                        ? 'default'
                                                        : actionType === 'reject'
                                                            ? 'destructive'
                                                            : 'outline'
                                                }
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        {actionType === 'approve' ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Confirm Approve
                                                            </>
                                                        ) : actionType === 'reject' ? (
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
                                            <Button
                                                variant="outline"
                                                onClick={() => setActionType(null)}
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                    {/* )} */}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

