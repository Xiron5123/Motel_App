import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast } from '../ui/Toast';

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    return (
        <View style={styles.container}>
            {children}
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
