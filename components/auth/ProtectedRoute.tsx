'use client';

import { useEffect, useState } from 'react';
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (requiredRole && user?.role) {
            const userRole = user.role.toLowerCase();
            const required = requiredRole.toLowerCase();

            const normalizedUserRole = userRole === 'student' ? 'student' : 'staff';
            const normalizedRequiredRole = required === 'student' ? 'student' : 'staff';

            if (normalizedRequiredRole !== 'student' && normalizedRequiredRole !== 'staff') {
                const exeatRoles = Array.isArray((user as any)?.roles) ? (user as any).roles : [];
                if (!exeatRoles.includes(required)) {
                    router.push(normalizedUserRole === 'student' ? '/student/dashboard' : '/staff/dashboard');
                }
            } else if (normalizedUserRole !== normalizedRequiredRole) {
                router.push(normalizedUserRole === 'student' ? '/student/dashboard' : '/staff/dashboard');
            }
        }
    }, [isAuthenticated, user, requiredRole, router]);

    // Avoid hydration mismatch by rendering nothing until mounted
    if (!mounted) {
        return null;
    }
    if (!isAuthenticated) {
        return null;
    }

    if (requiredRole && user?.role) {
        const userRole = user.role.toLowerCase();
        const required = requiredRole.toLowerCase();

        const normalizedUserRole = userRole === 'student' ? 'student' : 'staff';
        const normalizedRequiredRole = required === 'student' ? 'student' : 'staff';

        if (normalizedRequiredRole !== 'student' && normalizedRequiredRole !== 'staff') {
            const exeatRoles = Array.isArray((user as any)?.roles) ? (user as any).roles : [];
            if (!exeatRoles.includes(required)) {
                return null;
            }
        } else if (normalizedUserRole !== normalizedRequiredRole) {
            return null;
        }
    }

    return <>{children}</>;
}