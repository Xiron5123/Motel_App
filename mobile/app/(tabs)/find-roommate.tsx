import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { theme } from '../../src/theme';
import { useQuery } from '@tanstack/react-query';
import api from '../../src/services/api';
import { useRoommateFilterStore } from '../../src/store/roommateFilterStore';
import { getImageUrl } from '../../src/utils/image';

// Mock Data
const ROOMMATES = [
    {
        id: '1',
        name: 'Nguyễn Văn An',
        age: 22,
        job: 'Sinh viên Bách Khoa',
        description: 'Tìm bạn ở ghép khu vực Cầu Giấy. Mình gọn gàng, vui vẻ, không hút thuốc. Ưu tiên bạn nam sinh viên.',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        tags: ['Nam', 'Sinh viên'],
        budget: '2tr - 3tr',
    },
    {
        id: '2',
        name: 'Trần Thị Bích',
        age: 24,
        job: 'Nhân viên văn phòng',
        description: 'Người đi làm, cần tìm bạn nữ ở ghép gần quận 1. Mình thích nấu ăn, yên tĩnh và sạch sẽ.',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        tags: ['Nữ', 'Người đi làm'],
        budget: '3tr - 5tr',
    },
    {
        id: '3',
        name: 'Lê Hoàng',
        age: 21,
        job: 'Sinh viên Kinh Tế',
        description: 'Tìm phòng trọ hoặc bạn ở ghép quanh khu vực Hai Bà Trưng. Mình hiền, dễ tính và hay đi chơi cuối tuần.',
        avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
        tags: ['Nam', 'Sinh viên'],
        budget: '2.5tr - 4tr',
    },
];

const QUICK_FILTERS = ['Nam', 'Nữ', 'Sinh viên', 'Người đi làm'];

