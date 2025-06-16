import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Switch } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Availability'>;

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const times = ['6-7pm', '7-8pm', '8-9pm'];

export default function Availability({ navigation }: Props) {
    const [availability, setAvailability] = useState<Record<string, boolean>>({});

    const toggleSlot = (slot: string) => {
        setAvailability((prev) => ({ ...prev, [slot]: !prev[slot] }));
    };

    const handleSave = async () => {
        const user = supabase.auth.user();
        if (!user) return Alert.alert('Error', 'User not logged in');

        const { error } = await supabase
            .from('profiles')
            .update({ weekly_availability: availability })
            .eq('id', user.id);

        if (error) {
            console.error(error);
            Alert.alert('Error saving availability');
        } else {
            Alert.alert('Success', 'Availability saved!');
            // Later: navigate to discovery/match screen
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Set Your Weekly Availability</Text>
            {days.map((day) => (
                <View key={day} style={styles.row}>
                    <Text style={styles.day}>{day}</Text>
                    {times.map((time) => {
                        const key = `${day}_${time}`;
                        return (
                            <View key={key} style={styles.slot}>
                                <Text>{time}</Text>
                                <Switch
                                    value={!!availability[key]}
                                    onValueChange={() => toggleSlot(key)}
                                />
                            </View>
                        );
                    })}
                </View>
            ))}
            <Button title="Save Availability" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1 },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    row: { marginBottom: 12 },
    day: { fontWeight: '600', marginBottom: 4 },
    slot: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
});
