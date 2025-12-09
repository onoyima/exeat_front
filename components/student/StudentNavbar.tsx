'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, User, LogOut } from 'lucide-react';

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
import type { useGetCurrentUser } from '@/hooks/use-current-user';
import LogoutModal from '@/components/ui/logout-modal';

export default function StudentNavbar({
  onMenuClick,
  currentUser,
}: {
  onMenuClick: () => void;
  currentUser: ReturnType<typeof useGetCurrentUser>;
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, fullName, initials, avatarUrl } = currentUser;
  const router = useRouter();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutSuccess = () => {
    router.replace('/login');
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
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
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
          <div className="text-xs sm:text-sm font-medium truncate">
            <span className="hidden md:inline">Digital Exeat System</span>
            <span className="md:hidden">Exeat System</span>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden md:block text-sm text-muted-foreground">
            Welcome, {user?.fname}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
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
                  <a href="/student/profile" className="cursor-pointer">
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
