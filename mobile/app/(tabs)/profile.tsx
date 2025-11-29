import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { LogoutConfirmModal } from '../../src/components/modals/LogoutConfirmModal';
import { theme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useNotificationStore } from '../../src/store/notificationStore';
import { getImageUrl } from '../../src/utils/image';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    React.useEffect(() => {
        fetchNotifications();
    }, []);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        logout();
    };

    const MenuItem = ({ icon, label, onPress, color = theme.colors.text, badge }: { icon: keyof typeof Feather.glyphMap, label: string, onPress?: () => void, color?: string, badge?: number }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Feather name={icon} size={20} color={color} style={styles.menuIcon} />
            <Typography variant="body" style={[styles.menuText, { color }]}>{label}</Typography>
            {badge ? (
                <View style={styles.badge}>
                    <Typography variant="caption" style={styles.badgeText}>
                        {badge > 99 ? '99+' : badge}
                    </Typography>
                </View>
            ) : null}
            <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        {user?.avatar ? (
                            <Image source={{ uri: getImageUrl(user.avatar) }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Feather name="user" size={40} color="white" />
                            </View>
                        )}
                    </View>
                    <Typography variant="h2" style={styles.name}>{user?.name || 'Người dùng'}</Typography>
                    <Typography variant="body" style={styles.email}>{user?.email}</Typography>
                    <View style={styles.roleTag}>
                        <Typography variant="caption" style={styles.roleText}>
                            {user?.role === 'LANDLORD' ? 'Chủ trọ' : 'Người thuê'}
                        </Typography>
                    </View>
                </View>

                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Tài khoản</Typography>
                    <Card style={styles.menuCard}>
                        <MenuItem icon="user" label="Thông tin cá nhân" onPress={() => router.push('/profile/edit' as any)} />
                        <MenuItem icon="lock" label="Đổi mật khẩu" onPress={() => router.push('/profile/change-password' as any)} />
                        <MenuItem
                            icon="bell"
                            label="Thông báo"
                            onPress={() => router.push('/notifications' as any)}
                            badge={unreadCount > 0 ? unreadCount : undefined}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Quản lý</Typography>
                    <Card style={styles.menuCard}>
                        <MenuItem
                            icon="heart"
                            label="Đã lưu"
                            onPress={() => router.push('/favorites')}
                        />
                        <MenuItem
                            icon="message-circle"
                            label="Phòng đã đặt"
                            onPress={() => router.push('/my-bookings')}
                        />
                        {user?.role === 'LANDLORD' && (
                            <MenuItem
                                icon="inbox"
                                label="Yêu cầu thuê phòng"
                                onPress={() => router.push('/landlord-bookings' as any)}
                            />
                        )}
                        {user?.role === 'RENTER' && (
                            <MenuItem
                                icon="users"
                                label="Hồ sơ tìm bạn ở ghép"
                                onPress={() => router.push('/find-roommate/create-profile')}
                            />
                        )}
                        <MenuItem
                            icon="grid"
                            label="Quản lý tin đăng"
                            onPress={() => router.push('/profile/landlord-dashboard' as any)}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Ứng dụng</Typography>
                    <Card style={styles.menuCard}>
                        <MenuItem icon="help-circle" label="Trợ giúp & Hỗ trợ" onPress={() => { }} />
                        <MenuItem icon="info" label="Về ứng dụng" onPress={() => { }} />
                    </Card>
                </View>

                <Button
                    title="Đăng xuất"
                    onPress={handleLogout}
                    variant="outline"
                    style={styles.logoutButton}
                    textStyle={{ color: theme.colors.error }}
                    icon={<Feather name="log-out" size={20} color={theme.colors.error} />}
                />
            </ScrollView>

            {/* Logout Confirm Modal */}
            <LogoutConfirmModal
                visible={showLogoutModal}
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutModal(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: theme.colors.border,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.border,
    },
    name: {
        marginBottom: 4,
    },
    email: {
        color: theme.colors.textSecondary,
        marginBottom: 12,
    },
    roleTag: {
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    roleText: {
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    menuCard: {
        padding: 0,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
    },
    menuIcon: {
        marginRight: 16,
    },
    menuText: {
        flex: 1,
    },
    logoutButton: {
        marginTop: 8,
    },
    badge: {
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 8,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
