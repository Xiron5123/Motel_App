import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface MessageStatusProps {
    isMine: boolean;
    isRead?: boolean;
    sentAt: string;
}

export function MessageStatus({ isMine, isRead, sentAt }: MessageStatusProps) {
    if (!isMine) return null; // Only show status for sent messages

    return (
        <View style={styles.container}>
            {isRead ? (
                // Read: Double checkmark in blue
                <View style={styles.checkmarks}>
                    <Feather name="check" size={12} color="#4A90E2" style={styles.check1} />
                    <Feather name="check" size={12} color="#4A90E2" style={styles.check2} />
                </View>
            ) : (
                // Delivered: Single checkmark in gray
                <Feather name="check" size={12} color="rgba(255, 255, 255, 0.6)" />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarks: {
        flexDirection: 'row',
        position: 'relative',
        width: 16,
        height: 12,
    },
    check1: {
        position: 'absolute',
        left: 0,
    },
    check2: {
        position: 'absolute',
        left: 4,
    },
});
