import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button,
    ScrollView,
    Pressable,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabaseClient';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 26 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hour - 1) % 12) + 1;
    return `${formattedHour}:${minute} ${suffix}`;
});

export default function Availability() {
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const isDragging = useRef(false);
    const dragMode = useRef<'select' | 'deselect' | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadUserAvailability = async () => {
            const { data: userData, error: userErr } = await supabase.auth.getUser();
            const uid = userData?.user?.id;
            if (!uid || userErr) return;
            setUserId(uid);

            const { data, error } = await supabase.from('profiles').select('weekly_availability').eq('id', uid).single();
            if (!error && data?.weekly_availability) {
                const restored = Object.fromEntries(data.weekly_availability.map((k: string) => [k, true]));
                setSelected(restored);
            }
        };

        loadUserAvailability();
    }, []);

    const toggleCell = (key: string, force?: boolean) => {
        setSelected(prev => ({
            ...prev,
            [key]: force !== undefined ? force : !prev[key],
        }));
    };

    const handleTouchStart = (key: string) => {
        const currentlySelected = selected[key] ?? false;
        dragMode.current = currentlySelected ? 'deselect' : 'select';
        isDragging.current = true;
        toggleCell(key, dragMode.current === 'select');
    };

    const handleTouchMove = (key: string) => {
        if (!isDragging.current || dragMode.current === null) return;
        toggleCell(key, dragMode.current === 'select');
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        dragMode.current = null;
    };

    const handleSave = async () => {
        const activeSlots = Object.keys(selected).filter(k => selected[k]);
        if (!userId) return;

        const { error } = await supabase.from('profiles').update({ weekly_availability: activeSlots }).eq('id', userId);
        if (!error) {
            Toast.show({ type: 'success', text1: 'Availability saved!' });
        }
    };

    const handleReset = () => setSelected({});

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>Weekly Availability</Text>
            <ScrollView horizontal>
                <View>
                    <View style={styles.headerRow}>
                        <View style={styles.timeLabel} />
                        {days.map(day => (
                            <View key={day} style={styles.dayHeader}>
                                <Text style={styles.headerText}>{day}</Text>
                            </View>
                        ))}
                    </View>
                    <ScrollView style={{ maxHeight: 600 }}>
                        {hours.map(time => (
                            <View key={time} style={styles.row}>
                                <View style={styles.timeLabel}>
                                    <Text style={styles.timeText}>{time}</Text>
                                </View>
                                {days.map(day => {
                                    const key = `${day}_${time}`;
                                    const active = selected[key];
                                    return (
                                        <Pressable
                                            key={key}
                                            style={[styles.cell, active && styles.selectedCell]}
                                            onPressIn={() => handleTouchStart(key)}
                                            onHoverIn={() => handleTouchMove(key)}
                                            onTouchEnd={handleTouchEnd}
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
            <View style={styles.buttons}>
                <Button title="Save" onPress={handleSave} />
                <Button title="Reset" onPress={handleReset} color="gray" />
            </View>
            <Toast position="bottom" />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
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
        height: 38,
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    selectedCell: {
        backgroundColor: '#34C759',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 16,
    },
});
