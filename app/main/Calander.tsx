import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const mockEvents = [
    { id: '1', date: 'July 2, 2025', time: '8:00 PM', type: 'Video' },
    { id: '2', date: 'July 6, 2025', time: '6:30 PM', type: 'In-Person' },
];

export default function CalendarScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Upcoming Dates</Text>
            <FlatList
                data={mockEvents}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.event}>
                        <Text style={styles.eventText}>
                            {item.date} — {item.time} ({item.type})
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1 },
    title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
    event: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#ccc' },
    eventText: { fontSize: 16 },
});
