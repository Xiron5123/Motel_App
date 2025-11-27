import * as SecureStore from 'expo-secure-store';

export const storage = {
    async getToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync('accessToken');
        } catch (error) {
            console.error('Error getting token', error);
            return null;
        }
    },

    async setToken(token: string): Promise<void> {
        try {
            await SecureStore.setItemAsync('accessToken', token);
        } catch (error) {
            console.error('Error setting token', error);
        }
    },

    async removeToken(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken'); // Also remove refresh token
        } catch (error) {
            console.error('Error removing token', error);
        }
    },

    async getRefreshToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync('refreshToken');
        } catch (error) {
            console.error('Error getting refresh token', error);
            return null;
        }
    },

    async setRefreshToken(token: string): Promise<void> {
        try {
            await SecureStore.setItemAsync('refreshToken', token);
        } catch (error) {
            console.error('Error setting refresh token', error);
        }
    },
};
