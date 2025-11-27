import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    style,
    rightIcon,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.inputWrapper}>
                {/* Hard Shadow */}
                <View style={styles.shadow} />

                <TextInput
                    style={[
                        styles.input,
                        error && styles.inputError,
                        rightIcon ? styles.inputWithIcon : undefined,
                        style
                    ]}
                    placeholderTextColor={theme.colors.textSecondary}
                    {...props}
                />
                {rightIcon && (
                    <View style={styles.rightIconContainer}>
                        {rightIcon}
                    </View>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        marginBottom: 8,
        color: theme.colors.text,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        position: 'relative',
    },
    shadow: {
        position: 'absolute',
        top: 4,
        left: 4,
        right: -4,
        bottom: -4,
        backgroundColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        zIndex: -1,
    },
    input: {
        backgroundColor: theme.colors.card,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        padding: 12,
        fontFamily: theme.fonts.medium,
        fontSize: 16,
        color: theme.colors.text,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    inputWithIcon: {
        paddingRight: 48,
    },
    rightIconContainer: {
        position: 'absolute',
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    errorText: {
        fontFamily: theme.fonts.medium,
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 4,
    },
});
