'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/lib/services/authSlice';
import StaffSidebar from '@/components/staff/StaffSidebar';
import StaffNavbar from '@/components/staff/StaffNavbar';
import SoundNotifier from '@/components/notifications/SoundNotifier';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const [user, setUser] = useState({ fname: '', lname: '', email: '', image: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setUser({
        fname: currentUser.fname || '',
        lname: currentUser.lname || '',
        email: currentUser.email || '',
        image: currentUser.passport || ''
      });
      setLoading(false);
    } else {
      // Fallback to localStorage if Redux state is not yet populated
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            fname: parsedUser.fname || '',
            lname: parsedUser.lname || '',
            email: parsedUser.email || '',
            image: parsedUser.passport || parsedUser.image || ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [currentUser]);

  if (loading) {
    // Show only loading overlay
    return (
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-1 flex items-center justify-center">
            <Image
              src="/vicon.png"
              alt="Loading"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        </div>
        <p className="text-white text-base font-medium drop-shadow">Loading...</p>
      </div>
    );
  }

  // When loading is done, render layout and content
  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <div className="flex flex-col h-full">
        <StaffNavbar onMenuClick={() => setSidebarOpen(true)} />
        <SoundNotifier />
        <div className="flex flex-1 relative overflow-hidden pt-[116px] md:pt-14">
          <StaffSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:ml-[280px] bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
