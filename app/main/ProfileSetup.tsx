
import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSupabaseUser } from '../../lib/hooks/useSupabaseUser';
import { useRegisterPushToken } from '../../lib/hooks/useRegisterPushToken';
import { useProfileSetup } from '../../lib/hooks/useProfileSetup';
import { colors } from '../../theme/colors';

// Import components
import ImageUploader from '../components/ImageUploader';
import ProfileForm from '../components/ProfileForm';
import LocationPicker from '../components/LocationPicker';
import PromptSelector from '../components/PromptSelector';

export default function ProfileSetup() {
    const user = useSupabaseUser();
    useRegisterPushToken(user?.id);

    // Custom hook for all profile setup logic
    const profileSetup = useProfileSetup();

    const handleSave = async () => {
        if (user?.id) {
            await profileSetup.handleSave(user.id);
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
                images={profileSetup.images}
                onImagesChange={profileSetup.setImages}
                maxImages={8}
            />

            {/* Basic Information */}
            <ProfileForm
                name={profileSetup.name}
                bio={profileSetup.bio}
                age={profileSetup.age}
                gender={profileSetup.gender}
                sexuality={profileSetup.sexuality}
                height={profileSetup.height}
                religion={profileSetup.religion}
                politics={profileSetup.politics}
                datingIntentions={profileSetup.datingIntentions}
                relationshipType={profileSetup.relationshipType}
                drinkingFrequency={profileSetup.drinkingFrequency}
                drugsFrequency={profileSetup.drugsFrequency}
                onFieldChange={profileSetup.handleFieldChange}
                validationErrors={profileSetup.validationErrors}
            />

            {/* Location */}
            <LocationPicker
                latitude={profileSetup.latitude}
                longitude={profileSetup.longitude}
                city={profileSetup.city}
                state={profileSetup.state}
                distancePreference={profileSetup.distancePreference}
                anyDistance={profileSetup.anyDistance}
                locationPermission={profileSetup.locationPermission}
                onLocationChange={profileSetup.handleLocationChange}
                onDistanceChange={profileSetup.setDistancePreference}
                onAnyDistanceChange={profileSetup.setAnyDistance}
                onPermissionChange={profileSetup.setLocationPermission}
            />

            {/* Prompts */}
            <PromptSelector
                selectedPrompts={profileSetup.selectedPrompts}
                promptAnswers={profileSetup.promptAnswers}
                onPromptsChange={profileSetup.setSelectedPrompts}
                onAnswersChange={profileSetup.setPromptAnswers}
                maxPrompts={3}
            />

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.saveButton, profileSetup.loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={profileSetup.loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.saveButtonText}>
                        {profileSetup.loading ? 'Saving...' : 'Save Profile'}
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