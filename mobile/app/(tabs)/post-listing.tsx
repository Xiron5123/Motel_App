
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { Typography } from '../../src/components/ui/Typography';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { toast } from '../../src/store/toastStore';
import { ListingForm, ListingFormValues } from '../../src/components/listing/ListingForm';

export default function PostListingScreen() {
    const router = useRouter();
    const { checkAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    // Check auth on mount
    useEffect(() => {
        const verifyAuth = async () => {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                toast.info('Vui lòng đăng nhập để đăng tin');
                router.replace('/(auth)/login');
            }
        };
        verifyAuth();
    }, []);

    const uploadImage = async (uri: string): Promise<string | null> => {
        try {
            const fileUri = Platform.OS === 'android' ? uri : uri.replace('file://', '');
            const formData = new FormData();
            // @ts-ignore
            formData.append('file', {
                uri: fileUri,
                name: 'listing_photo.jpg',
                type: 'image/jpeg',
            });

            const token = await SecureStore.getItemAsync('accessToken');
            const response = await fetch(`${api.defaults.baseURL}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            return data.url;
        } catch (error: any) {
            console.error('Upload error:', error);
            if (error.message === 'Unauthorized') {
                throw error;
            }
            return null;
        }
    };

    const handleCreateListing = async (
        data: ListingFormValues,
        images: string[],
        coordinates: { lat: number; lng: number } | null,
        selectedAmenities: string[],
        selectedFurniture: string,
        selectedCity: string
    ) => {
        if (images.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 ảnh cho phòng trọ.');
            return;
        }

        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) {
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            router.replace('/(auth)/login');
            return;
        }

        try {
            setIsLoading(true);

            // Combine amenities and furniture
            const finalAmenities = [...selectedAmenities];
            if (selectedFurniture) {
                finalAmenities.push(selectedFurniture);
            }

            // 1. Create Listing
            const listingData = {
                title: data.title,
                description: data.description,
                price: parseFloat(data.price.replace(/,/g, '')),
                area: parseFloat(data.area),
                address: data.address,
                city: selectedCity,
                district: data.district,
                ward: data.ward,
                amenities: finalAmenities,
                lat: coordinates?.lat || 21.0285,
                lng: coordinates?.lng || 105.8542,
            };

            const response = await api.post('/listings', listingData);
            const listingId = response.data.id;

            // 2. Upload Photos
            const newPhotos = images.filter(img => !img.startsWith('http'));
            const uploadedUrls: string[] = [];

            for (const uri of newPhotos) {
                const url = await uploadImage(uri);
                if (url) {
                    uploadedUrls.push(url);
                }
            }

            await Promise.all(uploadedUrls.map((url, index) => {
                return api.post(`/listings/${listingId}/photos`, {
                    url: url,
                    order: index,
                });
            }));

            // 3. Refresh Auth to update Role (if upgraded)
            await checkAuth();

            toast.success('Đăng tin thành công!');
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error('Post listing error:', error);
            if (error.response?.status === 401 || error.message === 'Unauthorized') {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                router.replace('/(auth)/login');
            } else {
                toast.error(error.response?.data?.message || 'Đăng tin thất bại');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']} >
            <View style={styles.header}>
                <Typography variant="h2">Đăng Tin Mới</Typography>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ListingForm
                    onSubmit={handleCreateListing}
                    isLoading={isLoading}
                    submitLabel="Đăng Tin"
                />
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: 20,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
});
