
import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, Button, Image, TouchableOpacity,
    StyleSheet, ScrollView, FlatList, Alert,
    Switch,
    Modal, Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useSupabaseUser } from '../../lib/hooks/useSupabaseUser';
import { useRegisterPushToken } from '../../lib/hooks/useRegisterPushToken';
import type { Profile } from '../../types';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Ionicons } from '@expo/vector-icons';

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Other'];
const SEXUALITIES = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Asexual', 'Queer', 'Other'];
const HEIGHTS = ['4\'0"', '4\'1"', '4\'2"', '4\'3"', '4\'4"', '4\'5"', '4\'6"', '4\'7"', '4\'8"', '4\'9"', '4\'10"', '4\'11"', '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"', '6\'5"', '6\'6"', '6\'7"', '6\'8"', '6\'9"', '6\'10"', '6\'11"', '7\'0"'];
const RELIGIONS = ['None', 'Christian', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 'Spiritual', 'Other'];
const POLITICS = ['Liberal', 'Moderate', 'Conservative', 'Other'];
const DATING_INTENTIONS = ['Long-term relationship', 'Short-term relationship', 'Casual dating', 'Friendship', 'Marriage', 'Not sure yet'];
const RELATIONSHIP_TYPES = ['Monogamous', 'Non-monogamous', 'Polyamorous', 'Open relationship', 'Not sure yet'];
const DRINKING_FREQUENCY = ['Never', 'Rarely', 'Socially', 'Often', 'Very often'];
const DRUGS_FREQUENCY = ['Never', 'Rarely', 'Socially', 'Often', 'Very often'];

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
    const user = useSupabaseUser();
    useRegisterPushToken(user?.id);

    // All useState and other hooks must be declared before any return
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [images, setImages] = useState<(string | null)[]>(Array(8).fill(null));
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
    const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [gender, setGender] = useState('');
    const [sexuality, setSexuality] = useState('');
    const [age, setAge] = useState('');

    const [religion, setReligion] = useState('');
    const [politics, setPolitics] = useState('');
    const [height, setHeight] = useState('');
    const [datingIntentions, setDatingIntentions] = useState('');
    const [relationshipType, setRelationshipType] = useState('');
    const [drinkingFrequency, setDrinkingFrequency] = useState('');
    const [drugsFrequency, setDrugsFrequency] = useState('');

    // Location state
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [distancePreference, setDistancePreference] = useState<number>(25); // Default 25 miles
    const [anyDistance, setAnyDistance] = useState<boolean>(false); // New checkbox for any distance
    const [locationPermission, setLocationPermission] = useState<boolean>(false);

    // Deal breaker state - moved to top with other hooks


    // Add validation state
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Location functions
    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            setLocationPermission(true);
            return true;
        } else {
            Alert.alert('Location Permission', 'Location access is needed to find nearby matches.');
            return false;
        }
    };

    const getCurrentLocation = async () => {
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) return;

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setLatitude(location.coords.latitude);
            setLongitude(location.coords.longitude);

            // Reverse geocode to get city and state
            const geocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (geocode.length > 0) {
                const address = geocode[0];
                setCity(address.city || '');
                setState(address.region || '');
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Location Error', 'Could not get your current location. You can enter it manually.');
        }
    };

    if (user === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }



    const handleAddImage = async (index: number) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
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

    // Validation function
    const validateProfile = () => {
        const errors: string[] = [];

        if (!name.trim()) errors.push('Name is required');
        if (!bio.trim()) errors.push('Bio is required');
        if (!gender) errors.push('Gender is required');
        if (!age || parseInt(age) < 18 || parseInt(age) > 100) errors.push('Valid age (18-100) is required');
        if (!height) errors.push('Height is required');
        if (!images.some(img => img)) errors.push('At least one photo is required');
        if (selectedPrompts.length === 0) errors.push('Please select at least one prompt');

        // Location validation (optional but recommended)
        if (!latitude || !longitude) {
            errors.push('Please enable location access to find nearby matches');
        }

        // Check if all selected prompts have answers
        const unansweredPrompts = selectedPrompts.filter(prompt => !promptAnswers[prompt]?.trim());
        if (unansweredPrompts.length > 0) {
            errors.push('Please answer all selected prompts');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSave = async () => {
        // Validate before saving
        if (!validateProfile()) {
            Alert.alert('Please complete your profile', validationErrors.join('\n'));
            return;
        }

        setLoading(true);
        if (!user) return;

        // Upload all images and create photos array
        const photos: { id: string; url: string; order: number; is_primary: boolean }[] = [];
        let firstPhotoUrl = 'default-avatar.svg';

        for (let i = 0; i < images.length; i++) {
            const imageUri = images[i];
            if (imageUri) {
                try {
                    const fileName = `photo-${i}-${Date.now()}.jpg`;
                    const blob = await (await fetch(imageUri)).blob();
                    const { data, error } = await supabase.storage
                        .from('avatars')
                        .upload(`${user.id}/${fileName}`, blob, { upsert: true });

                    if (!error && data) {
                        const photoUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
                        photos.push({
                            id: `photo-${i}`,
                            url: photoUrl,
                            order: i,
                            is_primary: i === 0 // First photo is primary
                        });

                        // Set first photo as avatar_url
                        if (i === 0) {
                            firstPhotoUrl = photoUrl;
                        }
                    }
                } catch (error) {
                    console.error(`Error uploading photo ${i}:`, error);
                }
            }
        }



        const profileData: Profile = {
            id: user.id,
            user_id: user.id,
            name,
            bio,
            gender,
            age: age ? parseInt(age) || 0 : 0,

            religion,
            politics,
            height,
            dating_intentions: datingIntentions || undefined,
            relationship_type: relationshipType || undefined,
            drinking_frequency: drinkingFrequency || undefined,
            drugs_frequency: drugsFrequency || undefined,
            // Location data
            latitude: latitude || undefined,
            longitude: longitude || undefined,
            city: city || undefined,
            state: state || undefined,
            distance_preference: anyDistance ? 999 : distancePreference, // Use 999 for "any distance"

            photos: photos.length > 0 ? photos : undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase.from('profiles').upsert(profileData);
        if (!updateError) router.push('/main/Availability');
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/auth/Login');
    };

    // Reusable select row component
    const SelectRow = ({
        label,
        value,
        options,
        onSelect,
        placeholder = 'Select...',
        style = {},
    }: {
        label: string;
        value: string;
        options: string[];
        onSelect: (val: string) => void;
        placeholder?: string;
        style?: any;
    }) => {
        const [modalVisible, setModalVisible] = useState(false);
        return (
            <>
                <Pressable style={[styles.selectRow, style]} onPress={() => setModalVisible(true)}>
                    <Text style={styles.selectRowLabel}>{label}</Text>
                    <View style={styles.selectRowValueWrap}>
                        <Text style={[styles.selectRowValue, !value && styles.selectRowPlaceholder]}>{value || placeholder}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#bbb" style={{ marginLeft: 4 }} />
                    </View>
                </Pressable>
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setModalVisible(false)}
                >
                    <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        {options.map((opt: string) => (
                            <Pressable
                                key={opt}
                                style={styles.modalOption}
                                onPress={() => {
                                    onSelect(opt);
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalOptionText}>{opt}</Text>
                                {value === opt && <Ionicons name="checkmark" size={18} color="#007AFF" />}
                            </Pressable>
                        ))}
                        <Pressable style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </Modal>
            </>
        );
    };





    // Helper function to check if a field has an error
    const hasError = (fieldName: string) => {
        return validationErrors.some(error => error.toLowerCase().includes(fieldName.toLowerCase()));
    };

    // Enhanced input style with error state
    const getInputStyle = (fieldName: string) => {
        return [
            styles.input,
            hasError(fieldName) && styles.inputError
        ];
    };

    // Enhanced field card style with error state
    const getFieldCardStyle = (fieldName: string) => {
        return [
            styles.fieldCard,
            hasError(fieldName) && styles.fieldCardError
        ];
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Set up your profile 🍐</Text>

            <TextInput
                placeholder="Your name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
                style={getInputStyle('name')}
            />
            <TextInput
                placeholder="Bio / Fun Fact"
                placeholderTextColor="#888"
                value={bio}
                onChangeText={setBio}
                multiline
                style={getInputStyle('bio')}
            />

            <Text style={styles.sectionTitle}>Your Photos</Text>
            <View style={styles.photoGrid}>
                {images.map((uri, idx) => (
                    <TouchableOpacity
                        key={idx}
                        onPress={() => handleAddImage(idx)}
                        style={[
                            styles.imageSlot,
                            idx === 0 && styles.firstImageSlot // Make first photo bigger
                        ]}
                    >
                        {uri ? (
                            <Image source={{ uri }} style={styles.thumbnail} />
                        ) : (
                            <Text style={styles.plus}>＋</Text>
                        )}
                        {idx === 0 && (
                            <View style={styles.primaryPhotoBadge}>
                                <Text style={styles.primaryPhotoText}>Primary</Text>
                            </View>
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

            {/* About Me Section */}
            <Text style={styles.sectionTitle}>About Me</Text>

            {/* Gender */}
            <View style={getFieldCardStyle('gender')}>
                <SelectRow
                    label="Gender"
                    value={gender}
                    options={GENDERS}
                    onSelect={setGender}
                    placeholder="Select gender..."
                />
            </View>

            {/* Sexuality */}
            <View style={getFieldCardStyle('sexuality')}>
                <SelectRow
                    label="Sexuality"
                    value={sexuality}
                    options={SEXUALITIES}
                    onSelect={setSexuality}
                    placeholder="Select sexuality..."
                />
            </View>

            {/* Age */}
            <View style={getFieldCardStyle('age')}>
                <Text style={styles.fieldLabel}>Age</Text>
                <TextInput
                    placeholder="Your age"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                    style={getInputStyle('age')}
                />

            </View>

            {/* Height */}
            <View style={getFieldCardStyle('height')}>
                <SelectRow
                    label="Height"
                    value={height}
                    options={HEIGHTS}
                    onSelect={setHeight}
                    placeholder="Select height..."
                />
            </View>

            {/* Religion */}
            <View style={getFieldCardStyle('religion')}>
                <SelectRow
                    label="Religion"
                    value={religion}
                    options={RELIGIONS}
                    onSelect={setReligion}
                    placeholder="Select religion..."
                />
            </View>

            {/* Politics */}
            <View style={getFieldCardStyle('politics')}>
                <SelectRow
                    label="Politics"
                    value={politics}
                    options={POLITICS}
                    onSelect={setPolitics}
                    placeholder="Select political leaning..."
                />
            </View>

            {/* Dating Intentions */}
            <View style={getFieldCardStyle('datingIntentions')}>
                <SelectRow
                    label="Dating Intentions"
                    value={datingIntentions}
                    options={DATING_INTENTIONS}
                    onSelect={setDatingIntentions}
                    placeholder="What are you looking for?"
                />
            </View>

            {/* Relationship Type */}
            <View style={getFieldCardStyle('relationshipType')}>
                <SelectRow
                    label="Relationship Type"
                    value={relationshipType}
                    options={RELATIONSHIP_TYPES}
                    onSelect={setRelationshipType}
                    placeholder="What type of relationship?"
                />
            </View>

            {/* Drinking Frequency */}
            <View style={getFieldCardStyle('drinkingFrequency')}>
                <SelectRow
                    label="Drinking Frequency"
                    value={drinkingFrequency}
                    options={DRINKING_FREQUENCY}
                    onSelect={setDrinkingFrequency}
                    placeholder="How often do you drink?"
                />
            </View>

            {/* Drugs Frequency */}
            <View style={getFieldCardStyle('drugsFrequency')}>
                <SelectRow
                    label="Drugs Frequency"
                    value={drugsFrequency}
                    options={DRUGS_FREQUENCY}
                    onSelect={setDrugsFrequency}
                    placeholder="How often do you use drugs?"
                />
            </View>

            {/* Location Section */}
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.sectionSubtitle}>Help us find nearby matches</Text>

            {/* Current Location */}
            <View style={getFieldCardStyle('location')}>
                <Text style={styles.fieldLabel}>Current Location</Text>
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={getCurrentLocation}
                >
                    <Ionicons name="location" size={20} color="#00C48C" />
                    <Text style={styles.locationButtonText}>
                        {latitude && longitude ? 'Location Updated' : 'Get Current Location'}
                    </Text>
                </TouchableOpacity>
                {latitude && longitude && (
                    <Text style={styles.locationText}>
                        📍 {city && state ? `${city}, ${state}` : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
                    </Text>
                )}
            </View>

            {/* Distance Preference */}
            <View style={getFieldCardStyle('distancePreference')}>
                <Text style={styles.fieldLabel}>Distance Preference</Text>
                <View style={styles.distanceValueRow}>
                    <Text style={styles.distanceValue}>{anyDistance ? 'Any Distance' : `${distancePreference.toFixed(1)} miles`}</Text>
                    <TouchableOpacity
                        style={styles.anyDistanceButton}
                        onPress={() => setAnyDistance(!anyDistance)}
                    >
                        <View style={styles.checkboxContainer}>
                            <Ionicons
                                name={anyDistance ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color="#00C48C"
                            />
                            <Text style={styles.checkboxLabel}>Any distance</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {!anyDistance && (
                    <Slider
                        style={styles.distanceSlider}
                        minimumValue={1}
                        maximumValue={100}
                        value={distancePreference}
                        onValueChange={(val) => setDistancePreference(Math.round(val * 10) / 10)}
                        minimumTrackTintColor="#00C48C"
                        maximumTrackTintColor="#E0E0E0"
                        step={0.1}
                    />
                )}
                <Text style={styles.dealBreakerDesc}>
                    {anyDistance ? 'Show me people from anywhere' : 'Show me people within this distance'}
                </Text>
            </View>



            <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>
                    {loading ? 'Saving...' : 'Save Profile'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    bioInput: {
        height: 80,
    },
    container: {
        backgroundColor: '#fff',
        padding: 24,
        paddingBottom: 60,
    },
    header: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        marginTop: 40,
        textAlign: 'center',
    },
    imageSlot: {
        alignItems: 'center',
        height: 120, // Set specific height to control size
        backgroundColor: '#eee',
        borderRadius: 10,
        justifyContent: 'center',
        marginBottom: 4,
        width: '48%', // Make them larger to fill the row better
        position: 'relative',
        overflow: 'hidden', // Crop any overflow
    },
    firstImageSlot: {
        width: '48%', // Make first photo larger but not full width
        height: 120, // Same height as others
        marginBottom: 4,
        overflow: 'hidden', // Crop any overflow
    },
    primaryPhotoBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#00C48C',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    primaryPhotoText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderColor: '#ccc',
        borderRadius: 10,
        borderWidth: 1,
        color: '#000',
        fontSize: 16,
        marginBottom: 12,
        padding: 12,
    },
    inputError: {
        borderColor: '#d00',
        borderWidth: 2,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 4,
        overflow: 'hidden',
    },
    plus: {
        color: '#999',
        fontSize: 32,
    },
    promptBlock: {
        marginBottom: 16,
    },
    promptChip: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    promptChipSelected: {
        backgroundColor: '#00C48C',
        borderColor: '#00C48C',
    },
    promptLabel: {
        color: '#444',
        fontWeight: '500',
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 12,
        marginTop: 20,
    },
    thumbnail: {
        borderRadius: 10,
        height: '100%',
        width: '100%',
        resizeMode: 'cover', // This will crop the image to fill the container
    },
    dealBreakerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    fieldCard: {
        backgroundColor: '#fafbfc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 16,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    fieldCardError: {
        borderColor: '#d00',
        borderWidth: 2,
    },
    pickerCompact: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderRadius: 8,
        borderWidth: 1,
        color: '#333',
        fontSize: 16,
        height: 50,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    dealBreakerLabel: {
        fontSize: 15,
        color: '#444',
    },
    dealBreakerDesc: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
        marginBottom: 0,
    },
    rangeSliderContainer: {
        marginVertical: 10,
    },
    rangeSliderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    rangeSliderButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    rangeSliderButton: {
        backgroundColor: '#00C48C',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rangeSliderButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    rangeSliderButtonDisabled: {
        backgroundColor: '#ccc',
    },
    rangeSliderButtonTextDisabled: {
        color: '#999',
    },
    rangeSliderValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00C48C',
    },
    rangeSliderTrack: {
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        position: 'relative',
        marginBottom: 8,
    },
    rangeSliderFill: {
        position: 'absolute',
        height: 4,
        backgroundColor: '#007AFF',
        borderRadius: 2,
        top: 0,
    },
    rangeSlider: {
        position: 'absolute',
        width: '100%',
        height: 50, // Increased touch area
        top: -23, // Adjusted for larger touch area
    },
    rangeSliderOverlay: {
        zIndex: 1,
    },
    rangeSliderThumb: {
        backgroundColor: '#007AFF',
        width: 24, // Larger thumb
        height: 24, // Larger thumb
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    rangeSliderTrackStyle: {
        height: 4,
        borderRadius: 2,
    },
    rangeSliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    rangeSliderLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    selectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderColor: '#eee',
        backgroundColor: 'transparent',
    },
    selectRowLabel: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    selectRowValueWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectRowValue: {
        fontSize: 16,
        color: '#222',
    },
    selectRowPlaceholder: {
        color: '#aaa',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    modalSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 18,
        color: '#222',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#f2f2f2',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#222',
    },
    modalCancel: {
        marginTop: 18,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    dealBreakerChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dealBreakerChip: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    dealBreakerChipSelected: {
        backgroundColor: '#ffebee',
        borderColor: '#d00',
    },
    dealBreakerChipText: {
        fontSize: 14,
        color: '#666',
    },
    dealBreakerChipTextSelected: {
        color: '#d00',
        fontWeight: '500',
    },
    rangeSliderLabelActive: {
        color: '#007AFF',
        fontWeight: 'bold',
        transform: [{ scale: 1.1 }],
    },
    multiSliderContainer: {
        height: 40,
    },
    multiSliderTrack: {
        height: 4,
        borderRadius: 2,
    },
    multiSliderSelected: {
        backgroundColor: '#00C48C',
    },
    multiSliderUnselected: {
        backgroundColor: '#e0e0e0',
    },
    multiSliderMarker: {
        backgroundColor: '#00C48C',
        width: 20,
        height: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    multiSliderMarkerPressed: {
        backgroundColor: '#009973',
        transform: [{ scale: 1.2 }],
    },
    // Location styles
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginBottom: 8,
    },
    locationButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#00C48C',
        fontWeight: '500',
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    distanceValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#00C48C',
        textAlign: 'center',
        marginBottom: 8,
    },
    distanceSlider: {
        width: '100%',
        height: 40,
    },
    saveButton: {
        backgroundColor: '#00C48C',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    distanceValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    anyDistanceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#00C48C',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#00C48C',
        fontWeight: '500',
    },
});