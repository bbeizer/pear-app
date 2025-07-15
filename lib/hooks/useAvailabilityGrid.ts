import { useState, useRef } from 'react';
import { GestureResponderEvent } from 'react-native';
import { useHaptics } from './useHaptics';

export const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const hours = Array.from({ length: 30 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hour - 1) % 12) + 1;
    return `${formattedHour}:${minute} ${suffix}`;
});

const CELL_SIZE = 36;
const HEADER_HEIGHT = 32;
const LABEL_WIDTH = 54;

export function useAvailabilityGrid() {
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const isDragging = useRef(false);
    const dragMode = useRef<'select' | 'deselect' | null>(null);
    const [draggedKeys, setDraggedKeys] = useState<Set<string>>(new Set());
    const haptics = useHaptics();

    const toggleCell = (key: string, force?: boolean) => {
        setSelected(prev => {
            const newVal = force !== undefined ? force : !prev[key];
            return { ...prev, [key]: newVal };
        });
        haptics.lightImpact();
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

    const handleColSelect = (colIdx: number) => {
        const allSelected = hours.every(time => selected[`${days[colIdx]}_${time}`]);
        setSelected(prev => {
            const updated = { ...prev };
            hours.forEach(time => {
                updated[`${days[colIdx]}_${time}`] = !allSelected;
            });
            return updated;
        });
        haptics.mediumImpact();
    };

    const handleRowSelect = (rowIdx: number) => {
        const allSelected = days.every(day => selected[`${day}_${hours[rowIdx]}`]);
        setSelected(prev => {
            const updated = { ...prev };
            days.forEach(day => {
                updated[`${day}_${hours[rowIdx]}`] = !allSelected;
            });
            return updated;
        });
        haptics.mediumImpact();
    };

    const handleSave = () => {
        haptics.successNotification();
        // Save logic here
    };

    const handleReset = () => {
        setSelected({});
        haptics.mediumImpact();
    };

    const getCellStyle = (active: boolean, pressed: boolean) => [
        active ? { backgroundColor: '#34C159', borderColor: '#28a745' } : {},
        pressed ? { opacity: 0.7, transform: [{ scale: 0.97 }] } : {},
    ];

    return {
        selected,
        handleCellPressIn,
        handleCellPressOut,
        handleGridTouchMove,
        handleColSelect,
        handleRowSelect,
        handleSave,
        handleReset,
        getCellStyle,
        days,
        hours,
    };
} 