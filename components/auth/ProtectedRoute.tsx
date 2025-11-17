'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/lib/services/authSlice';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const router = useRouter();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (requiredRole && user?.role) {
            const userRole = user.role.toLowerCase();
            const required = requiredRole.toLowerCase();

            // Handle role mapping - staff roles should be treated as "staff"
            const normalizedUserRole = userRole === 'student' ? 'student' : 'staff';
            const normalizedRequiredRole = required === 'student' ? 'student' : 'staff';

            if (normalizedUserRole !== normalizedRequiredRole) {
                router.push(normalizedUserRole === 'student' ? '/student/dashboard' : '/staff/dashboard');
            }
        }
    }, [isAuthenticated, user, requiredRole, router]);

    // Show nothing while checking auth
    if (!isAuthenticated) {
        return null;
    }

    if (requiredRole && user?.role) {
        const userRole = user.role.toLowerCase();
        const required = requiredRole.toLowerCase();

        // Handle role mapping - staff roles should be treated as "staff"  
        const normalizedUserRole = userRole === 'student' ? 'student' : 'staff';
        const normalizedRequiredRole = required === 'student' ? 'student' : 'staff';

        if (normalizedUserRole !== normalizedRequiredRole) {
            return null;
        }
    }

    return <>{children}</>;
}