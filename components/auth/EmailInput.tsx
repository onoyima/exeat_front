import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Control, Controller, FieldError } from 'react-hook-form';

interface EmailInputProps {
    name: string;
    control: Control<any>;
    error?: FieldError;
}

export function EmailInput({ name, control, error }: EmailInputProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-sm font-semibold text-gray-700">
                Email Address
            </Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        id={name}
                        type="email"
                        placeholder="Enter Your Email"
                        className={`h-12 border-2 ${error ? 'border-red-500' : 'border-gray-200'} focus:border-university-primary`}
                        required
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                )}
            />
            <p className="text-xs text-gray-500">
                Use your Veritas University email address (ending with .veritas.edu.ng)
            </p>
            {error && (
                <div className="text-xs mt-1 text-red-600">
                    {error.message}
                </div>
            )}
        </div>
    );
}