import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useLocationStore } from '../../store/locationStore';

import { Typography } from '../ui/Typography';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { theme } from '../../theme';
import api from '../../services/api';
import { formatNumber } from '../../utils/format';
import { getImageUrl } from '../../utils/image';
import { toast } from '../../store/toastStore';
import { PROVINCES } from '../../constants/locations';

// Schema for validation
const listingSchema = z.object({
    title: z.string().min(5, 'Tiêu đề tối thiểu 5 ký tự'),
    description: z.string().min(10, 'Mô tả tối thiểu 10 ký tự'),
    price: z.string().min(1, 'Vui lòng nhập giá'),
    area: z.string().min(1, 'Vui lòng nhập diện tích'),
    address: z.string().min(5, 'Vui lòng nhập địa chỉ'),
    district: z.string().min(2, 'Vui lòng nhập quận/huyện'),
    ward: z.string().optional(),
    amenities: z.array(z.string()).optional(),
});

export type ListingFormValues = z.infer<typeof listingSchema>;

const AMENITIES_LIST = [
    { id: 'wifi', label: 'Wifi' },
    { id: 'parking', label: 'Chỗ để xe' },
    { id: 'kitchen', label: 'Bếp' },
    { id: 'ac', label: 'Điều hòa' },
    { id: 'wc_private', label: 'Vệ sinh riêng' },
    { id: 'wc_shared', label: 'Vệ sinh chung' },
    { id: 'fridge', label: 'Tủ lạnh' },
    { id: 'washing_machine', label: 'Máy giặt' },
    { id: 'bed', label: 'Giường' },
    { id: 'wardrobe', label: 'Tủ quần áo' },
    { id: 'pet', label: 'Thú cưng' },
    { id: 'window', label: 'Cửa sổ' },
    { id: 'balcony', label: 'Ban công' },
    { id: 'security', label: 'An ninh' },
    { id: 'time', label: 'Giờ giấc tự do' },
];

const FURNITURE_OPTIONS = [
    { id: 'furniture_full', label: 'Đầy đủ' },
    { id: 'furniture_basic', label: 'Cơ bản' },
    { id: 'furniture_empty', label: 'Nhà trống' },
];

interface ListingFormProps {
    initialData?: any;
    onSubmit: (
        data: ListingFormValues,
        images: string[],
        coordinates: { lat: number; lng: number } | null,
        selectedAmenities: string[],
        selectedFurniture: string,
        selectedCity: string
    ) => Promise<void>;
    isLoading?: boolean;
    submitLabel?: string;
}

