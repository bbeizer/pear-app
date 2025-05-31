import React, { useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { RootStackParamList } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'Availability'>;

const TIME_SLOTS = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '5:00 PM',
    '6:00 PM',
];

export default function Availability({ navigation }: Props) {
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleSlot = (slot: string) => {
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter(s => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        const user = supabase.auth.user();
        if (!user) {
            alert('Not logged in');
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('availability')
            .upsert({ user_id: user.id, slots: selectedSlots });

        if (error) {
            alert('Error saving availability');
        } else {
            alert('Availability saved!');
            // navigation.navigate('NextScreen');
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Your Availability</Text>
            <FlatList
                data={TIME_SLOTS}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => toggleSlot(item)}
                        style={[
                            styles.slot,
                            selectedSlots.includes(item) && styles.selectedSlot,
                        ]}
                    >
                        <Text style={styles.slotText}>{item}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ gap: 8 }}
            />
            <Button title={loading ? 'Saving...' : 'Save'} onPress={handleSubmit} disabled={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, backgroundColor: 'white' },
    title: { fontSize: 22, marginBottom: 20, fontWeight: 'bold' },
    slot: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
    },
    selectedSlot: {
        backgroundColor: '#caf0f8',
        borderColor: '#0077b6',
    },
    slotText: {
        fontSize: 16,
    },
});
