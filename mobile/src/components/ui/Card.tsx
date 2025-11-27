import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { theme } from '../../theme';

interface CardProps extends ViewProps {
    variant?: 'default' | 'flat';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'default',
    ...props
}) => {
    const isFlat = variant === 'flat';

    return (
        <View style={[styles.container, style]} {...props}>
            {!isFlat && <View style={styles.shadow} />}
            <View style={[
                styles.card,
                isFlat && styles.flatCard,
                style
            ]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginBottom: 16,
    },
    shadow: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.border, // Black color
        borderRadius: theme.borderRadius.md,
        zIndex: -1,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: 16,
    },
    flatCard: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
    },
});
