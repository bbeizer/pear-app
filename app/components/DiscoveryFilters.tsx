import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { colors } from '../../theme/colors';

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Other'];
const RELIGIONS = ['None', 'Christian', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 'Spiritual', 'Other'];
const POLITICS = ['Liberal', 'Moderate', 'Conservative', 'Other'];
const HEIGHTS = ['4\'0"', '4\'1"', '4\'2"', '4\'3"', '4\'4"', '4\'5"', '4\'6"', '4\'7"', '4\'8"', '4\'9"', '4\'10"', '4\'11"', '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"', '6\'5"', '6\'6"', '6\'7"', '6\'8"', '6\'9"', '6\'10"', '6\'11"', '7\'0"'];
const DATING_INTENTIONS = ['Long-term relationship', 'Short-term relationship', 'Casual dating', 'Friendship', 'Marriage', 'Not sure yet'];
const RELATIONSHIP_TYPES = ['Monogamous', 'Non-monogamous', 'Polyamorous', 'Open relationship', 'Not sure yet'];
const DRINKING_FREQUENCY = ['Never', 'Rarely', 'Socially', 'Often', 'Very often'];
const DRUGS_FREQUENCY = ['Never', 'Rarely', 'Socially', 'Often', 'Very often'];

interface DiscoveryFiltersProps {
    ageRange: [number, number];
    distancePreference: number;
    genderPreference: string[];
    religionDealBreakers: string[];
    politicsDealBreakers: string[];
    heightRange: [number, number];
    datingIntentions: string[];
    relationshipTypes: string[];
    drinkingDealBreakers: string[];
    drugsDealBreakers: string[];
    onAgeRangeChange: (range: [number, number]) => void;
    onDistanceChange: (distance: number) => void;
    onGenderPreferenceChange: (genders: string[]) => void;
    onReligionDealBreakersChange: (religions: string[]) => void;
    onPoliticsDealBreakersChange: (politics: string[]) => void;
    onHeightRangeChange: (range: [number, number]) => void;
    onDatingIntentionsChange: (intentions: string[]) => void;
    onRelationshipTypesChange: (types: string[]) => void;
    onDrinkingDealBreakersChange: (drinking: string[]) => void;
    onDrugsDealBreakersChange: (drugs: string[]) => void;
    onApplyFilters: () => void;
    onClose: () => void;
    profileCount: number;
}

