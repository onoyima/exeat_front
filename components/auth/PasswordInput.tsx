import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { Control, Controller, FieldError } from 'react-hook-form';

interface PasswordInputProps {
    name: string;
    control: Control<any>;
    error?: FieldError;
    disabled?: boolean;
    tabIndex?: number;
    title?: string;
}

export function PasswordInput({
    name,
    control,
    error,
    disabled,
    tabIndex,
    title,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-sm font-semibold text-gray-700">
                Password
            </Label>
            <div className="relative">
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => {

                        return (
                            <Input
                                {...field}
                                id={name}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                className={`h-12 border-2 pr-12 ${error
                                    ? 'border-red-500'
                                    : disabled
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        : 'border-gray-200 focus:border-university-primary'
                                    }`}
                                required
                                autoComplete="current-password"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                disabled={disabled}
                                tabIndex={tabIndex}
                                title={title}
                            />
                        );
                    }}
                />
                {/* Button to toggle password visibility */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
            </div>
            {error && (
                <div className="text-xs mt-1 text-red-600">
                    {error.message}
                </div>
            )}
        </div>
    );
}