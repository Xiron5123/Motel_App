import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Typography } from '../../src/components/ui/Typography';
import { BackButton } from '../../src/components/ui/BackButton';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { formatCurrency } from '../../src/utils/format';
import { getImageUrl } from '../../src/utils/image';
import { useAuthStore } from '../../src/store/authStore';

interface FavoriteListing {
    id: string;
    title: string;
    price: number;
    address: string;
    area: number;
    photos: { url: string }[];
    favoritedAt: string;
}

export default function FavoritesScreen() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFavorites = async () => {
        // Check authentication first
        if (!isAuthenticated) {
            Alert.alert(
                'Chưa đăng nhập',
                'Bạn cần đăng nhập để xem danh sách yêu thích',
                [
                    {
                        text: 'Đăng nhập',
                        onPress: () => router.replace('/(auth)/login')
                    },
                    {
                        text: 'Hủy',
                        onPress: () => router.back(),
                        style: 'cancel'
                    }
                ]
            );
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get('/favorites');
            setFavorites(response.data);
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [isAuthenticated])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchFavorites();
    };

    const handleRemoveFavorite = async (listingId: string) => {
        try {
            await api.delete(`/favorites/${listingId}`);
            setFavorites(prev => prev.filter(item => item.id !== listingId));
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích');
        }
    };

    const renderItem = ({ item }: { item: FavoriteListing }) => (
        <TouchableOpacity onPress={() => router.push(`/listing/${item.id}` as any)} activeOpacity={0.9}>
            <View style={styles.card}>
                <Image
                    source={{ uri: getImageUrl(item.photos?.[0]?.url) }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                />
                <View style={styles.cardContent}>
                    <View>
                        <Typography variant="h4" numberOfLines={2} style={styles.title}>{item.title}</Typography>
                        <Typography variant="body" style={styles.price}>{formatCurrency(item.price)}/tháng</Typography>
                        <View style={styles.locationRow}>
                            <Feather name="map-pin" size={12} color="#6B7280" />
                            <Typography variant="caption" numberOfLines={1} style={styles.address}>{item.address}</Typography>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.dateContainer}>
                            <Feather name="clock" size={12} color="#9CA3AF" />
                            <Typography variant="caption" style={styles.date}>
                                {new Date(item.favoritedAt).toLocaleDateString('vi-VN')}
                            </Typography>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleRemoveFavorite(item.id)}
                        >
                            <Feather name="heart" size={16} color="#EF4444" fill="#EF4444" />
                            <Typography variant="caption" style={styles.deleteText}>Bỏ lưu</Typography>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h3" style={styles.headerTitle}>Đã lưu</Typography>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={favorites}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Feather name="heart" size={48} color="#D1D5DB" />
                            </View>
                            <Typography variant="h4" style={styles.emptyTitle}>Chưa có tin đã lưu</Typography>
                            <Typography variant="body" style={styles.emptyText}>
                                Hãy thả tim các phòng trọ bạn thích để xem lại sau nhé!
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

    headerTitle: {
        fontWeight: '700',
        color: '#111827',
        fontSize: 18,
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        // Premium Shadow
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 }, // Harder shadow for "neo-brutalism" feel if desired, or keep soft? User said "viền đen", usually implies hard borders. Let's keep shadow soft but border hard.
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: theme.colors.border, // Black border
        // height removed for flexibility
        minHeight: 140, // Ensure at least some height
    },
    image: {
        width: 120,
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 14,
        justifyContent: 'space-between',
    },
    title: {
        fontWeight: '700',
        fontSize: 15,
        color: '#111827',
        marginBottom: 6,
        lineHeight: 22,
    },
    price: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    address: {
        color: '#6B7280',
        fontSize: 13,
        marginLeft: 4,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F9FAFB',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        color: '#9CA3AF',
        fontSize: 12,
        marginLeft: 4,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2', // Light red bg
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    deleteText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 12,
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
