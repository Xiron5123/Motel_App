import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Typography } from './ui/Typography';
import { theme } from '../theme';
import { Feather } from '@expo/vector-icons';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
    title?: string;
}

const REPORT_REASONS = [
    'Thông tin sai lệch',
    'Lừa đảo',
    'Spam / Quảng cáo',
    'Ngôn từ thù ghét',
    'Quấy rối',
    'Khác'
];

export const ReportModal: React.FC<ReportModalProps> = ({ visible, onClose, onSubmit, title = 'Báo cáo vi phạm' }) => {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [customReason, setCustomReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const finalReason = selectedReason === 'Khác' ? customReason : selectedReason;

        if (!finalReason.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(finalReason);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Report failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedReason('');
        setCustomReason('');
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    const isValid = selectedReason && (selectedReason !== 'Khác' || customReason.trim().length > 0);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardView}
                        >
                            <View style={styles.container}>
                                <Typography variant="h3" style={styles.title}>{title}</Typography>

                                <Typography variant="body" style={styles.label}>
                                    Vui lòng chọn lý do bạn báo cáo nội dung này:
                                </Typography>

                                <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
                                    {REPORT_REASONS.map((reason) => (
                                        <TouchableOpacity
                                            key={reason}
                                            style={[
                                                styles.reasonItem,
                                                selectedReason === reason && styles.reasonItemActive
                                            ]}
                                            onPress={() => setSelectedReason(reason)}
                                        >
                                            <View style={[
                                                styles.radio,
                                                selectedReason === reason && styles.radioActive
                                            ]}>
                                                {selectedReason === reason && <View style={styles.radioInner} />}
                                            </View>
                                            <Typography variant="body" style={styles.reasonText}>{reason}</Typography>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {selectedReason === 'Khác' && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập lý do cụ thể..."
                                        value={customReason}
                                        onChangeText={setCustomReason}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                        autoFocus
                                    />
                                )}

                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={handleClose}
                                        disabled={isSubmitting}
                                    >
                                        <Typography style={styles.cancelText}>Hủy</Typography>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.submitButton, !isValid && styles.disabledButton]}
                                        onPress={handleSubmit}
                                        disabled={!isValid || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Typography style={styles.submitText}>Gửi báo cáo</Typography>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    keyboardView: {
        width: '100%',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        // Hard shadow
        shadowColor: 'black',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
        borderWidth: 2,
        borderColor: 'black',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    label: {
        marginBottom: 12,
        color: '#666',
    },
    reasonsList: {
        maxHeight: 250,
        marginBottom: 16,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    reasonItemActive: {
        backgroundColor: '#f9f9f9',
    },
    reasonText: {
        marginLeft: 12,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: {
        borderColor: theme.colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },
    input: {
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        minHeight: 80,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 8,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'black',
        minWidth: 80,
        alignItems: 'center',
        // Hard shadow
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    cancelButton: {
        backgroundColor: 'white',
    },
    submitButton: {
        backgroundColor: theme.colors.error,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        borderColor: '#999',
    },
    cancelText: {
        fontWeight: 'bold',
    },
    submitText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
