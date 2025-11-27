import React, { ReactNode, useEffect } from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';

interface AnimatedScreenProps {
    children: ReactNode;
    style?: ViewStyle;
    delay?: number;
}

export const AnimatedScreen: React.FC<AnimatedScreenProps> = ({ children, style, delay = 0 }) => {
    return (
        <View style={[styles.container, style]}>
            <View style={{ flex: 1 }}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
