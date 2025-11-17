import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsLoading } from '@/lib/services/authSlice';
import type { User } from '@/types/auth';

export function useGetCurrentUser() {
    const user = useSelector(selectCurrentUser) as User | null;
    const isLoading = useSelector(selectIsLoading);

    return {
        user,
        isLoading,
        fullName: user ? `${user.fname} ${user.lname}` : '',
        initials: user ? `${user.fname[0]}${user.lname[0]}`.toUpperCase() : '',
        avatarUrl: user?.passport ? `data:image/jpeg;base64,${user.passport}` : undefined,
    };
}