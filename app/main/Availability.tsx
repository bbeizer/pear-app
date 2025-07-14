import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hour - 1) % 12) + 1;
    return `${formattedHour}:${minute} ${suffix}`;
});

const CELL_SIZE = 36;
const HEADER_HEIGHT = 32;
const LABEL_WIDTH = 54;

export default function AvailabilityV2() {
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const isDragging = useRef(false);
    const dragMode = useRef<'select' | 'deselect' | null>(null);
    const [draggedKeys, setDraggedKeys] = useState<Set<string>>(new Set());

    // Tap or drag to select/deselect
    const toggleCell = (key: string, force?: boolean) => {
        setSelected(prev => {
            const newVal = force !== undefined ? force : !prev[key];
            return { ...prev, [key]: newVal };
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleCellPressIn = (key: string) => {
        const currentlySelected = selected[key] ?? false;
        dragMode.current = currentlySelected ? 'deselect' : 'select';
        isDragging.current = true;
        setDraggedKeys(new Set([key]));
        toggleCell(key, dragMode.current === 'select');
    };

    const handleCellPressOut = () => {
        isDragging.current = false;
        dragMode.current = null;
        setDraggedKeys(new Set());
    };

    const getCellKeyFromTouch = (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        const col = Math.floor((locationX - LABEL_WIDTH) / CELL_SIZE);
        const row = Math.floor((locationY - HEADER_HEIGHT) / CELL_SIZE);
        if (col < 0 || col >= days.length || row < 0 || row >= hours.length) return null;
        return `${days[col]}_${hours[row]}`;
    };

    const handleGridTouchMove = (evt: GestureResponderEvent) => {
        if (!isDragging.current || dragMode.current === null) return;
        const key = getCellKeyFromTouch(evt);
        if (!key) return;
        setDraggedKeys(prev => {
            if (prev.has(key)) return prev;
            toggleCell(key, dragMode.current === 'select');
            const newSet = new Set(prev);
            newSet.add(key);
            return newSet;
        });
    };

    // Quick select: tap day header to select/deselect column
    const handleColSelect = (colIdx: number) => {
        const allSelected = hours.every(time => selected[`${days[colIdx]}_${time}`]);
        setSelected(prev => {
            const updated = { ...prev };
            hours.forEach(time => {
                updated[`${days[colIdx]}_${time}`] = !allSelected;
            });
            return updated;
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    // Quick select: tap time label to select/deselect row
    const handleRowSelect = (rowIdx: number) => {
        const allSelected = days.every(day => selected[`${day}_${hours[rowIdx]}`]);
        setSelected(prev => {
            const updated = { ...prev };
            days.forEach(day => {
                updated[`${day}_${hours[rowIdx]}`] = !allSelected;
            });
            return updated;
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    // Save/Reset (demo only)
    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Save logic here
    };
    const handleReset = () => {
        setSelected({});
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    // UI
    const getCellStyle = (active: boolean, pressed: boolean) => [
        styles.cell,
        active && styles.selectedCell,
        pressed && styles.pressedCell,
    ];

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>Weekly Availability</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.horizontalScroll}>
                <View style={styles.gridOuter}>
                    {/* Sticky day headers */}
                    <View style={[styles.headerRow, { height: HEADER_HEIGHT }]}>
                        <View style={[styles.timeLabel, { height: HEADER_HEIGHT }]} />
                        {days.map((day, colIdx) => (
                            <TouchableOpacity
                                key={day}
                                style={styles.dayHeader}
                                onPress={() => handleColSelect(colIdx)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.headerText}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <ScrollView style={styles.verticalScroll} showsVerticalScrollIndicator>
                        {hours.map((time, rowIdx) => (
                            <View key={time} style={styles.row}>
                                <TouchableOpacity
                                    style={styles.timeLabel}
                                    onPress={() => handleRowSelect(rowIdx)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.timeText}>{time}</Text>
                                </TouchableOpacity>
                                {days.map((day, colIdx) => {
                                    const key = `${day}_${time}`;
                                    const active = selected[key];
                                    return (
                                        <Pressable
                                            key={key}
                                            style={({ pressed }) => getCellStyle(active, pressed)}
                                            onPressIn={() => handleCellPressIn(key)}
                                            onPressOut={handleCellPressOut}
                                            onResponderMove={handleGridTouchMove}
                                            accessibilityLabel={`${day} at ${time} ${active ? 'selected' : 'not selected'}`}
                                            accessibilityRole="button"
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
            <View style={styles.buttons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        color: '#222',
    },
    horizontalScroll: {
        alignItems: 'flex-start',
        paddingLeft: 8,
        paddingRight: 8,
        minWidth: '100%',
    },
    gridOuter: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        alignSelf: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#e9ecef',
        backgroundColor: '#f8f9fa',
        zIndex: 2,
    },
    dayHeader: {
        width: CELL_SIZE,
        height: HEADER_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e9ecef',
        borderRadius: 7,
        marginHorizontal: 1,
        marginVertical: 2,
    },
    headerText: {
        fontWeight: '600',
        fontSize: 13,
        color: '#34C159',
    },
    verticalScroll: {
        maxHeight: Dimensions.get('window').height * 0.6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeLabel: {
        width: LABEL_WIDTH,
        height: CELL_SIZE,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 4,
        backgroundColor: '#e9ecef',
        borderRadius: 7,
        marginVertical: 2,
        marginRight: 2,
    },
    timeText: {
        fontSize: 11,
        color: '#34C159',
        fontWeight: '600',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 7,
        backgroundColor: '#fff',
        marginHorizontal: 1,
        marginVertical: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 1,
        elevation: 1,
    },
    selectedCell: {
        backgroundColor: '#34C159',
        borderColor: '#28a745',
    },
    pressedCell: {
        opacity: 0.7,
        transform: [{ scale: 0.97 }],
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 16,
        marginTop: 8,
    },
    saveButton: {
        backgroundColor: '#34C159',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
        shadowColor: '#34C159',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resetButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#bdbdbd',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#495057',
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 