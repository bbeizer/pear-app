import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, Button, Image, TouchableOpacity,
    StyleSheet, ScrollView, FlatList, Alert,
    Switch,
    Modal, Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
const RELIGIONS = ['None', 'Christian', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 'Spiritual', 'Other'];
const POLITICS = ['Liberal', 'Moderate', 'Conservative', 'Other'];
const HEIGHTS = ['4\'0"', '4\'1"', '4\'2"', '4\'3"', '4\'4"', '4\'5"', '4\'6"', '4\'7"', '4\'8"', '4\'9"', '4\'10"', '4\'11"', '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"', '6\'5"', '6\'6"', '6\'7"', '6\'8"', '6\'9"', '6\'10"', '6\'11"', '7\'0"'];


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
    const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
    const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [gender, setGender] = useState('');
    const [sexuality, setSexuality] = useState('');
    const [age, setAge] = useState('');
    const [ageRange, setAgeRange] = useState<[number, number]>([18, 99]);
    const [religion, setReligion] = useState('');
    const [politics, setPolitics] = useState('');
    const [height, setHeight] = useState('');

    // Deal breaker state - moved to top with other hooks
    const [genderDealBreakers, setGenderDealBreakers] = useState<string[]>([]);
    const [ageRangeDealBreaker, setAgeRangeDealBreaker] = useState<[number, number]>([18, 99]);
    const [religionDealBreakers, setReligionDealBreakers] = useState<string[]>([]);
    const [politicsDealBreakers, setPoliticsDealBreakers] = useState<string[]>([]);
    const [heightRangeDealBreaker, setHeightRangeDealBreaker] = useState<[number, number]>([0, HEIGHTS.length - 1]);

    // Add validation state
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    if (user === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    // Helper functions
    const toggleDealBreaker = (option: string, currentBreakers: string[], setBreakers: (breakers: string[]) => void) => {
        if (currentBreakers.includes(option)) {
            setBreakers(currentBreakers.filter(b => b !== option));
        } else {
            setBreakers([...currentBreakers, option]);
        }
    };

    // Get sexuality deal breaker options based on user's sexuality and gender
    const getSexualityDealBreakerOptions = () => {
        if (!gender || !sexuality) return [];

        // If straight, only show opposite gender
        if (sexuality === 'Straight') {
            return gender === 'Man' ? ['Man'] : ['Woman'];
        }
        // If gay, only show same gender
        if (sexuality === 'Gay') {
            return gender === 'Man' ? ['Woman'] : ['Man'];
        }
        // If lesbian, only show women
        if (sexuality === 'Lesbian') {
            return ['Man'];
        }
        // For bisexual, asexual, queer, other - no restrictions
        return [];
    };

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

    // Validation function
    const validateProfile = () => {
        const errors: string[] = [];

        if (!name.trim()) errors.push('Name is required');
        if (!bio.trim()) errors.push('Bio is required');
        if (!gender) errors.push('Gender is required');
        if (!sexuality) errors.push('Sexuality is required');
        if (!age || parseInt(age) < 18 || parseInt(age) > 100) errors.push('Valid age (18-100) is required');
        if (!height) errors.push('Height is required');
        if (!images.some(img => img)) errors.push('At least one photo is required');
        if (selectedPrompts.length === 0) errors.push('Please select at least one prompt');

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
                    }
                } catch (error) {
                    console.error(`Error uploading photo ${i}:`, error);
                }
            }
        }

        // Use first photo as avatar_url for backward compatibility
        const avatarUrl = photos.length > 0 ? photos[0].url : 'default-avatar.svg';

        const dealBreakers = {
            gender: genderDealBreakers.length > 0 ? genderDealBreakers : undefined,
            sexuality: getSexualityDealBreakerOptions().length > 0 ? getSexualityDealBreakerOptions() : undefined,
            ageRange: ageRangeDealBreaker,
            religion: religionDealBreakers.length > 0 ? religionDealBreakers : undefined,
            politics: politicsDealBreakers.length > 0 ? politicsDealBreakers : undefined,
            heightRange: heightRangeDealBreaker,
        };

        const profileData: Profile = {
            id: user.id,
            name,
            bio,
            gender,
            sexuality,
            age: age ? parseInt(age) : undefined,
            age_range_min: ageRange[0],
            age_range_max: ageRange[1],
            religion,
            politics,
            height,
            dealBreakers,
            avatar_url: avatarUrl,
            photos: photos.length > 0 ? photos : undefined,
            prompts: selectedPrompts.map(p => ({
                question: p,
                answer: promptAnswers[p] || '',
            })),
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

    // Improved range slider using multi-slider
    const RangeSlider = ({
        min,
        max,
        value,
        onValueChange,
        style = {}
    }: {
        min: number;
        max: number;
        value: [number, number];
        onValueChange: (value: [number, number]) => void;
        style?: any;
    }) => {
        return (
            <View style={[styles.rangeSliderContainer, style]}>
                <MultiSlider
                    values={value}
                    min={min}
                    max={max}
                    step={1}
                    onValuesChange={(values) => onValueChange([values[0], values[1]])}
                    selectedStyle={styles.multiSliderSelected}
                    unselectedStyle={styles.multiSliderUnselected}
                    containerStyle={styles.multiSliderContainer}
                    trackStyle={styles.multiSliderTrack}
                    markerStyle={styles.multiSliderMarker}
                    pressedMarkerStyle={styles.multiSliderMarkerPressed}
                />
                <View style={styles.rangeSliderLabels}>
                    <Text style={styles.rangeSliderLabel}>{value[0]}</Text>
                    <Text style={styles.rangeSliderLabel}>{value[1]}</Text>
                </View>
            </View>
        );
    };

    // Height range slider for deal breakers
    const HeightRangeSlider = ({
        value,
        onValueChange,
        style = {}
    }: {
        value: [number, number];
        onValueChange: (value: [number, number]) => void;
        style?: any;
    }) => {
        return (
            <View style={[styles.rangeSliderContainer, style]}>
                <MultiSlider
                    values={value}
                    min={0}
                    max={HEIGHTS.length - 1}
                    step={1}
                    onValuesChange={(values) => onValueChange([values[0], values[1]])}
                    selectedStyle={styles.multiSliderSelected}
                    unselectedStyle={styles.multiSliderUnselected}
                    containerStyle={styles.multiSliderContainer}
                    trackStyle={styles.multiSliderTrack}
                    markerStyle={styles.multiSliderMarker}
                    pressedMarkerStyle={styles.multiSliderMarkerPressed}
                />
                <View style={styles.rangeSliderLabels}>
                    <Text style={styles.rangeSliderLabel}>{HEIGHTS[value[0]]}</Text>
                    <Text style={styles.rangeSliderLabel}>{HEIGHTS[value[1]]}</Text>
                </View>
            </View>
        );
    };

    // Deal breaker chip component
    const DealBreakerChip = ({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) => (
        <TouchableOpacity
            style={[styles.dealBreakerChip, selected && styles.dealBreakerChipSelected]}
            onPress={onToggle}
        >
            <Text style={[styles.dealBreakerChipText, selected && styles.dealBreakerChipTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );

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
                <Text style={styles.fieldLabel}>Preferred Age Range</Text>
                <RangeSlider
                    min={18}
                    max={99}
                    value={ageRange}
                    onValueChange={setAgeRange}
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

            {/* Deal Breakers Section */}
            <Text style={styles.sectionTitle}>Deal Breakers</Text>
            <Text style={styles.sectionSubtitle}>Select options you do NOT want to match with</Text>

            {/* Religion Deal Breakers */}
            <View style={getFieldCardStyle('religionDealBreakers')}>
                <Text style={styles.fieldLabel}>Religion</Text>
                <View style={styles.dealBreakerChipsContainer}>
                    {RELIGIONS.map(r => (
                        <DealBreakerChip
                            key={r}
                            label={r}
                            selected={religionDealBreakers.includes(r)}
                            onToggle={() => toggleDealBreaker(r, religionDealBreakers, setReligionDealBreakers)}
                        />
                    ))}
                </View>
            </View>

            {/* Politics Deal Breakers */}
            <View style={getFieldCardStyle('politicsDealBreakers')}>
                <Text style={styles.fieldLabel}>Politics</Text>
                <View style={styles.dealBreakerChipsContainer}>
                    {POLITICS.map(p => (
                        <DealBreakerChip
                            key={p}
                            label={p}
                            selected={politicsDealBreakers.includes(p)}
                            onToggle={() => toggleDealBreaker(p, politicsDealBreakers, setPoliticsDealBreakers)}
                        />
                    ))}
                </View>
            </View>

            {/* Height Deal Breakers */}
            <View style={getFieldCardStyle('heightRangeDealBreaker')}>
                <Text style={styles.fieldLabel}>Height Range</Text>
                <HeightRangeSlider
                    value={heightRangeDealBreaker}
                    onValueChange={setHeightRangeDealBreaker}
                />
                <Text style={styles.dealBreakerDesc}>Only show matches within this height range</Text>
            </View>

            <Button title={loading ? 'Saving...' : 'Save Profile'} onPress={handleSave} disabled={loading} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    bioInput: {
        height: 80,
    },
    container: {
        backgroundColor: '#fff',
        padding: 20,
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
        aspectRatio: 4 / 5,
        backgroundColor: '#eee',
        borderRadius: 10,
        justifyContent: 'center',
        marginBottom: 10,
        width: '30%',
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
        marginBottom: 20,
    },
    plus: {
        color: '#999',
        fontSize: 32,
    },
    promptBlock: {
        marginBottom: 16,
    },
    promptChip: {
        backgroundColor: '#eee',
        borderRadius: 20,
        marginRight: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    promptChipSelected: {
        backgroundColor: '#007AFF',
    },
    promptLabel: {
        color: '#444',
        fontWeight: '500',
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 24,
    },
    thumbnail: {
        borderRadius: 10,
        height: '100%',
        width: '100%',
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
});
