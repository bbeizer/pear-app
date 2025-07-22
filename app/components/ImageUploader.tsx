import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ImageUploaderProps {
    images: (string | null)[];
    onImagesChange: (images: (string | null)[]) => void;
    maxImages?: number;
}

export default function ImageUploader({
    images,
    onImagesChange,
    maxImages = 8
}: ImageUploaderProps) {
    const handleAddImage = async (index: number) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const newImages = [...images];
                newImages[index] = result.assets[0].uri;
                onImagesChange(newImages);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...images];
        newImages[index] = null;
        onImagesChange(newImages);
    };

    const renderImageSlot = (index: number) => {
        const image = images[index];

        return (
            <View key={index} style={styles.imageSlot}>
                {image ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.image} />
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveImage(index)}
                        >
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddImage(index)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={32} />
                        <Text style={styles.addButtonText}>Add Photo</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const SCREEN_WIDTH = Dimensions.get('window').width;
    const CARD_HORIZONTAL_PADDING = 12 * 2 + 20 * 2; // cardWrapper + card padding
    const GRID_GAP = 16 * 2; // two gaps per row
    const SLOT_SIZE = Math.floor((SCREEN_WIDTH - CARD_HORIZONTAL_PADDING - GRID_GAP) / 3);

    const styles = StyleSheet.create({
        cardWrapper: {
            marginTop: 24,
            marginBottom: 32,
            paddingHorizontal: 12,
        },
        card: {
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 20,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
            elevation: 3,
        },
        title: {
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 4,
            color: '#1A1A1A',
            textAlign: 'left',
        },
        subtitle: {
            fontSize: 13,
            color: '#9ca3af',
            marginBottom: 18,
            textAlign: 'left',
            fontWeight: '500',
        },
        imageGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 16,
        },
        imageSlot: {
            width: SLOT_SIZE,
            height: SLOT_SIZE,
            marginBottom: 20,
            borderRadius: 16,
            backgroundColor: colors.gray50,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 6,
        },
        addButton: {
            width: SLOT_SIZE,
            height: SLOT_SIZE,
            borderWidth: 2,
            borderColor: colors.gray100,
            borderStyle: 'dashed',
            borderRadius: 14,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.gray50,
        },
        addButtonText: {
            fontSize: 12,
            color: colors.gray300,
            marginTop: 4,
            fontWeight: '600',
        },
        imageContainer: {
            position: 'relative',
            width: SLOT_SIZE,
            height: SLOT_SIZE,
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: colors.gray50,
            shadowColor: '#000',
            shadowOpacity: 0.10,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
        },
        image: {
            width: SLOT_SIZE,
            height: SLOT_SIZE,
            borderRadius: 14,
        },
        removeButton: {
            position: 'absolute',
            top: 6,
            right: 6,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 12,
            padding: 3,
            zIndex: 2,
        },
        primaryBadge: {
            position: 'absolute',
            bottom: 6,
            left: 6,
            backgroundColor: colors.primaryGreen,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 2,
            zIndex: 2,
        },
        primaryBadgeText: {
            color: '#fff',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
    });

    return (
        <View style={styles.cardWrapper}>
            <View style={styles.card}>
                <Text style={styles.title}>Photos</Text>
                <Text style={styles.subtitle}>
                    Add up to {maxImages} photos. First photo will be your main photo.
                </Text>
                <View style={styles.imageGrid}>
                    {Array.from({ length: maxImages }, (_, index) => renderImageSlot(index))}
                </View>
            </View>
        </View>
    );
} 