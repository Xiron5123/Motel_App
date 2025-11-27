import React from 'react';
import { StyleSheet, ViewStyle, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme';

interface BackButtonProps {
    style?: ViewStyle;
    onPress?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ style, onPress }) => {
    const router = useRouter();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.back();
        }
    };

    const shadowOffset = 4;

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.container,
                style
            ]}
        >
            {({ pressed }) => (
                <>
                    {/* Shadow Layer */}
                    <View style={[
                        styles.shadowLayer,
                        {
                            top: shadowOffset,
                            left: shadowOffset,
                        }
                    ]} />

                    {/* Main Button Layer */}
                    <View style={[
                        styles.button,
                        {
                            transform: [
                                { translateX: pressed ? shadowOffset : 0 },
                                { translateY: pressed ? shadowOffset : 0 }
                            ]
                        }
                    ]}>
                        <Feather name="arrow-left" size={20} color="black" />
                    </View>
                </>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        position: 'relative',
    },
    shadowLayer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.border,
        borderRadius: 12,
        zIndex: -1,
    },
    button: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
});
