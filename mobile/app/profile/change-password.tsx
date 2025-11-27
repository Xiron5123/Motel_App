import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Input } from '../../src/components/ui/Input';
import { theme } from '../../src/theme';
import api from '../../src/services/api';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);
        try {
            await api.patch('/users/change-password', {
                currentPassword,
                newPassword,
            });
            Alert.alert('Thành công', 'Đổi mật khẩu thành công', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đổi mật khẩu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h3" style={styles.headerTitle}>Đổi mật khẩu</Typography>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Input
                            label="Mật khẩu hiện tại"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Nhập mật khẩu hiện tại"
                            secureTextEntry={!showCurrentPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            <Feather name={showCurrentPassword ? "eye" : "eye-off"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Mật khẩu mới"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Nhập mật khẩu mới"
                            secureTextEntry={!showNewPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowNewPassword(!showNewPassword)}
                        >
                            <Feather name={showNewPassword ? "eye" : "eye-off"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Nhập lại mật khẩu mới"
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                <Button
                    title="Đổi mật khẩu"
                    onPress={handleChangePassword}
                    loading={isLoading}
                    style={styles.saveButton}
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
        flex: 1,
    },
    form: {
        gap: 16,
        marginBottom: 32,
    },
    inputContainer: {
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 38, // Adjust based on Input label height
        zIndex: 1,
    },
    saveButton: {
        marginTop: 'auto',
    },
});
