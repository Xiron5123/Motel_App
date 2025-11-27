import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Input } from '../../src/components/ui/Input';
import { Typography } from '../../src/components/ui/Typography';
import { theme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';
import { getImageUrl } from '../../src/utils/image';

const profileSchema = z.object({
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
    age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18, {
        message: 'Tuổi phải từ 18 trở lên',
    }),
    job: z.string().min(2, 'Vui lòng nhập nghề nghiệp/trường học'),
    budgetMin: z.string().min(1, 'Nhập ngân sách tối thiểu'),
    budgetMax: z.string().min(1, 'Nhập ngân sách tối đa'),
    location: z.string().min(2, 'Nhập khu vực mong muốn'),
    intro: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CreateRoommateProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditMode = params.mode === 'edit';
    const { user } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
    const [occupation, setOccupation] = useState<'STUDENT' | 'WORKER' | 'OTHER'>('STUDENT');
    const [habits, setHabits] = useState<string[]>([]);

    const { control, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
            age: '',
            job: '',
            budgetMin: '',
            budgetMax: '',
            location: '',
            intro: '',
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (isEditMode) {
                try {
                    setIsLoading(true);
                    const response = await api.get('/roommates/me');
                    const profile = response.data;

                    if (profile) {
                        setValue('name', profile.name);
                        setValue('age', profile.age.toString());
                        setValue('job', profile.job);
                        setValue('budgetMin', formatCurrency(profile.budgetMin.toString()));
                        setValue('budgetMax', formatCurrency(profile.budgetMax.toString()));
                        setValue('location', profile.location);
                        setValue('intro', profile.intro || '');
                        setAvatar(profile.avatar);
                        setGender(profile.gender);
                        setOccupation(profile.occupation || 'STUDENT');
                        setHabits(profile.habits || []);
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ');
                } finally {
                    setIsLoading(false);
                }
            } else if (user) {
                // Auto-fill from user account if creating new
                setValue('name', user.name || '');
                if (user.avatar) setAvatar(user.avatar);
            }
        };

        fetchProfile();
    }, [isEditMode, user, setValue]);

    // ... (pickImage, toggleHabit, formatCurrency)

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            // In a real app, upload image to server here and get URL
            // For now, we'll just use the local URI, but backend expects a string
            // TODO: Implement image upload
            setAvatar(result.assets[0].uri);
        }
    };

    const toggleHabit = (habit: string) => {
        if (habits.includes(habit)) {
            setHabits(habits.filter(h => h !== habit));
        } else {
            setHabits([...habits, habit]);
        }
    };

    const formatCurrency = (value: string) => {
        if (!value) return '';
        // Remove non-numeric characters
        const number = value.replace(/\D/g, '');
        // Format with commas
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const uploadImage = async (uri: string) => {
        try {
            const formData = new FormData();
            // @ts-ignore - React Native FormData expects name, type, uri
            formData.append('file', {
                uri,
                name: 'avatar.jpg',
                type: 'image/jpeg',
            });

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        try {
            setIsLoading(true);

            // Parse budget values back to numbers
            const budgetMin = parseInt(data.budgetMin.replace(/,/g, ''), 10);
            const budgetMax = parseInt(data.budgetMax.replace(/,/g, ''), 10);

            if (budgetMin > budgetMax) {
                Alert.alert('Lỗi', 'Ngân sách tối thiểu không được lớn hơn tối đa');
                setIsLoading(false);
                return;
            }

            let avatarUrl = avatar;
            if (avatar && !avatar.startsWith('http') && !avatar.startsWith('/')) {
                // It's a local file, upload it
                avatarUrl = await uploadImage(avatar);
            }

            const payload = {
                ...data,
                age: parseInt(data.age, 10),
                budgetMin,
                budgetMax,
                gender,
                occupation,
                habits,
                avatar: avatarUrl || undefined,
            };

            await api.post('/roommates', payload);

            Alert.alert(
                'Thành công',
                isEditMode ? 'Đã cập nhật hồ sơ tìm bạn trọ!' : 'Đã tạo hồ sơ tìm bạn trọ!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                    {isEditMode ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ tìm bạn'}
                </Typography>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                        {avatar ? (
                            <Image source={{ uri: getImageUrl(avatar) }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Feather name="camera" size={32} color={theme.colors.textSecondary} />
                                <Typography variant="caption" style={{ marginTop: 8, color: theme.colors.textSecondary }}>
                                    Thêm ảnh
                                </Typography>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Personal Info */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Thông tin cá nhân</Typography>

                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Họ và tên"
                                placeholder="Nhập họ tên của bạn"
                                value={value}
                                onChangeText={onChange}
                                error={errors.name?.message}
                            />
                        )}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Controller
                                control={control}
                                name="age"
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        label="Tuổi"
                                        placeholder="VD: 22"
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="numeric"
                                        error={errors.age?.message}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Typography variant="label" style={{ marginBottom: 8 }}>Giới tính</Typography>
                            <View style={styles.genderContainer}>
                                <TouchableOpacity
                                    style={[styles.genderOption, gender === 'MALE' && styles.genderActive]}
                                    onPress={() => setGender('MALE')}
                                >
                                    <Typography style={{ color: gender === 'MALE' ? 'white' : 'black' }}>Nam</Typography>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.genderOption, gender === 'FEMALE' && styles.genderActive]}
                                    onPress={() => setGender('FEMALE')}
                                >
                                    <Typography style={{ color: gender === 'FEMALE' ? 'white' : 'black' }}>Nữ</Typography>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <Typography variant="label" style={{ marginBottom: 8 }}>Nghề nghiệp hiện tại</Typography>
                    <View style={styles.occupationContainer}>
                        <TouchableOpacity
                            style={[styles.occupationOption, occupation === 'STUDENT' && styles.occupationActive]}
                            onPress={() => setOccupation('STUDENT')}
                        >
                            <MaterialCommunityIcons name="school" size={20} color={occupation === 'STUDENT' ? 'white' : theme.colors.text} />
                            <Typography style={[styles.occupationText, occupation === 'STUDENT' && { color: 'white' }]}>Sinh viên</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.occupationOption, occupation === 'WORKER' && styles.occupationActive]}
                            onPress={() => setOccupation('WORKER')}
                        >
                            <MaterialCommunityIcons name="briefcase" size={20} color={occupation === 'WORKER' ? 'white' : theme.colors.text} />
                            <Typography style={[styles.occupationText, occupation === 'WORKER' && { color: 'white' }]}>Người đi làm</Typography>
                        </TouchableOpacity>
                    </View>

                    <Controller
                        control={control}
                        name="job"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Chi tiết (Trường / Công ty)"
                                placeholder="VD: ĐH Bách Khoa / FPT Software"
                                value={value}
                                onChangeText={onChange}
                                error={errors.job?.message}
                            />
                        )}
                    />
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Nhu cầu tìm bạn</Typography>

                    <Controller
                        control={control}
                        name="location"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Khu vực mong muốn"
                                placeholder="VD: Quận Cầu Giấy"
                                value={value}
                                onChangeText={onChange}
                                error={errors.location?.message}
                            />
                        )}
                    />

                    <Typography variant="label" style={{ marginBottom: 8 }}>Ngân sách (VNĐ)</Typography>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Controller
                                control={control}
                                name="budgetMin"
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        placeholder="Min"
                                        value={value}
                                        onChangeText={(text) => onChange(formatCurrency(text))}
                                        keyboardType="numeric"
                                        error={errors.budgetMin?.message}
                                    />
                                )}
                            />
                        </View>
                        <Typography style={{ alignSelf: 'center', marginBottom: 16 }}>-</Typography>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Controller
                                control={control}
                                name="budgetMax"
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        placeholder="Max"
                                        value={value}
                                        onChangeText={(text) => onChange(formatCurrency(text))}
                                        keyboardType="numeric"
                                        error={errors.budgetMax?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>
                </View>

                {/* Habits */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Lối sống & Thói quen</Typography>
                    <View style={styles.habitsContainer}>
                        {[
                            'Gọn gàng', 'Không hút thuốc', 'Thích yên tĩnh',
                            'Hay nấu ăn', 'Ngủ sớm', 'Thân thiện', 'Có thú cưng'
                        ].map((habit) => (
                            <TouchableOpacity
                                key={habit}
                                style={[styles.habitChip, habits.includes(habit) && styles.habitChipActive]}
                                onPress={() => toggleHabit(habit)}
                            >
                                <Typography
                                    variant="caption"
                                    style={{ color: habits.includes(habit) ? theme.colors.primary : theme.colors.text }}
                                >
                                    {habit}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Intro */}
                <View style={styles.section}>
                    <Controller
                        control={control}
                        name="intro"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Giới thiệu bản thân (Ngắn gọn)"
                                placeholder="VD: Mình là người vui vẻ, hòa đồng..."
                                value={value}
                                onChangeText={onChange}
                                multiline
                                numberOfLines={3}
                                style={{ height: 80, textAlignVertical: 'top' }}
                            />
                        )}
                    />
                </View>

                <Button
                    title={isEditMode ? "Cập nhật hồ sơ" : "Hoàn tất hồ sơ"}
                    onPress={handleSubmit(onSubmit)}
                    variant="primary"
                    loading={isLoading}
                    style={{ marginTop: 16, marginBottom: 32 }}
                />
            </ScrollView>
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
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
        backgroundColor: 'white',
    },

    content: {
        padding: 16,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.background,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.border,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        alignItems: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
    },
    genderContainer: {
        flexDirection: 'row',
        height: 48,
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    genderOption: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    genderActive: {
        backgroundColor: theme.colors.primary,
    },
    habitsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    habitChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.full,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: 'white',
    },
    habitChipActive: {
        backgroundColor: theme.colors.secondary,
    },
    occupationContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    occupationOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: 'white',
        gap: 8,
    },
    occupationActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    occupationText: {
        fontWeight: 'bold',
    },
});
