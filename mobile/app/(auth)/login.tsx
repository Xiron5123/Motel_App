import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Typography } from '../../src/components/ui/Typography';
import { theme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';
import { storage } from '../../src/services/storage';
import { toast } from '../../src/store/toastStore';

const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            setIsLoading(true);
            const response = await api.post('/auth/login', data);
            const { accessToken, refreshToken, user } = response.data;

            // Save refresh token
            await storage.setRefreshToken(refreshToken);

            await login(accessToken, user);
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Typography variant="h1" style={styles.title}>Chào mừng bạn!</Typography>
                </View>

                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Email"
                                placeholder="Nhập email của bạn"
                                value={value}
                                onChangeText={onChange}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                error={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Mật khẩu"
                                placeholder="Nhập mật khẩu của bạn"
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


                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/forgot-password')}
                        style={styles.forgotPasswordLink}
                    >
                        <Typography
                            variant="caption"
                            style={styles.forgotPasswordText}
                            numberOfLines={undefined}
                        >
                            Quên mật khẩu?
                        </Typography>
                    </TouchableOpacity>


                    <View style={styles.buttonRow}>
                        <View style={styles.buttonCol}>
                            <Button
                                title="Đăng nhập"
                                onPress={handleSubmit(onSubmit)}
                                loading={isLoading}
                                variant="primary"
                            />
                        </View>
                        <View style={styles.buttonSpacing} />
                        <View style={styles.buttonCol}>
                            <Button
                                title="Đăng ký"
                                onPress={() => router.push('/register')}
                                variant="secondary"
                            />
                        </View>
                    </View>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Typography variant="caption" style={styles.dividerText}>Hoặc tiếp tục với</Typography>
                        <View style={styles.dividerLine} />
                    </View>

                    <Button
                        title="Google"
                        onPress={() => toast.info('Chức năng đang phát triển')}
                        variant="white"
                        icon={<Feather name="globe" size={20} color="black" />}
                        style={styles.socialButton}
                    />

                    <Button
                        title="Facebook"
                        onPress={() => toast.info('Chức năng đang phát triển')}
                        variant="white"
                        icon={<Feather name="facebook" size={20} color="black" />}
                        style={styles.socialButton}
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
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 24,
        marginBottom: 32,
    },
    buttonCol: {
        flex: 1,
    },
    buttonSpacing: {
        width: 16,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.textSecondary,
        opacity: 0.3,
    },
    dividerText: {
        marginHorizontal: 16,
        color: theme.colors.textSecondary,
    },
    socialButton: {
        marginBottom: 16,
    },
    forgotPasswordLink: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    forgotPasswordText: {
        color: theme.colors.primary,
        fontWeight: '600',
        minWidth: 120, // Ensure enough space for "Quên mật khẩu?"
    },
});
