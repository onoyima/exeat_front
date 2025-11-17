'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetHostelAssignmentsQuery, useUpdateHostelAssignmentStatusMutation, useGetStaffListQuery } from '@/lib/services/adminApi';
import { Building2, User, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function EditHostelAssignmentPage() {
    const router = useRouter();
    const params = useParams();
    const assignmentId = parseInt(params.id as string);

    const [formData, setFormData] = useState({
        status: 'active' as 'active' | 'inactive',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: assignmentsData, isLoading } = useGetHostelAssignmentsQuery({
        page: 1,
        per_page: 1000, // Get all to find the specific assignment
    });
    const { data: staffList } = useGetStaffListQuery();

    const [updateStatus] = useUpdateHostelAssignmentStatusMutation();

    const assignment = assignmentsData?.data?.data?.find(a => a.id === assignmentId);

    // Helper function to get staff name by ID
    const getStaffNameById = (staffId: number) => {
        const staff = staffList?.find(s => s.id === staffId);
        return staff ? `${staff.fname} ${staff.lname}` : `Staff ID: ${staffId}`;
    };

    useEffect(() => {
        if (assignment) {
            setFormData({
                status: assignment.status,
                notes: assignment.notes || '',
            });
        }
    }, [assignment]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        try {
            await updateStatus({
                id: assignmentId,
                status: formData.status,
            }).unwrap();

            toast({
                title: "Success",
                description: "Assignment updated successfully.",
            });

            router.push('/staff/admin/hostel-assignments');
        } catch (error: any) {
            console.error('Error updating assignment:', error);
            toast({
                title: "Error",
                description: error?.data?.message || "Failed to update assignment.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="self-start">
                        <Link href="/staff/admin/hostel-assignments">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Edit Assignment</h1>
                        <p className="text-muted-foreground mt-1">Loading assignment details...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="self-start">
                        <Link href="/staff/admin/hostel-assignments">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Assignment Not Found</h1>
                        <p className="text-muted-foreground mt-1">The requested assignment could not be found.</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="text-center py-12">
                        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Assignment Not Found</h3>
                        <p className="text-muted-foreground mb-4">
                            The assignment you&apos;re looking for doesn&apos;t exist or has been removed.
                        </p>
                        <Button asChild>
                            <Link href="/staff/admin/hostel-assignments">Back to Assignments</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="self-start">
                    <Link href="/staff/admin/hostel-assignments">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Edit Assignment</h1>
                    <p className="text-muted-foreground mt-1">
                        Update assignment status and details
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Assignment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Assignment Details
                            </CardTitle>
                            <CardDescription>
                                Current assignment information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Hostel Info */}
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{assignment.hostel.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Hostel ID: {assignment.vuna_accomodation_id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Staff Info */}
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        {assignment.staff.passport ? (
                                            <Image
                                                src={`data:image/jpeg;base64,${assignment.staff.passport}`}
                                                alt={`${assignment.staff.fname} ${assignment.staff.lname}'s passport`}
                                                width={48}
                                                height={48}
                                                className="h-full w-full object-contain"
                                                unoptimized
                                            />
                                        ) : (
                                            <User className="h-6 w-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            {assignment.staff.fname} {assignment.staff.lname}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Staff ID: {assignment.staff_id}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Assigned by: {getStaffNameById(assignment.assigned_by)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Assignment Date */}
                            <div className="p-3 border rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-800">
                                    <strong>Assigned:</strong> {new Date(assignment.assigned_at).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Assignment</CardTitle>
                            <CardDescription>
                                Update the assignment status and notes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleInputChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                <span>Active</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                <span>Inactive</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional notes about this assignment..."
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    rows={4}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Note: Notes field is for display purposes only. Status changes will be saved.
                                </p>
                            </div>

                            {/* Current Status Display */}
                            <div className={cn(
                                "p-3 border rounded-lg",
                                assignment.status === 'active'
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                            )}>
                                <p className={cn(
                                    "text-sm font-medium",
                                    assignment.status === 'active'
                                        ? "text-green-800"
                                        : "text-red-800"
                                )}>
                                    Current Status: {assignment.status === 'active' ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
                    <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                        <Link href="/staff/admin/hostel-assignments">Cancel</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Update Assignment
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

