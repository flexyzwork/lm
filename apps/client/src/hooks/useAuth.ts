import { useEffect } from 'react';

import { refreshAccessToken } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

export const useAuthRefresh = () => {
  const { setToken } = useAuthStore();

  useEffect(() => {
    const refreshToken = async () => {
      const result = await refreshAccessToken();
      if (result?.token) {
        setToken(result.token);
      }
    };

    // 1시간마다 리프레시 (과부하 방지)
    const interval = setInterval(refreshToken, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
