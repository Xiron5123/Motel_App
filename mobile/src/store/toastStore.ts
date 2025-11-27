import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
    duration: number;
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
    showToast: (message, type = 'info', duration = 3000) => set({ visible: true, message, type, duration }),
    hideToast: () => set({ visible: false }),
}));

export const toast = {
    success: (message: string, duration?: number) => useToastStore.getState().showToast(message, 'success', duration),
    error: (message: string, duration?: number) => useToastStore.getState().showToast(message, 'error', duration),
    info: (message: string, duration?: number) => useToastStore.getState().showToast(message, 'info', duration),
};
