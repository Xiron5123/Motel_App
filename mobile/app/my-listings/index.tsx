import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

import { Typography } from '../../src/components/ui/Typography';
import { BackButton } from '../../src/components/ui/BackButton';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';

export default function MyListingsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: listings, isLoading, error } = useQuery({
        queryKey: ['my-listings'],
        queryFn: async () => {
            const response = await api.get('/listings/my');
            return response.data;
        },
        enabled: !!user && user.role === 'LANDLORD',
        retry: false,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/listings/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-listings'] });
            Alert.alert('Thành công', 'Đã xóa tin đăng');
        },
        onError: () => {
            Alert.alert('Lỗi', 'Không thể xóa tin đăng');
        }
    });

    const handleDelete = (id: string) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn xóa tin đăng này?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <Card style={styles.card}>
            <View style={styles.cardContent}>
                <Image
                    source={{ uri: item.photos?.[0]?.url || 'https://via.placeholder.com/100' }}
                    style={styles.image}
                />
                <View style={styles.info}>
                    <Typography variant="h3" numberOfLines={2}>{item.title}</Typography>
                    <Typography variant="body" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        {(item.price / 1000000).toLocaleString('vi-VN')} triệu/tháng
                    </Typography>
                    <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                </View>
            </View>

            <View style={styles.actions}>
                <Button
                    title="Sửa"
                    variant="outline"
                    size="small"
                    onPress={() => router.push(`/post-listing?id=${item.id}`)} // Assuming post-listing handles edit
                    style={{ flex: 1, marginRight: 8 }}
                    icon={<Feather name="edit-2" size={14} color="black" />}
                />
                <Button
                    title="Xóa"
                    variant="outline"
                    size="small"
                    onPress={() => handleDelete(item.id)}
                    style={{ flex: 1, borderColor: theme.colors.error }}
                    textStyle={{ color: theme.colors.error }}
                    icon={<Feather name="trash-2" size={14} color={theme.colors.error} />}
                />
            </View>
        </Card>
    );

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Show message if user is not a landlord
    if (user && user.role !== 'LANDLORD') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <BackButton />
                    <Typography variant="h2">Tin đăng của tôi</Typography>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.empty}>
                    <Typography variant="body" style={{ textAlign: 'center', marginBottom: 16 }}>
                        Chỉ chủ trọ mới có thể đăng tin.
                    </Typography>
                    <Typography variant="caption" style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                        Nếu bạn muốn đăng tin cho thuê phòng, vui lòng đăng ký tài khoản chủ trọ.
                    </Typography>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h2">Tin đăng của tôi</Typography>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={listings}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Typography variant="body">Bạn chưa có tin đăng nào.</Typography>
                    </View>
                }
            />

            {/* FAB Button */}
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
        backgroundColor: '#FAF7F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },

    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        marginBottom: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'black',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    info: {
        flex: 1,
        justifyContent: 'space-between',
    },
    actions: {
        flexDirection: 'row',
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'black',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
});
