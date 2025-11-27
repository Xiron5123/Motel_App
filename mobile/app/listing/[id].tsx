import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    interpolate,
    Extrapolation,
    runOnJS,
    SharedValue
} from 'react-native-reanimated';

import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Card } from '../../src/components/ui/Card';
import { theme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { toast } from '../../src/store/toastStore';
import api from '../../src/services/api';
import { getImageUrl } from '../../src/utils/image';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [showPhone, setShowPhone] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const insets = useSafeAreaInsets();

    const { data: listing, isLoading } = useQuery({
        queryKey: ['listing', id],
        queryFn: async () => {
            const response = await api.get(`/listings/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    const checkFavoriteStatus = async () => {
        try {
            const response = await api.get(`/favorites/check/${id}`);
            setIsFavorite(response.data.isFavorited);
        } catch (error) {
            console.log('Check favorite error:', error);
        }
    };

    useEffect(() => {
        if (id) {
            checkFavoriteStatus();
        }
    }, [id]);

    // Animation Values
    const heartScale = useSharedValue(1);

    const animatedHeartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
    }));

    const toggleFavorite = async () => {
        // Optimistic update
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);

        // Simple Pop Animation
        heartScale.value = withSequence(
            withTiming(1.2, { duration: 100 }),
            withTiming(1, { duration: 100 })
        );

        if (newStatus) {
            runOnJS(toast.success)('Đã lưu');
        }

        try {
            if (!newStatus) {
                await api.delete(`/favorites/${id}`);
                // No toast for remove
            } else {
                await api.post('/favorites', { listingId: id });
            }
        } catch (error: any) {
            console.error('Toggle favorite error:', error);
            // Revert on error
            setIsFavorite(!newStatus);
            if (error.response?.status === 401) {
                toast.info('Vui lòng đăng nhập để lưu tin');
                router.push('/(auth)/login');
            } else {
                toast.error('Không thể cập nhật trạng thái yêu thích');
            }
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!listing) {
        return (
            <View style={styles.loading}>
                <Typography variant="body">Không tìm thấy tin đăng</Typography>
            </View>
        );
    }

    const formatPhone = (phone: string) => {
        if (!phone) return '093*******';
        if (showPhone) return phone;
        return `${phone.substring(0, 3)}*******`;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Image Carousel */}
                <View style={styles.carousel}>
                    <FlatList
                        data={listing.photos?.length ? listing.photos : [{ url: null }]}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveIndex(newIndex);
                        }}
                        renderItem={({ item, index }: { item: { url: string }, index: number }) => (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => {
                                    setSelectedImageIndex(index);
                                    setImageModalVisible(true);
                                }}
                            >
                                <Image
                                    source={{ uri: getImageUrl(item.url) }}
                                    style={{ width, height: 300 }}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                    />
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {listing.photos?.map((_: any, index: number) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === activeIndex && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Typography variant="h2" style={styles.title}>{listing.title}</Typography>
                        <View style={styles.priceTag}>
                            <Typography variant="h3" style={{ color: theme.colors.card }}>
                                {(listing.price / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu/tháng
                            </Typography>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <TouchableOpacity
                            style={[styles.infoItem, { flex: 2 }]}
                            onPress={() => {
                                if (listing.lat && listing.lng) {
                                    router.push({
                                        pathname: '/map' as any,
                                        params: {
                                            id: listing.id,
                                            lat: listing.lat,
                                            lng: listing.lng,
                                            title: listing.title,
                                            price: listing.price,
                                            address: [listing.address, listing.ward, listing.district, listing.city].filter(Boolean).join(', '),
                                            thumb: listing.photos?.[0]?.url || ''
                                        }
                                    });
                                } else {
                                    toast.info('Tin đăng này chưa có dữ liệu bản đồ');
                                }
                            }}
                        >
                            <Feather name="map-pin" size={20} color={theme.colors.primary} />
                            <Typography variant="body" style={styles.infoText} numberOfLines={2}>
                                {[listing.address, listing.ward, listing.district, listing.city].filter(Boolean).join(', ')}
                            </Typography>
                        </TouchableOpacity>
                        <View style={[styles.infoItem, { flex: 1, justifyContent: 'flex-end' }]}>
                            <Feather name="maximize" size={20} color={theme.colors.primary} />
                            <Typography variant="body" style={styles.infoText}>{listing.area} m²</Typography>
                        </View>
                    </View>

                    <View style={[styles.infoRow, { marginTop: -12 }]}>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="sofa" size={20} color={theme.colors.primary} />
                            <Typography variant="body" style={styles.infoText}>
                                {listing.amenities?.includes('furniture_full') ? 'Nội thất đầy đủ' :
                                    listing.amenities?.includes('furniture_basic') ? 'Nội thất cơ bản' :
                                        listing.amenities?.includes('furniture_empty') ? 'Nhà trống' : 'Nội thất: ---'}
                            </Typography>
                        </View>
                    </View>

                    <Card style={styles.section} variant="flat">
                        <Typography variant="h3" style={styles.sectionTitle}>Mô tả</Typography>
                        <Typography variant="body" style={styles.description}>
                            {listing.description}
                        </Typography>
                    </Card>

                    <Card style={styles.section}>
                        <Typography variant="h3" style={styles.sectionTitle}>Tiện ích</Typography>
                        <View style={styles.amenitiesGrid}>
                            {listing.amenities?.filter((a: string) => !a.startsWith('furniture_')).map((amenity: string, index: number) => {
                                let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'check-circle-outline';
                                let label = amenity;

                                // Map amenities to icons and labels
                                if (amenity.includes('wifi') || amenity.includes('internet')) { iconName = 'wifi'; label = 'Wi-Fi'; }
                                else if (amenity === 'air_conditioner' || amenity.includes('ac') || amenity.includes('máy lạnh') || amenity.includes('điều hòa')) { iconName = 'air-conditioner'; label = 'Máy lạnh'; }
                                else if (amenity.includes('parking') || amenity.includes('xe')) { iconName = 'motorbike'; label = 'Chỗ để xe'; }
                                else if (amenity.includes('kitchen') || amenity.includes('bếp')) { iconName = 'chef-hat'; label = 'Nhà bếp'; }
                                else if (amenity === 'wc_private' || amenity.includes('riêng')) { iconName = 'toilet'; label = 'Vệ sinh riêng'; }
                                else if (amenity === 'wc_shared' || amenity.includes('chung')) { iconName = 'toilet'; label = 'Vệ sinh chung'; }
                                else if (amenity.includes('wc') || amenity.includes('vệ sinh')) { iconName = 'toilet'; label = 'Vệ sinh'; }
                                else if (amenity.includes('fridge') || amenity.includes('tủ lạnh')) { iconName = 'fridge'; label = 'Tủ lạnh'; }
                                else if (amenity.includes('water') || amenity.includes('nóng lạnh')) { iconName = 'water-boiler'; label = 'Bình nóng lạnh'; }
                                else if (amenity.includes('balcony') || amenity.includes('ban công')) { iconName = 'balcony'; label = 'Ban công'; }
                                else if (amenity.includes('security') || amenity.includes('an ninh')) { iconName = 'shield-check'; label = 'An ninh'; }
                                else if (amenity.includes('time') || amenity.includes('giờ')) { iconName = 'clock-time-four-outline'; label = 'Giờ giấc tự do'; }
                                else if (amenity.includes('washing') || amenity.includes('giặt')) { iconName = 'washing-machine'; label = 'Máy giặt'; }
                                else if (amenity.includes('bed') || amenity.includes('giường')) { iconName = 'bed'; label = 'Giường'; }
                                else if (amenity.includes('wardrobe') || amenity.includes('tủ')) { iconName = 'wardrobe'; label = 'Tủ quần áo'; }
                                else if (amenity.includes('pet') || amenity.includes('thú')) { iconName = 'paw'; label = 'Thú cưng'; }
                                else if (amenity.includes('window') || amenity.includes('cửa sổ')) { iconName = 'window-open-variant'; label = 'Cửa sổ'; }

                                return (
                                    <View key={index} style={styles.amenityItem}>
                                        <MaterialCommunityIcons name={iconName} size={20} color="black" style={{ marginRight: 8 }} />
                                        <Typography variant="body">{label}</Typography>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>

                    <Card style={styles.section}>
                        <Typography variant="h3" style={styles.sectionTitle}>Chủ trọ</Typography>
                        <View style={styles.landlordContainer}>
                            {/* Row 1: Avatar + Name/Email */}
                            <View style={styles.landlordRow1}>
                                <View style={styles.avatarPlaceholder}>
                                    <Typography variant="h3" style={{ color: theme.colors.card }}>
                                        {listing.landlord?.name?.[0]?.toUpperCase() || 'C'}
                                    </Typography>
                                </View>
                                <View style={styles.landlordInfo}>
                                    <Typography variant="h3" style={styles.landlordName}>{listing.landlord?.name}</Typography>
                                    <Typography variant="caption" style={styles.landlordEmail}>{listing.landlord?.email}</Typography>
                                </View>
                            </View>

                            {/* Row 2: Phone */}
                            <TouchableOpacity style={styles.landlordRow2} onPress={() => setShowPhone(!showPhone)}>
                                <Feather name={showPhone ? "eye" : "eye-off"} size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
                                <Typography variant="body" style={styles.landlordPhone}>
                                    {formatPhone(listing.landlord?.phone || '0938123456')}
                                </Typography>
                            </TouchableOpacity>

                            {/* Row 3: Message Button */}
                            {String(user?.id) !== String(listing.landlord?.id) && (
                                <Button
                                    title="Nhắn tin"
                                    variant="primary"
                                    onPress={async () => {
                                        if (!user) {
                                            toast.info('Vui lòng đăng nhập để nhắn tin');
                                            router.push('/(auth)/login');
                                            return;
                                        }
                                        try {
                                            const landlordId = listing.landlord?.id;
                                            if (!landlordId) {
                                                toast.error('Không tìm thấy thông tin chủ trọ');
                                                return;
                                            }
                                            const response = await api.post('/chat/conversations', { participantId: landlordId });
                                            router.push(`/chat/${response.data.id}`);
                                        } catch (error: any) {
                                            console.error('Start chat error details:', error.response?.data || error.message);
                                            toast.error(error.response?.data?.message || 'Không thể bắt đầu cuộc trò chuyện');
                                        }
                                    }}
                                    style={styles.messageButton}
                                />
                            )}
                            {String(user?.id) === String(listing.landlord?.id) && (
                                <Typography variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
                                    Đây là tin đăng của bạn
                                </Typography>
                            )}
                        </View>
                    </Card>
                </View>
            </ScrollView>

            {/* Header Overlay (Back & Favorite) - Fixed position */}
            <View style={[styles.headerOverlay, { top: insets.top + 10 }]}>
                <BackButton />

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={toggleFavorite} style={styles.iconButton}>
                        <Animated.View style={animatedHeartStyle}>
                            <MaterialCommunityIcons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={28}
                                color={isFavorite ? "#ef4444" : "black"}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Booking Footer */}
            <View style={styles.footer}>
                <Button
                    title="Đặt phòng ngay"
                    onPress={() => { }}
                    style={styles.bookButton}
                />
            </View>

            {/* Full Screen Image Modal */}
            <Modal
                visible={imageModalVisible}
                transparent={true}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setImageModalVisible(false)}
                    >
                        <Feather name="x" size={24} color="white" />
                    </TouchableOpacity>

                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentOffset={{ x: selectedImageIndex * width, y: 0 }}
                    >
                        {listing.photos?.map((photo: any, index: number) => (
                            <View key={index} style={{ width, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <ScrollView
                                    maximumZoomScale={3}
                                    minimumZoomScale={1}
                                    contentContainerStyle={{ width, height: '100%' }}
                                >
                                    <Image
                                        source={{ uri: getImageUrl(photo.url) }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="contain"
                                    />
                                </ScrollView>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    carousel: {
        height: 300,
        backgroundColor: '#ddd',
    },
    headerOverlay: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Ensure vertical alignment
        zIndex: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    flyingHeart: {
        position: 'absolute',
        zIndex: 0,
    },
    content: {
        padding: 20,
        marginTop: -20,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    title: {
        marginBottom: 8,
    },
    priceTag: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.md,
        alignSelf: 'flex-start',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoText: {
        marginLeft: 8,
    },
    section: {
        marginBottom: 24,
        padding: 16,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    description: {
        color: theme.colors.textSecondary,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%', // 2 columns
        marginBottom: 12,
    },
    landlordContainer: {
        flexDirection: 'column',
    },
    landlordRow1: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    landlordInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    landlordName: {
        marginBottom: 2,
    },
    landlordEmail: {
        color: theme.colors.textSecondary,
    },
    landlordRow2: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    landlordPhone: {
        color: theme.colors.text,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    messageButton: {
        width: '100%',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.card,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align right
        alignItems: 'center',
    },
    bookButton: {
        minWidth: 150,
    },
    pagination: {
        position: 'absolute',
        bottom: 16,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: 'white',
        width: 10,
        height: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
});
