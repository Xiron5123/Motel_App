import React from 'react';
import { View, StyleSheet, Modal as RNModal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { theme } from '../../theme';
import { Typography } from './Typography';
import { Button } from './Button';
import { Feather } from '@expo/vector-icons';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children, footer }) => {
    return (
        <RNModal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.contentContainer}>
                        {/* Hard Shadow */}
                        <View style={styles.shadowLayer} />

                        {/* Modal Content */}
                        <View style={styles.modal}>
                            <View style={styles.header}>
                                <Typography variant="h3" style={styles.title}>{title}</Typography>
                                {/* Optional: Close button if needed, but clicking outside closes it */}
                            </View>

                            <View style={styles.body}>
                                {children}
                            </View>

                            {footer && (
                                <View style={styles.footer}>
                                    {footer}
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    contentContainer: {
        width: '100%',
        maxWidth: 340,
        position: 'relative',
    },
    shadowLayer: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        zIndex: -1,
    },
    modal: {
        backgroundColor: theme.colors.background,
        borderWidth: 3,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: 20,
        width: '100%',
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
    body: {
        marginBottom: 24,
    },
    footer: {
        marginTop: 0,
    },
});
