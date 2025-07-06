import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MainLayout() {
    return (
        <Tabs
            screenOptions={({ route }: { route: { name: string } }) => {
                const iconMap = {
                    ProfileSetup: 'person-circle-outline',
                    Availability: 'calendar-outline',
                    Pool: 'people-outline',
                    Calendar: 'calendar-outline',
                    Matches: 'help-buoy-outline', // you can change this icon
                } as const;

                const iconName =
                    iconMap[route.name as keyof typeof iconMap] ?? 'help-circle-outline';

                return {
                    tabBarIcon: ({
                        color,
                        size,
                    }: {
                        color: string;
                        size: number;
                    }) => <Ionicons name={iconName} size={size} color={color} />,
                    tabBarActiveTintColor: '#000',
                    tabBarInactiveTintColor: 'gray',
                    headerShown: false,
                };
            }}
        >
            <Tabs.Screen name="ProfileSetup" options={{ title: 'Profile' }} />
            <Tabs.Screen name="Availability" options={{ title: 'Availability' }} />
            <Tabs.Screen name="Pool" options={{ title: 'Pool' }} />
            <Tabs.Screen name="Calendar" options={{ title: 'Calendar' }} />
            <Tabs.Screen name="Matches" options={{ title: 'Matches' }} />
        </Tabs>
    );
}
