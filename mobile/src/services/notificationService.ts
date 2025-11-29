import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import api from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class NotificationService {
    private pushToken: string | null = null;

    async registerForPushNotificationsAsync(): Promise<string | null> {
        if (!Device.isDevice) {
            console.warn('Push notifications only work on physical devices');
            return null;
        }

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Permission for push notifications denied');
                return null;
            }

            const token = (await Notifications.getExpoPushTokenAsync({
                projectId: 'f189e170-3a40-4436-8d21-b097d5b5d21a',
            })).data;

            this.pushToken = token;

            // Register token with backend
            await this.registerTokenWithBackend(token);

            return token;
        } catch (error) {
            console.error('Failed to get push token:', error);
            return null;
        }
    }

    async registerTokenWithBackend(token: string) {
        try {
            await api.post('/notifications/token', { token });
            console.log('Push token registered with backend');
        } catch (error) {
            console.error('Failed to register push token with backend:', error);
        }
    }

    async unregisterToken() {
        if (this.pushToken) {
            try {
                await api.delete('/notifications/token', {
                    data: { token: this.pushToken },
                });
                this.pushToken = null;
            } catch (error) {
                console.error('Failed to unregister push token:', error);
            }
        }
    }

    setupNotificationListeners(
        onNotificationReceived?: (notification: Notifications.Notification) => void,
        onNotificationTapped?: (response: Notifications.NotificationResponse) => void
    ) {
        // Handle notifications received while app is foregrounded
        const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
            console.log('Notification received:', notification);
            onNotificationReceived?.(notification);
        });

        // Handle user tapping on notification
        const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Notification tapped:', response);
            onNotificationTapped?.(response);
        });

        return () => {
            receivedListener.remove();
            responseListener.remove();
        };
    }

    getPushToken(): string | null {
        return this.pushToken;
    }
}

export const notificationService = new NotificationService();
