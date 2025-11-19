'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGetHostelAssignmentOptionsQuery, useCreateHostelAssignmentMutation, useGetStaffListQuery } from '@/lib/services/adminApi';
import { Building2, User, ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function CreateHostelAssignmentPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        vuna_accomodation_id: '',
        staff_id: '',
        auto_assign_role: false,
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const { data: options, isLoading: optionsLoading } = useGetHostelAssignmentOptionsQuery({
        per_page: 100,
        page: 1,
    });

    const { data: staffList, isLoading: staffListLoading } = useGetStaffListQuery();

    const [createAssignment] = useCreateHostelAssignmentMutation();

    const hostels = options?.hostels?.data || [];

    // Convert hostels to searchable options
    const hostelOptions: SearchableSelectOption[] = useMemo(() => {
        if (!hostels) return [];
        return hostels.map(hostel => ({
            value: hostel.id.toString(),
            label: hostel.name,
            description: `${hostel.gender} hostel`
        }));
    }, [hostels]);

    // Convert staff list to searchable options
    const staffOptions: SearchableSelectOption[] = useMemo(() => {
        if (!staffList) return [];
        return staffList.map(staff => ({
            value: String(staff.id),
            label: `${staff.fname}${staff.middle_name ? ' ' + staff.middle_name : ''} ${staff.lname}`,
            description: staff.email
        }));
    }, [staffList]);

    // Keep original data for preview
    const staff = useMemo(() => {
        if (!staffList) return [];
        return staffList.map(s => ({
            id: s.id,
            fname: s.fname,
            lname: s.lname,
            middle_name: s.middle_name,
            email: s.email
        }));
    }, [staffList]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear validation error when user makes changes
        if (validationError) {
            setValidationError(null);
        }
    };

    const handleHostelChange = (value: string) => {
        handleInputChange('vuna_accomodation_id', value);
    };

    const handleStaffChange = (value: string) => {
        handleInputChange('staff_id', value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setValidationError(null);

        // Validate form fields with specific messages
        if (!formData.vuna_accomodation_id && !formData.staff_id) {
            const errorMessage = "Please select both a hostel and staff member.";
            setValidationError(errorMessage);
            toast({
                title: "Validation Error",
                description: errorMessage,
                variant: "destructive",
            });
            return;
        }

        if (!formData.vuna_accomodation_id) {
            const errorMessage = "Please select a hostel.";
            setValidationError(errorMessage);
            toast({
                title: "Validation Error",
                description: errorMessage,
                variant: "destructive",
            });
            return;
        }

        if (!formData.staff_id) {
            const errorMessage = "Please select a staff member.";
            setValidationError(errorMessage);
            toast({
                title: "Validation Error",
                description: errorMessage,
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await createAssignment({
                vuna_accomodation_id: parseInt(formData.vuna_accomodation_id),
                staff_id: parseInt(formData.staff_id),
                auto_assign_role: formData.auto_assign_role,
                notes: formData.notes || undefined,
            }).unwrap();

            toast({
                title: "Success",
                description: response.message || "Hostel assignment created successfully.",
            });

            router.push('/staff/admin/hostel-assignments');
        } catch (error: any) {
            console.error('Error creating assignment:', error);
            toast({
                title: "Error",
                description: error?.data?.message || "Failed to create hostel assignment.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedHostel = hostels.find(h => h.id.toString() === formData.vuna_accomodation_id);
    const selectedStaff = staff.find(s => s.id.toString() === formData.staff_id);

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
                    <h1 className="text-2xl sm:text-3xl font-bold">Create Hostel Assignment</h1>
                    <p className="text-muted-foreground mt-1">Assign a staff member to manage a hostel</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Validation Error Alert */}
                {validationError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Validation Error</AlertTitle>
                        <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Assignment Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Assignment Details
                            </CardTitle>
                            <CardDescription>
                                Select the hostel and staff member for this assignment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Hostel Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="hostel">Hostel *</Label>
                                <SearchableSelect
                                    options={hostelOptions}
                                    value={formData.vuna_accomodation_id}
                                    onValueChange={handleHostelChange}
                                    placeholder="Select a hostel"
                                    searchPlaceholder="Search hostels by name or gender..."
                                    emptyMessage="No hostels found"
                                    disabled={optionsLoading}
                                />
                                {optionsLoading && (
                                    <p className="text-sm text-muted-foreground">Loading hostels...</p>
                                )}
                                {!formData.vuna_accomodation_id && validationError && (
                                    <p className="text-sm text-destructive">Please select a hostel</p>
                                )}
                            </div>

                            {/* Staff Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="staff">Staff Member *</Label>
                                <SearchableSelect
                                    options={staffOptions}
                                    value={formData.staff_id}
                                    onValueChange={handleStaffChange}
                                    placeholder="Select a staff member"
                                    searchPlaceholder="Search staff by name or email..."
                                    emptyMessage="No staff members found"
                                    disabled={optionsLoading || staffListLoading}
                                />
                                {(optionsLoading || staffListLoading) && (
                                    <p className="text-sm text-muted-foreground">Loading staff...</p>
                                )}
                                {!formData.staff_id && validationError && (
                                    <p className="text-sm text-destructive">Please select a staff member</p>
                                )}
                            </div>

                            {/* Auto Assign Role */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="auto_assign_role"
                                    checked={formData.auto_assign_role}
                                    onCheckedChange={(checked) => handleInputChange('auto_assign_role', checked as boolean)}
                                />
                                <Label htmlFor="auto_assign_role" className="text-sm">
                                    Automatically assign hostel admin role
                                </Label>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional notes about this assignment..."
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assignment Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Preview</CardTitle>
                            <CardDescription>
                                Review the assignment details before creating
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedHostel && selectedStaff ? (
                                <>
                                    <div className="p-4 border rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{selectedHostel.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedHostel.gender} hostel
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {selectedStaff.fname} {selectedStaff.lname}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedStaff.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.auto_assign_role && (
                                        <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                                            <p className="text-sm text-blue-800">
                                                <strong>Auto-assign:</strong> Hostel admin role will be automatically assigned
                                            </p>
                                        </div>
                                    )}

                                    {formData.notes && (
                                        <div className="p-3 border rounded-lg bg-gray-50">
                                            <p className="text-sm text-gray-800">
                                                <strong>Notes:</strong> {formData.notes}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Building2 className="mx-auto h-12 w-12 mb-2" />
                                    <p>Select a hostel and staff member to see preview</p>
                                </div>
                            )}
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
                        disabled={isSubmitting || !formData.vuna_accomodation_id || !formData.staff_id}
                        className="w-full sm:w-auto min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Assignment
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}