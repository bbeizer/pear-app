import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors } from '../../theme/colors';
import VenueSuggestions from './VenueSuggestions';
import { venueClient } from '../../lib/venueClient';
import { useMatches } from '../../lib/hooks/useMatches';
import { useRouter } from 'expo-router';

interface VenuePickerModalProps {
    visible: boolean;
    onClose: () => void;
    matchId: string;
    midpoint: { latitude: number; longitude: number };
}

export default function VenuePickerModal({ visible, onClose, matchId, midpoint }: VenuePickerModalProps) {
    const matches = useMatches();
    const router = useRouter();
    const [venues, setVenues] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [radius, setRadius] = useState(2000);

    const initialRegion = {
        latitude: midpoint.latitude,
        longitude: midpoint.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

    const search = async () => {
        setIsSearching(true);
        try {
            // Search for each category separately and combine results
            const [restaurants, cafes, bars, activities] = await Promise.all([
                venueClient.searchByCategory('restaurant', { latitude: midpoint.latitude, longitude: midpoint.longitude, radius }),
                venueClient.searchByCategory('cafe', { latitude: midpoint.latitude, longitude: midpoint.longitude, radius }),
                venueClient.searchByCategory('bar', { latitude: midpoint.latitude, longitude: midpoint.longitude, radius }),
                venueClient.searchByCategory('activity', { latitude: midpoint.latitude, longitude: midpoint.longitude, radius }),
            ]);

            // Combine all results
            const allVenues = [...restaurants, ...cafes, ...bars, ...activities];

            // Deduplicate venues
            const uniqueVenues = allVenues.filter((venue: any, index: number, self: any[]) =>
                index === self.findIndex((v: any) =>
                    v.name === venue.name &&
                    Math.abs(v.location.latitude - venue.location.latitude) < 0.001 &&
                    Math.abs(v.location.longitude - venue.location.longitude) < 0.001
                )
            );

            setVenues(uniqueVenues);
        } catch (error) {
            console.error('Error searching venues:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const onConfirm = async () => {
        if (!selected) return;

        try {
            // The venue is already saved to the database when selected
            // Close the modal and route to the specific match
            onClose();
            router.push(`/MatchDetails/${matchId}`);

        } catch (error) {
            console.error('Error confirming venue:', error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <SafeAreaView style={styles.root}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.close}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {venues.length === 0 ? 'Pick a Venue' : 'Venues'}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                {venues.length === 0 ? (
                    // Stage 1: Map View
                    <>
                        {/* Controls */}
                        <View style={styles.controls}>
                            <Text style={styles.label}>Radius: {Math.round(radius)} m</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={500}
                                maximumValue={5000}
                                step={100}
                                value={radius}
                                minimumTrackTintColor={colors.primaryGreen}
                                maximumTrackTintColor="#ccc"
                                onValueChange={setRadius}
                            />
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>500m</Text>
                                <Text style={styles.sliderLabel}>5km</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.searchBtn}
                                onPress={search}
                                disabled={isSearching}
                            >
                                {isSearching ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.searchText}>Search this area</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Map */}
                        <View style={styles.mapWrap}>
                            <MapView
                                style={styles.map}
                                initialRegion={initialRegion}
                                {...(Platform.OS === 'android' ? { provider: PROVIDER_GOOGLE } : {})}
                            >
                                <Marker coordinate={midpoint} title="Midpoint" />
                                <Circle
                                    center={midpoint}
                                    radius={radius}
                                    strokeColor={colors.primaryGreen}
                                    fillColor="rgba(76,175,80,0.2)"
                                />
                            </MapView>
                        </View>
                    </>
                ) : (
                    // Stage 2: Venue List View
                    <>
                        {/* Back to Map Button */}
                        <TouchableOpacity
                            style={styles.backToMapBtn}
                            onPress={() => {
                                setVenues([]);
                                setSelected(null);
                            }}
                        >
                            <Ionicons name="arrow-back" size={20} color={colors.primaryGreen} />
                            <Text style={styles.backToMapText}>Back to Map</Text>
                        </TouchableOpacity>

                        {/* Venue List */}
                        <View style={styles.venueSuggestions}>
                            <VenueSuggestions
                                venues={venues}
                                selectedVenue={selected}
                                onVenueSelect={setSelected}
                                minHeight={600}
                                matchId={matchId}
                            />

                            <TouchableOpacity
                                style={[
                                    styles.confirmBtn,
                                    !selected && { opacity: 0.5 }
                                ]}
                                disabled={!selected}
                                onPress={onConfirm}
                            >
                                <Text style={styles.confirmText}>
                                    {selected ? `Confirm ${selected.name}` : 'Select a venue'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeBtn: {
        padding: 8,
    },
    close: {
        fontSize: 20,
        color: '#666',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    controls: {
        padding: 20,
        gap: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    sliderLabel: {
        fontSize: 12,
        color: '#666',
    },
    searchBtn: {
        backgroundColor: colors.primaryGreen,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    searchText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    mapWrap: {
        flex: 1,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    backToMapBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 20,
        paddingBottom: 10,
    },
    backToMapText: {
        fontSize: 16,
        color: colors.primaryGreen,
        fontWeight: '500',
    },
    venueSuggestions: {
        flex: 1,
        paddingHorizontal: 20,
    },
    confirmBtn: {
        backgroundColor: colors.primaryGreen,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center'
    },
    confirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
