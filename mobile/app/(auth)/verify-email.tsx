import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Typography } from '../../src/components/ui/Typography';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { toast } from '../../src/store/toastStore';

export default function VerifyEmailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        email: string;
        name: string;
        password: string;
        phone?: string;
    }>();
    const { email, name, password, phone } = params;
    const [otp, setOTP] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleOTPChange = (value: string, index: number) => {
        if (value.length > 1) return; // Only 1 digit per box

        // Only allow numbers
        if (value && !/^\d+$/.test(value)) {
            return;
        }

        const newOTP = [...otp];
        newOTP[index] = value;
        setOTP(newOTP);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error('Vui lòng nhập đầy đủ mã OTP');
            return;
        }

        try {
            setLoading(true);
            // First verify OTP
            await api.post('/auth/verify-otp', { email, otp: otpString });

            // Then complete registration with user data
            await api.post('/auth/register', {
                name,
                email,
                password,
                phone: phone || undefined
            });

            toast.success('Đăng ký thành công!');
            // Navigate to login
            router.replace('/(auth)/login');
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Đăng ký thất bại');
            // Clear OTP on error
            setOTP(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await api.post('/auth/send-otp', { email });
            toast.success('Đã gửi lại mã OTP');
            setOTP(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            console.error('Resend OTP error:', error);
            toast.error('Không thể gửi lại OTP');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <BackButton />
            </View>

            <View style={styles.content}>
                <Typography variant="h1" style={styles.title}>
                    Xác thực tài khoản
                </Typography>

                <Typography variant="body" style={styles.subtitle}>
                    Vui lòng nhập mã gồm 6 chữ số đã được gửi{'\n'}
                    đến email của bạn.
                </Typography>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[
                                styles.otpInput,
                                digit ? styles.otpInputFilled : null,
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOTPChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                            autoFocus={index === 0}
                        />
                    ))}
                </View>

                <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
                    <Typography variant="caption" style={styles.resendText}>
                        Chưa nhận được mã? <Typography variant="caption" style={styles.resendLink}>Gửi lại</Typography>
                    </Typography>
                </TouchableOpacity>

                <Button
                    title="Xác nhận"
                    onPress={handleVerify}
                    loading={loading}
                    variant="primary"
                    style={styles.button}
                />
            </View>
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
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    otpInput: {
        width: 48,
        height: 56,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 8,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: theme.colors.card,
    },
    otpInputFilled: {
        borderColor: theme.colors.primary,
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    resendText: {
        color: theme.colors.textSecondary,
    },
    resendLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    button: {
        marginTop: 8,
    },
});
