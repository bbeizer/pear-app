import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, Button, Image, TouchableOpacity,
    StyleSheet, ScrollView, FlatList, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from 'lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

const ALL_PROMPTS = [
    "I'm weirdly attracted to...",
    "My most controversial opinion is...",
    "My hidden talent is...",
    "Two truths and a lie:",
    "The last song I listened to on repeat was...",
    "Dating me is like...",
    "My toxic trait is...",
    "My go-to karaoke song is...",
    "A shower thought I recently had...",
    "My hobbies are...",
    "I love...",
    "One dealbreaker for me is...",
    "The emoji that best describes me is...",
];

export default function ProfileSetup() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
    const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const registerForPush = async () => {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Alert.alert('Permission denied', 'Unable to get push token');
                return;
            }

            const tokenRes = await Notifications.getExpoPushTokenAsync();
            const expoPushToken = tokenRes.data;
            console.log('📲 Got Expo push token:', expoPushToken);

            // Save to Supabase
            const { data: userData, error } = await supabase.auth.getUser();
            if (!error && userData?.user?.id) {
                await supabase.from('profiles')
                    .update({ push_token: expoPushToken })
                    .eq('id', userData.user.id);
                console.log('✅ Push token saved to Supabase');
            }
        };

        registerForPush();
    }, []);

    useEffect(() => {
        const fetchUserAndRegisterPushToken = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data.user) {
                console.error("Supabase getUser error:", error);
                return;
            }

            setUser(data.user);

            // 🔔 Register push token
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.warn('❌ Push notifications permission not granted');
                return;
            }

            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('📲 Got Expo push token:', token);

            const { error: updateErr } = await supabase
                .from('profiles')
                .update({ push_token: token })
                .eq('id', data.user.id);

            if (updateErr) {
                console.error('❌ Error saving push token:', updateErr.message);
            } else {
                console.log('✅ Push token saved to Supabase');
            }
        };

        fetchUserAndRegisterPushToken();
    }, []);

    const handleAddImage = async (index: number) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.7,
        });
        if (!result.canceled) {
            const newImages = [...images];
            newImages[index] = result.assets[0].uri;
            setImages(newImages);
        }
    };

    const togglePrompt = (prompt: string) => {
        if (selectedPrompts.includes(prompt)) {
            setSelectedPrompts(selectedPrompts.filter(p => p !== prompt));
        } else {
            if (selectedPrompts.length >= 3) {
                Alert.alert('Limit Reached', 'You can select up to 3 prompts.');
                return;
            }
            setSelectedPrompts([...selectedPrompts, prompt]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        if (!user) return;

        let avatarUrl: string | null = null;
        if (images[0]) {
            const fileName = images[0].split('/').pop() || `profile-${Date.now()}.jpg`;
            const blob = await (await fetch(images[0])).blob();
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(`${user.id}/${fileName}`, blob, { upsert: true });
            if (!error) avatarUrl = data?.path || null;
        }

        const profileData = {
            id: user.id,
            name,
            bio,
            avatar_url: avatarUrl,
            prompts: selectedPrompts.map(p => ({
                question: p,
                answer: promptAnswers[p] || '',
            })),
        };

        const { error: updateError } = await supabase.from('profiles').upsert(profileData);
        if (!updateError) router.push('/main/Availability');
        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Set up your profile 🍐</Text>

            <TextInput
                placeholder="Your name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                placeholder="Bio / Fun Fact"
                placeholderTextColor="#888"
                value={bio}
                onChangeText={setBio}
                multiline
                style={[styles.input, styles.bioInput]}
            />

            <Text style={styles.sectionTitle}>Your Photos</Text>
            <View style={styles.photoGrid}>
                {images.map((uri, idx) => (
                    <TouchableOpacity key={idx} onPress={() => handleAddImage(idx)} style={styles.imageSlot}>
                        {uri ? (
                            <Image source={{ uri }} style={styles.thumbnail} />
                        ) : (
                            <Text style={styles.plus}>＋</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Choose up to 3 prompts</Text>
            <FlatList
                data={ALL_PROMPTS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => togglePrompt(item)}
                        style={[
                            styles.promptChip,
                            selectedPrompts.includes(item) && styles.promptChipSelected,
                        ]}
                    >
                        <Text
                            style={{
                                color: selectedPrompts.includes(item) ? '#fff' : '#333',
                            }}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginVertical: 10 }}
            />

            {selectedPrompts.map((prompt, i) => (
                <View key={i} style={styles.promptBlock}>
                    <Text style={styles.promptLabel}>{prompt}</Text>
                    <TextInput
                        placeholder="Type your answer..."
                        placeholderTextColor="#aaa"
                        value={promptAnswers[prompt] || ''}
                        onChangeText={(text) =>
                            setPromptAnswers((prev) => ({ ...prev, [prompt]: text }))
                        }
                        style={styles.input}
                    />
                </View>
            ))}

            <Button title={loading ? 'Saving...' : 'Save Profile'} onPress={handleSave} disabled={loading} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 60,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 24,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        color: '#000',
        backgroundColor: '#f9f9f9',
    },
    bioInput: {
        height: 80,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    imageSlot: {
        width: '30%',
        aspectRatio: 4 / 5,
        backgroundColor: '#eee',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    plus: {
        fontSize: 32,
        color: '#999',
    },
    promptChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#eee',
        borderRadius: 20,
        marginRight: 8,
    },
    promptChipSelected: {
        backgroundColor: '#007AFF',
    },
    promptBlock: {
        marginBottom: 16,
    },
    promptLabel: {
        fontWeight: '500',
        marginBottom: 6,
        color: '#444',
    },
});
