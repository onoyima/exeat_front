"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusPill } from '@/components/ui/status-pill';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileText, CheckCircle, XCircle, MessageSquare, RefreshCw, Phone, Mail } from 'lucide-react';
import type { StaffExeatRequest } from '@/lib/services/staffApi';
import { ExeatCountdown } from '@/components/ExeatCountdown';
import { getApprovalConfirmationText, getRejectionConfirmationText, getApproveButtonText } from '@/lib/utils/exeat-ui';
import { useToast } from '@/hooks/use-toast';

interface ExeatRequestsTableProps {
    requests: StaffExeatRequest[];
    onApprove: (exeat_request_id: number, comment?: string) => Promise<void>;
    onReject: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignOut?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignIn?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSendComment?: (exeat_request_id: number, comment: string) => Promise<void>;
    onViewDetails: (request: StaffExeatRequest) => void;
}

export const ExeatRequestsTable: React.FC<ExeatRequestsTableProps> = ({
    requests,
    onApprove,
    onReject,
    onSignOut,
    onSignIn,
    onSendComment,
    onViewDetails,
}) => {
    const { toast } = useToast();
    const getInitials = (fname: string, lname: string) => `${(fname || '').charAt(0)}${(lname || '').charAt(0)}`.toUpperCase();
    const [actionDialog, setActionDialog] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | 'see_me' | null;
        requestId: number | null;
        comment: string;
        request: StaffExeatRequest | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        type: null,
        requestId: null,
        comment: '',
        request: null,
        isLoading: false,
    });

    const handleAction = (type: 'approve' | 'reject' | 'see_me', requestId: number) => {
        const request = requests.find(r => r.id === requestId);
        setActionDialog({
            isOpen: true,
            type,
            requestId,
            comment: '',
            request: request || null,
            isLoading: false,
        });
    };

    const submitAction = async () => {
        if (!actionDialog.requestId || !actionDialog.type) return;

        setActionDialog(prev => ({ ...prev, isLoading: true }));

        try {
            if (actionDialog.type === 'approve') {
                await onApprove(actionDialog.requestId, actionDialog.comment || undefined);
                toast({
                    title: 'Success',
                    description: 'Exeat request approved successfully.',
                });
            } else if (actionDialog.type === 'reject') {
                await onReject(actionDialog.requestId, actionDialog.comment || undefined);
                toast({
                    title: 'Success',
                    description: 'Exeat request rejected successfully.',
                });
            } else if (actionDialog.type === 'see_me' && onSendComment) {
                try {
                    await onSendComment(actionDialog.requestId, actionDialog.comment);
                    toast({
                        title: 'Success',
                        description: 'Comment sent to student successfully.',
                    });
                } catch (error: any) {
                    console.error('Error sending comment:', error);

                    // Extract detailed error message
                    let errorMessage = 'Failed to send comment. Please try again.';

                    if (error.message) {
                        errorMessage = error.message;
                    }

                    toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                    // Re-throw to prevent dialog from closing
                    throw error;
                }
            }
            setActionDialog({ isOpen: false, type: null, requestId: null, comment: '', request: null, isLoading: false });
        } catch (error) {
            console.error('Error processing action:', error);
            toast({
                title: 'Error',
                description: `Failed to ${actionDialog.type === 'see_me' ? 'send comment' : actionDialog.type} request. Please try again.`,
                variant: 'destructive',
            });
            setActionDialog(prev => ({ ...prev, isLoading: false }));
        }
    };

    return (
        <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
                {requests.map((r) => {
                    const avatarUrl = r.student.passport ? `data:image/jpeg;base64,${r.student.passport}` : '';
                    const mode = (r.preferred_mode_of_contact || '').toLowerCase();
                    const contactValue = mode === 'email' ? r.parent_email : (r.parent_phone_no || r.parent_phone_no_two);
                    const modeLabel = mode === 'whatsapp' ? 'WhatsApp' : mode === 'text' ? 'Text' : mode === 'phone_call' ? 'Phone' : mode === 'email' ? 'Email' : 'Contact';

                    return (
                        <Card key={r.id} className="p-4 hover:shadow-md transition-shadow duration-200">
                            {/* Header with Avatar, Name then Status (stacked for mobile) */}
                            <div className="mb-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage src={avatarUrl} alt={`${r.student.fname} ${r.student.lname}`} />
                                        <AvatarFallback className="text-xs">{getInitials(r.student.fname, r.student.lname)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-base truncate">
                                            {r.student.fname} {r.student.lname}
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-mono truncate">{r.matric_no}</p>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <StatusPill status={r.status} size="sm" />
                                </div>
                            </div>

                            {/* Countdown Timer - Show only when student has left (security_signin) */}
                            {r.status === 'security_signin' && r.departure_date && r.return_date && (
                                <div className="mb-3">
                                    <ExeatCountdown
                                        departureDate={r.departure_date}
                                        returnDate={r.return_date}
                                        variant="staff"
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* Preferred Contact (Mobile) */}
                            <div className="mb-3">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                    {mode === 'email' ? (
                                        <Mail className="h-3.5 w-3.5" />
                                    ) : (
                                        <Phone className="h-3.5 w-3.5" />
                                    )}
                                    <span className="text-xs font-medium">{modeLabel}</span>
                                    {contactValue && (
                                        <span className="text-xs font-mono truncate max-w-[140px]">{contactValue}</span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons - Always show all actions */}
                            <div className="space-y-2">
                                {/* Primary Action Row */}
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        size="sm"
                                        className="flex-1 min-w-[100px] bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handleAction('approve', r.id)}
                                        disabled={['rejected', 'completed'].includes(r.status)}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                                        <span className="truncate">{getApproveButtonText(r.status)}</span>
                                    </Button>
                                    {!['hostel_signout', 'hostel_signin', 'security_signout', 'security_signin', 'completed', 'rejected'].includes(r.status) && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1 min-w-[100px]"
                                            onClick={() => handleAction('reject', r.id)}
                                        >
                                            <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
                                            <span className="truncate">Reject</span>
                                        </Button>
                                    )}
                                </div>

                                {/* Secondary Action Row */}
                                <div className="flex gap-2 flex-wrap">
                                    {/* See Me - disabled for final statuses */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 min-w-[100px]"
                                        onClick={() => onViewDetails(r)}
                                    >
                                        <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                                        <span className="truncate">Details</span>
                                    </Button>

                                    {!!onSendComment && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() => handleAction('see_me', r.id)}
                                            disabled={['hostel_signout', 'hostel_signin', 'security_signout', 'security_signin', 'completed'].includes(r.status)}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                                            <span className="truncate">See Me</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-lg border bg-background">
                <Table className="text-[15px] md:text-base">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow className="bg-muted/50">
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Student</TableHead>
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Status</TableHead>
                            <TableHead className="text-right whitespace-nowrap text-sm md:text-base">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((r) => {
                            const avatarUrl = r.student.passport ? `data:image/jpeg;base64,${r.student.passport}` : '';
                            const mode = (r.preferred_mode_of_contact || '').toLowerCase();
                            const contactValue = mode === 'email' ? r.parent_email : (r.parent_phone_no || r.parent_phone_no_two);
                            const modeLabel = mode === 'whatsapp' ? 'WhatsApp' : mode === 'text' ? 'Text' : mode === 'phone_call' ? 'Phone' : mode === 'email' ? 'Email' : 'Contact';

                            return (
                                <TableRow key={r.id} className="align-middle">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10">
                                                <AvatarImage src={avatarUrl} alt={`${r.student.fname} ${r.student.lname}`} />
                                                <AvatarFallback className="text-xs">{getInitials(r.student.fname, r.student.lname)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{r.student.fname} {r.student.lname}</span>
                                                <span className="text-muted-foreground font-mono text-xs">{r.matric_no}</span>
                                                {/* Preferred Contact (Desktop) */}
                                                <div className="mt-1 inline-flex items-center gap-2 max-w-full">
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                                        {mode === 'email' ? (
                                                            <Mail className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Phone className="h-3.5 w-3.5" />
                                                        )}
                                                        <span className="text-[11px] font-medium">{modeLabel}</span>
                                                        {contactValue && (
                                                            <span className="text-[11px] font-mono truncate max-w-[180px]">{contactValue}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Countdown Timer - Show only when student has left (security_signout) */}
                                                {r.status === 'security_signout' && r.departure_date && r.return_date && (
                                                    <div className="mt-2 max-w-full">
                                                        <ExeatCountdown
                                                            departureDate={r.departure_date}
                                                            returnDate={r.return_date}
                                                            variant="staff"
                                                            className="w-full max-w-md"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill status={r.status} size="sm" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {/* Approve - Always visible, disabled for rejected/completed */}
                                            <Button
                                                size="sm"
                                                className="h-8 px-3 text-[13px] md:text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={() => handleAction('approve', r.id)}
                                                disabled={['rejected', 'completed'].includes(r.status)}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">{getApproveButtonText(r.status)}</span>
                                            </Button>

                                            {/* Reject - Hidden for sign-in/out statuses, completed, and rejected */}
                                            {!['hostel_signout', 'hostel_signin', 'security_signout', 'security_signin', 'completed', 'rejected'].includes(r.status) && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8 px-3 text-[13px] md:text-sm"
                                                    onClick={() => handleAction('reject', r.id)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    <span className="hidden sm:inline">Reject</span>
                                                </Button>
                                            )}

                                            {/* See Me - Disabled for final statuses */}
                                            {!!onSendComment && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-3 text-[13px] md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => handleAction('see_me', r.id)}
                                                    disabled={['hostel_signout', 'hostel_signin', 'security_signout', 'security_signin', 'completed'].includes(r.status)}
                                                >
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    <span className="hidden sm:inline">See Me</span>
                                                </Button>
                                            )}

                                            {/* View Details - Always enabled */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 text-[13px] md:text-sm"
                                                onClick={() => onViewDetails(r)}
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Details</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Action Dialog */}
            <Dialog open={actionDialog.isOpen} onOpenChange={(open) => setActionDialog(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog.type === 'approve'
                                ? 'Approve Exeat Request'
                                : actionDialog.type === 'reject'
                                    ? 'Reject Exeat Request'
                                    : 'Send Comment to Student'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog.request && actionDialog.type === 'approve' ? (
                                <>
                                    {getApprovalConfirmationText(
                                        actionDialog.request.status,
                                        `${actionDialog.request.student.fname} ${actionDialog.request.student.lname}`,
                                        actionDialog.request.reason,
                                        actionDialog.request.destination,
                                        Math.ceil(
                                            (new Date(actionDialog.request.return_date).getTime() -
                                                new Date(actionDialog.request.departure_date).getTime()) / (1000 * 60 * 60 * 24)
                                        )
                                    )}
                                    <br />
                                    <span className="font-medium text-green-700">This action cannot be undone.</span>
                                </>
                            ) : actionDialog.request && actionDialog.type === 'reject' ? (
                                <>
                                    {getRejectionConfirmationText(
                                        actionDialog.request.status,
                                        `${actionDialog.request.student.fname} ${actionDialog.request.student.lname}`,
                                        actionDialog.request.reason,
                                        actionDialog.request.destination,
                                        Math.ceil(
                                            (new Date(actionDialog.request.return_date).getTime() -
                                                new Date(actionDialog.request.departure_date).getTime()) / (1000 * 60 * 60 * 24)
                                        )
                                    )}
                                    <br />
                                    <span className="font-medium text-red-700">This action cannot be undone.</span>
                                </>
                            ) : actionDialog.request && actionDialog.type === 'see_me' ? (
                                <>
                                    Send a message to {actionDialog.request.student.fname} {actionDialog.request.student.lname} requesting them to see you.
                                </>
                            ) : (
                                actionDialog.type === 'approve'
                                    ? 'Are you sure you want to approve this exeat request? You can add an optional comment below.'
                                    : actionDialog.type === 'reject'
                                        ? 'Are you sure you want to reject this exeat request? Please provide a reason for rejection.'
                                        : 'Please provide a message for the student.'
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">
                                {actionDialog.type === 'approve'
                                    ? 'Comment (Optional)'
                                    : actionDialog.type === 'reject'
                                        ? 'Reason for Rejection *'
                                        : 'Message for Student *'}
                            </label>
                            <Textarea
                                placeholder={actionDialog.type === 'approve'
                                    ? 'Add any additional notes or conditions...'
                                    : actionDialog.type === 'reject'
                                        ? 'Please provide a reason for rejection...'
                                        : 'Enter your message for the student...'
                                }
                                value={actionDialog.comment}
                                onChange={(e) => setActionDialog(prev => ({ ...prev, comment: e.target.value }))}
                                className="mt-1"
                                rows={3}
                                defaultValue={actionDialog.type === 'see_me' ? "Come to my office to see me" : ""}
                                required={actionDialog.type === 'reject' || actionDialog.type === 'see_me'}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setActionDialog({ isOpen: false, type: null, requestId: null, comment: '', request: null, isLoading: false })}
                            disabled={actionDialog.isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitAction}
                            className={
                                actionDialog.type === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : actionDialog.type === 'reject'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : ''
                            }
                            disabled={actionDialog.isLoading || ((actionDialog.type === 'reject' || actionDialog.type === 'see_me') && !actionDialog.comment.trim())}
                        >
                            {actionDialog.isLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                actionDialog.type === 'approve'
                                    ? 'Approve Request'
                                    : actionDialog.type === 'reject'
                                        ? 'Reject Request'
                                        : 'Send Comment'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ExeatRequestsTable;


