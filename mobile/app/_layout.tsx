import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../src/theme';
import { ToastProvider } from '../src/components/providers/ToastProvider';
import { notificationService } from '../src/services/notificationService';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function InitialLayout() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    console.log('Layout State:', { isLoading, isAuthenticated, fontsLoaded, segments });
    if (!isLoading && fontsLoaded) {
      console.log('Hiding Splash Screen');
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded, isAuthenticated, segments]);

  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments, isLoading, fontsLoaded]);

  // Initialize push notifications when authenticated
  // NOTE: Push notifications don't work in Expo Go (SDK 53+)
  // Uncomment this when using development build or production app
  /*
  useEffect(() => {
    if (isAuthenticated) {
      notificationService.registerForPushNotificationsAsync();

      const cleanup = notificationService.setupNotificationListeners(
        undefined, // onReceived
        (response) => {
          // Handle notification tap
          const data = response.notification.request.content.data;
          if (data?.conversationId) {
            router.push(`/chat/${data.conversationId}` as any);
          }
        }
      );

      return cleanup;
    }
  }, [isAuthenticated]);
  */

  // Return Stack immediately to ensure stable component tree
  // SplashScreen will keep the screen hidden until we are ready
  if (!fontsLoaded) {
    // We can return null or a View here if we want, but Stack is better for stability?
    // Actually, if fonts aren't loaded, rendering Stack might cause issues if it uses fonts immediately.
    // But usually it's fine if we hide splash screen later.
    // However, to be safe and strictly follow "don't conditional render", we can return Stack.
    // But if we want to be absolutely sure we don't show unstyled content:
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <InitialLayout />
      </ToastProvider>
    </QueryClientProvider>
  );
}
