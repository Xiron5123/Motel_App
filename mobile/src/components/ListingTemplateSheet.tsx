import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { theme } from '../theme';

interface Template {
    id: string;
    text: string;
    icon: string;
}

interface ListingTemplateSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelectTemplate: (message: string) => void;
    listingTitle?: string;
}

const TEMPLATES: Template[] = [
    {
        id: '1',
        text: 'Phòng này còn trống không ạ?',
        icon: '🏠',
    },
    {
        id: '2',
        text: 'Tôi quan tâm đến phòng này. Có thể xem phòng được không?',
        icon: '👀',
    },
    {
        id: '3',
        text: 'Giá phòng có thương lượng được không ạ?',
        icon: '💰',
    },
];

export function ListingTemplateSheet({
    visible,
    onClose,
    onSelectTemplate,
    listingTitle,
}: ListingTemplateSheetProps) {
    const [customMessage, setCustomMessage] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleTemplateSelect = (template: Template) => {
        onSelectTemplate(template.text);
        onClose();
    };

    const handleCustomSubmit = () => {
        if (customMessage.trim()) {
            onSelectTemplate(customMessage.trim());
            setCustomMessage('');
            setShowCustomInput(false);
            onClose();
        }
    };

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={styles.header}>
                    <Typography variant="h3">Gửi tin nhanh</Typography>
                    <TouchableOpacity onPress={onClose}>
                        <Feather name="x" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {listingTitle && (
                    <Typography variant="caption" style={styles.subtitle}>
                        {listingTitle}
                    </Typography>
                )}

                <ScrollView style={styles.content}>
                    {TEMPLATES.map((template) => (
                        <TouchableOpacity
                            key={template.id}
                            style={styles.templateCard}
                            onPress={() => handleTemplateSelect(template)}
                            activeOpacity={0.7}
                        >
                            <Typography variant="h1" style={styles.icon}>
                                {template.icon}
                            </Typography>
                            <Typography variant="body" style={styles.templateText}>
                                {template.text}
                            </Typography>
                            <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ))}

                    {/* Custom Message Option */}
                    {!showCustomInput ? (
                        <TouchableOpacity
                            style={[styles.templateCard, styles.customCard]}
                            onPress={() => setShowCustomInput(true)}
                            activeOpacity={0.7}
                        >
                            <Typography variant="h1" style={styles.icon}>
                                ✏️
                            </Typography>
                            <Typography variant="body" style={styles.templateText}>
                                Tự viết tin nhắn
                            </Typography>
                            <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.customInputContainer}>
                            <TextInput
                                style={styles.customInput}
                                placeholder="Nhập tin nhắn của bạn..."
                                value={customMessage}
                                onChangeText={setCustomMessage}
                                multiline
                                autoFocus
                                maxLength={500}
                            />
                            <View style={styles.customActions}>
                                <Button
                                    title="Hủy"
                                    variant="outline"
                                    onPress={() => {
                                        setShowCustomInput(false);
                                        setCustomMessage('');
                                    }}
                                    style={{ flex: 1 }}
                                    size="small"
                                />
                                <Button
                                    title="Gửi"
                                    variant="primary"
                                    onPress={handleCustomSubmit}
                                    style={{ flex: 1 }}
                                    size="small"
                                    disabled={!customMessage.trim()}
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    subtitle: {
        paddingHorizontal: 20,
        paddingTop: 12,
        color: theme.colors.textSecondary,
    },
    content: {
        padding: 20,
    },
    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.lg,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    customCard: {
        borderStyle: 'dashed',
    },
    icon: {
        fontSize: 28,
        marginRight: 16,
    },
    templateText: {
        flex: 1,
        lineHeight: 22,
    },
    customInputContainer: {
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.lg,
        padding: 16,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    customInput: {
        fontSize: 16,
        lineHeight: 24,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
    customActions: {
        flexDirection: 'row',
        gap: 12,
    },
});
