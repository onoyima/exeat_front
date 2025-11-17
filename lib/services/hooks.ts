import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/lib/services/authSlice';

// These functions are now handled by the Redux store

/**
 * Hook to protect routes and handle role-based access
 */
export function useAuth(requiredRole?: string) {
    const router = useRouter();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Check role if required
        if (requiredRole) {
            if (!user || user.role !== requiredRole) {
                // Redirect based on actual role
                if (user?.role === 'student') {
                    router.push('/student/dashboard');
                } else {
                    router.push('/staff/dashboard');
                }
            }
        }
    }, [router, requiredRole, isAuthenticated, user]);

    return { user };
}