import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

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
                            <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddImage(index)}
                    >
                        <Ionicons name="add" size={32} color="#ccc" />
                        <Text style={styles.addButtonText}>Add Photo</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Photos</Text>
            <Text style={styles.subtitle}>
                Add up to {maxImages} photos. First photo will be your main photo.
            </Text>
            <View style={styles.imageGrid}>
                {Array.from({ length: maxImages }, (_, index) => renderImageSlot(index))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1A1A1A',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    imageSlot: {
        width: 100,
        height: 100,
    },
    addButton: {
        width: 100,
        height: 100,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    addButtonText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    imageContainer: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 12,
    },
}); 