export default function DiscoveryFilters({
    ageRange,
    distancePreference,
    genderPreference,
    religionDealBreakers,
    politicsDealBreakers,
    heightRange,
    datingIntentions,
    relationshipTypes,
    drinkingDealBreakers,
    drugsDealBreakers,
    onAgeRangeChange,
    onDistanceChange,
    onGenderPreferenceChange,
    onReligionDealBreakersChange,
    onPoliticsDealBreakersChange,
    onHeightRangeChange,
    onDatingIntentionsChange,
    onRelationshipTypesChange,
    onDrinkingDealBreakersChange,
    onDrugsDealBreakersChange,
    onApplyFilters,
    onClose,
    profileCount,
}: DiscoveryFiltersProps) {
    const toggleArrayItem = (
        array: string[],
        item: string,
        onChange: (newArray: string[]) => void
    ) => {
        if (array.includes(item)) {
            onChange(array.filter(i => i !== item));
        } else {
            onChange([...array, item]);
        }
    };

    const renderChipSelector = (
        title: string,
        description: string,
        options: string[],
        selected: string[],
        onToggle: (item: string) => void
    ) => (
        <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>{title}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
            <View style={styles.chipContainer}>
                {options.map(option => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.chip,
                            selected.includes(option) && styles.chipSelected
                        ]}
                        onPress={() => onToggle(option)}
                    >
                        <Text style={[
                            styles.chipText,
                            selected.includes(option) && styles.chipTextSelected
                        ]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={onClose}
        >
            <View style={styles.modalContent}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={true}
                >
                    <Text style={styles.modalTitle}>Discovery Settings</Text>
                    {/* Debug: Show current filter count */}
                    <View style={styles.settingSection}>
                        <Text style={styles.settingLabel}>Current Filters Active</Text>
                        <Text style={styles.debugText}>
                            Age: {ageRange[0]}-{ageRange[1]} |
                            Distance: {distancePreference.toFixed(1)} miles |
                            Gender: {genderPreference.length > 0 ? genderPreference.join(', ') : 'Any'} |
                            Religion Deal-breakers: {religionDealBreakers.length} |
                            Politics Deal-breakers: {politicsDealBreakers.length}
                        </Text>
                        <TouchableOpacity
                            style={styles.applyFiltersButton}
                            onPress={onApplyFilters}
                        >
                            <Text style={styles.applyFiltersText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Age Range */}
                    <View style={styles.settingSection}>
                        <Text style={styles.settingLabel}>Age Range</Text>
                        <View style={styles.rangeSliderRow}>
                            <Text style={styles.rangeSliderLabel}>Min: {ageRange[0]}</Text>
                            <Text style={styles.rangeSliderLabel}>Max: {ageRange[1]}</Text>
                        </View>
                        <MultiSlider
                            values={ageRange}
                            min={18}
                            max={99}
                            step={1}
                            onValuesChange={(values) => onAgeRangeChange([values[0], values[1]])}
                            selectedStyle={{
                                backgroundColor: colors.primaryGreen,
                            }}
                            unselectedStyle={{ backgroundColor: '#E0E0E0' }}
                            containerStyle={{ height: 40 }}
                            trackStyle={{ height: 4, borderRadius: 2 }}
                            markerStyle={{
                                backgroundColor: colors.primaryGreen, width: 20, height: 20, borderRadius: 10
                            }}
                            pressedMarkerStyle={{ backgroundColor: '#009973', transform: [{ scale: 1.2 }] }}
                        />
                    </View>

                    {/* Distance */}
                    <View style={styles.settingSection}>
                        <Text style={styles.settingLabel}>Distance</Text>
                        <View style={styles.distanceValueRow}>
                            <Text style={styles.distanceValue}>{distancePreference.toFixed(1)} miles</Text>
                        </View>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={1}
                            maximumValue={100}
                            value={distancePreference}
                            onValueChange={(val) => onDistanceChange(Math.round(val * 10) / 10)}
                            minimumTrackTintColor={colors.primaryGreen}
                            maximumTrackTintColor="#E0E0E0"
                            step={0.1}
                        />
                        <Text style={styles.settingDescription}>
                            Only show me people within this distance
                        </Text>
                    </View>

                    {/* Gender Preference */}
                    {renderChipSelector(
                        'Gender Preference',
                        'Leave empty to see all genders',
                        GENDERS,
                        genderPreference,
                        (gender) => toggleArrayItem(genderPreference, gender, onGenderPreferenceChange)
                    )}

                    {/* Religion Deal Breakers */}
                    {renderChipSelector(
                        'Religion Deal Breakers',
                        'Select religions you don\'t want to see',
                        RELIGIONS,
                        religionDealBreakers,
                        (religion) => toggleArrayItem(religionDealBreakers, religion, onReligionDealBreakersChange)
                    )}

                    {/* Politics Deal Breakers */}
                    {renderChipSelector(
                        'Politics Deal Breakers',
                        'Select political views you don\'t want to see',
                        POLITICS,
                        politicsDealBreakers,
                        (politics) => toggleArrayItem(politicsDealBreakers, politics, onPoliticsDealBreakersChange)
                    )}

                    {/* Height Range */}
                    <View style={styles.settingSection}>
                        <Text style={styles.settingLabel}>Height Range</Text>
                        <View style={styles.rangeSliderRow}>
                            <Text style={styles.rangeSliderLabel}>Min: {HEIGHTS[heightRange[0]]}</Text>
                            <Text style={styles.rangeSliderLabel}>Max: {HEIGHTS[heightRange[1]]}</Text>
                        </View>
                        <MultiSlider
                            values={heightRange}
                            min={0}
                            max={35}
                            step={1}
                            onValuesChange={(values) => onHeightRangeChange([values[0], values[1]])}
                            selectedStyle={{
                                backgroundColor: colors.primaryGreen,
                            }}
                            unselectedStyle={{ backgroundColor: '#E0E0E0' }}
                            containerStyle={{ height: 40 }}
                            trackStyle={{ height: 4, borderRadius: 2 }}
                            markerStyle={{
                                backgroundColor: colors.primaryGreen, width: 20, height: 20, borderRadius: 10
                            }}
                            pressedMarkerStyle={{ backgroundColor: '#009973', transform: [{ scale: 1.2 }] }}
                        />
                    </View>

                    {/* Dating Intentions */}
                    {renderChipSelector(
                        'Dating Intentions',
                        'Select what you\'re looking for',
                        DATING_INTENTIONS,
                        datingIntentions,
                        (intention) => toggleArrayItem(datingIntentions, intention, onDatingIntentionsChange)
                    )}

                    {/* Relationship Types */}
                    {renderChipSelector(
                        'Relationship Types',
                        'Select relationship types you\'re open to',
                        RELATIONSHIP_TYPES,
                        relationshipTypes,
                        (type) => toggleArrayItem(relationshipTypes, type, onRelationshipTypesChange)
                    )}

                    {/* Drinking Deal Breakers */}
                    {renderChipSelector(
                        'Drinking Deal Breakers',
                        'Select drinking habits you don\'t want to see',
                        DRINKING_FREQUENCY,
                        drinkingDealBreakers,
                        (drinking) => toggleArrayItem(drinkingDealBreakers, drinking, onDrinkingDealBreakersChange)
                    )}

                    {/* Drugs Deal Breakers */}
                    {renderChipSelector(
                        'Drugs Deal Breakers',
                        'Select drug habits you don\'t want to see',
                        DRUGS_FREQUENCY,
                        drugsDealBreakers,
                        (drugs) => toggleArrayItem(drugsDealBreakers, drugs, onDrugsDealBreakersChange)
                    )}
                </ScrollView>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '95%',
        maxHeight: '90%',
        padding: 20,
        flex: 1,
        justifyContent: 'flex-start',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1A1A1A',
    },
    settingSection: {
        marginBottom: 24,
    },
    settingLabel: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1A1A1A',
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    debugText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
        fontFamily: 'monospace',
    },
    applyFiltersButton: {
        backgroundColor: colors.primaryGreen,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyFiltersText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    rangeSliderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    rangeSliderLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    distanceValueRow: {
        alignItems: 'center',
        marginBottom: 8,
    },
    distanceValue: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primaryGreen,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    chipSelected: {
        backgroundColor: colors.primaryGreen,
        borderColor: colors.primaryGreen,
    },
    chipText: {
        fontSize: 14,
        color: '#666',
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
}); 