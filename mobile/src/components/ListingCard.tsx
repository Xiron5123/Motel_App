import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Typography } from './ui/Typography';
import { theme } from '../theme';
import { getImageUrl } from '../utils/image';

interface ListingCardProps {
    listing: {
        id: string;
        title: string;
        price: number;
        area: number;
        address?: string;
        city?: string;
        district?: string;
        photos?: { url: string }[];
    };
}

export function ListingCard({ listing }: ListingCardProps) {
    const router = useRouter();

    const handlePress = () => {
        router.push(`/listing/${listing.id}` as any);
    };

    const formatPrice = (price: number) => {
        return `${(price / 1000000).toFixed(1)} triệu/tháng`;
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
            <View style={styles.container}>
                <Image
                    source={{ uri: getImageUrl(listing.photos?.[0]?.url) }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.content}>
                    <Typography variant="h4" numberOfLines={2} style={styles.title}>
                        {listing.title}
                    </Typography>
                    <Typography variant="body" style={styles.price}>
                        {formatPrice(listing.price)}
                    </Typography>
                    <View style={styles.details}>
                        <Feather name="maximize" size={14} color={theme.colors.textSecondary} />
                        <Typography variant="caption" style={styles.detailText}>
                            {listing.area}m²
                        </Typography>
                        {listing.address && (
                            <>
                                <Feather name="map-pin" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 12 }} />
                                <Typography variant="caption" style={styles.detailText} numberOfLines={1}>
                                    {[listing.district, listing.city].filter(Boolean).join(', ')}
                                </Typography>
                            </>
                        )}
                    </View>
                    <View style={styles.footer}>
                        <Feather name="external-link" size={14} color={theme.colors.primary} />
                        <Typography variant="caption" style={styles.viewDetail}>
                            Xem chi tiết
                        </Typography>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        maxWidth: 280,
        marginVertical: 4,
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#f0f0f0',
    },
    content: {
        padding: 12,
    },
    title: {
        marginBottom: 6,
        lineHeight: 20,
    },
    price: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    detailText: {
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    viewDetail: {
        color: theme.colors.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
});
