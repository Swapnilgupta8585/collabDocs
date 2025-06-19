import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const useAuthStore = create(
    devtools(
        persist(
            (set,get) => ({
                user:null,
                authLoading: false,
                authError:null,
                authAccessToken:null,
                authRefreshToken:null,
                isAuthenticated:false,

                setUser:(user) => set({ user }),
                setAuthLoading:(loading) => set({ authLoading: loading }),
                setAuthError:(error) => set({ authError: error }),

                setTokens: (accessToken, refreshToken) => set({
                    authAccessToken: accessToken,
                    authRefreshToken: refreshToken,
                    isAuthenticated: !!accessToken,
                }),

                clearAuth: () => set({
                    user:null,
                    authAccessToken:null,
                    authRefreshToken:null,
                    isAuthenticated:false,
                    authError: null,
                    authLoading: false,
                }),

                getAccessToken: () => get().authAccessToken,
                getRefreshToken: () => get().authRefreshToken,
                getIsAuthenticated: () => get().isAuthenticated,
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    user: state.user,
                    authAccessToken: state.authAccessToken,
                    authRefreshToken: state.authRefreshToken,
                    isAuthenticated: state.isAuthenticated,
                }),
            }
        )
    )
)

export default useAuthStore;