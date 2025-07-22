import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ActionButtonsProps {
    onPass: () => void;
    onLike: () => void;
    disabled?: boolean;
}

export default function ActionButtons({
    onPass,
    onLike,
    disabled = false
}: ActionButtonsProps) {
    return (
        <View style={styles.actionButtons}>
            <TouchableOpacity
                style={[styles.actionButton, styles.passButton, { borderWidth: 2, borderColor: 'red' }]}
                onPress={onPass}
                disabled={disabled}

            >
                <Ionicons name="close" size={32} color="#FF6B6B" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.actionButton,
                    styles.likeButton,
                    { borderWidth: 2, borderColor: colors.primaryGreen }
                ]}
                onPress={onLike}
                disabled={disabled}
            >
                <Text style={styles.pearEmoji}>🍐</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    actionButtons: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        paddingHorizontal: 20,
    },
    actionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    passButton: {
        backgroundColor: '#fff',
    },
    likeButton: {
        backgroundColor: '#fff',
    },
    pearEmoji: {
        fontSize: 32,
    },
}); 