import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Input } from '../../src/components/ui/Input';
import { Typography } from '../../src/components/ui/Typography';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { toast } from '../../src/store/toastStore';

const registerSchema = z.object({
    firstName: z.string().min(1, 'Vui lòng nhập họ'),
    lastName: z.string().min(1, 'Vui lòng nhập tên'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ').regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(6, 'Vui lòng nhập lại mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            setIsLoading(true);

            // Send OTP to email
            await api.post('/auth/send-otp', { email: data.email });

            // Navigate to OTP verification screen with ALL user data
            router.push({
                pathname: '/(auth)/verify-email',
                params: {
                    email: data.email,
                    name: `${data.firstName} ${data.lastName}`,
                    password: data.password,
                    phone: data.phone || '',
                },
            });

            toast.success('Mã OTP đã được gửi đến email của bạn');
        } catch (error: any) {
            console.error('Send OTP error:', error);
            toast.error(error.response?.data?.message || 'Không thể gửi OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <BackButton />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <Typography variant="h1" style={styles.title}>Tạo tài khoản</Typography>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Controller
                                    control={control}
                                    name="firstName"
                                    render={({ field: { onChange, value } }) => (
                                        <Input
                                            label="Họ"
                                            placeholder="Nguyễn"
                                            value={value}
                                            onChangeText={onChange}
                                            error={errors.firstName?.message}
                                        />
                                    )}
                                />
                            </View>
                            <View style={styles.colSpacing} />
                            <View style={styles.col}>
                                <Controller
                                    control={control}
                                    name="lastName"
                                    render={({ field: { onChange, value } }) => (
                                        <Input
                                            label="Tên"
                                            placeholder="Văn A"
                                            value={value}
                                            onChangeText={onChange}
                                            error={errors.lastName?.message}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Email"
                                    placeholder="email@example.com"
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    error={errors.email?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="phone"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="SĐT"
                                    placeholder="0912..."
                                    value={value || ''}
                                    onChangeText={onChange}
                                    keyboardType="phone-pad"
                                    error={errors.phone?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Mật khẩu"
                                    placeholder="Nhập mật khẩu"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry={!showPassword}
                                    error={errors.password?.message}
                                    rightIcon={
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={theme.colors.textSecondary} />
                                        </TouchableOpacity>
                                    }
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Xác nhận mật khẩu"
                                    placeholder="Nhập lại mật khẩu"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry={!showConfirmPassword}
                                    error={errors.confirmPassword?.message}
                                    rightIcon={
                                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color={theme.colors.textSecondary} />
                                        </TouchableOpacity>
                                    }
                                />
                            )}
                        />

                        <Button
                            title="Đăng ký"
                            onPress={handleSubmit(onSubmit)}
                            loading={isLoading}
                            style={styles.submitButton}
                            variant="primary"
                        />

                        <View style={styles.footer}>
                            <Typography variant="caption">Đã có tài khoản? </Typography>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Typography variant="caption" style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}>
                                        Đăng nhập ngay
                                    </Typography>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    backButton: {
        marginLeft: -8,
        alignSelf: 'flex-start',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    col: {
        flex: 1,
    },
    colSpacing: {
        width: 12,
    },
    submitButton: {
        marginTop: 24,
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
