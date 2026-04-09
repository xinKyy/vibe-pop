import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCallback } from 'react';

export function useRequireAuth() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  const requireAuth = useCallback(
    (action: () => void) => {
      if (isLoggedIn) {
        action();
      } else {
        navigate('/login');
      }
    },
    [isLoggedIn, navigate]
  );

  return { isLoggedIn, requireAuth };
}
