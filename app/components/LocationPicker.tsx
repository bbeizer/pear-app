import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Switch,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface LocationPickerProps {
    latitude: number | null;
    longitude: number | null;
    city: string;
    state: string;
    distancePreference: number;
    anyDistance: boolean;
    locationPermission: boolean;
    onLocationChange: (lat: number | null, lng: number | null, city: string, state: string) => void;
    onDistanceChange: (distance: number) => void;
    onAnyDistanceChange: (anyDistance: boolean) => void;
    onPermissionChange: (permission: boolean) => void;
}

export default function LocationPicker({
    latitude,
    longitude,
    city,
    state,
    distancePreference,
    anyDistance,
    locationPermission,
    onLocationChange,
    onDistanceChange,
    onAnyDistanceChange,
    onPermissionChange,
}: LocationPickerProps) {
    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            onPermissionChange(true);
            return true;
        } else {
            Alert.alert('Location Permission', 'Location access is needed to find nearby matches.');
            return false;
        }
    };

    const getCurrentLocation = async () => {
        if (!locationPermission) {
            const granted = await requestLocationPermission();
            if (!granted) return;
        }

        try {
            const location = await Location.getCurrentPositionAsync({});
            const { latitude: lat, longitude: lng } = location.coords;

            // Get city and state from coordinates
            const geocode = await Location.reverseGeocodeAsync({
                latitude: lat,
                longitude: lng,
            });

            const address = geocode[0];
            const cityName = address?.city || 'Unknown City';
            const stateName = address?.region || 'Unknown State';

            onLocationChange(lat, lng, cityName, stateName);
        } catch (error) {
            Alert.alert('Location Error', 'Failed to get your location. Please try again.');
        }
    };

    const clearLocation = () => {
        onLocationChange(null, null, '', '');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Location</Text>
            <Text style={styles.subtitle}>
                Help us find matches near you
            </Text>

            {/* Location Permission */}
            <View style={styles.permissionSection}>
                <View style={styles.permissionRow}>
                    <Ionicons
                        name={locationPermission ? "location" : "location-outline"}
                        size={24}
                        color={locationPermission ? "#00C48C" : "#999"}
                    />
                    <Text style={styles.permissionText}>
                        {locationPermission ? 'Location access granted' : 'Location access needed'}
                    </Text>
                </View>

                {!locationPermission && (
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestLocationPermission}
                    >
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Current Location */}
            <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                    <Text style={styles.sectionTitle}>Current Location</Text>
                    <TouchableOpacity onPress={getCurrentLocation}>
                        <Ionicons name="refresh" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                {latitude && longitude ? (
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationText}>
                            📍 {city}, {state}
                        </Text>
                        <TouchableOpacity onPress={clearLocation} style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.getLocationButton}
                        onPress={getCurrentLocation}
                    >
                        <Ionicons name="location" size={20} color="#007AFF" />
                        <Text style={styles.getLocationText}>Get Current Location</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Distance Preference */}
            <View style={styles.distanceSection}>
                <View style={styles.distanceHeader}>
                    <Text style={styles.sectionTitle}>Distance Preference</Text>
                    <View style={styles.anyDistanceRow}>
                        <Text style={styles.anyDistanceText}>Any distance</Text>
                        <Switch
                            value={anyDistance}
                            onValueChange={onAnyDistanceChange}
                            trackColor={{ false: '#e0e0e0', true: '#00C48C' }}
                            thumbColor={anyDistance ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {!anyDistance && (
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={styles.slider}
                            minimumValue={1}
                            maximumValue={100}
                            value={distancePreference}
                            onValueChange={onDistanceChange}
                            minimumTrackTintColor="#00C48C"
                            maximumTrackTintColor="#e0e0e0"
                        />
                        <Text style={styles.distanceText}>
                            Within {Math.round(distancePreference)} miles
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1A1A1A',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    permissionSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    permissionText: {
        fontSize: 14,
        color: '#666',
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    locationSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    locationInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 16,
        color: '#1A1A1A',
    },
    clearButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    getLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    getLocationText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    distanceSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    distanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    anyDistanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    anyDistanceText: {
        fontSize: 14,
        color: '#666',
    },
    sliderContainer: {
        marginTop: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },

    distanceText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
}); 