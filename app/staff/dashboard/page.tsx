"use client";

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import StaffDashboard from '@/components/staff/StaffDashboard';

export default function StaffDashboardPage() {
  return (
    <ProtectedRoute requiredRole="staff">
      <div className="w-full p-4 h-full">
        <StaffDashboard />
      </div>
    </ProtectedRoute>
  );
} 