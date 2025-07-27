
import React, { useState } from 'react';
import {
    View, Text, Button, StyleSheet, ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'expo-router';
import { useSupabaseUser } from '../../lib/hooks/useSupabaseUser';
import { useRegisterPushToken } from '../../lib/hooks/useRegisterPushToken';
import type { Profile } from '../../types';
import { colors } from '../../theme/colors';

// Import our new components
import ImageUploader from '../components/ImageUploader';
import ProfileForm from '../components/ProfileForm';
import LocationPicker from '../components/LocationPicker';
import PromptSelector from '../components/PromptSelector';

export default function ProfileSetup() {
    const router = useRouter();
    const user = useSupabaseUser();
    useRegisterPushToken(user?.id);

    // Form state
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [images, setImages] = useState<(string | null)[]>(Array(8).fill(null));
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
    const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Profile fields
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [sexuality, setSexuality] = useState('');
    const [height, setHeight] = useState('');
    const [religion, setReligion] = useState('');
    const [politics, setPolitics] = useState('');
    const [datingIntentions, setDatingIntentions] = useState('');
    const [relationshipType, setRelationshipType] = useState('');
    const [drinkingFrequency, setDrinkingFrequency] = useState('');
    const [drugsFrequency, setDrugsFrequency] = useState('');

    // Location state
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [distancePreference, setDistancePreference] = useState<number>(25);
    const [anyDistance, setAnyDistance] = useState<boolean>(false);
    const [locationPermission, setLocationPermission] = useState<boolean>(false);

    // Validation
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const validateProfile = () => {
        const errors: string[] = [];

        if (!name.trim()) errors.push('name');
        if (!age.trim()) errors.push('age');
        if (!gender.trim()) errors.push('gender');
        if (images.every(img => !img)) errors.push('images');

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleFieldChange = (field: string, value: string) => {
        switch (field) {
            case 'name': setName(value); break;
            case 'bio': setBio(value); break;
            case 'age': setAge(value); break;
            case 'gender': setGender(value); break;
            case 'sexuality': setSexuality(value); break;
            case 'height': setHeight(value); break;
            case 'religion': setReligion(value); break;
            case 'politics': setPolitics(value); break;
            case 'datingIntentions': setDatingIntentions(value); break;
            case 'relationshipType': setRelationshipType(value); break;
            case 'drinkingFrequency': setDrinkingFrequency(value); break;
            case 'drugsFrequency': setDrugsFrequency(value); break;
        }
    };

    const handleLocationChange = (lat: number | null, lng: number | null, cityName: string, stateName: string) => {
        const roundedLat = lat ? parseFloat(lat.toFixed(4)) : null;
        const roundedLng = lng ? parseFloat(lng.toFixed(4)) : null;

        setLatitude(roundedLat);
        setLongitude(roundedLng);
        setCity(cityName);
        setState(stateName);
    };

    const handleSave = async () => {
        if (!validateProfile()) {
            Alert.alert('Missing Information', 'Please fill in all required fields and add at least one photo.');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not found. Please log in again.');
            return;
        }

        setLoading(true);

        try {
            // Upload images to Supabase storage
            const uploadedImageUrls: string[] = [];
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                if (image) {
                    const fileName = `${user.id}/image_${i}_${Date.now()}.jpg`;
                    const { data, error } = await supabase.storage
                        .from('profile-images')
                        .upload(fileName, {
                            uri: image,
                            type: 'image/jpeg',
                            name: fileName,
                        } as any);

                    if (error) {
                        console.error('Image upload error:', error);
                        Alert.alert('Error', 'Failed to upload image. Please try again.');
                        return;
                    }

                    const { data: urlData } = supabase.storage
                        .from('profile-images')
                        .getPublicUrl(fileName);

                    uploadedImageUrls.push(urlData.publicUrl);
                }
            }

            // Create profile object
            const profileData: Partial<Profile> = {
                id: user.id,
                user_id: user.id,
                name: name.trim(),
                bio: bio.trim(),
                age: parseInt(age),
                gender,
                height,
                religion,
                politics,
                dating_intentions: datingIntentions,
                relationship_type: relationshipType,
                drinking_frequency: drinkingFrequency,
                drugs_frequency: drugsFrequency,
                latitude: latitude || undefined,
                longitude: longitude || undefined,
                city,
                state,
                distance_preference: anyDistance ? undefined : distancePreference,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Insert or update profile
            const { error } = await supabase
                .from('profiles')
                .upsert(profileData, { onConflict: 'id' });

            if (error) {
                console.error('Profile save error:', error);
                Alert.alert('Error', 'Failed to save profile. Please try again.');
                return;
            }

            // Save prompts separately
            if (selectedPrompts.length > 0) {
                const promptData = selectedPrompts.map((prompt, index) => ({
                    profile_id: user.id,
                    question: prompt,
                    answer: promptAnswers[prompt] || '',
                    order_index: index,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }));

                const { error: promptError } = await supabase
                    .from('prompts')
                    .upsert(promptData, { onConflict: 'profile_id,question' });

                if (promptError) {
                    console.error('Prompt save error:', promptError);
                }
            }

            Alert.alert('Success! 🎉', 'Your profile has been saved successfully!', [
                {
                    text: 'Continue',
                    onPress: () => router.replace('/main/'),
                },
            ]);

        } catch (error) {
            console.error('Unexpected error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Create Your Profile</Text>
                <Text style={styles.subtitle}>
                    Tell us about yourself to find your perfect match
                </Text>
            </View>

            {/* Photos Section */}
            <ImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={8}
            />

            {/* Basic Information */}
            <ProfileForm
                name={name}
                bio={bio}
                age={age}
                gender={gender}
                sexuality={sexuality}
                height={height}
                religion={religion}
                politics={politics}
                datingIntentions={datingIntentions}
                relationshipType={relationshipType}
                drinkingFrequency={drinkingFrequency}
                drugsFrequency={drugsFrequency}
                onFieldChange={handleFieldChange}
                validationErrors={validationErrors}
            />

            {/* Location */}
            <LocationPicker
                latitude={latitude}
                longitude={longitude}
                city={city}
                state={state}
                distancePreference={distancePreference}
                anyDistance={anyDistance}
                locationPermission={locationPermission}
                onLocationChange={handleLocationChange}
                onDistanceChange={setDistancePreference}
                onAnyDistanceChange={setAnyDistance}
                onPermissionChange={setLocationPermission}
            />

            {/* Prompts */}
            <PromptSelector
                selectedPrompts={selectedPrompts}
                promptAnswers={promptAnswers}
                onPromptsChange={setSelectedPrompts}
                onAnswersChange={setPromptAnswers}
                maxPrompts={3}
            />

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? 'Saving...' : 'Save Profile'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    actions: {
        padding: 20,
        gap: 16,
    },
    saveButton: {
        backgroundColor: colors.primaryGreen,
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    saveButtonDisabled: {
        backgroundColor: '#b2e9d3',
    },
    saveButtonText: {
        backgroundColor: colors.primaryGreen,
        color: "white",
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    logoutContainer: {
        marginTop: 8,
    },
});