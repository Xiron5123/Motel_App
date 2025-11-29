import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Typography } from '../../src/components/ui/Typography';
import { BackButton } from '../../src/components/ui/BackButton';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { getImageUrl } from '../../src/utils/image';
import { useAuthStore } from '../../src/store/authStore';

interface ConversationWithListing {
    id: string;
    lastMessageAt: string;
    participants: Array<{
        id: string;
        name: string;
        avatar?: string;
    }>;
    lastMessage?: {
        content: string;
        listing?: {
            id: string;
            title: string;
            price: number;
            photos?: { url: string }[];
        };
    };
}

export default function LandlordBookingsScreen() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    const { data: conversations, isLoading, refetch } = useQuery({
        queryKey: ['landlord-bookings'],
        queryFn: async () => {
            const response = await api.get('/chat/landlord/bookings');
            return response.data;
        },
        enabled: isAuthenticated && user?.role === 'LANDLORD',
    });

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && user?.role === 'LANDLORD') {
                refetch();
            }
        }, [isAuthenticated, user?.role])
    );

    const renderItem = ({ item }: { item: ConversationWithListing }) => {
        const renter = item.participants.find(p => p.id !== user?.id);
        const listing = item.lastMessage?.listing;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/chat/${item.id}` as any)}
                activeOpacity={0.8}
            >
                {/* Listing Image */}
                {listing?.photos?.[0] && (
                    <Image
                        source={{ uri: getImageUrl(listing.photos[0].url) }}
                        style={styles.listingImage}
                        contentFit="cover"
                    />
                )}

                <View style={styles.content}>
                    {/* Listing Title */}
                    {listing && (
                        <Typography variant="h4" numberOfLines={2} style={styles.listingTitle}>
                            {listing.title}
                        </Typography>
                    )}

                    {/* Price */}
                    {listing && (
                        <Typography variant="body" style={styles.price}>
                            {(listing.price / 1000000).toFixed(1)} triệu/tháng
                        </Typography>
                    )}

                    {/* Last Message Preview */}
                    {item.lastMessage?.content && (
                        <Typography variant="caption" numberOfLines={2} style={styles.lastMessage}>
                            {item.lastMessage.content}
                        </Typography>
                    )}

                    {/* Footer: Renter + Time */}
                    <View style={styles.footer}>
                        <View style={styles.renter}>
                            {renter?.avatar && (
                                <Image
                                    source={{ uri: getImageUrl(renter.avatar, renter.name) }}
                                    style={styles.avatar}
                                />
                            )}
                            <Typography variant="caption" style={styles.renterName}>
                                {renter?.name}
                            </Typography>
                        </View>
                        <Typography variant="caption" style={styles.time}>
                            {formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: true, locale: vi })}
                        </Typography>
                    </View>

                    {/* Go to chat indicator */}
                    <View style={styles.chatIndicator}>
                        <Feather name="message-circle" size={14} color={theme.colors.primary} />
                        <Typography variant="caption" style={styles.chatText}>
                            Trả lời
                        </Typography>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (!isAuthenticated || user?.role !== 'LANDLORD') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <BackButton />
                    <Typography variant="h3">Yêu cầu thuê phòng</Typography>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyState}>
                    <Typography variant="body">Chỉ dành cho chủ trọ</Typography>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h3">Yêu cầu thuê phòng</Typography>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Feather name="inbox" size={48} color="#D1D5DB" />
                            </View>
                            <Typography variant="h4" style={styles.emptyTitle}>
                                Chưa có yêu cầu nào
                            </Typography>
                            <Typography variant="body" style={styles.emptyText}>
                                Khi có người quan tâm phòng trọ, tin nhắn sẽ hiển thị ở đây
                            </Typography>
                        </View>
                    ) : null
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    listingImage: {
        width: 120,
        height: '100%',
        minHeight: 160,
    },
    content: {
        flex: 1,
        padding: 14,
    },
    listingTitle: {
        fontWeight: '700',
        marginBottom: 6,
        lineHeight: 20,
    },
    price: {
        color: theme.colors.primary,
        fontWeight: '700',
        marginBottom: 8,
    },
    lastMessage: {
        color: theme.colors.textSecondary,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    renter: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 6,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    renterName: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    time: {
        color: '#9CA3AF',
    },
    chatIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    chatText: {
        color: theme.colors.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        color: '#374151',
        marginBottom: 8,
    },
    emptyText: {
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
});
