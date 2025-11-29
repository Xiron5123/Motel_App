import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

import { Typography } from '../../src/components/ui/Typography';
import { BackButton } from '../../src/components/ui/BackButton';
import { TypingIndicator } from '../../src/components/ui/TypingIndicator';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { socketService } from '../../src/services/socket';
import { getImageUrl } from '../../src/utils/image';

interface Message {
    id: string;
    content: string;
    imageUrl?: string;
    listingId?: string;
    listing?: {
        id: string;
        title: string;
        price: number;
        address: string;
        photos?: { url: string }[];
    };
    senderId: string;
    conversationId: string;
    sentAt: string;
    sender: {
        id: string;
        name: string;
        avatar: string;
    };
}

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const flatListRef = useRef<FlatList>(null);

    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch conversation details
    const { data: conversation } = useQuery({
        queryKey: ['conversation', id],
        queryFn: async () => {
            const response = await api.get(`/chat/conversations/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    // Fetch initial messages
    const { isLoading: isLoadingMessages } = useQuery({
        queryKey: ['messages', id],
        queryFn: async () => {
            const response = await api.get(`/chat/conversations/${id}/messages?limit=50`);
            setMessages(response.data);
            return response.data;
        },
        enabled: !!id,
    });

    useEffect(() => {
        if (!id) return;

        console.log('Joining conversation:', id);
        socketService.emit('join_conversation', { conversationId: id });

        const handleNewMessage = (message: Message) => {
            console.log('New message received:', message);
            if (message.conversationId === id) {
                setMessages((prev) => [message, ...prev]);
            }
        };

        const handleTypingStatus = (data: { conversationId: string, typingUsers: string[] }) => {
            if (data.conversationId === id) {
                // Check if anyone OTHER than me is typing
                const otherTyping = data.typingUsers.some(userId => userId !== user?.id);
                setIsTyping(otherTyping);
            }
        };

        socketService.on('new_message', handleNewMessage);
        socketService.on('typing_status', handleTypingStatus);

        return () => {
            socketService.off('new_message');
            socketService.off('typing_status');
            socketService.emit('leave_conversation', { conversationId: id });
        };
    }, [id, user?.id]);

    // Mark messages as read when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            if (id && user?.id) {
                api.patch(`/chat/conversations/${id}/read`)
                    .then(() => {
                        // Invalidate both queries to update badge everywhere
                        queryClient.invalidateQueries({ queryKey: ['unread-count'] });
                        queryClient.invalidateQueries({ queryKey: ['conversations'] });
                    })
                    .catch(err => console.error('Failed to mark as read:', err));
            }
        }, [id, user?.id, queryClient])
    );

    const handleInputChange = (text: string) => {
        setInputText(text);

        // Emit typing start
        if (text.length > 0) {
            socketService.emit('typing_start', { conversationId: id, userId: user?.id });

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to stop typing after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                socketService.emit('typing_stop', { conversationId: id, userId: user?.id });
            }, 2000);
        } else {
            socketService.emit('typing_stop', { conversationId: id, userId: user?.id });
        }
    };

    const handleSend = async (imageUrl?: string) => {
        const content = inputText.trim();
        if ((!content && !imageUrl) || !id) return;

        if (!imageUrl) {
            setInputText('');
            socketService.emit('typing_stop', { conversationId: id, userId: user?.id });
        }

        try {
            await api.post(`/chat/conversations/${id}/messages`, { content, imageUrl });
        } catch (error) {
            console.error('Failed to send message:', error);
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: false,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            // Upload each selected image
            for (const asset of result.assets) {
                await uploadImage(asset.uri);
            }
        }
    };

    const uploadImage = async (uri: string) => {
        setIsUploading(true);
        try {
            // Fix URI for Android if needed (though Expo usually handles it)
            const fileUri = Platform.OS === 'android' ? uri : uri.replace('file://', '');

            const formData = new FormData();
            // @ts-ignore
            formData.append('file', {
                uri: fileUri,
                name: 'image.jpg',
                type: 'image/jpeg',
            });

            // Get token for auth
            const token = await SecureStore.getItemAsync('accessToken');

            // Use fetch instead of axios for better FormData support in RN
            const response = await fetch(`${api.defaults.baseURL}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    // 'Content-Type': 'multipart/form-data', // Remove this to let fetch generate boundary
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            await handleSend(data.url);
        } catch (error) {
            console.error('Upload failed:', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh lên');
        } finally {
            setIsUploading(false);
        }
    };

    const handleProfilePress = async (userId: string) => {
        try {
            const response = await api.get(`/roommates/user/${userId}`);
            if (response.data) {
                router.push(`/find-roommate/${response.data.id}`);
            } else {
                Alert.alert('Thông báo', 'Người dùng này chưa tạo hồ sơ tìm người ở ghép.');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // Fallback: if error (e.g. 404), assume no profile
            Alert.alert('Thông báo', 'Người dùng này chưa tạo hồ sơ tìm người ở ghép.');
        }
    };

    const otherParticipant = conversation?.participants?.find((p: any) => p.userId !== user?.id)?.user;

    const renderItem = ({ item }: { item: Message }) => {
        const isMe = item.senderId === user?.id;

        return (
            <View style={[
                styles.messageContainer,
                isMe ? styles.myMessageContainer : styles.theirMessageContainer
            ]}>
                {!isMe && (
                    <TouchableOpacity onPress={() => handleProfilePress(item.senderId)}>
                        <Image
                            source={{ uri: getImageUrl(item.sender.avatar, item.sender.name) }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                )}
                <View style={[
                    styles.bubble,
                    isMe ? styles.myBubble : styles.theirBubble
                ]}>
                    {/* Listing Card */}
                    {item.listing && (
                        <TouchableOpacity
                            style={styles.listingCard}
                            onPress={() => router.push(`/listing/${item.listing!.id}`)}
                            activeOpacity={0.8}
                        >
                            {item.listing.photos?.[0] && (
                                <Image
                                    source={{ uri: getImageUrl(item.listing.photos[0].url) }}
                                    style={styles.listingCardImage}
                                    contentFit="cover"
                                />
                            )}
                            <View style={styles.listingCardContent}>
                                <Typography variant="body" numberOfLines={2} style={styles.listingCardTitle}>
                                    {item.listing.title}
                                </Typography>
                                <Typography variant="caption" style={styles.listingCardPrice}>
                                    {(item.listing.price / 1000000).toFixed(1)} triệu/tháng
                                </Typography>
                            </View>
                        </TouchableOpacity>
                    )}

                    {item.imageUrl && (
                        <TouchableOpacity onPress={() => setSelectedImage(getImageUrl(item.imageUrl))}>
                            <Image
                                source={{ uri: getImageUrl(item.imageUrl) }}
                                style={styles.messageImage}
                                contentFit="cover"
                                transition={500}
                                placeholder={require('../../assets/images/icon.png')}
                                placeholderContentFit="cover"
                                onError={(e) => console.log('Image load error:', e.error)}
                            />
                        </TouchableOpacity>
                    )}
                    {!!item.content && (
                        <Typography variant="body" style={isMe ? styles.myText : styles.theirText}>
                            {item.content}
                        </Typography>
                    )}
                    <Typography variant="caption" style={isMe ? styles.myTime : styles.theirTime}>
                        {formatDistanceToNow(new Date(item.sentAt), { addSuffix: true, locale: vi })}
                    </Typography>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <BackButton />

                {otherParticipant && (
                    <TouchableOpacity
                        style={styles.headerInfo}
                        onPress={() => handleProfilePress(otherParticipant.id)}
                    >
                        <Image source={{ uri: getImageUrl(otherParticipant.avatar, otherParticipant.name) }} style={styles.headerAvatar} />
                        <Typography variant="h3" style={{ fontWeight: 'bold' }}>{otherParticipant.name}</Typography>
                    </TouchableOpacity>
                )}
            </View>

            {/* Chat Content */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Messages List */}
                {isLoadingMessages ? (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="black" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        inverted
                        contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    />
                )}

                {/* Typing Indicator */}
                {isTyping && <TypingIndicator />}

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton} onPress={handlePickImage} disabled={isUploading}>
                        {isUploading ? (
                            <ActivityIndicator size="small" color="black" />
                        ) : (
                            <Feather name="image" size={24} color="black" />
                        )}
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Nhập tin nhắn..."
                        placeholderTextColor="#666"
                        value={inputText}
                        onChangeText={handleInputChange}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!inputText.trim() && !isUploading) && styles.sendButtonDisabled]}
                        onPress={() => handleSend()}
                        disabled={!inputText.trim() && !isUploading}
                    >
                        <Typography style={{ fontWeight: 'bold', color: 'black' }}>Gửi</Typography>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Lightbox Modal */}
            <Modal
                visible={!!selectedImage}
                transparent={true}
                onRequestClose={() => setSelectedImage(null)}
                animationType="fade"
            >
                <View style={styles.lightboxContainer}>
                    <TouchableOpacity
                        style={styles.lightboxBackground}
                        onPress={() => setSelectedImage(null)}
                        activeOpacity={1}
                    >
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.lightboxImage}
                                contentFit="contain"
                                transition={300}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedImage(null)}
                        >
                            <Ionicons name="close" size={30} color="#fff" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9E6', // Beige background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF9E6',
        borderBottomWidth: 2,
        borderBottomColor: 'black',
    },
    backButton: {
        marginRight: 0, // BackButton component has its own margin/padding, but we might need to adjust container
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16, // Add margin to separate from BackButton
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'black',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    theirMessageContainer: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 2,
        borderColor: 'black',
    },
    bubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'black',
        // Hard shadow
        shadowColor: 'black',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    },
    myBubble: {
        backgroundColor: '#4A90E2', // Blue
    },
    theirBubble: {
        backgroundColor: 'white',
    },
    myText: {
        color: 'white',
        fontWeight: '500',
    },
    theirText: {
        color: 'black',
        fontWeight: '500',
    },
    myTime: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 10,
        marginTop: 4,
        textAlign: 'right',
    },
    theirTime: {
        color: '#666',
        fontSize: 10,
        marginTop: 4,
    },
    keyboardAvoidingView: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FFF9E6',
        borderTopWidth: 2,
        borderTopColor: 'black',
        alignItems: 'center',
    },
    attachButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        // Hard shadow
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'black',
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        marginRight: 12,
        fontSize: 16,
        // Hard shadow
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    sendButton: {
        height: 44,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#FFD700', // Gold/Yellow
        borderWidth: 2,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        // Hard shadow
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
    },
    listingCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    listingCardImage: {
        width: 80,
        height: 80,
    },
    listingCardContent: {
        flex: 1,
        padding: 8,
        justifyContent: 'center',
    },
    listingCardTitle: {
        fontWeight: '600',
        marginBottom: 4,
        color: '#000',
    },
    listingCardPrice: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    sendButtonDisabled: {
        backgroundColor: '#E0E0E0',
        borderColor: '#999',
    },
    lightboxContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightboxBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightboxImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
        zIndex: 1,
    },
});
