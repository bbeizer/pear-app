import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import { useRouter } from 'expo-router';
import type { Profile } from '../../types';

export function useProfileSetup() {
    const router = useRouter();

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

    const uploadImages = async (userId: string): Promise<string[]> => {
        const uploadedImageUrls: string[] = [];
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            if (image) {
                const fileName = `${userId}/image_${i}_${Date.now()}.jpg`;
                const { data, error } = await supabase.storage
                    .from('profile-images')
                    .upload(fileName, {
                        uri: image,
                        type: 'image/jpeg',
                        name: fileName,
                    } as any);

                if (error) {
                    console.error('Image upload error:', error);
                    throw new Error('Failed to upload image');
                }

                const { data: urlData } = supabase.storage
                    .from('profile-images')
                    .getPublicUrl(fileName);

                uploadedImageUrls.push(urlData.publicUrl);
            }
        }
        
        return uploadedImageUrls;
    };

    const saveProfile = async (userId: string): Promise<void> => {
        // Create profile object
        const profileData: Partial<Profile> = {
            id: userId,
            user_id: userId,
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
            throw new Error('Failed to save profile');
        }
    };

    const savePrompts = async (userId: string): Promise<void> => {
        if (selectedPrompts.length === 0) return;

        const promptData = selectedPrompts.map((prompt, index) => ({
            profile_id: userId,
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
            // Don't throw here as prompts are optional
        }
    };

    const handleSave = async (userId: string) => {
        if (!validateProfile()) {
            Alert.alert('Missing Information', 'Please fill in all required fields and add at least one photo.');
            return false;
        }

        if (!userId) {
            Alert.alert('Error', 'User not found. Please log in again.');
            return false;
        }

        setLoading(true);

        try {
            // Upload images
            await uploadImages(userId);
            
            // Save profile
            await saveProfile(userId);
            
            // Save prompts
            await savePrompts(userId);

            Alert.alert('Success! 🎉', 'Your profile has been saved successfully!', [
                {
                    text: 'Continue',
                    onPress: () => router.replace('/main/'),
                },
            ]);

            return true;
        } catch (error) {
            console.error('Unexpected error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        // Form state
        name,
        bio,
        images,
        selectedPrompts,
        promptAnswers,
        loading,
        
        // Profile fields
        age,
        gender,
        sexuality,
        height,
        religion,
        politics,
        datingIntentions,
        relationshipType,
        drinkingFrequency,
        drugsFrequency,
        
        // Location state
        latitude,
        longitude,
        city,
        state,
        distancePreference,
        anyDistance,
        locationPermission,
        
        // Validation
        validationErrors,
        
        // Actions
        setName,
        setBio,
        setImages,
        setSelectedPrompts,
        setPromptAnswers,
        setAge,
        setGender,
        setSexuality,
        setHeight,
        setReligion,
        setPolitics,
        setDatingIntentions,
        setRelationshipType,
        setDrinkingFrequency,
        setDrugsFrequency,
        setLatitude,
        setLongitude,
        setCity,
        setState,
        setDistancePreference,
        setAnyDistance,
        setLocationPermission,
        handleFieldChange,
        handleLocationChange,
        handleSave,
        validateProfile,
    };
} 