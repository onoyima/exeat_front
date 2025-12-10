'use client';

import { useState, useEffect } from 'react';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentNavbar from '@/components/student/StudentNavbar';
import { useGetCurrentUser } from '@/hooks/use-current-user';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import WhatsAppButton from '@/components/student/WhatsAppButton';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExeatModal, setShowExeatModal] = useState(false);
  const currentUser = useGetCurrentUser();
  const [isClient, setIsClient] = useState(false);

  // Avoid hydration mismatch by rendering only on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ProtectedRoute requiredRole="student">
      <div className="flex min-h-screen flex-col">
        <StudentNavbar
          onMenuClick={() => setSidebarOpen(true)}
          currentUser={currentUser}
        />

        <div className="flex-1 flex pt-14">
          <StudentSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onApplyExeat={() => setShowExeatModal(true)}
            currentUser={currentUser}
          />

          <main className="flex-1 relative overflow-x-hidden lg:ml-[280px]">
            <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
        
        {isClient && <WhatsAppButton />}

        {/* Loading state is now handled by the auth hook */}
      </div>
    </ProtectedRoute>
  );
}