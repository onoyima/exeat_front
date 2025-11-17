'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => Promise<void> | void;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
}: ConfirmModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            setError('');
            await onConfirm();
        } catch (e: any) {
            setError(e?.message || 'Action failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={!isLoading ? onClose : undefined}
        >
            <div
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        {description && (
                            <p className="text-sm text-gray-500">{description}</p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-4 py-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}


