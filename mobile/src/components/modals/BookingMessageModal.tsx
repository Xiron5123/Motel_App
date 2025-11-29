import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';

import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { theme } from '../../theme';
import { getImageUrl } from '../../utils/image';

interface BookingMessageModalProps {
    visible: boolean;
    listing: {
        id: string;
        title: string;
        price: number;
        photos?: { url: string }[];
    };
    onClose: () => void;
    onSend: (message: string) => Promise<void>;
}

const MESSAGE_TEMPLATES = [
    'Xin chào! Tôi muốn đặt phòng này',
    'Phòng còn trống không ạ?',
    'Tôi có thể xem phòng được không?',
];

export function BookingMessageModal({ visible, listing, onClose, onSend }: BookingMessageModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        const message = selectedTemplate !== null
            ? MESSAGE_TEMPLATES[selectedTemplate]
            : customMessage.trim();

        if (!message) return;

        setIsSending(true);
        try {
            await onSend(message);
            // Reset state
            setSelectedTemplate(null);
            setCustomMessage('');
        } catch (error) {
            console.error('Send error:', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Typography variant="h3">Gửi tin nhắn</Typography>
                        <TouchableOpacity onPress={onClose} disabled={isSending}>
                            <Feather name="x" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Listing Card */}
                        <View style={styles.listingCard}>
                            <Image
                                source={{ uri: getImageUrl(listing.photos?.[0]?.url) }}
                                style={styles.listingImage}
                                contentFit="cover"
                            />
                            <View style={styles.listingInfo}>
                                <Typography variant="h4" numberOfLines={2} style={styles.listingTitle}>
                                    {listing.title}
                                </Typography>
                                <Typography variant="body" style={styles.listingPrice}>
                                    {(listing.price / 1000000).toFixed(1)} triệu/tháng
                                </Typography>
                            </View>
                        </View>

                        {/* Message Templates */}
                        <Typography variant="h4" style={styles.sectionTitle}>Chọn tin nhắn mẫu</Typography>
                        {MESSAGE_TEMPLATES.map((template, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.templateButton,
                                    selectedTemplate === index && styles.templateButtonSelected,
                                ]}
                                onPress={() => {
                                    setSelectedTemplate(index);
                                    setCustomMessage('');
                                }}
                                disabled={isSending}
                            >
                                <View style={[
                                    styles.radio,
                                    selectedTemplate === index && styles.radioSelected,
                                ]}>
                                    {selectedTemplate === index && (
                                        <View style={styles.radioDot} />
                                    )}
                                </View>
                                <Typography
                                    variant="body"
                                    style={[
                                        styles.templateText,
                                        selectedTemplate === index && styles.templateTextSelected,
                                    ]}
                                >
                                    {template}
                                </Typography>
                            </TouchableOpacity>
                        ))}

                        {/* Custom Message */}
                        <Typography variant="h4" style={styles.sectionTitle}>Hoặc tự soạn tin</Typography>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Nhập tin nhắn của bạn..."
                            placeholderTextColor="#999"
                            value={customMessage}
                            onChangeText={(text) => {
                                setCustomMessage(text);
                                setSelectedTemplate(null);
                            }}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            editable={!isSending}
                        />
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Button
                            title="Hủy"
                            variant="secondary"
                            onPress={onClose}
                            style={styles.cancelButton}
                            disabled={isSending}
                        />
                        <Button
                            title={isSending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                            variant="primary"
                            onPress={handleSend}
                            style={styles.sendButton}
                            disabled={isSending || (selectedTemplate === null && !customMessage.trim())}
                        />
                    </View>

                    {isSending && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        borderWidth: 2,
        borderBottomWidth: 0,
        borderColor: theme.colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
    },
    content: {
        padding: 20,
    },
    listingCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    listingImage: {
        width: 100,
        height: 100,
    },
    listingInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    listingTitle: {
        fontWeight: '700',
        marginBottom: 4,
    },
    listingPrice: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    sectionTitle: {
        marginBottom: 12,
        fontWeight: '700',
    },
    templateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    templateButtonSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}10`,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.border,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: theme.colors.primary,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },
    templateText: {
        flex: 1,
    },
    templateTextSelected: {
        fontWeight: '600',
        color: theme.colors.text,
    },
    textInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        padding: 16,
        marginBottom: 20,
        fontSize: 16,
        minHeight: 100,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 2,
        borderTopColor: theme.colors.border,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
    },
    sendButton: {
        flex: 2,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
});
