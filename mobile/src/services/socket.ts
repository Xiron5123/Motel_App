import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

import { API_URL } from './api';

// Use the same base URL as the API
const SOCKET_URL = API_URL;

class SocketService {
    private static instance: SocketService;
    private socket: Socket | null = null;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(token: string) {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        this.socket = io(SOCKET_URL, {
            auth: {
                token: `Bearer ${token}`,
            },
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public emit(event: string, data: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not initialized. Cannot emit event:', event);
        }
    }

    public on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    public off(event: string) {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }
}

export const socketService = SocketService.getInstance();
