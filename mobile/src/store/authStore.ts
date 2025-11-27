import { create } from 'zustand';
import { storage } from '../services/storage';
import api from '../services/api';
import { router } from 'expo-router';
import { socketService } from '../services/socket';

interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'RENTER' | 'LANDLORD';
    avatar?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (token, user) => {
        await storage.setToken(token);

        // Connect socket
        socketService.connect(token);

        set({ user, token, isAuthenticated: true });
        router.replace('/(tabs)');
    },

    logout: async () => {
        await storage.removeToken();

        // Disconnect socket
        socketService.disconnect();

        set({ user: null, token: null, isAuthenticated: false });
        router.replace('/(auth)/login');
    },

    checkAuth: async () => {
        try {
            const state = get();
            if (state.isLoading && state.user) return;

            set({ isLoading: true });
            const token = await storage.getToken();

            if (token) {
                try {
                    const response = await api.get('/users/me', { timeout: 3000 });

                    // Connect socket on load
                    socketService.connect(token);

                    set({ user: response.data, token, isAuthenticated: true });
                    router.replace('/(tabs)');
                } catch (apiError: any) {
                    if (apiError.response?.status === 401) {
                        console.log('Token expired or invalid');
                        await storage.removeToken();
                        set({ user: null, isAuthenticated: false });
                    } else if (apiError.response?.status === 429 || !apiError.response) {
                        console.warn('Auth check failed due to network/rate limit:', apiError.message);
                        set({ user: null, isAuthenticated: false });
                    } else {
                        console.error('Auth check failed with unknown error:', apiError);
                        await storage.removeToken();
                        set({ user: null, isAuthenticated: false });
                    }
                }
            } else {
                set({ isAuthenticated: false });
            }
        } catch (error) {
            console.error('Auth check failed', error);
            await storage.removeToken();
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },

    setUser: (user) => set({ user }),
}));
