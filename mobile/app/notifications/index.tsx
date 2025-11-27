import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Typography } from '../../src/components/ui/Typography';
import { BackButton } from '../../src/components/ui/BackButton';
import { AnimatedScreen } from '../../src/components/ui/AnimatedScreen';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { theme } from '../../src/theme';
import { useNotificationStore, Notification } from '../../src/store/notificationStore';

export default function NotificationsScreen() {
    const router = useRouter();
    const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handlePress = async (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        // Handle navigation based on type if needed
        // if (notification.type === 'CHAT') router.push(...)
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.card, !item.isRead && styles.unreadCard]}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, !item.isRead && styles.unreadIconContainer]}>
                <Feather
                    name={item.type === 'CHAT' ? 'message-circle' : 'bell'}
                    size={24}
                    color={item.isRead ? theme.colors.textSecondary : theme.colors.primary}
                />
            </View>
            <View style={styles.content}>
                <Typography variant="h4" style={[styles.title, !item.isRead && styles.unreadText]}>
                    {item.title}
                </Typography>
                <Typography variant="body" style={styles.body} numberOfLines={2}>
                    {item.body}
                </Typography>
                <Typography variant="caption" style={styles.time}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
                </Typography>
            </View>
            {!item.isRead && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h3">Thông báo</Typography>
                <TouchableOpacity onPress={() => markAllAsRead()}>
                    <Typography variant="caption" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        Đọc tất cả
                    </Typography>
                </TouchableOpacity>
            </View>

            <AnimatedScreen>
                {isLoading && notifications.length === 0 ? (
                    <View style={{ padding: 16, gap: 16 }}>
                        {[1, 2, 3, 4].map(i => (
                            <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                                <Skeleton width={48} height={48} borderRadius={24} />
                                <View style={{ flex: 1, gap: 8 }}>
                                    <Skeleton width="60%" height={20} />
                                    <Skeleton width="100%" height={16} />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={fetchNotifications} />
                        }
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Feather name="bell-off" size={48} color={theme.colors.textSecondary} />
                                <Typography variant="body" style={{ marginTop: 16, color: theme.colors.textSecondary }}>
                                    Không có thông báo nào
                                </Typography>
                            </View>
                        }
                    />
                )}
            </AnimatedScreen>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: 'white',
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    unreadCard: {
        backgroundColor: '#F0F9FF', // Light blue
        borderColor: theme.colors.primary,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    unreadIconContainer: {
        backgroundColor: '#DBEAFE',
    },
    content: {
        flex: 1,
    },
    title: {
        marginBottom: 4,
    },
    unreadText: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    body: {
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    time: {
        color: '#9CA3AF',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        marginLeft: 8,
    },
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
});
