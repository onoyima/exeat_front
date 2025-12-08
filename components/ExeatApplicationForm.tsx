'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import { FormField } from './ui/form-field';
import { DatePicker } from './ui/date-picker';
import { toast } from '@/hooks/use-toast';
import {
  useGetCategoriesQuery,
  useCreateExeatRequestMutation,
} from '@/lib/services/exeatApi';

const preferredModes = [
  { value: 'text', label: 'Text Message' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'email', label: 'Email' }
] as const;

const exeatFormSchema = z.object({
  category_id: z.string().min(1, 'Please select a category'),
  preferred_mode_of_contact: z.enum(['whatsapp', 'text', 'phone_call', 'email'], {
    required_error: 'Please select a contact mode',
  }),
  reason: z.string().min(10, 'Please provide a detailed reason (minimum 10 characters)'),
  destination: z.string().min(3, 'Please specify your destination'),
  departure_date: z.date({
    required_error: 'Please select a departure date',
  }),
  return_date: z.date({
    required_error: 'Please select a return date',
  }),
}).refine((data) => {
  // Skip 3-day minimum validation for holiday category (id: 6)
  if (data.category_id === '6') {
    return true;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDepartureDate = addDays(today, 3);
  const departureDate = new Date(data.departure_date);
  departureDate.setHours(0, 0, 0, 0);
  return departureDate >= minDepartureDate;
}, {
  message: 'Departure date must be at least 3 days from today',
  path: ['departure_date'],
}).refine((data) => data.return_date >= data.departure_date, {
  message: 'Return date cannot be before departure date',
  path: ['return_date'],
}).refine((data) => {
  // Check if category is exigency - we need to check this dynamically
  // The validation will be handled in the disabled function for the date picker
  // and here for form submission
  return true;
}, {
  message: 'Exigency category allows maximum of 4 days',
  path: ['return_date'],
});

type ExeatFormValues = z.infer<typeof exeatFormSchema>;

interface ExeatApplicationFormProps {
  onSuccess?: () => void;
}

export default function ExeatApplicationForm({ onSuccess }: ExeatApplicationFormProps) {
  const { data: categoriesData, isLoading: loadingCategories, error: categoriesError } = useGetCategoriesQuery();
  const [createExeatRequest, { isLoading: isSubmitting }] = useCreateExeatRequestMutation();

  const form = useForm<ExeatFormValues>({
    resolver: zodResolver(exeatFormSchema),
    defaultValues: {
      category_id: '',
      preferred_mode_of_contact: 'phone_call',
      reason: '',
      destination: '',
    },
    mode: 'onChange',
  });

  // Watch dates and category efficiently
  const watchedDepartureDate = form.watch('departure_date');
  const watchedReturnDate = form.watch('return_date');
  const watchedCategoryId = form.watch('category_id');

  // Memoize date boundaries for performance
  const dateBoundaries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Minimum departure date is 3 days from today
    const minDepartureDate = addDays(today, 3);
    minDepartureDate.setHours(0, 0, 0, 0);

    const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());

    return { today, minDepartureDate, threeMonthsFromNow };
  }, []);

  // Memoize sorted categories
  const sortedCategories = useMemo(() => {
    return categoriesData?.categories
      ? [...categoriesData.categories].sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [categoriesData?.categories]);

  // Get selected category details
  const selectedCategory = useMemo(() => {
    return sortedCategories.find(cat => String(cat.id) === watchedCategoryId);
  }, [sortedCategories, watchedCategoryId]);

  // Check if holiday category is selected
  const isHolidayCategory = useMemo(() => {
    return selectedCategory?.id === 6 || selectedCategory?.name?.toLowerCase() === 'holiday';
  }, [selectedCategory]);

  // Handle holiday category - auto-set dates and lock them
  useEffect(() => {
    if (isHolidayCategory) {
      // Set fixed dates for holiday category
      const departureDate = new Date(2025, 11, 12); // December 12, 2025 (month is 0-indexed)
      departureDate.setHours(0, 0, 0, 0);

      const returnDate = new Date(2026, 0, 9); // January 9, 2026 (month is 0-indexed)
      returnDate.setHours(0, 0, 0, 0);

      // Set the dates in the form
      form.setValue('departure_date', departureDate, { shouldValidate: true });
      form.setValue('return_date', returnDate, { shouldValidate: true });

      // Clear any date-related errors
      form.clearErrors('departure_date');
      form.clearErrors('return_date');
    }
  }, [isHolidayCategory, form]);

  // Handle category change - validate return date for exigency
  useEffect(() => {
    // Skip validation if holiday category is selected
    if (isHolidayCategory) return;

    const isExigency = selectedCategory?.name?.toLowerCase() === 'exigency';
    if (isExigency && watchedDepartureDate && watchedReturnDate) {
      const departureDateOnly = new Date(watchedDepartureDate);
      departureDateOnly.setHours(0, 0, 0, 0);
      const maxReturnDate = addDays(departureDateOnly, 4);
      maxReturnDate.setHours(0, 0, 0, 0);
      const returnDateOnly = new Date(watchedReturnDate);
      returnDateOnly.setHours(0, 0, 0, 0);

      if (returnDateOnly > maxReturnDate) {
        form.setValue('return_date', null as any);
        form.setError('return_date', {
          type: 'manual',
          message: 'Exigency category allows maximum of 4 days from departure date'
        });
      }
    }
  }, [selectedCategory, watchedDepartureDate, watchedReturnDate, form, isHolidayCategory]);

  // Optimized departure date disabled function
  const isDepartureDateDisabled = useCallback((date: Date) => {
    // If holiday category is selected, disable all dates (dates are auto-set and locked)
    if (isHolidayCategory) {
      return true;
    }

    const { minDepartureDate, threeMonthsFromNow } = dateBoundaries;

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // Disable dates before minimum departure date (3 days from today) or after 3 months
    return compareDate < minDepartureDate || compareDate > threeMonthsFromNow;
  }, [dateBoundaries, isHolidayCategory]);

  // Optimized return date disabled function
  const isReturnDateDisabled = useCallback((date: Date) => {
    // If holiday category is selected, disable all dates (dates are auto-set and locked)
    if (isHolidayCategory) {
      return true;
    }

    const { today, threeMonthsFromNow } = dateBoundaries;

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // Basic date range check
    if (compareDate < today || compareDate > threeMonthsFromNow) return true;

    // Check against departure date
    if (watchedDepartureDate) {
      const departureDateOnly = new Date(watchedDepartureDate);
      departureDateOnly.setHours(0, 0, 0, 0);
      if (compareDate < departureDateOnly) return true;

      // Check if category is exigency - limit to 4 days maximum
      const isExigency = selectedCategory?.name?.toLowerCase() === 'exigency';
      if (isExigency) {
        const maxReturnDate = addDays(departureDateOnly, 4);
        maxReturnDate.setHours(0, 0, 0, 0);
        if (compareDate > maxReturnDate) return true;
      }
    }

    return false;
  }, [dateBoundaries, watchedDepartureDate, selectedCategory, isHolidayCategory]);

  // Optimized departure date change handler
  const handleDepartureDateChange = useCallback((date: Date | undefined, field: any) => {
    // Prevent date changes if holiday category is selected
    if (isHolidayCategory) {
      // Reset to the fixed holiday dates
      const departureDate = new Date(2025, 11, 12);
      departureDate.setHours(0, 0, 0, 0);
      field.onChange(departureDate);
      return;
    }

    field.onChange(date);

    // Clear return date if it becomes invalid (return date before departure date)
    if (date && watchedReturnDate && watchedReturnDate < date) {
      form.setValue('return_date', null as any);
    }

    // Clear return date if it exceeds 4 days for exigency category
    if (date && watchedReturnDate) {
      const isExigency = selectedCategory?.name?.toLowerCase() === 'exigency';
      if (isExigency) {
        const departureDateOnly = new Date(date);
        departureDateOnly.setHours(0, 0, 0, 0);
        const maxReturnDate = addDays(departureDateOnly, 4);
        maxReturnDate.setHours(0, 0, 0, 0);
        const returnDateOnly = new Date(watchedReturnDate);
        returnDateOnly.setHours(0, 0, 0, 0);

        if (returnDateOnly > maxReturnDate) {
          form.setValue('return_date', null as any);
        }
      }
    }
  }, [watchedReturnDate, form, selectedCategory, isHolidayCategory]);

  // Optimized form submission
  const onSubmit = useCallback(async (values: ExeatFormValues) => {
    try {
      // Validate exigency category 4-day limit
      const isExigency = selectedCategory?.name?.toLowerCase() === 'exigency';
      if (isExigency && values.departure_date && values.return_date) {
        const departureDateOnly = new Date(values.departure_date);
        departureDateOnly.setHours(0, 0, 0, 0);
        const returnDateOnly = new Date(values.return_date);
        returnDateOnly.setHours(0, 0, 0, 0);
        const maxReturnDate = addDays(departureDateOnly, 4);
        maxReturnDate.setHours(0, 0, 0, 0);

        if (returnDateOnly > maxReturnDate) {
          form.setError('return_date', {
            type: 'manual',
            message: 'Exigency category allows maximum of 4 days from departure date'
          });
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Exigency category allows maximum of 4 days from departure date",
            duration: 5000,
          });
          return;
        }
      }

      const payload = {
        ...values,
        category_id: Number(values.category_id),
        departure_date: format(values.departure_date, 'yyyy-MM-dd'),
        return_date: format(values.return_date, 'yyyy-MM-dd'),
      };

      const result = await createExeatRequest(payload).unwrap();

      toast({
        variant: "success",
        title: "Success",
        description: result.message || "Exeat request submitted successfully.",
        duration: 3000,
      });

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.log('Error object:', error);

      if (error?.status === 403 && error?.data?.message) {
        toast({
          variant: "destructive",
          title: "Existing Request",
          description: error.data.message,
          duration: 5000,
        });
        setTimeout(() => onSuccess?.(), 100);
        return;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit exeat request. Please try again.",
        duration: 5000,
      });
    }
  }, [createExeatRequest, form, onSuccess, selectedCategory]);

  // Handle loading states
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

  // Handle API errors
  if (categoriesError) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <p>Failed to load exeat categories. Please try again later.</p>
          <p className="text-sm mt-2">{categoriesError.toString()}</p>
        </div>
      </div>
    );
  }

  // Verify data is available
  if (!categoriesData?.categories) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>Unable to load required data. Please refresh the page and try again.</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Close button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-0 absolute right-4 top-4"
          onClick={onSuccess}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          label="Exeat Category"
          error={form.formState.errors.category_id?.message}
        >
          <Controller
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category">
                    {field.value && selectedCategory
                      ? selectedCategory.name.charAt(0).toUpperCase() + selectedCategory.name.slice(1)
                      : "Select Category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sortedCategories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={String(cat.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col items-start w-full py-1">
                        <span className="font-medium">
                          {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                        </span>
                        {cat.description && (
                          <span className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[300px]">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {selectedCategory?.description && (
            <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted/50 rounded-md border">
              <span className="font-medium">About this category:</span> {selectedCategory.description}
            </p>
          )}
        </FormField>

        <FormField
          label="Preferred Contact Method (How can we contact your parent/guardian?)"
          error={form.formState.errors.preferred_mode_of_contact?.message}
        >
          <Controller
            control={form.control}
            name="preferred_mode_of_contact"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact mode" />
                </SelectTrigger>
                <SelectContent>
                  {preferredModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField
        label="Reason for Exeat"
        error={form.formState.errors.reason?.message}
      >
        <Controller
          control={form.control}
          name="reason"
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Please provide a detailed reason for your exeat request"
              className="min-h-[100px] resize-none"
            />
          )}
        />
      </FormField>

      <FormField
        label="Destination"
        error={form.formState.errors.destination?.message}
      >
        <Controller
          control={form.control}
          name="destination"
          render={({ field }) => (
            <Input {...field} placeholder="Where are you going?" />
          )}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Departure Date"
          error={form.formState.errors.departure_date?.message}
        >
          <Controller
            control={form.control}
            name="departure_date"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={(date) => handleDepartureDateChange(date, field)}
                disabled={isDepartureDateDisabled}
              />
            )}
          />
          {isHolidayCategory ? (
            <p className="text-xs text-muted-foreground mt-2">
              Holiday exeat dates are automatically set and cannot be changed.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">
              Note: Departure date must be at least 3 days from today.
              {dateBoundaries?.minDepartureDate && (
                <>
                  {' '}Earliest allowed date: {format(dateBoundaries.minDepartureDate, 'MMM d, yyyy')}
                </>
              )}
            </p>
          )}
        </FormField>

        <FormField
          label="Return Date"
          error={form.formState.errors.return_date?.message}
        >
          <Controller
            control={form.control}
            name="return_date"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={(date) => {
                  // Prevent date changes if holiday category is selected
                  if (isHolidayCategory) {
                    const returnDate = new Date(2026, 0, 9);
                    returnDate.setHours(0, 0, 0, 0);
                    field.onChange(returnDate);
                    return;
                  }
                  field.onChange(date);
                }}
                disabled={isReturnDateDisabled}
              />
            )}
          />
          {isHolidayCategory ? (
            <p className="text-xs text-muted-foreground mt-2">
              Holiday exeat dates are automatically set and cannot be changed.
            </p>
          ) : selectedCategory?.name?.toLowerCase() === 'exigency' && watchedDepartureDate ? (
            <p className="text-xs text-muted-foreground mt-2">
              Note: Exigency category allows maximum of 4 days from departure date.
              {watchedDepartureDate && (
                <>
                  {' '}Latest allowed return date: {format(addDays(watchedDepartureDate, 4), 'MMM d, yyyy')}
                </>
              )}
            </p>
          ) : null}
        </FormField>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
            Submitting...
          </>
        ) : (
          'Submit Exeat Request'
        )}
      </Button>
    </form>
  );
}