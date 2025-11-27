import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    SlideInUp,
    SlideOutUp
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Typography } from './Typography';
import { useToastStore } from '../../store/toastStore';
import { theme } from '../../theme';

export const Toast = () => {
    const { visible, message, type, duration, hideToast } = useToastStore();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                hideToast();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, hideToast]);

    if (!visible) return null;

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return '#22c55e'; // Green 500
            case 'error': return '#ef4444'; // Red 500
            case 'info': return '#3b82f6'; // Blue 500
            default: return '#3b82f6';
        }
    };

    const getIconName = () => {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'alert-circle';
            case 'info': return 'info';
            default: return 'info';
        }
    };

    return (
        <Animated.View
            entering={SlideInUp.springify().damping(15).mass(1)}
            exiting={SlideOutUp}
            style={[
                styles.container,
                { top: insets.top + 20, backgroundColor: getBackgroundColor() }
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={hideToast}
                activeOpacity={0.9}
            >
                <Feather name={getIconName()} size={24} color="white" style={styles.icon} />
                <Typography variant="body" style={[styles.text, { color: 'white' }]}>
                    {message}
                </Typography>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        borderRadius: 12,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    icon: {
        marginRight: 12,
    },
    text: {
        fontWeight: '600',
        flex: 1,
    },
});
