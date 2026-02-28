import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function useAuth() {
  const { user, isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);

  return {
    user,
    isAuthenticated,
    accessToken,
    isAdmin: user?.role === 'admin',
    isCoach: user?.role === 'coach',
    isAthlete: user?.role === 'athlete',
    fullName: user
      ? `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim() || user.email
      : '',
  };
}
