import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Input } from '../../src/components/ui/Input';
import { Typography } from '../../src/components/ui/Typography';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { toast } from '../../src/store/toastStore';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { token } = useLocalSearchParams<{ token?: string }>();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Token không hợp lệ');
            router.replace('/(auth)/login');
        }
    }, [token]);

    const handleSubmit = async () => {
        // Validation
        if (!newPassword || !confirmPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setLoading(true);
            await api.post('/auth/reset-password', {
                token,
                newPassword,
            });

            toast.success('Đặt lại mật khẩu thành công!');

            // Redirect to login after 1 second
            setTimeout(() => {
                router.replace('/(auth)/login');
            }, 1000);
        } catch (error: any) {
            console.error('Reset password error:', error);
            const message = error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <BackButton />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Feather name="shield" size={48} color={theme.colors.primary} />
                    </View>
                    <Typography variant="h1" style={styles.title}>
                        Đặt lại mật khẩu
                    </Typography>
                    <Typography variant="body" style={styles.subtitle}>
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </Typography>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Mật khẩu mới"
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                <Feather
                                    name={showNewPassword ? "eye" : "eye-off"}
                                    size={20}
                                    color={theme.colors.textSecondary}
                                />
                            </TouchableOpacity>
                        }
                    />

                    <Input
                        label="Xác nhận mật khẩu"
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Feather
                                    name={showConfirmPassword ? "eye" : "eye-off"}
                                    size={20}
                                    color={theme.colors.textSecondary}
                                />
                            </TouchableOpacity>
                        }
                    />

                    <View style={styles.requirementsBox}>
                        <Typography variant="caption" style={styles.requirementsTitle}>
                            Yêu cầu mật khẩu:
                        </Typography>
                        <View style={styles.requirementItem}>
                            <Feather
                                name={newPassword.length >= 6 ? "check-circle" : "circle"}
                                size={16}
                                color={newPassword.length >= 6 ? theme.colors.success : theme.colors.textSecondary}
                            />
                            <Typography variant="caption" style={styles.requirementText}>
                                Ít nhất 6 ký tự
                            </Typography>
                        </View>
                        <View style={styles.requirementItem}>
                            <Feather
                                name={newPassword && confirmPassword && newPassword === confirmPassword ? "check-circle" : "circle"}
                                size={16}
                                color={newPassword && confirmPassword && newPassword === confirmPassword ? theme.colors.success : theme.colors.textSecondary}
                            />
                            <Typography variant="caption" style={styles.requirementText}>
                                Mật khẩu khớp nhau
                            </Typography>
                        </View>
                    </View>

                    <Button
                        title="Đặt lại mật khẩu"
                        onPress={handleSubmit}
                        loading={loading}
                        variant="primary"
                        style={styles.button}
                    />

                    <Button
                        title="Quay lại Đăng nhập"
                        onPress={() => router.replace('/(auth)/login')}
                        variant="secondary"
                        style={styles.button}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerBar: {
        paddingHorizontal: 20,
        paddingTop: 10,
        alignItems: 'flex-start',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        paddingHorizontal: 20,
    },
    form: {
        width: '100%',
    },
    requirementsBox: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    requirementsTitle: {
        fontWeight: '600',
        marginBottom: 8,
        color: theme.colors.text,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    requirementText: {
        marginLeft: 8,
        color: theme.colors.textSecondary,
    },
    button: {
        marginTop: 16,
    },
});
