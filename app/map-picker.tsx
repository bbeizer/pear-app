import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { venueClient } from '../lib/venueClient';
import VenueSuggestions from './components/VenueSuggestions';
import type { Venue } from '../lib/venueClient';
import { useVenuePicker } from '../lib/stores/venuePicker';
import { supabase } from '../lib/supabaseClient';

export default function MapPickerScreen() {
  const { midpoint, confirmVenue, activeMatchId } = useVenuePicker();
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
      const all = [...res.restaurants, ...res.cafes, ...res.bars, ...res.activities];

      console.log('🔍 Raw venue data by category:', {
        restaurants: res.restaurants.length,
        cafes: res.cafes.length,
        bars: res.bars.length,
        activities: res.activities.length,
        total: all.length
      });

      // Log some sample venues to see their structure
      if (all.length > 0) {
        console.log('🔍 Sample venue:', JSON.stringify(all[0], null, 2));
      }

      // Improved deduplication based on name + location
      const uniqueVenues = all.filter((venue, index, self) => {
        const venueKey = `${venue.name.toLowerCase().trim()}_${venue.location.latitude.toFixed(6)}_${venue.location.longitude.toFixed(6)}`;
        const isDuplicate = self.findIndex(v => {
          const vKey = `${v.name.toLowerCase().trim()}_${v.location.latitude.toFixed(6)}_${v.location.longitude.toFixed(6)}`;
          return vKey === venueKey;
        }) !== index;

        if (isDuplicate) {
          console.log('🔍 Duplicate found:', {
            name: venue.name,
            lat: venue.location.latitude,
            lng: venue.location.longitude,
            id: venue.id
          });
        }

        return !isDuplicate;
      });

      // Sort by rating (highest first), then by distance
      const sortedVenues = uniqueVenues.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return a.distance - b.distance;
      });

      console.log('🔍 Search results:', {
        total: all.length,
        unique: uniqueVenues.length,
        sorted: sortedVenues.length
      });

      setVenues(sortedVenues);
    } finally {
      setIsSearching(false);
    }
  };

  const onConfirm = async () => {
    if (!selected || !activeMatchId) return;

    console.log('🔍 Map-picker: Confirming venue:', selected.name, 'for match:', activeMatchId);

    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Get the match to determine which user is making the suggestion
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', activeMatchId)
        .single();

      if (matchError || !match) {
        console.error('Error fetching match:', matchError);
        Alert.alert('Error', 'Failed to fetch match information');
        return;
      }

      // Determine which user is making the suggestion
      const isUser1 = user.id === match.user1_id;
      const venueField = isUser1 ? 'user1_proposed_venue' : 'user2_proposed_venue';

      console.log('🔍 Saving venue to field:', venueField);

      // Save the venue suggestion to the match
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          [venueField]: selected,
          status: 'proposed'
        })
        .eq('id', activeMatchId);

      if (updateError) {
        console.error('Error saving venue suggestion:', updateError);
        Alert.alert('Error', 'Failed to save venue suggestion. Please try again.');
        return;
      }

      console.log('✅ Venue suggestion saved successfully');
      Alert.alert('Success', 'Venue suggestion saved! Your match will be notified.');

      // Update the store and route back
      confirmVenue(selected, activeMatchId);
      router.push('/main/Matches');

    } catch (error) {
      console.error('Error in onConfirm:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
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

  console.log('🔍 Debug - venues in map picker:', venues);
  console.log('🔍 Debug - venues length:', venues?.length);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
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
          venues={venues}
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

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 70, paddingHorizontal: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#eee'
  },
  title: { fontSize: 16, fontWeight: '600' },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: '#f5f5f5' },
  close: { fontSize: 22, color: '#777' },
  mapWrap: { height: '32%', marginTop: 0 },
  map: { flex: 1 },
  controls: { padding: 4, gap: 4, borderTopWidth: 1, borderColor: '#eee' },
  label: { fontSize: 12, color: '#333' },
  searchBtn: { backgroundColor: colors.primaryGreen, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  searchText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  results: { padding: 4, borderTopWidth: 1, borderColor: '#eee', flex: 1, marginTop: 10, paddingBottom: 20, minHeight: '60%' },
  confirmBtn: { marginTop: 4, backgroundColor: colors.primaryGreen, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  cancelBtn: { marginTop: 4, backgroundColor: '#eee', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  cancelText: { color: '#333', fontWeight: '600', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  msg: { color: '#444', marginBottom: 12 },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#aaa', borderRadius: 8 },
  backText: { color: '#333' },
});
