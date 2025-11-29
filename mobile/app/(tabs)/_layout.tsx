import { Tabs } from 'expo-router';
import { theme } from '../../src/theme';
import { Feather } from '@expo/vector-icons';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { socketService } from '../../src/services/socket';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Get total unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const response = await api.get('/chat/conversations');
      const total = response.data.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0);
      return total;
    },
    enabled: isAuthenticated,
  });

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleNewMessage = () => {
      // Refetch unread count when new message arrives
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    };

    const handleMessagesRead = () => {
      // Refetch when messages are marked as read
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('messages_read', handleMessagesRead);

    return () => {
      socketService.off('new_message');
      socketService.off('messages_read');
    };
  }, [isAuthenticated, queryClient]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Feather name="home" size={24} color={focused ? theme.colors.text : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="find-roommate"
        options={{
          title: "Bạn trọ",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Feather name="users" size={24} color={focused ? theme.colors.text : color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="post-listing"
        options={{
          title: "Đăng tin",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Feather name="plus-square" size={24} color={focused ? theme.colors.text : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Feather name="message-square" size={24} color={focused ? theme.colors.text : color} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Feather name="user" size={24} color={focused ? theme.colors.text : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 2,
    borderTopColor: theme.colors.border,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    elevation: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    position: 'relative',
  },
  activeIcon: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: theme.colors.border,
    // Hard shadow effect for active tab
    shadowColor: theme.colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    transform: [{ translateY: -2 }],
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
