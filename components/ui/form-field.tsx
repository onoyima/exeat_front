import { cn } from '@/lib/utils';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children, className, ...props }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}