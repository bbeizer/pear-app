import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Marker, Circle } from 'react-native-maps';
import { colors } from '../../theme/colors';
import { venueClient } from '../../lib/venueClient';
import VenueSuggestions from './VenueSuggestions';
import type { Venue } from '../../lib/venueClient';

const { width, height } = Dimensions.get('window');

interface MapWithRadiusModalProps {
    visible: boolean;
    onClose: () => void;
    midpoint: { latitude: number; longitude: number };
    initialRadius?: number;
    onVenueSelect?: (venue: Venue) => void;
}

export default function MapWithRadiusModal({
    visible,
    onClose,
    midpoint,
    initialRadius = 1000, // in meters
    onVenueSelect,
}: MapWithRadiusModalProps) {
    const [radius, setRadius] = useState(initialRadius);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [showVenues, setShowVenues] = useState(false);

    // Debug logs
    console.log('🔴 MapWithRadiusModal render:', {
        visible,
        midpoint,
        hasOnVenueSelect: !!onVenueSelect,
        showVenues,
        venuesCount: venues.length
    });

    useEffect(() => {
        if (visible) {
            console.log('🔴 MapWithRadiusModal visible changed to true');
            setRadius(initialRadius);
            setVenues([]);
            setSelectedVenue(null);
            setShowVenues(false);
        }
    }, [visible]);

    const handleSearchVenues = async () => {
        setIsSearching(true);
        try {
            const response = await venueClient.getDateVenues(
                midpoint.latitude,
                midpoint.longitude,
                radius
            );

            // Combine all venue types and sort by rating
            const allVenues = [
                ...response.restaurants,
                ...response.cafes,
                ...response.bars,
                ...response.activities
            ].sort((a, b) => b.rating - a.rating);

            setVenues(allVenues);
            setShowVenues(true);
        } catch (error) {
            console.error('Error searching venues:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleVenueSelect = (venue: Venue) => {
        setSelectedVenue(venue);
        onVenueSelect?.(venue);
    };

    const handleConfirmVenue = () => {
        if (selectedVenue) {
            onVenueSelect?.(selectedVenue);
            onClose();
        }
    };

    console.log('🔴 About to render MapWithRadiusModal with visible:', visible);

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose a Spot</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                </View>

                {!showVenues ? (
                    <>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: midpoint.latitude,
                                longitude: midpoint.longitude,
                                latitudeDelta: 0.02,
                                longitudeDelta: 0.02,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: midpoint.latitude,
                                    longitude: midpoint.longitude,
                                }}
                                title="Midpoint"
                                description="Meeting point"
                            />
                            <Circle
                                center={{
                                    latitude: midpoint.latitude,
                                    longitude: midpoint.longitude,
                                }}
                                radius={radius}
                                strokeColor={colors.primaryGreen}
                                fillColor="rgba(76, 175, 80, 0.2)"
                            />
                        </MapView>

                        <View style={styles.controls}>
                            <Text style={styles.label}>Radius: {Math.round(radius)} meters</Text>
                            <Slider
                                style={{ width: '100%' }}
                                minimumValue={500}
                                maximumValue={5000}
                                step={100}
                                value={radius}
                                onValueChange={(val) => setRadius(val)}
                                minimumTrackTintColor={colors.primaryGreen}
                                maximumTrackTintColor="#ccc"
                            />

                            <TouchableOpacity
                                style={styles.searchButton}
                                onPress={handleSearchVenues}
                                disabled={isSearching}
                            >
                                {isSearching ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.searchButtonText}>Search This Area</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View style={styles.venuesContainer}>
                        <View style={styles.venuesHeader}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setShowVenues(false)}
                            >
                                <Text style={styles.backButtonText}>← Back to Map</Text>
                            </TouchableOpacity>
                            <Text style={styles.venuesTitle}>Venues Nearby</Text>
                        </View>

                        <VenueSuggestions
                            latitude={midpoint.latitude}
                            longitude={midpoint.longitude}
                            onVenueSelect={handleVenueSelect}
                            selectedVenue={selectedVenue}
                        />

                        {selectedVenue && (
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirmVenue}
                            >
                                <Text style={styles.confirmButtonText}>
                                    Confirm {selectedVenue.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        fontSize: 22,
        color: '#888',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    map: {
        width,
        height: height * 0.55,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    mapText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        padding: 20,
    },
    controls: {
        padding: 16,
        gap: 16,
    },
    label: {
        fontSize: 14,
        color: '#333',
    },
    searchButton: {
        backgroundColor: colors.primaryGreen,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    venuesContainer: {
        flex: 1,
    },
    venuesHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    backButton: {
        marginBottom: 8,
    },
    backButtonText: {
        color: colors.primaryGreen,
        fontSize: 16,
        fontWeight: '500',
    },
    venuesTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: colors.primaryGreen,
        margin: 16,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
