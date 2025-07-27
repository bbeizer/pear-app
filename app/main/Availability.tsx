import React, { useState, useRef, JSX } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAvailabilityGrid, days, hours } from '../../lib/hooks/useAvailabilityGrid';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { colors } from '../../theme/colors';

const CELL_SIZE = 36;
const HEADER_HEIGHT = 32;
const LABEL_WIDTH = 54;

export default function Availability(): JSX.Element {
    const {
        selected,
        isSaving,
        isLoading,
        handleCellPressIn,
        handleCellPressOut,
        handleGridTouchMove,
        handleColSelect,
        handleRowSelect,
        handleSave,
        handleReset,
        getCellStyle,
    } = useAvailabilityGrid();
    const haptics = useHaptics();

    console.log('HOURS:', hours);
    console.log('DAYS:', days);

    const onSavePress = async () => {
        const result = await handleSave();
        if (result.success) {
            Alert.alert('Success!', 'Your availability has been saved.');
        } else {
            Alert.alert('Error', `Failed to save availability: ${result.error}`);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.wrapper, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primaryGreen} />
                <Text style={[styles.title, { marginTop: 16 }]}>Loading availability...</Text>
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>Weekly Availability</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                contentContainerStyle={styles.horizontalScroll}
            >
                <View style={styles.gridWrapper}>
                    <View style={styles.gridOuter}>
                        {/* Sticky Headers */}
                        <View style={[styles.headerRow, { height: HEADER_HEIGHT }]}>
                            <View style={[styles.timeLabel, { height: HEADER_HEIGHT }]} />
                            {days.map((day: string, colIdx: number) => (
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
                            {hours.map((time: string, rowIdx: number) => (
                                <View key={time} style={styles.row}>
                                    <TouchableOpacity
                                        style={styles.timeLabel}
                                        onPress={() => handleRowSelect(rowIdx)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.timeText}>{time}</Text>
                                    </TouchableOpacity>
                                    {days.map((day: string) => {
                                        const key = `${day}_${time}`;
                                        const active = selected[key];
                                        return (
                                            <Pressable
                                                key={key}
                                                style={[
                                                    styles.cell,
                                                    { backgroundColor: active ? colors.primaryGreen : colors.gray200 },
                                                    active ? { shadowColor: colors.primaryGreen, shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } } : {},
                                                ]}
                                                onPressIn={() => handleCellPressIn(key)}
                                                onPressOut={handleCellPressOut}
                                                onResponderMove={handleGridTouchMove}
                                                accessibilityLabel={`${day} at ${time} ${active ? 'selected' : 'not selected'}`}
                                                accessibilityRole="button"
                                            >
                                                <Text style={{ fontSize: 8, color: active ? colors.white : '#bbb', fontWeight: active ? '700' : '500' }}>
                                                    {day.slice(0, 1)}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.buttons}>
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={onSavePress}
                    disabled={isSaving}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={() => { haptics.mediumImpact(); handleReset(); }}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 8,
        padding: 16,
    },
    cell: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: '#eee',
        borderRadius: 10,
        borderWidth: 1,
        elevation: 1,
        height: CELL_SIZE,
        justifyContent: 'center',
        marginHorizontal: 2,
        marginVertical: 3,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        width: CELL_SIZE,
    },
    dayHeader: {
        alignItems: 'center',
        backgroundColor: colors.gray100,
        borderRadius: 10,
        height: HEADER_HEIGHT,
        justifyContent: 'center',
        marginHorizontal: 2,
        marginVertical: 3,
        width: CELL_SIZE,
    },
    gridOuter: {
        backgroundColor: colors.white,
        borderRadius: 14,
        elevation: 2,
        padding: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    gridWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    headerRow: {
        alignItems: 'center',
        backgroundColor: colors.gray50,
        borderBottomWidth: 1,
        borderColor: colors.gray100,
        flexDirection: 'row',
        zIndex: 2,
    },
    headerText: {
        color: colors.primaryGreen,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    horizontalScroll: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '100%',
        paddingVertical: 4,
    },
    pressedCell: {
        opacity: 0.7,
        transform: [{ scale: 0.97 }],
    },
    resetButton: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderColor: colors.primaryGreen,
        borderRadius: 10,
        borderWidth: 2,
        minWidth: 120,
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    resetButtonText: {
        color: colors.primaryGreen,
        fontSize: 16,
        fontWeight: 'bold',
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    saveButton: {
        alignItems: 'center',
        backgroundColor: colors.primaryGreen,
        borderRadius: 10,
        elevation: 2,
        minWidth: 120,
        paddingHorizontal: 32,
        paddingVertical: 16,
        shadowColor: colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedCell: {
        backgroundColor: colors.primaryGreen,
        borderColor: colors.greenDark,
    },
    timeLabel: {
        alignItems: 'flex-end',
        backgroundColor: colors.gray100,
        borderRadius: 7,
        height: CELL_SIZE,
        justifyContent: 'center',
        marginRight: 2,
        marginVertical: 2,
        paddingRight: 4,
        width: LABEL_WIDTH,
    },
    timeText: {
        color: colors.primaryGreen,
        fontSize: 11,
        fontWeight: '600',
    },
    title: {
        color: colors.gray900,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    verticalScroll: {
        maxHeight: Dimensions.get('window').height * 0.6,
    },
    wrapper: {
        backgroundColor: colors.gray50,
        flex: 1,
        paddingTop: 32,
    },
});
