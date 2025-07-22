import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { colors } from '../../theme/colors';

export default function MainLayout() {
    const [unreadLikesCount, setUnreadLikesCount] = useState(0);

    useEffect(() => {
        fetchUnreadLikesCount();

        // Set up real-time subscription for new likes
        const channel = supabase
            .channel('likes_notifications')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'swipes',
                    filter: 'liked=eq.true'
                },
                () => {
                    fetchUnreadLikesCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchUnreadLikesCount = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;

            // Count unread likes (swipes where user is swipee and liked=true)
            const { count, error } = await supabase
                .from('swipes')
                .select('*', { count: 'exact', head: true })
                .eq('swipee_id', userId)
                .eq('liked', true);

            if (error) {
                console.error('Error fetching unread likes count:', error);
                return;
            }

            setUnreadLikesCount(count || 0);
        } catch (error) {
            console.error('Error in fetchUnreadLikesCount:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={({ route }: { route: { name: string } }) => {
                    const iconMap = {
                        ProfileSetup: 'person-circle-outline',
                        Availability: 'calendar-outline',
                        Pool: 'people-outline',
                        Likes: 'heart-outline',
                        Matches: 'sparkles-outline',
                        Calendar: 'calendar-outline',
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
                        }) => (
                            <View style={{ position: 'relative' }}>
                                <Ionicons name={iconName} size={size} color={color} />
                                {route.name === 'Likes' && unreadLikesCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {unreadLikesCount > 99 ? '99+' : unreadLikesCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ),
                        tabBarActiveTintColor: colors.primaryGreen,
                        tabBarInactiveTintColor: 'gray',
                        headerShown: false,
                    };
                }}
            >
                <Tabs.Screen name="ProfileSetup" options={{ title: 'Profile' }} />
                <Tabs.Screen name="Availability" options={{ title: 'Availability' }} />
                <Tabs.Screen name="Pool" options={{ title: 'Pool' }} />
                <Tabs.Screen name="Likes" options={{ title: 'Likes' }} />
                <Tabs.Screen name="Matches" options={{ title: 'Matches' }} />
                <Tabs.Screen name="Calendar" options={{ title: 'Calendar' }} />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -5,
        right: -8,
        backgroundColor: colors.primaryGreen,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
});