export function ListingForm({ initialData, onSubmit, isLoading, submitLabel = "Đăng Tin" }: ListingFormProps) {
    const router = useRouter();
    const [images, setImages] = useState<string[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [selectedFurniture, setSelectedFurniture] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState('Hồ Chí Minh');
    const [cityModalVisible, setCityModalVisible] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<ListingFormValues>({
        resolver: zodResolver(listingSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '',
            area: '',
            address: '',
            district: '',
            ward: '',
        },
    });

    const { pickedLocation, setPickedLocation } = useLocationStore();

    // Handle map return params
    useEffect(() => {
        if (pickedLocation) {
            setCoordinates(pickedLocation);
        }
    }, [pickedLocation]);

    // Initialize form with data
    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title,
                description: initialData.description,
                price: initialData.price.toString(),
                area: initialData.area.toString(),
                address: initialData.address,
                district: initialData.district,
                ward: initialData.ward || '',
            });

            setSelectedCity(initialData.city);
            if (initialData.amenities) {
                setSelectedAmenities(initialData.amenities.filter((a: string) => !a.startsWith('furniture_')));
                const furniture = initialData.amenities.find((a: string) => a.startsWith('furniture_'));
                if (furniture) setSelectedFurniture(furniture);
            }

            if (initialData.lat && initialData.lng) {
                setCoordinates({ lat: initialData.lat, lng: initialData.lng });
            }

            if (initialData.photos) {
                setImages(initialData.photos.map((p: any) => getImageUrl(p.url)));
            }
        }
    }, [initialData]);

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                toast.error('Cần quyền truy cập thư viện ảnh để đăng ảnh.');
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: 5 - images.length,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const toggleAmenity = (id: string) => {
        if (selectedAmenities.includes(id)) {
            setSelectedAmenities(selectedAmenities.filter(item => item !== id));
        } else {
            setSelectedAmenities([...selectedAmenities, id]);
        }
    };

    const onFinalSubmit = (data: ListingFormValues) => {
        // We need to pass all the state up.
        // Let's extend the onSubmit signature in the component.
        onSubmit(data, images, coordinates, selectedAmenities, selectedFurniture, selectedCity);
    };

    return (
        <View style={styles.form}>
            {/* Image Picker Section */}
            <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>Hình ảnh ({images.length}/5)</Typography>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                    <TouchableOpacity style={styles.addImageButton} onPress={pickImage} disabled={images.length >= 5}>
                        <Feather name="camera" size={24} color={theme.colors.textSecondary} />
                        <Typography variant="caption" style={{ marginTop: 4 }}>Thêm ảnh</Typography>
                    </TouchableOpacity>
                    {images.map((uri, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image source={{ uri }} style={styles.imageThumbnail} />
                            <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                <Feather name="x" size={12} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Form Fields */}
            <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                    <Input
                        label="Tiêu đề"
                        placeholder="VD: Phòng trọ giá rẻ quận 10"
                        value={value}
                        onChangeText={onChange}
                        error={errors.title?.message}
                    />
                )}
            />

            <View style={styles.row}>
                <View style={styles.col}>
                    <Controller
                        control={control}
                        name="price"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Giá (Triệu/tháng)"
                                placeholder="3,500,000"
                                value={value}
                                onChangeText={(text) => onChange(formatNumber(text))}
                                keyboardType="numeric"
                                error={errors.price?.message}
                            />
                        )}
                    />
                </View>
                <View style={styles.colSpacing} />
                <View style={styles.col}>
                    <Controller
                        control={control}
                        name="area"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Diện tích (m²)"
                                placeholder="25"
                                value={value}
                                onChangeText={onChange}
                                keyboardType="numeric"
                                error={errors.area?.message}
                            />
                        )}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Typography variant="h3" style={[styles.sectionTitle, { fontSize: 16, marginBottom: 8 }]}>Khu vực</Typography>
                <View style={{ gap: 12 }}>
                    <TouchableOpacity
                        style={styles.citySelector}
                        onPress={() => setCityModalVisible(true)}
                    >
                        <Typography variant="body">{selectedCity}</Typography>
                        <Feather name="chevron-down" size={20} color={theme.colors.text} />
                    </TouchableOpacity>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Controller
                                control={control}
                                name="district"
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        label="Quận/Huyện"
                                        placeholder="Quận 1"
                                        value={value}
                                        onChangeText={onChange}
                                        error={errors.district?.message}
                                    />
                                )}
                            />
                        </View>
                        <View style={styles.colSpacing} />
                        <View style={styles.col}>
                            <Controller
                                control={control}
                                name="ward"
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        label="Phường/Xã"
                                        placeholder="Phường Bến Nghé"
                                        value={value}
                                        onChangeText={onChange}
                                        error={errors.ward?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <Controller
                        control={control}
                        name="address"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Địa chỉ chi tiết"
                                placeholder="Số nhà, tên đường..."
                                value={value}
                                onChangeText={onChange}
                                error={errors.address?.message}
                            />
                        )}
                    />

                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => router.push({ pathname: '/map' as any, params: { mode: 'pick' } })}
                    >
                        <Feather name="map-pin" size={20} color={theme.colors.primary} />
                        <Typography variant="body" style={styles.mapButtonText}>
                            {coordinates ? 'Đã chọn vị trí trên bản đồ' : 'Chọn vị trí trên bản đồ'}
                        </Typography>
                        {coordinates && <Feather name="check" size={20} color="green" />}
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={cityModalVisible}
                onClose={() => setCityModalVisible(false)}
                title="Chọn Tỉnh/Thành phố"
            >
                <ScrollView style={{ maxHeight: 400 }}>
                    {PROVINCES.map((province) => (
                        <TouchableOpacity
                            key={province}
                            style={[
                                styles.provinceItem,
                                selectedCity === province && styles.provinceItemSelected
                            ]}
                            onPress={() => {
                                setSelectedCity(province);
                                setCityModalVisible(false);
                            }}
                        >
                            <Typography variant="body" style={selectedCity === province ? { color: theme.colors.primary, fontWeight: 'bold' } : {}}>
                                {province}
                            </Typography>
                            {selectedCity === province && <Feather name="check" size={20} color={theme.colors.primary} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Modal>

            <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                    <Input
                        label="Mô tả chi tiết"
                        placeholder="Mô tả về phòng, tiện ích xung quanh..."
                        value={value}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={4}
                        style={{ height: 100, textAlignVertical: 'top' }}
                        error={errors.description?.message}
                    />
                )}
            />

            {/* Furniture Section */}
            <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>Nội thất</Typography>
                <View style={styles.amenitiesGrid}>
                    {FURNITURE_OPTIONS.map((item) => {
                        const isSelected = selectedFurniture === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.amenityChip,
                                    isSelected && styles.amenityChipSelected
                                ]}
                                onPress={() => setSelectedFurniture(item.id)}
                            >
                                <Typography
                                    variant="caption"
                                    style={[
                                        styles.amenityText,
                                        isSelected && styles.amenityTextSelected
                                    ]}
                                >
                                    {item.label}
                                </Typography>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Amenities Section */}
            <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>Tiện ích</Typography>
                <View style={styles.amenitiesGrid}>
                    {AMENITIES_LIST.map((item) => {
                        const isSelected = selectedAmenities.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.amenityChip,
                                    isSelected && styles.amenityChipSelected
                                ]}
                                onPress={() => toggleAmenity(item.id)}
                            >
                                <Typography
                                    variant="caption"
                                    style={[
                                        styles.amenityText,
                                        isSelected && styles.amenityTextSelected
                                    ]}
                                >
                                    {item.label}
                                </Typography>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <Button
                title={submitLabel}
                onPress={handleSubmit(onFinalSubmit)}
                loading={isLoading}
                variant="primary"
                style={styles.submitButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        fontSize: 18,
    },
    imageScroll: {
        flexDirection: 'row',
    },
    addImageButton: {
        width: 80,
        height: 80,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        backgroundColor: theme.colors.card,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 12,
    },
    imageThumbnail: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: '#eee',
    },
    removeImageButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: theme.colors.error,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    col: {
        flex: 1,
    },
    colSpacing: {
        width: 12,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenityChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
    },
    amenityChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: 'black',
    },
    amenityText: {
        fontWeight: '600',
    },
    amenityTextSelected: {
        color: theme.colors.text,
    },
    submitButton: {
        marginTop: 24,
    },
    citySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.card,
        marginBottom: 12,
    },
    provinceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    provinceItemSelected: {
        backgroundColor: '#FFF5F5',
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        backgroundColor: '#F0F9FF',
        marginBottom: 24,
        gap: 8,
    },
    mapButtonText: {
        color: theme.colors.primary,
        fontWeight: '600',
        flex: 1,
    },
});
