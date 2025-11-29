import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { theme } from '../../theme';

interface LogoutConfirmModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function LogoutConfirmModal({ visible, onConfirm, onCancel }: LogoutConfirmModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Feather name="log-out" size={48} color={theme.colors.error} />
                    </View>

                    {/* Title */}
                    <Typography variant="h3" style={styles.title}>
                        Đăng xuất
                    </Typography>

                    {/* Message */}
                    <Typography variant="body" style={styles.message}>
                        Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
                    </Typography>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Hủy"
                            variant="secondary"
                            onPress={onCancel}
                            style={styles.cancelButton}
                        />
                        <Button
                            title="Đăng xuất"
                            variant="primary"
                            onPress={onConfirm}
                            style={styles.confirmButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: theme.colors.background,
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${theme.colors.error}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: `${theme.colors.error}30`,
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: '700',
    },
    message: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginBottom: 28,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
    },
    confirmButton: {
        flex: 1,
    },
});
