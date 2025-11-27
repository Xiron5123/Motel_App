import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Card } from '../../src/components/ui/Card';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { getImageUrl } from '../../src/utils/image';

export default function RoommateDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['roommate', id],
        queryFn: async () => {
            const response = await api.get(`/roommates/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Typography>Không tìm thấy hồ sơ</Typography>
                <Button title="Quay lại" onPress={() => router.back()} style={{ marginTop: 16 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h3">Hồ sơ</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Image source={{ uri: getImageUrl(profile.user?.avatar || profile.avatar) }} style={styles.avatar} />
                    <Typography variant="h2" style={{ marginTop: 16 }}>{profile.name}</Typography>
                    <Typography variant="body" style={{ color: theme.colors.textSecondary }}>
                        {profile.age} tuổi, {profile.gender === 'MALE' ? 'Nam' : 'Nữ'}
                    </Typography>
                </View>

                <Card style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>THÔNG TIN HỒ SƠ</Typography>

                    {/* Introduction */}
                    <View style={styles.subsection}>
                        <Typography variant="h4" style={styles.subsectionTitle}>Giới thiệu</Typography>
                        <Typography variant="body" style={{ lineHeight: 22 }}>
                            {profile.intro}
                        </Typography>
                    </View>

                    <View style={styles.divider} />

                    {/* Details */}
                    <View style={styles.subsection}>
                        <Typography variant="h4" style={styles.subsectionTitle}>Chi tiết</Typography>
                        <View style={styles.detailRow}>
                            <Typography variant="body" style={styles.detailLabel}>Khu vực</Typography>
                            <Typography variant="h3" style={styles.detailValue}>{profile.location}</Typography>
                        </View>
                        <View style={styles.detailRow}>
                            <Typography variant="body" style={styles.detailLabel}>Ngân sách</Typography>
                            <Typography variant="h3" style={styles.detailValue}>
                                {profile.budgetMin?.toLocaleString()} - {profile.budgetMax?.toLocaleString()}
                            </Typography>
                        </View>
                        <View style={styles.detailRow}>
                            <Typography variant="body" style={styles.detailLabel}>Nghề nghiệp</Typography>
                            <Typography variant="h3" style={styles.detailValue}>{profile.job}</Typography>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Habits */}
                    <View style={styles.subsection}>
                        <Typography variant="h4" style={styles.subsectionTitle}>Thói quen</Typography>
                        <View style={styles.habitsContainer}>
                            {profile.habits.map((habit: string, index: number) => (
                                <View key={index} style={styles.habitChip}>
                                    <Typography variant="caption" style={{ fontWeight: 'bold' }}>{habit}</Typography>
                                </View>
                            ))}
                        </View>
                    </View>
                </Card>

            </ScrollView>

            {/* Footer Action */}
            <View style={styles.footer}>
                {user && user.id === profile.userId ? (
                    <Button
                        title="Chỉnh sửa hồ sơ"
                        onPress={() => router.push({ pathname: '/find-roommate/create-profile', params: { mode: 'edit' } })}
                        variant="outline"
                        style={{ width: '100%' }}
                    />
                ) : (
                    <Button
                        title="Nhắn tin"
                        onPress={async () => {
                            try {
                                const response = await api.post('/chat/conversations', { participantId: profile.userId });
                                router.push(`/chat/${response.data.id}`);
                            } catch (error) {
                                Alert.alert('Lỗi', 'Không thể bắt đầu cuộc trò chuyện');
                            }
                        }}
                        variant="primary"
                        style={{ width: '100%' }}
                    />
                )}
            </View>
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

    content: {
        padding: 16,
        paddingBottom: 100,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'white',
    },
    section: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    subsection: {
        marginVertical: 8,
    },
    subsectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    detailLabel: {
        color: theme.colors.textSecondary,
        width: 100,
    },
    detailValue: {
        flex: 1,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 4,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    habitsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    habitChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: '#E0F7FA', // Light cyan
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
});
