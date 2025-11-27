import React from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle, TextStyle, ActivityIndicator, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { theme } from '../../theme';

interface ButtonProps {
    onPress: () => void;
    title?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white';
    size?: 'small' | 'medium' | 'large' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
    noShadow?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
    icon,
    noShadow = false,
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const getBackgroundColor = () => {
        if (disabled) return theme.colors.textSecondary;
        switch (variant) {
            case 'primary': return theme.colors.primary;
            case 'secondary': return theme.colors.secondary;
            case 'outline': return theme.colors.card;
            case 'white': return theme.colors.card;
            case 'ghost': return 'transparent';
            case 'danger': return theme.colors.error;
            default: return theme.colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.card;
        switch (variant) {
            case 'outline': return theme.colors.text;
            case 'white': return theme.colors.text;
            case 'ghost': return theme.colors.text;
            default: return theme.colors.text;
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'small': return { vertical: 8, horizontal: 12 };
            case 'large': return { vertical: 16, horizontal: 24 };
            case 'icon': return { vertical: 10, horizontal: 10 };
            default: return { vertical: 12, horizontal: 20 };
        }
    };

    const fontSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;
    const padding = getPadding();

    const isGhost = variant === 'ghost';
    const shadowOffset = isGhost ? 0 : 4;

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={[
                styles.container,
                size === 'icon' && { alignSelf: 'flex-start' },
                animatedStyle,
                style
            ]}
        >
            {({ pressed }) => (
                <>
                    {/* Hard Shadow Layer - Static */}
                    {!isGhost && !disabled && !noShadow && (
                        <View style={[
                            styles.shadowLayer,
                            {
                                top: shadowOffset,
                                left: shadowOffset,
                            }
                        ]} />
                    )}

                    {/* Main Button Layer - Moves on Press */}
                    <View style={[
                        styles.button,
                        {
                            backgroundColor: getBackgroundColor(),
                            paddingVertical: padding.vertical,
                            paddingHorizontal: padding.horizontal,
                            borderColor: theme.colors.border,
                            borderWidth: isGhost ? 0 : 2,
                            transform: [
                                { translateX: pressed && !isGhost ? shadowOffset : 0 },
                                { translateY: pressed && !isGhost ? shadowOffset : 0 }
                            ]
                        }
                    ]}>
                        {loading ? (
                            <ActivityIndicator color={theme.colors.text} />
                        ) : (
                            <View style={styles.content}>
                                {icon && (
                                    <View style={[
                                        styles.iconContainer,
                                        !title && { marginRight: 0 }
                                    ]}>
                                        {icon}
                                    </View>
                                )}
                                {title ? (
                                    <Text style={[
                                        styles.text,
                                        {
                                            color: getTextColor(),
                                            fontSize,
                                        },
                                        textStyle
                                    ]}>
                                        {title}
                                    </Text>
                                ) : null}
                            </View>
                        )}
                    </View>
                </>
            )}
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    shadowLayer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        zIndex: -1,
    },
    button: {
        borderRadius: theme.borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        fontFamily: theme.fonts.bold,
        fontWeight: '700',
    },
});
