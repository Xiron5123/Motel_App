import { create } from 'zustand';
import api from '../services/api';

export interface Notification {
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    type: 'SYSTEM' | 'CHAT' | 'LISTING';
    data?: any;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/notifications');
            const notifications = response.data;
            const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
            set({ notifications, unreadCount, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            set({ isLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            set((state) => {
                const updatedNotifications = state.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;
                return { notifications: updatedNotifications, unreadCount };
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.patch('/notifications/read-all');
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },
}));
