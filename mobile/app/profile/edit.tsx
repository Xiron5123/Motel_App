import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Input } from '../../src/components/ui/Input';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { getImageUrl } from '../../src/utils/image';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatar, setAvatar] = useState(user?.avatar || null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setIsUploading(true);
        try {
            // Fix URI for Android
            const fileUri = Platform.OS === 'android' ? uri : uri.replace('file://', '');

            const formData = new FormData();
            // @ts-ignore
            formData.append('file', {
                uri: fileUri,
                name: 'avatar.jpg',
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

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setAvatar(data.url);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh lên');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên hiển thị');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.patch('/users/me', {
                name,
                phone,
                avatar,
            });
            setUser(response.data);
            Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật thông tin');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h3" style={styles.headerTitle}>Chỉnh sửa hồ sơ</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handlePickImage} disabled={isUploading}>
                        {isUploading ? (
                            <View style={[styles.avatar, styles.loadingAvatar]}>
                                <ActivityIndicator color={theme.colors.primary} />
                            </View>
                        ) : avatar ? (
                            <Image source={{ uri: getImageUrl(avatar) }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Feather name="user" size={40} color="#666" />
                            </View>
                        )}
                        <View style={styles.editIcon}>
                            <Feather name="camera" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Tên hiển thị"
                        value={name}
                        onChangeText={setName}
                        placeholder="Nhập tên của bạn"
                    />
                    <Input
                        label="Số điện thoại"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Nhập số điện thoại"
                        keyboardType="phone-pad"
                    />
                </View>

                <Button
                    title="Lưu thay đổi"
                    onPress={handleSave}
                    loading={isLoading}
                    style={styles.saveButton}
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
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },

    headerTitle: {
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: theme.colors.border,
    },
    loadingAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    form: {
        gap: 16,
        marginBottom: 32,
    },
    saveButton: {
        marginTop: 'auto',
    },
});
