import * as Haptics from 'expo-haptics';

export function useHaptics() {
    const lightImpact = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const mediumImpact = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const successNotification = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return { lightImpact, mediumImpact, successNotification };
} 