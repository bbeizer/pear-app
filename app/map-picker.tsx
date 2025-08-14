import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { venueClient } from '../lib/venueClient';
import VenueSuggestions from './components/VenueSuggestions';
import type { Venue } from '../lib/venueClient';
import { useVenuePicker } from '../lib/stores/venuePicker';

export default function MapPickerScreen() {
  const { midpoint, confirmVenue } = useVenuePicker();
  const [radius, setRadius] = useState(1000);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<Venue | null>(null);

  const initialRegion = useMemo(() => ({
    latitude: midpoint?.latitude ?? 40.0,
    longitude: midpoint?.longitude ?? -73.0,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  }), [midpoint]);

  const search = async () => {
    if (!midpoint) return;
    setIsSearching(true);
    try {
      const res = await venueClient.getDateVenues(midpoint.latitude, midpoint.longitude, radius);
      const all = [...res.restaurants, ...res.cafes, ...res.bars, ...res.activities].sort((a,b) => b.rating - a.rating);
      setVenues(all);
    } finally {
      setIsSearching(false);
    }
  };

  const onConfirm = () => {
    if (!selected) return;
    confirmVenue(selected);
    router.back();
  };

  if (!midpoint) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>No midpoint found. Go back and try again.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pick a place</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapWrap}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          {...(Platform.OS === 'android' ? { provider: PROVIDER_GOOGLE } : {})}
        >
          <Marker coordinate={midpoint} title="Midpoint" />
          <Circle center={midpoint} radius={radius} strokeColor={colors.primaryGreen} fillColor="rgba(76,175,80,0.2)" />
        </MapView>
      </View>

      <View style={styles.controls}>
        <Text style={styles.label}>Radius: {Math.round(radius)} m</Text>
        <Slider
          style={{ width: '100%' }}
          minimumValue={500}
          maximumValue={5000}
          step={100}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor={colors.primaryGreen}
          maximumTrackTintColor="#ccc"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search} disabled={isSearching}>
          {isSearching ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchText}>Search this area</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.results}>
        <VenueSuggestions
          latitude={midpoint.latitude}
          longitude={midpoint.longitude}
          selectedVenue={selected}
          onVenueSelect={setSelected}
        />

        <TouchableOpacity
          style={[styles.confirmBtn, !selected && { opacity: 0.5 }]}
          disabled={!selected}
          onPress={onConfirm}
        >
          <Text style={styles.confirmText}>{selected ? `Confirm ${selected.name}` : 'Select a venue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 52, paddingHorizontal: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#eee'
  },
  title: { fontSize: 16, fontWeight: '600' },
  close: { fontSize: 22, color: '#777' },
  mapWrap: { flex: 1 },
  map: { flex: 1 },
  controls: { padding: 12, gap: 12, borderTopWidth: 1, borderColor: '#eee' },
  label: { fontSize: 13, color: '#333' },
  searchBtn: { backgroundColor: colors.primaryGreen, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  searchText: { color: '#fff', fontWeight: '600' },
  results: { padding: 12, borderTopWidth: 1, borderColor: '#eee' },
  confirmBtn: { marginTop: 12, backgroundColor: colors.primaryGreen, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  msg: { color: '#444', marginBottom: 12 },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#aaa', borderRadius: 8 },
  backText: { color: '#333' },
});
