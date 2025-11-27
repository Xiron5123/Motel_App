import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

const getBaseUrl = () => {
    // Hardcoded IP as requested
    return 'http://192.168.0.2:3000';

    // Original logic preserved below for reference but disabled
    /*
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Check for Android Emulator
    if (!Constants.isDevice && Platform.OS === 'android') {
        return 'http://10.0.2.2:3000';
    }

    // Get the host URI from Expo Constants (works for Emulator & Physical Device)
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (localhost) {
        return `http://${localhost}:3000`;
    }

    // Fallback for Physical Device if hostUri is missing
    return 'http://192.168.0.2:3000';
    */
};

export const API_URL = getBaseUrl();

console.log('API URL:', API_URL); // Log for debugging

const api = axios.create({
    baseURL: API_URL,
    timeout: 5000, // 5 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        // Skip adding token for auth endpoints
        if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
            console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
            return config;
        }

        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            console.log(`API Request with Token: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log(`API Request WITHOUT Token: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;

        // Handle 401 Unauthorized (Token expired)
        if (status === 401 && originalRequest && !originalRequest._retry) {
            // Check if this is a refresh token request failing
            if (originalRequest.url?.includes('/auth/refresh')) {
                // Refresh token is also invalid, logout completely
                isRefreshing = false;
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                router.replace('/(auth)/login');
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Wait for the current refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                console.log('Attempting to refresh access token...');

                // Call refresh token API
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken
                });

                const { accessToken: newAccessToken } = response.data;

                // Save new access token
                await SecureStore.setItemAsync('accessToken', newAccessToken);

                console.log('Access token refreshed successfully');

                // Update header with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                processQueue(null, newAccessToken);
                isRefreshing = false;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh failed, logout user
                console.log('Token refresh failed, logging out...');
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                router.replace('/(auth)/login');

                return Promise.reject(refreshError);
            }
        }

        // Log other errors
        console.error(`API Error: ${error.message} - URL: ${error.config?.baseURL}${error.config?.url}`);
        return Promise.reject(error);
    }
);

export default api;
