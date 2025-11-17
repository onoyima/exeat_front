'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { logout as logoutAction } from '@/lib/services/authSlice';
import { useLogoutMutation } from '@/lib/services/authApi';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onLogoutSuccess: () => void;
}

export default function LogoutModal({ isOpen, onClose, userName, onLogoutSuccess }: LogoutModalProps) {
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError('');

    try {
      // Try to call logout API endpoint
      await logout().unwrap();
    } catch (error: any) {
      // Log the error but don't prevent logout
      console.warn('API logout failed:', error);

      // If it's just "No authenticated user", that's fine - user is already logged out on server
      if (error?.data?.message !== "No authenticated user.") {
        console.error('Unexpected logout error:', error);
      }
    } finally {
      // Always clear local state regardless of API response
      dispatch(logoutAction());
      onLogoutSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={!isLoggingOut ? onClose : undefined}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
              <p className="text-sm text-gray-500">Are you sure you want to log out?</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              <span className="font-medium">{userName}</span> will be logged out of the system.
            </p>
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
              disabled={isLoggingOut}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                'Logout'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 