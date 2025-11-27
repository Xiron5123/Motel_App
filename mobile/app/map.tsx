import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import LeafletMap from '../src/components/map/LeafletMap';
import { useLocationStore } from '../src/store/locationStore';
import { useQuery } from '@tanstack/react-query';
import api from '../src/services/api';
import { Listing } from '../src/types/listing';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { getImageUrl } from '../src/utils/image';
import { formatPriceShort } from '../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { BackButton } from '../src/components/ui/BackButton';

export default function MapScreen() {
    const params = useLocalSearchParams();
    const mode = params.mode as string; // 'pick' or 'view'
    const singleLat = params.lat ? parseFloat(params.lat as string) : null;
    const singleLng = params.lng ? parseFloat(params.lng as string) : null;

    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    // Animation for bottom card
    const cardTranslateY = useSharedValue(200);

    const { data: listings = [] } = useQuery({
        queryKey: ['listings'],
        queryFn: async () => {
            const response = await api.get('/listings');
            return response.data.data || response.data; // Handle potential data wrapping
        },
        enabled: mode !== 'pick' && !singleLat,
    });

    useEffect(() => {
        (async () => {
            if (singleLat && singleLng) {
                setLocation({ lat: singleLat, lng: singleLng });
                // If single listing, set it as selected immediately if we have details
                if (params.id) {
                    setSelectedListing({
                        id: params.id as string,
                        title: params.title as string,
                        price: parseFloat(params.price as string),
                        address: params.address as string,
                        lat: singleLat,
                        lng: singleLng,
                        photos: [{ url: params.thumb as string || '' }]
                    } as Listing);
                    cardTranslateY.value = withSpring(0);
                }
                return;
            }

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Default to HCMC if permission denied
                setLocation({ lat: 10.762622, lng: 106.660172 });
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation({
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            });
        })();
    }, [singleLat, singleLng]);

    const markers = useMemo(() => {
        if (mode === 'pick') return [];
        if (singleLat && singleLng) {
            return [{
                id: params.id as string || 'single-view',
                lat: singleLat,
                lng: singleLng,
                title: params.title as string || '',
                price: params.price ? formatPriceShort(parseFloat(params.price as string)) : '',
            }];
        }
        return listings
            .filter((l: Listing) => l.lat && l.lng)
            .map((l: Listing) => ({
                id: l.id,
                lat: l.lat!,
                lng: l.lng!,
                title: l.title,
                price: formatPriceShort(l.price),
            }));
    }, [mode, listings, singleLat, singleLng, params]);

    const handleMarkerPress = (markerId: string) => {
        if (mode === 'pick') return;

        if (singleLat && singleLng) {
            // Already selected
            return;
        }

        const listing = listings.find((l: Listing) => l.id === markerId);
        if (listing) {
            setSelectedListing(listing);
            cardTranslateY.value = withSpring(0);
        }
    };

    const handleRegionChange = (region: { lat: number; lng: number }) => {
        if (mode === 'pick') {
            setPickedLocation(region);
        }
    };

    const { setPickedLocation: setGlobalPickedLocation } = useLocationStore();

    const handleConfirmLocation = () => {
        if (pickedLocation) {
            setGlobalPickedLocation(pickedLocation);
            router.back();
        }
    };

    const cardStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: cardTranslateY.value }],
        };
    });

    if (!location) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Đang tải bản đồ...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Back Button */}
            {/* Back Button */}
            <BackButton style={styles.backButton} />

            <LeafletMap
                markers={markers}
                initialRegion={{ lat: location!.lat, lng: location!.lng, zoom: 15 }}
                editable={mode === 'pick'}
                onMarkerPress={handleMarkerPress}
                onRegionChange={handleRegionChange}
            />

            {mode === 'pick' && (
                <View style={styles.confirmButtonContainer}>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
                        <Text style={styles.confirmButtonText}>Xác nhận vị trí này</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Bottom Card */}
            {selectedListing && mode !== 'pick' && (
                <Animated.View style={[styles.cardContainer, cardStyle]}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => {
                            if (!singleLat) {
                                router.push(`/listing/${selectedListing.id}`);
                            }
                        }}
                        activeOpacity={0.9}
                    >
                        <Image
                            source={{ uri: getImageUrl(selectedListing.photos?.[0]?.url) }}
                            style={styles.cardImage}
                        />
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{selectedListing.title}</Text>
                            <Text style={styles.cardPrice}>{formatPriceShort(selectedListing.price)}</Text>
                            <View style={styles.cardAddressRow}>
                                <Ionicons name="location-outline" size={14} color="#666" />
                                <Text style={styles.cardAddress} numberOfLines={1}>{selectedListing.address}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    cardAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardAddress: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    confirmButtonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        position: 'absolute',
        top: 60, // Safe area + padding
        left: 20,
        zIndex: 10,
    },
});
