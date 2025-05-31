import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabaseClient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

export default function ProfileSetup({ navigation }: Props) {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setLoading(true);

        const user = supabase.auth.user();

        if (!user) {
            console.error('Error fetching user:');
            setLoading(false);
            return;
        }

        let imageUrl: string | null = null;

        if (image) {
            try {
                const fileName = image.split('/').pop() || `profile-${Date.now()}.jpg`;
                const response = await fetch(image);
                const blob = await response.blob();

                const { data, error } = await supabase.storage
                    .from('avatars')
                    .upload(`${user.id}/${fileName}`, blob);

                if (error) {
                    console.log('Image upload error', error);
                } else {
                    imageUrl = data?.Key || null;
                }
            } catch (err) {
                console.error('Upload failed:', err);
            }
        }

        const { error: updateError } = await supabase.from('profiles').upsert({
            id: user.id,
            name,
            bio,
            avatar_url: imageUrl,
        });

        if (updateError) {
            console.error('Error updating profile:', updateError);
        } else {
            navigation.navigate('Availability');
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Set up your profile</Text>
            <TextInput
                placeholder="Your name"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder="Bio / Fun fact"
                style={[styles.input, { height: 80 }]}
                value={bio}
                onChangeText={setBio}
                multiline
            />
            <TouchableOpacity onPress={handleImagePick} style={styles.imagePicker}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <Text>Select profile photo</Text>
                )}
            </TouchableOpacity>
            <Button
                title={loading ? 'Saving...' : 'Save Profile'}
                onPress={handleSave}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, justifyContent: 'center' },
    header: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 12,
        borderRadius: 8,
    },
    imagePicker: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
    },
    image: { width: 150, height: 150, borderRadius: 75 },
});
