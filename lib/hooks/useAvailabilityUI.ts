import { Alert } from 'react-native';
import { useAvailabilityGrid, days, hours } from './useAvailabilityGrid';

export { days, hours };

export function useAvailabilityUI() {
    const availabilityGrid = useAvailabilityGrid();

    const onSavePress = async () => {
        const result = await availabilityGrid.handleSave();
        if (result.success) {
            Alert.alert('Success!', 'Your availability has been saved.');
        } else {
            Alert.alert('Error', `Failed to save availability: ${result.error}`);
        }
    };

    const onResetPress = () => {
        Alert.alert(
            'Reset Availability',
            'Are you sure you want to clear all your availability?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: availabilityGrid.handleReset,
                },
            ]
        );
    };

    return {
        ...availabilityGrid,
        onSavePress,
        onResetPress,
    };
} 