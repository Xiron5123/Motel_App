import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../services/api';
import { storage } from '../services/storage';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        const connectSocket = async () => {
            const token = await storage.getToken();

            if (!token || !user) return;

            // Connect to the chat namespace
            const socketUrl = `${API_URL}/chat`;

            socketRef.current = io(socketUrl, {
                auth: {
                    token,
                },
                transports: ['websocket'],
                autoConnect: true,
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
                // Register user with socket
                socketRef.current?.emit('register', { userId: user.id });
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });
        };

        connectSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user]);

    return socketRef.current;
};
