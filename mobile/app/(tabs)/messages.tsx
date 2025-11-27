import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Typography } from '../../src/components/ui/Typography';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { socketService } from '../../src/services/socket';
import { getImageUrl } from '../../src/utils/image';

export default function MessagesScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: conversations = [], isLoading, refetch } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await api.get('/chat/conversations');
            return response.data;
        },
    });

    React.useEffect(() => {
        const handleNewMessage = (message: any) => {
            // Update cache optimistically
            queryClient.setQueryData(['conversations'], (oldData: any[]) => {
                if (!oldData) return oldData;

                const conversationIndex = oldData.findIndex(c => c.id === message.conversationId);

                if (conversationIndex > -1) {
                    // Move to top and update last message
                    const updatedConversation = {
                        ...oldData[conversationIndex],
                        lastMessage: message,
                        lastMessageAt: message.sentAt,
                        unreadCount: oldData[conversationIndex].unreadCount + (message.senderId !== user?.id ? 1 : 0)
                    };

                    const newData = [...oldData];
                    newData.splice(conversationIndex, 1);
                    return [updatedConversation, ...newData];
                } else {
                    // New conversation? Refetch to be safe or just ignore
                    refetch();
                    return oldData;
                }
            });
        };

        socketService.on('new_message', handleNewMessage);

        return () => {
            socketService.off('new_message');
        };
    }, [queryClient, user, refetch]);

    const renderItem = ({ item }: { item: any }) => {
        // Identify the other participant
        const otherParticipant = item.participants.find((p: any) => p.id !== user?.id) || item.participants[0];

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => router.push(`/chat/${item.id}`)}
            >
                <Image
                    source={{ uri: getImageUrl(otherParticipant?.avatar, otherParticipant?.name) }}
                    style={styles.avatar}
                />
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Typography variant="h4" style={styles.name}>
                            {otherParticipant?.name || 'Người dùng'}
                        </Typography>
                        {item.lastMessageAt && (
                            <Typography variant="caption" style={styles.time}>
                                {formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: true, locale: vi })}
                            </Typography>
                        )}
                    </View>
                    <View style={styles.messageRow}>
                        <Typography
                            variant="body"
                            style={[
                                styles.lastMessage,
                                item.unreadCount > 0 && styles.unreadMessage
                            ]}
                            numberOfLines={1}
                        >
                            {item.lastMessage?.content || 'Chưa có tin nhắn'}
                        </Typography>
                        {item.unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Typography style={styles.unreadText}>{item.unreadCount}</Typography>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Typography variant="h2">Tin nhắn</Typography>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Typography style={styles.emptyText}>Chưa có cuộc trò chuyện nào.</Typography>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
    },
    listContent: {
        padding: 16,
    },
    conversationItem: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.md,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.border,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontWeight: 'bold',
    },
    time: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        color: theme.colors.textSecondary,
        flex: 1,
        marginRight: 8,
    },
    unreadMessage: {
        color: theme.colors.text,
        fontWeight: 'bold',
    },
    unreadBadge: {
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
