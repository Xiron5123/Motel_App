import { Tabs } from 'expo-router';
import { theme } from '../../src/theme';
import { Feather } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
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
});
