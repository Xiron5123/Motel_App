import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { theme } from '../../theme';

const Dot = ({ delay }: { delay: number }) => {
    const opacity = useSharedValue(0.3);
    const translateY = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 400 }),
                    withTiming(0.3, { duration: 400 })
                ),
                -1,
                true
            )
        );

        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-4, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    return <Animated.View style={[styles.dot, animatedStyle]} />;
};

interface TypingIndicatorProps {
    showAvatar?: boolean;
    avatarUrl?: string;
    userName?: string;
}

export const TypingIndicator = ({ showAvatar = true, avatarUrl, userName }: TypingIndicatorProps) => {
    return (
        <View style={styles.wrapper}>
            {showAvatar && avatarUrl && (
                <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                />
            )}
            <View style={styles.container}>
                <Dot delay={0} />
                <Dot delay={200} />
                <Dot delay={400} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 2,
        borderColor: 'black',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'black',
        // Hard shadow like message bubbles
        shadowColor: 'black',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#666',
        marginHorizontal: 2,
    },
});