export default function FindRoommateScreen() {
    const router = useRouter();
    const {
        gender, setGender,
        ageRange,
        location,
        budgetRange,
        habits
    } = useRoommateFilterStore();

    // Local state for occupation filter since it's not in the store yet (or we can treat it as quick filter only)
    // Ideally should be in store, but for now let's use local state or map to store if possible.
    // Let's add occupation to store later if needed, but for now we can just use a local state for the query.
    // Wait, the user wants it to work.
    const [occupation, setOccupation] = useState<'STUDENT' | 'WORKER' | 'ALL'>('ALL');

    const activeFilter =
        gender === 'MALE' ? 'Nam' :
            gender === 'FEMALE' ? 'Nữ' :
                occupation === 'STUDENT' ? 'Sinh viên' :
                    occupation === 'WORKER' ? 'Người đi làm' : null;

    const handleQuickFilter = (filter: string) => {
        // Reset others when one is selected for simplicity, or allow combination?
        // User said "Student" OR "Worker", usually mutually exclusive with each other, but maybe not with Gender.
        // Let's keep it simple: 
        if (filter === 'Nam') {
            setGender(gender === 'MALE' ? 'ALL' : 'MALE');
            setOccupation('ALL');
        } else if (filter === 'Nữ') {
            setGender(gender === 'FEMALE' ? 'ALL' : 'FEMALE');
            setOccupation('ALL');
        } else if (filter === 'Sinh viên') {
            setOccupation(occupation === 'STUDENT' ? 'ALL' : 'STUDENT');
            setGender('ALL');
        } else if (filter === 'Người đi làm') {
            setOccupation(occupation === 'WORKER' ? 'ALL' : 'WORKER');
            setGender('ALL');
        }
    };

    const { data: roommates = [], isLoading, refetch } = useQuery({
        queryKey: ['roommates', gender, ageRange, location, budgetRange, habits, occupation],
        queryFn: async () => {
            const params: any = {};

            if (gender !== 'ALL') params.gender = gender;
            if (occupation !== 'ALL') params.occupation = occupation;

            // Add other filters
            params.minAge = ageRange[0];
            params.maxAge = ageRange[1];

            if (location) params.location = location;

            params.minBudget = budgetRange[0] * 1000000; // Convert to VND
            params.maxBudget = budgetRange[1] * 1000000;

            // Habits (simple mapping)
            if (habits.smoking) params.smoking = true;
            // ... map other habits if backend supports it

            const response = await api.get('/roommates', { params });
            return response.data;
        },
    });

    const { data: myProfile, refetch: refetchProfile } = useQuery({
        queryKey: ['my-roommate-profile'],
        queryFn: async () => {
            try {
                const response = await api.get('/roommates/me');
                return response.data;
            } catch (error) {
                return null;
            }
        },
    });

    useFocusEffect(
        React.useCallback(() => {
            refetchProfile();
            refetch();
        }, [])
    );

    const hasProfile = !!myProfile;

    const handleCreateProfile = () => {
        router.push('/find-roommate/create-profile');
    };

    const handleEditProfile = () => {
        router.push({ pathname: '/find-roommate/create-profile', params: { mode: 'edit' } });
    };

    const renderRoommateItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/find-roommate/${item.id}`)}
            activeOpacity={0.9}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <Image source={{ uri: getImageUrl(item.user?.avatar || item.avatar) }} style={styles.avatar} />
                <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                        <Typography variant="h4" style={styles.name}>{item.name}</Typography>
                        <View style={styles.badgesContainer}>
                            <View style={styles.badge}>
                                <Typography style={styles.badgeText}>{item.age}t</Typography>
                            </View>
                            <View style={styles.badge}>
                                <Typography style={styles.badgeText}>{item.gender === 'MALE' ? 'Nam' : 'Nữ'}</Typography>
                            </View>
                            {item.occupation && (
                                <View style={[styles.badge, { backgroundColor: item.occupation === 'STUDENT' ? '#E3F2FD' : '#E8F5E9', borderColor: 'transparent' }]}>
                                    <Typography style={[styles.badgeText, { color: item.occupation === 'STUDENT' ? '#1976D2' : '#388E3C' }]}>
                                        {item.occupation === 'STUDENT' ? 'Sinh viên' : 'Đi làm'}
                                    </Typography>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Feather name="briefcase" size={12} color={theme.colors.textSecondary} />
                        <Typography style={styles.infoText}>{item.job}</Typography>
                    </View>
                </View>
            </View>

            <View style={styles.tagsContainer}>
                {item.habits?.slice(0, 3).map((tag: string, index: number) => (
                    <View key={index} style={styles.tag}>
                        <Typography style={styles.tagText}>{tag}</Typography>
                    </View>
                ))}
                {item.habits?.length > 3 && (
                    <View style={styles.tag}>
                        <Typography style={styles.tagText}>+{item.habits.length - 3}</Typography>
                    </View>
                )}
            </View>

            <Typography style={styles.description} numberOfLines={2}>
                {item.intro}
            </Typography>

            <View style={styles.cardFooter}>
                <View style={styles.budgetContainer}>
                    <MaterialCommunityIcons name="cash-multiple" size={16} color={theme.colors.primary} />
                    <Typography style={styles.budgetText}>
                        {item.budgetMin?.toLocaleString()} - {item.budgetMax?.toLocaleString()}
                    </Typography>
                </View>
                <View style={styles.detailButton}>
                    <Typography style={styles.detailText}>Chi tiết</Typography>
                    <Feather name="arrow-right" size={16} color={theme.colors.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Typography variant="h2">Tìm Bạn trọ</Typography>
                {hasProfile ? (
                    <TouchableOpacity onPress={() => router.push(`/find-roommate/${myProfile.id}`)} style={styles.createButton}>
                        <Feather name="user" size={16} color="white" />
                        <Typography style={styles.createButtonText}>Hồ sơ của tôi</Typography>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleCreateProfile} style={styles.createButton}>
                        <Feather name="plus" size={16} color="white" />
                        <Typography style={styles.createButtonText}>Tạo hồ sơ</Typography>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.filterContainer}>
                <View style={styles.quickFiltersRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersScroll}>
                        <TouchableOpacity
                            onPress={() => router.push('/find-roommate/filter')}
                            style={styles.filterIconButton}
                        >
                            <Feather name="sliders" size={18} color="black" />
                        </TouchableOpacity>

                        {QUICK_FILTERS.map((filter: string) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    activeFilter === filter && styles.filterChipActive
                                ]}
                                onPress={() => handleQuickFilter(filter)}
                            >
                                <Typography
                                    variant="caption"
                                    style={{
                                        color: activeFilter === filter ? theme.colors.primary : theme.colors.text,
                                        fontWeight: activeFilter === filter ? 'bold' : 'normal'
                                    }}
                                >
                                    {filter}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <FlatList
                data={roommates}
                renderItem={renderRoommateItem}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Typography style={styles.emptyText}>Chưa có ai đăng tin tìm bạn.</Typography>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: 'black',
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 12,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: 16,
        marginBottom: 8,
    },
    filterContainer: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 0, // Remove horizontal padding to allow scroll to edge
        marginBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
    },
    quickFiltersRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quickFiltersScroll: {
        paddingHorizontal: 16,
        gap: 8,
        alignItems: 'center',
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: 'white',
    },
    filterChipActive: {
        backgroundColor: theme.colors.secondary,
    },
    filterIconButton: {
        padding: 8,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: 'white',
        marginRight: 4, // Add spacing between icon and first chip
    },
    listContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 100,
    },
    card: {
        padding: 16,
        borderRadius: theme.borderRadius.md,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.border,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    name: {
        fontWeight: 'bold',
        marginRight: 8,
        fontSize: 16,
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginLeft: 4,
        marginRight: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    tag: {
        backgroundColor: '#F0F4F8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tagText: {
        fontSize: 11,
        color: theme.colors.textSecondary,
    },
    description: {
        color: theme.colors.text,
        lineHeight: 20,
        marginBottom: 12,
        fontSize: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    budgetContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    budgetText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginRight: 4,
        fontSize: 12,
    },
});
