'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, User, LogOut, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/lib/services/authSlice';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LogoutModal from '@/components/ui/logout-modal';

export default function StaffNavbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const router = useRouter();

  // Create user display data
  const user = currentUser;
  const fullName = user ? `${user.fname} ${user.lname}` : 'Staff Member';
  const initials = user
    ? `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase()
    : 'ST';
  const avatarUrl = user?.passport ? `data:image/jpeg;base64,${user.passport}` : '';


  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutSuccess = () => {
    router.replace('/login');
  };

  const [studentIdSearch, setStudentIdSearch] = useState('');

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = studentIdSearch.trim();
    if (!id) return;
    router.push(`/staff/search?student_id=${encodeURIComponent(id)}`);
    setStudentIdSearch('');
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white">
      <div className="flex h-14 items-center px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo and Title */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Image
              src="/veritas-logo.png"
              alt="Veritas University Logo"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
            <span className="hidden lg:inline-block text-lg font-semibold text-primary">
              Veritas University
            </span>
          </div>
          <div className="hidden lg:block h-4 w-px bg-border mx-2" />
          <div className="text-sm font-medium">Digital Exeat System - Staff</div>
        </div>

        {/* Navbar Search (Student ID) - compact, doesn't push logo */}
        <form onSubmit={onSubmitSearch} className="hidden lg:flex items-center gap-2 mr-2 w-[350px] flex-none">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={studentIdSearch}
              onChange={(e) => setStudentIdSearch(e.target.value)}
              inputMode="numeric"
              placeholder="Search by Student ID"
              className="w-full pl-9 pr-3 py-2 h-9 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Button type="submit" size="sm" disabled={!studentIdSearch}>Go</Button>
        </form>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-muted-foreground">
            Welcome, {user?.fname || 'Staff'}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative size-12 rounded-full">
                <Avatar className="size-12">
                  <AvatarImage
                    src={avatarUrl}
                    alt={user ? `${user.fname} ${user.lname}` : 'User avatar'}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {fullName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <a href="/staff/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleLogoutClick}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={onSubmitSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={studentIdSearch}
              onChange={(e) => setStudentIdSearch(e.target.value)}
              inputMode="numeric"
              placeholder="Search by Student ID"
              className="w-full pl-9 pr-3 py-2 h-10 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Button type="submit" size="sm" disabled={!studentIdSearch}>Go</Button>
        </form>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        userName={fullName}
        onLogoutSuccess={handleLogoutSuccess}
      />
    </header>
  );
}