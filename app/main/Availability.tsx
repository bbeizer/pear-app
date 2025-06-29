import React, { useState, useRef } from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Pressable,
    Button,
} from 'react-native';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 26 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hour - 1) % 12) + 1;
    return `${formattedHour}:${minute} ${suffix}`;
});

type AvailabilityMap = {
    [key: string]: boolean;
};

export default function AvailabilityGrid() {
    const [selected, setSelected] = useState<AvailabilityMap>({});
    const isDragging = useRef(false);

    const toggleCell = (key: string) => {
        setSelected(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleTouchMove = (key: string) => {
        if (!isDragging.current) return;
        setSelected(prev => ({
            ...prev,
            [key]: true,
        }));
    };

    const handleTouchStart = () => {
        isDragging.current = true;
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
    };

    const handleSave = () => {
        console.log('Selected Availability:', selected);
        // Add Supabase update logic here if needed
    };

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>General Weekly Availability</Text>
            <ScrollView horizontal>
                <View onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <View style={styles.headerRow}>
                        <View style={styles.timeLabel} />
                        {days.map(day => (
                            <View key={day} style={styles.dayHeader}>
                                <Text style={styles.headerText}>{day}</Text>
                            </View>
                        ))}
                    </View>
                    <ScrollView>
                        {hours.map(time => (
                            <View key={time} style={styles.row}>
                                <View style={styles.timeLabel}>
                                    <Text style={styles.timeText}>{time}</Text>
                                </View>
                                {days.map(day => {
                                    const key = `${day}_${time}`;
                                    const isSelected = selected[key];
                                    return (
                                        <Pressable
                                            key={key}
                                            onPress={() => toggleCell(key)}
                                            onHoverIn={() => handleTouchMove(key)}
                                            style={[
                                                styles.cell,
                                                isSelected && styles.selectedCell,
                                            ]}
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
            <View style={styles.buttonWrapper}>
                <Button title="Save Availability" onPress={handleSave} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        paddingTop: 40,
        paddingBottom: 16,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
        marginTop: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingTop: 10,
        marginBottom: 4,
    },
    dayHeader: {
        width: 43,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        borderWidth: 0.5,
        borderColor: '#ccc',
    },
    headerText: {
        fontWeight: '600',
        fontSize: 13,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeLabel: {
        width: 65,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 5,
    },
    timeText: {
        fontSize: 12,
        color: '#333',
    },
    cell: {
        width: 43,
        height: 40,
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    selectedCell: {
        backgroundColor: '#34C759',
        borderRadius: 8
    },
    buttonWrapper: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
});
