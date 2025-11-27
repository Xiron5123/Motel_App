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

export const TypingIndicator = () => {
    return (
        <View style={styles.container}>
            <Dot delay={0} />
            <Dot delay={200} />
            <Dot delay={400} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        height: 30,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        alignSelf: 'flex-start',
        marginLeft: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#666',
        marginHorizontal: 2,
    },
});
