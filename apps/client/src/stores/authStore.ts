import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: {
    userId: string;
    id: string;
    provider: string;
    name: string;
    email: string;
    role: 'USER' | 'INSTRUCTOR';
    picture: string;
    created_at: string;
  } | null;
  accessToken: string | null;
  login: (user: AuthState['user'], token: string) => void;
  logout: () => void;
  setUser: (user: AuthState['user']) => void; 
  setToken: (token: AuthState['accessToken']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      login: (user, token) => {
        console.log('✅ 로그인 성공 - 저장:', user, token);
        set({ user, accessToken: token });
      },
      logout: () => {
        console.log('🔴 로그아웃 - 상태 초기화');
        set({ user: null, accessToken: null });
      },
      setUser: (user) => set({ user }),
      setToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
    }
  )
);