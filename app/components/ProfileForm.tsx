import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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

interface ProfileFormProps {
    name: string;
    bio: string;
    age: string;
    gender: string;
    sexuality: string;
    height: string;
    religion: string;
    politics: string;
    datingIntentions: string;
    relationshipType: string;
    drinkingFrequency: string;
    drugsFrequency: string;
    onFieldChange: (field: string, value: string) => void;
    validationErrors: string[];
}

export default function ProfileForm({
    name,
    bio,
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
    onFieldChange,
    validationErrors,
}: ProfileFormProps) {
    const hasError = (fieldName: string) => validationErrors.includes(fieldName);

    const getInputStyle = (fieldName: string) => [
        styles.input,
        hasError(fieldName) && styles.inputError,
    ];

    const getFieldCardStyle = (fieldName: string) => [
        styles.fieldCard,
        hasError(fieldName) && styles.fieldCardError,
    ];

    const SelectRow = ({
        label,
        value,
        options,
        onSelect,
        placeholder = 'Select...',
        fieldName,
    }: {
        label: string;
        value: string;
        options: string[];
        onSelect: (val: string) => void;
        placeholder?: string;
        fieldName: string;
    }) => (
        <View style={getFieldCardStyle(fieldName)}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={value}
                    onValueChange={onSelect}
                    style={styles.picker}
                >
                    <Picker.Item label={placeholder} value="" />
                    {options.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                    ))}
                </Picker>
            </View>
            {hasError(fieldName) && (
                <Text style={styles.errorText}>This field is required</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Basic Information</Text>

            {/* Name */}
            <View style={getFieldCardStyle('name')}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                    style={getInputStyle('name')}
                    value={name}
                    onChangeText={(text) => onFieldChange('name', text)}
                    placeholder="Your name"
                    maxLength={50}
                />
                {hasError('name') && (
                    <Text style={styles.errorText}>Name is required</Text>
                )}
            </View>

            {/* Age */}
            <View style={getFieldCardStyle('age')}>
                <Text style={styles.label}>Age *</Text>
                <TextInput
                    style={getInputStyle('age')}
                    value={age}
                    onChangeText={(text) => onFieldChange('age', text.replace(/[^0-9]/g, ''))}
                    placeholder="Your age"
                    keyboardType="numeric"
                    maxLength={2}
                />
                {hasError('age') && (
                    <Text style={styles.errorText}>Age is required</Text>
                )}
            </View>

            {/* Bio */}
            <View style={getFieldCardStyle('bio')}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                    style={[getInputStyle('bio'), styles.bioInput]}
                    value={bio}
                    onChangeText={(text) => onFieldChange('bio', text)}
                    placeholder="Tell us about yourself..."
                    multiline
                    maxLength={500}
                    textAlignVertical="top"
                />
                <Text style={styles.charCount}>{bio.length}/500</Text>
            </View>

            {/* Gender */}
            <SelectRow
                label="Gender *"
                value={gender}
                options={GENDERS}
                onSelect={(val) => onFieldChange('gender', val)}
                fieldName="gender"
            />

            {/* Sexuality */}
            <SelectRow
                label="Sexuality"
                value={sexuality}
                options={SEXUALITIES}
                onSelect={(val) => onFieldChange('sexuality', val)}
                fieldName="sexuality"
            />

            {/* Height */}
            <SelectRow
                label="Height"
                value={height}
                options={HEIGHTS}
                onSelect={(val) => onFieldChange('height', val)}
                fieldName="height"
            />

            {/* Religion */}
            <SelectRow
                label="Religion"
                value={religion}
                options={RELIGIONS}
                onSelect={(val) => onFieldChange('religion', val)}
                fieldName="religion"
            />

            {/* Politics */}
            <SelectRow
                label="Politics"
                value={politics}
                options={POLITICS}
                onSelect={(val) => onFieldChange('politics', val)}
                fieldName="politics"
            />

            {/* Dating Intentions */}
            <SelectRow
                label="Dating Intentions"
                value={datingIntentions}
                options={DATING_INTENTIONS}
                onSelect={(val) => onFieldChange('datingIntentions', val)}
                fieldName="datingIntentions"
            />

            {/* Relationship Type */}
            <SelectRow
                label="Relationship Type"
                value={relationshipType}
                options={RELATIONSHIP_TYPES}
                onSelect={(val) => onFieldChange('relationshipType', val)}
                fieldName="relationshipType"
            />

            {/* Drinking Frequency */}
            <SelectRow
                label="Drinking Frequency"
                value={drinkingFrequency}
                options={DRINKING_FREQUENCY}
                onSelect={(val) => onFieldChange('drinkingFrequency', val)}
                fieldName="drinkingFrequency"
            />

            {/* Drugs Frequency */}
            <SelectRow
                label="Drugs Frequency"
                value={drugsFrequency}
                options={DRUGS_FREQUENCY}
                onSelect={(val) => onFieldChange('drugsFrequency', val)}
                fieldName="drugsFrequency"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 18,
        color: '#1A1A1A',
    },
    fieldCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    fieldCardError: {
        borderColor: '#FF6B6B',
        shadowColor: '#FF6B6B',
        shadowOpacity: 0.08,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1A1A1A',
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        marginBottom: 2,
    },
    inputError: {
        borderColor: '#FF6B6B',
    },
    bioInput: {
        minHeight: 100,
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    pickerContainer: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 2,
    },
    picker: {
        height: 50,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
    },
}); 