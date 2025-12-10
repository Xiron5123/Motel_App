import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

const getBaseUrl = () => {
    // ⚠️ QUAN TRỌNG: Kiểm tra IP của máy backend (chạy `ipconfig` trên Windows)
    // Thay đổi IP này thành IP máy tính đang chạy backend
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

import qs from 'qs';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: params => {
        return qs.stringify(params, { arrayFormat: 'repeat' });
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

        // Use console.log instead of console.error to avoid noisy stack traces in Expo
        console.log(`[API Debug] Error: ${error.message}`);
        console.log(`[API Debug] URL: ${error.config?.baseURL}${error.config?.url}`);
        if (error.response) {
            console.log(`[API Debug] Status: ${error.response.status}`);
            // console.log(`[API Debug] Data:`, JSON.stringify(error.response.data, null, 2)); // Commented out to reduce noise
        }

        // Handle 401 Unauthorized (Token expired)
        if (status === 401 && originalRequest && !originalRequest._retry) {
            console.log('[API Debug] 401 detected. Checking if retry is possible...');

            // Check if this is a refresh token request failing
            if (originalRequest.url?.includes('/auth/refresh')) {
                console.log('[API Debug] Refresh token request failed. Logging out.');
                // Refresh token is also invalid, logout completely
                isRefreshing = false;
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                router.replace('/(auth)/login');
                return Promise.reject(error);
            }

            if (isRefreshing) {
                console.log('[API Debug] Refresh already in progress. Queuing request.');
                // Wait for the current refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        console.log('[API Debug] Processing queued request with new token.');
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
                console.log('[API Debug] Attempting to retrieve refresh token from storage...');
                const refreshToken = await SecureStore.getItemAsync('refreshToken');

                if (!refreshToken) {
                    console.log('[API Debug] No refresh token found in storage.');
                    throw new Error('No refresh token available');
                }

                console.log('[API Debug] Refresh token found. Calling refresh endpoint...');

                // Call refresh token API
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken
                });

                console.log('[API Debug] Refresh endpoint response status:', response.status);

                const { accessToken: newAccessToken } = response.data;

                // Save new access token
                await SecureStore.setItemAsync('accessToken', newAccessToken);

                console.log('[API Debug] Access token refreshed and saved successfully.');

                // Update header with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                processQueue(null, newAccessToken);
                isRefreshing = false;

                // Retry the original request
                console.log('[API Debug] Retrying original request.');
                return api(originalRequest);
            } catch (refreshError: any) {
                console.log('[API Debug] Token refresh failed:', refreshError.message);
                if (refreshError.response) {
                    // console.log('[API Debug] Refresh failure data:', JSON.stringify(refreshError.response.data, null, 2));
                }

                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh failed, logout user
                console.log('[API Debug] Logging out due to refresh failure.');
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                router.replace('/(auth)/login');

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
