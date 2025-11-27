import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
    color?: string;
    align?: 'left' | 'center' | 'right';
}

export const Typography: React.FC<TypographyProps> = ({
    children,
    variant = 'body',
    color = theme.colors.text,
    align = 'left',
    style,
    ...props
}) => {
    const getStyle = () => {
        switch (variant) {
            case 'h1': return styles.h1;
            case 'h2': return styles.h2;
            case 'h3': return styles.h3;
            case 'h4': return styles.h4;
            case 'body': return styles.body;
            case 'caption': return styles.caption;
            case 'label': return styles.label;
            default: return styles.body;
        }
    };

    return (
        <Text
            style={[
                getStyle(),
                { color, textAlign: align },
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    h1: {
        fontFamily: theme.fonts.bold,
        fontSize: 32,
        lineHeight: 40,
    },
    h2: {
        fontFamily: theme.fonts.bold,
        fontSize: 24,
        lineHeight: 32,
    },
    h3: {
        fontFamily: theme.fonts.bold,
        fontSize: 20,
        lineHeight: 28,
    },
    h4: {
        fontFamily: theme.fonts.bold,
        fontSize: 18,
        lineHeight: 24,
    },
    body: {
        fontFamily: theme.fonts.regular,
        fontSize: 16,
        lineHeight: 24,
    },
    caption: {
        fontFamily: theme.fonts.regular,
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.textSecondary,
    },
    label: {
        fontFamily: theme.fonts.medium,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
