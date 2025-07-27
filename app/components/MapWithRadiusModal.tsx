import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

interface MapWithRadiusModalProps {
    visible: boolean;
    onClose: () => void;
    midpoint: { latitude: number; longitude: number };
    initialRadius?: number;
}

export default function MapWithRadiusModal({
    visible,
    onClose,
    midpoint,
    initialRadius = 1000, // in meters
}: MapWithRadiusModalProps) {
    const [radius, setRadius] = useState(initialRadius);

    useEffect(() => {
        if (visible) {
            setRadius(initialRadius);
        }
    }, [visible]);

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose a Spot</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                </View>

                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        ...midpoint,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                >
                    <Marker coordinate={midpoint} />
                    <Circle
                        center={midpoint}
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
                        onPress={() => {
                            // TODO: Trigger search for places inside radius
                            console.log('Searching with radius', radius);
                        }}
                    >
                        <Text style={styles.searchButtonText}>Search This Area</Text>
                    </TouchableOpacity>
                </View>
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
    map: {
        width,
        height: height * 0.55,
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
});
