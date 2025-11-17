import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, ClockIcon, UserIcon, PhoneIcon, MailIcon, MapPinIcon, FileText, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { StaffExeatRequest } from '@/lib/services/staffApi';
import type { StaffApprovalAction, StudentSignAction } from '@/types/staff';

interface ExeatRequestCardProps {
    request: StaffExeatRequest;
    onApprove: (exeat_request_id: number, comment?: string) => Promise<void>;
    onReject: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignOut?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignIn?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSendComment?: (exeat_request_id: number, comment: string) => Promise<void>;
    onViewDetails: (request: StaffExeatRequest) => void;
    userRole: string;
}

export const ExeatRequestCard: React.FC<ExeatRequestCardProps> = ({
    request,
    onApprove,
    onReject,
    onSignOut,
    onSignIn,
    onSendComment,
    onViewDetails,
    userRole,
}) => {
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAction = async (action: 'approve' | 'reject' | 'sign_out' | 'sign_in' | 'see_me') => {
        if (action === 'approve') {
            setIsLoading(true);
            try {
                await onApprove(request.id, comment.trim() || undefined);
                toast({
                    title: 'Success',
                    description: 'Exeat request approved successfully.',
                });
                setComment('');
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to approve request. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        } else if (action === 'reject') {
            setIsLoading(true);
            try {
                await onReject(request.id, comment.trim() || undefined);
                toast({
                    title: 'Success',
                    description: 'Exeat request rejected successfully.',
                });
                setComment('');
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to reject request. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        } else if (action === 'sign_out' && onSignOut) {
            setIsLoading(true);
            try {
                await onSignOut(request.id, comment.trim() || undefined);
                toast({
                    title: 'Success',
                    description: 'Student signed out successfully.',
                });
                setComment('');
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to sign student out. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        } else if (action === 'sign_in' && onSignIn) {
            setIsLoading(true);
            try {
                await onSignIn(request.id, comment.trim() || undefined);
                toast({
                    title: 'Success',
                    description: 'Student signed in successfully.',
                });
                setComment('');
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to sign student in. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        } else if (action === 'see_me' && onSendComment) {
            if (!comment.trim()) {
                toast({
                    title: 'Comment Required',
                    description: 'Please provide a message for the student.',
                    variant: 'destructive',
                });
                return;
            }

            setIsLoading(true);
            try {
                await onSendComment(request.id, comment.trim());
                toast({
                    title: 'Success',
                    description: 'Comment sent to student successfully.',
                });
                setComment('');
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to send comment. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
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
        };

        return (
            <Badge variant={statusColors[status] || 'default'}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const canApprove = userRole === 'dean' || userRole === 'secretary';
    const canSign = userRole === 'hostel_admin';
    const isApproved = request.status === 'approved';
    const isSignedOut = request.status === 'signed_out';

    // Check if the request status is eligible for "See me" button
    // Exclude hostel signout, hostel sign in, security sign out, security sign in, and completed statuses
    const excludedStatuses = ['hostel_signout', 'hostel_signin', 'security_signout', 'security_signin', 'completed'];
    const canSendComment = !excludedStatuses.includes(request.status);

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(`${request.student.fname} ${request.student.lname}`)}&backgroundType=gradientLinear&fontSize=42`}
                                alt={`${request.student.fname} ${request.student.lname}`}
                            />
                            <AvatarFallback>
                                {(request.student.fname?.[0] || '').toUpperCase()}
                                {(request.student.lname?.[0] || '').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                {request.student.fname} {request.student.lname}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1">
                                    <MailIcon className="h-4 w-4" />
                                    {request.matric_no}
                                </span>
                                <span className="flex items-center gap-1">
                                    <PhoneIcon className="h-4 w-4" />
                                    {request.parent_phone_no}
                                </span>
                            </CardDescription>
                        </div>
                    </div>
                    {getStatusBadge(request.status)}
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">Request Details</h4>
                            <div className="mt-2 space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>From: {format(new Date(request.departure_date), 'PPP')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>To: {format(new Date(request.return_date), 'PPP')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>Duration: {Math.ceil((new Date(request.return_date).getTime() - new Date(request.departure_date).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">Destination</h4>
                            <div className="mt-2 space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4" />
                                    <span>{request.destination}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {request.reason}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Request Details */}
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Additional Details</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Medical Request:</span>
                                <Badge variant={request.is_medical ? "destructive" : "secondary"}>
                                    {request.is_medical ? "Yes" : "No"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Contact Preference:</span>
                                <span className="capitalize">{request.preferred_mode_of_contact.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Parent:</span>
                                <span>{request.parent_surname} {request.parent_othernames}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(request)}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                        </Button>

                        {canApprove && request.status === 'pending' && (
                            <>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="default" size="sm">
                                            Approve
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Approve Exeat Request</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to approve this exeat request?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="Add a comment (optional)"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                onClick={() => handleAction('approve')}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Approving...' : 'Approve'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            Reject
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Reject Exeat Request</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to reject this exeat request? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="Add a reason for rejection (optional)"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleAction('reject')}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {isLoading ? 'Rejecting...' : 'Reject'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}

                        {canSign && isApproved && !isSignedOut && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Sign Out
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Sign Student Out</DialogTitle>
                                        <DialogDescription>
                                            Confirm that the student is leaving the hostel.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="Add a comment (optional)"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={() => handleAction('sign_out')}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Signing Out...' : 'Sign Out'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {canSign && isSignedOut && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Sign In
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Sign Student In</DialogTitle>
                                        <DialogDescription>
                                            Confirm that the student has returned to the hostel.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="Add a comment (optional)"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={() => handleAction('sign_in')}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Signing In...' : 'Sign In'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* See Me Button */}
                        {onSendComment && canSendComment && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        See Me
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Send Comment to Student</DialogTitle>
                                        <DialogDescription>
                                            Send a message to the student requesting them to see you.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="Enter your message for the student..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            defaultValue="Come to my office to see me"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={() => handleAction('see_me')}
                                            disabled={isLoading || !comment.trim()}
                                        >
                                            {isLoading ? 'Sending...' : 'Send Comment'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
