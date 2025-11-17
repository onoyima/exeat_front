'use client';

import { useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useDeanApplyExeatRequestMutation } from '@/lib/services/staffApi';
import { useGetCategoriesQuery } from '@/lib/services/exeatApi';

const deanExeatFormSchema = z.object({
    student_id: z
        .string()
        .min(1, 'Enter a valid student ID')
        .transform((v) => Number(v))
        .pipe(z.number().int().positive('Student ID must be a positive integer')),
    category_id: z.string().min(1, 'Please select a category'),
    reason: z.string().min(10, 'Please provide a detailed reason (minimum 10 characters)'),
    destination: z.string().min(3, 'Please specify the destination'),
    departure_date: z.date({ required_error: 'Please select a departure date' }),
    return_date: z.date({ required_error: 'Please select a return date' }),
}).refine((data) => data.return_date >= data.departure_date, {
    message: 'Return date cannot be before departure date',
    path: ['return_date'],
});

type DeanExeatFormValues = z.infer<typeof deanExeatFormSchema>;

interface Props {
    onSuccess?: () => void;
}

export default function ExeatApplyForStudentForm({ onSuccess }: Props) {
    const { data: categoriesData, isLoading: loadingCategories, error: categoriesError } = useGetCategoriesQuery();
    const [applyExeat, { isLoading: isSubmitting }] = useDeanApplyExeatRequestMutation();

    const form = useForm<DeanExeatFormValues>({
        resolver: zodResolver(deanExeatFormSchema),
        defaultValues: {
            student_id: '' as unknown as number,
            category_id: '',
            reason: '',
            destination: '',
        },
        mode: 'onChange',
    });

    const watchedDepartureDate = form.watch('departure_date');

    const dateBoundaries = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
        return { today, threeMonthsFromNow };
    }, []);

    const sortedCategories = useMemo(() => {
        return categoriesData?.categories ? [...categoriesData.categories].sort((a, b) => a.name.localeCompare(b.name)) : [];
    }, [categoriesData?.categories]);

    const isDepartureDateDisabled = useCallback((date: Date) => {
        const { today, threeMonthsFromNow } = dateBoundaries;
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today || compareDate > threeMonthsFromNow;
    }, [dateBoundaries]);

    const isReturnDateDisabled = useCallback((date: Date) => {
        const { today, threeMonthsFromNow } = dateBoundaries;
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        if (compareDate < today || compareDate > threeMonthsFromNow) return true;
        if (watchedDepartureDate) {
            const departureDateOnly = new Date(watchedDepartureDate);
            departureDateOnly.setHours(0, 0, 0, 0);
            if (compareDate < departureDateOnly) return true;
        }
        return false;
    }, [dateBoundaries, watchedDepartureDate]);

    const onSubmit = useCallback(async (values: DeanExeatFormValues) => {
        try {
            const payload = {
                student_id: Number(values.student_id),
                category_id: Number(values.category_id),
                reason: values.reason,
                destination: values.destination,
                departure_date: format(values.departure_date, 'yyyy-MM-dd'),
                return_date: format(values.return_date, 'yyyy-MM-dd'),
            };

            const result = await applyExeat(payload).unwrap();

            toast({
                variant: 'success',
                title: 'Success',
                description: result.message || 'Exeat request submitted for student.',
                duration: 3000,
            });

            form.reset();
            onSuccess?.();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.data?.message || 'Failed to submit exeat request.',
                duration: 5000,
            });
        }
    }, [applyExeat, form, onSuccess]);

    if (loadingCategories) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="space-y-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-muted-foreground">Loading form data...</p>
                </div>
            </div>
        );
    }

    if (categoriesError) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                <p>Failed to load exeat categories. Please try again later.</p>
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Student ID" error={form.formState.errors.student_id?.message as string}>
                    <Controller
                        control={form.control}
                        name="student_id"
                        render={({ field }) => (
                            <Input {...field} inputMode="numeric" placeholder="Enter student ID (e.g. 2031)" />
                        )}
                    />
                </FormField>

                <FormField label="Exeat Category" error={form.formState.errors.category_id?.message}>
                    <Controller
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                            <Select value={field.value as unknown as string} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortedCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormField>
            </div>

            <FormField label="Reason" error={form.formState.errors.reason?.message}>
                <Controller
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <Textarea {...field} placeholder="Reason for exeat" className="min-h-[100px] resize-none" />
                    )}
                />
            </FormField>

            <FormField label="Destination" error={form.formState.errors.destination?.message}>
                <Controller
                    control={form.control}
                    name="destination"
                    render={({ field }) => <Input {...field} placeholder="Enter destination" />}
                />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Departure Date" error={form.formState.errors.departure_date?.message}>
                    <Controller
                        control={form.control}
                        name="departure_date"
                        render={({ field }) => (
                            <DatePicker value={field.value} onChange={field.onChange} disabled={isDepartureDateDisabled} />
                        )}
                    />
                </FormField>

                <FormField label="Return Date" error={form.formState.errors.return_date?.message}>
                    <Controller
                        control={form.control}
                        name="return_date"
                        render={({ field }) => (
                            <DatePicker value={field.value} onChange={field.onChange} disabled={isReturnDateDisabled} />
                        )}
                    />
                </FormField>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Exeat For Student'}
            </Button>
        </form>
    );
}


