import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import type { Match } from '../../types';
import { colors } from '../../theme/colors';

interface CalendarMatch extends Match {
    partnerName: string;
}

interface DateCardProps {
    match: CalendarMatch;
}

export default function DateCard({ match }: DateCardProps) {
    const formatDate = (timeString: string) => {
        // Convert "Tomorrow_7:00_PM" to "Tomorrow at 7:00 PM"
        return timeString.replace(/_/g, ' ').replace(/(\w+) (\d+:\d+ [AP]M)/, '$1 at $2');
    };

    const getTimeText = () => {
        const time = match.user1_proposed_time || match.user2_proposed_time;
        if (!time) return 'Time TBD';

        // Extract just the time part (e.g., "7:00 PM" from "Tomorrow_7:00_PM")
        const parts = time.split('_');
        if (parts.length >= 2) {
            // Join the time parts (e.g., "7:00" + "PM" = "7:00 PM")
            return parts.slice(1).join(' ');
        }
        return time;
    };

    return (
        <View style={styles.card}>
            {/* Time Header */}
            <Text style={styles.timeHeader}>
                {getTimeText()}
            </Text>

            {/* Separator Line */}
            <View style={styles.separator} />

            {/* Date Details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.partnerText}>
                    with <Text style={styles.partnerName}>{match.partnerName}</Text>
                </Text>

                <Text style={styles.typeText}>
                    {match.meeting_type === 'video' ? '📹 Video call' : '👥 In-person'}
                </Text>

                {match.suggested_activity && (
                    <Text style={styles.activityText}>
                        {match.suggested_activity}
                    </Text>
                )}

                {match.suggested_venue && (
                    <Text style={styles.venueText}>
                        {match.suggested_venue}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 0,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    timeHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        padding: 20,
        paddingBottom: 12,
        textAlign: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 20,
    },
    detailsContainer: {
        padding: 20,
        paddingTop: 16,
    },
    partnerText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 8,
    },
    partnerName: {
        fontWeight: '700',
        color: colors.primaryGreen,
    },
    typeText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    activityText: {
        fontSize: 14,
        color: '#000',
        marginBottom: 4,
        fontWeight: '500',
    },
    venueText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
});