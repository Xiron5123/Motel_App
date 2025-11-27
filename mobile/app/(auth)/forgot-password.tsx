import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Input } from '../../src/components/ui/Input';
import { Typography } from '../../src/components/ui/Typography';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { toast } from '../../src/store/toastStore';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            toast.error('Vui lòng nhập email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Email không hợp lệ');
            return;
        }

        try {
            setLoading(true);
            await api.post('/auth/forgot-password', { email });
            setEmailSent(true);
            toast.success('Link đặt lại mật khẩu đã được gửi đến email của bạn!');
        } catch (error: any) {
            console.error('Forgot password error:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.iconContainer}>
                        <Feather name="mail" size={64} color={theme.colors.primary} />
                    </View>

                    <Typography variant="h2" style={styles.successTitle}>
                        Kiểm tra email của bạn
                    </Typography>

                    <Typography variant="body" style={styles.successMessage}>
                        Chúng tôi đã gửi link đặt lại mật khẩu đến{'\n'}
                        <Typography variant="body" style={styles.emailText}>{email}</Typography>
                    </Typography>

                    <Typography variant="caption" style={styles.infoText}>
                        Link sẽ hết hạn sau 1 giờ
                    </Typography>

                    <Button
                        title="Quay lại Đăng nhập"
                        onPress={() => router.replace('/(auth)/login')}
                        variant="primary"
                        style={styles.button}
                    />

                    <Button
                        title="Gửi lại email"
                        onPress={() => setEmailSent(false)}
                        variant="secondary"
                        style={styles.button}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <BackButton />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Feather name="lock" size={48} color={theme.colors.primary} />
                    </View>
                    <Typography variant="h1" style={styles.title}>
                        Quên mật khẩu?
                    </Typography>
                    <Typography variant="body" style={styles.subtitle}>
                        Nhập email của bạn để nhận link đặt lại mật khẩu
                    </Typography>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="Nhập email đã đăng ký"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                    />

                    <Button
                        title="Gửi link đặt lại"
                        onPress={handleSubmit}
                        loading={loading}
                        variant="primary"
                        style={styles.button}
                    />

                    <Button
                        title="Quay lại Đăng nhập"
                        onPress={() => router.back()}
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
    button: {
        marginTop: 16,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    successMessage: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    emailText: {
        fontWeight: '600',
        color: theme.colors.text,
    },
    infoText: {
        color: theme.colors.textSecondary,
        marginBottom: 32,
    },
});
