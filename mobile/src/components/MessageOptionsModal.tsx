import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from './ui/Typography';
import { theme } from '../theme';

interface MessageOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    isMe: boolean;
    isRecalled: boolean;
    onRecall: () => void;
    onDelete: () => void;
    onReport: () => void;
    content?: string;
}

export const MessageOptionsModal: React.FC<MessageOptionsModalProps> = ({
    visible,
    onClose,
    isMe,
    isRecalled,
    onRecall,
    onDelete,
    onReport,
    content,
}) => {
    const insets = useSafeAreaInsets();

    const handleCopy = async () => {
        if (content) {
            await Clipboard.setStringAsync(content);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                            <View style={styles.header}>
                                <Typography variant="h4" style={styles.title}>Tùy chọn tin nhắn</Typography>
                            </View>

                            {/* Copy Option */}
                            {content && (
                                <TouchableOpacity style={styles.option} onPress={handleCopy}>
                                    <Feather name="copy" size={20} color="black" style={styles.icon} />
                                    <Typography variant="body">Sao chép</Typography>
                                </TouchableOpacity>
                            )}

                            {/* Owner Options */}
                            {isMe && (
                                <>
                                    {!isRecalled && (
                                        <TouchableOpacity style={styles.option} onPress={onRecall}>
                                            <Feather name="rotate-ccw" size={20} color={theme.colors.error} style={styles.icon} />
                                            <Typography variant="body" style={{ color: theme.colors.error }}>Thu hồi tin nhắn</Typography>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.option} onPress={onDelete}>
                                        <Feather name="trash-2" size={20} color="black" style={styles.icon} />
                                        <Typography variant="body">Gỡ ở phía tôi</Typography>
                                    </TouchableOpacity>
                                </>
                            )}

                            {/* Other's Options */}
                            {!isMe && !isRecalled && (
                                <TouchableOpacity style={styles.option} onPress={onReport}>
                                    <Feather name="flag" size={20} color={theme.colors.error} style={styles.icon} />
                                    <Typography variant="body" style={{ color: theme.colors.error }}>Báo cáo vi phạm</Typography>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={[styles.option, styles.cancelOption]} onPress={onClose}>
                                <Typography variant="body" style={styles.cancelText}>Hủy</Typography>
                            </TouchableOpacity>
                        </View>
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
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        borderWidth: 2,
        borderColor: 'black',
        // Hard shadow
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontWeight: 'bold',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    icon: {
        marginRight: 16,
    },
    cancelOption: {
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
        paddingVertical: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'black',
    },
    cancelText: {
        fontWeight: 'bold',
    },
});
