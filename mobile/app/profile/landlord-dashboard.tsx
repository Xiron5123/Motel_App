import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Typography } from '../../src/components/ui/Typography';
import { BackButton } from '../../src/components/ui/BackButton';
import { Button } from '../../src/components/ui/Button';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { formatCurrency } from '../../src/utils/format';
import { getImageUrl } from '../../src/utils/image';

interface Listing {
    id: string;
    title: string;
    price: number;
    address: string;
    photos: { url: string }[];
    status: 'AVAILABLE' | 'RENTED' | 'UNAVAILABLE';
    createdAt: string;
}

export default function LandlordDashboardScreen() {
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchListings = async () => {
        try {
            const response = await api.get('/listings/my');
            console.log('My listings:', response.data);
            setListings(response.data.data);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách phòng');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchListings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Xóa tin đăng',
            'Bạn có chắc chắn muốn xóa tin đăng này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/listings/${id}`);
                            setListings(prev => prev.filter(item => item.id !== id));
                            Alert.alert('Thành công', 'Đã xóa tin đăng');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa tin đăng');
                        }
                    }
                }
            ]
        );
    };

    const handleToggleHidden = async (id: string, currentStatus: string) => {
        // Optimistic update
        const newStatus = currentStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
        setListings(prev => prev.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));

        try {
            await api.patch(`/listings/${id}/toggle-hidden`);
        } catch (error) {
            // Revert if failed
            setListings(prev => prev.map(item =>
                item.id === id ? { ...item, status: currentStatus as any } : item
            ));
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    const renderItem = ({ item }: { item: Listing }) => (
        <View style={styles.card}>
            <Image source={{ uri: getImageUrl(item.photos?.[0]?.url) }} style={styles.image} contentFit="cover" transition={200} />
            <View style={styles.cardContent}>
                <View>
                    <View style={styles.statusBadgeContainer}>
                        <View style={[styles.statusBadge,
                        item.status === 'AVAILABLE' ? styles.statusAvailable :
                            item.status === 'RENTED' ? styles.statusRented : styles.statusHidden
                        ]}>
                            <Typography variant="caption" style={[styles.statusText,
                            item.status === 'AVAILABLE' ? styles.textAvailable :
                                item.status === 'RENTED' ? styles.textRented : styles.textHidden
                            ]}>
                                {item.status === 'AVAILABLE' ? 'Đang hiển thị' :
                                    item.status === 'RENTED' ? 'Đã cho thuê' : 'Đang ẩn'}
                            </Typography>
                        </View>
                    </View>
                    <Typography variant="h4" numberOfLines={2} style={styles.title}>{item.title}</Typography>
                    <Typography variant="body" style={styles.price}>{formatCurrency(item.price)}/tháng</Typography>
                    <View style={styles.locationRow}>
                        <Feather name="map-pin" size={12} color="#6B7280" />
                        <Typography variant="caption" numberOfLines={1} style={styles.address}>{item.address}</Typography>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => router.push(`/listing/edit/${item.id}`)}
                    >
                        <Feather name="edit-2" size={14} color="#2563EB" />
                        <Typography variant="caption" style={styles.editText}>Sửa</Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.hideButton]}
                        onPress={() => handleToggleHidden(item.id, item.status)}
                    >
                        <Feather name={item.status === 'UNAVAILABLE' ? "eye" : "eye-off"} size={14} color="#D97706" />
                        <Typography variant="caption" style={styles.hideText}>
                            {item.status === 'UNAVAILABLE' ? 'Hiện' : 'Ẩn'}
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(item.id)}
                    >
                        <Feather name="trash-2" size={14} color="#EF4444" />
                        <Typography variant="caption" style={styles.deleteText}>Xóa</Typography>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h3" style={styles.headerTitle}>Quản lý tin đăng</Typography>
                <View style={{ width: 40 }} />

            </View>

            <FlatList
                data={listings}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Feather name="grid" size={48} color="#D1D5DB" />
                            </View>
                            <Typography variant="h4" style={styles.emptyTitle}>Chưa có tin đăng nào</Typography>
                            <Typography variant="body" style={styles.emptyText}>
                                Đăng tin ngay để tìm khách thuê nhanh chóng!
                            </Typography>
                        </View>
                    ) : null
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/(tabs)/post-listing')}
            >
                <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
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
    headerAddButton: {
        padding: 4,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    listContent: {
        padding: 20,
        paddingBottom: 80, // Add padding for FAB
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: theme.colors.border, // Black border
        // height removed
        minHeight: 150,
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
    statusBadgeContainer: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusAvailable: { backgroundColor: '#ECFDF5' },
    statusRented: { backgroundColor: '#F3F4F6' },
    statusHidden: { backgroundColor: '#FFFBEB' },
    statusText: { fontSize: 10, fontWeight: '700' },
    textAvailable: { color: '#059669' },
    textRented: { color: '#6B7280' },
    textHidden: { color: '#D97706' },
    title: {
        fontWeight: '700',
        fontSize: 15,
        color: '#111827',
        marginBottom: 4,
        lineHeight: 22,
    },
    price: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 4,
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
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F9FAFB',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        gap: 4,
        flex: 1,
        justifyContent: 'center',
    },
    editButton: { backgroundColor: '#EFF6FF' },
    editText: { color: '#2563EB', fontWeight: '600', fontSize: 12 },
    hideButton: { backgroundColor: '#FFFBEB' },
    hideText: { color: '#D97706', fontWeight: '600', fontSize: 12 },
    deleteButton: { backgroundColor: '#FEF2F2' },
    deleteText: { color: '#EF4444', fontWeight: '600', fontSize: 12 },
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
        marginBottom: 24,
    },
    emptyButton: {
        minWidth: 200,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
