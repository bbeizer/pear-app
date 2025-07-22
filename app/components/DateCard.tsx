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
    const formatTime = (timeString: string) => {
        return timeString.replace(/_/g, ' ');
    };

    return (
        <View style={styles.card}>
            <Text style={styles.summary}>
                ✅ You have a{' '}
                <Text style={match.meeting_type === 'video' ? styles.video : styles.inperson}>
                    {match.meeting_type === 'video' ? 'video' : 'in-person'}
                </Text>{' '}
                date with{' '}
                <Text style={styles.partnerName}>{match.partnerName}</Text>
            </Text>

            {(match.user1_proposed_time || match.user2_proposed_time) && (
                <Text style={styles.time}>
                    at <Text style={styles.timeHighlight}>
                        {formatTime(match.user1_proposed_time || match.user2_proposed_time || '')}
                    </Text>
                </Text>
            )}

            {match.suggested_activity && (
                <Text style={styles.activity}>💡 {match.suggested_activity}</Text>
            )}

            {match.suggested_venue && (
                <Text style={styles.venue}>📍 {match.suggested_venue}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
    },
    summary: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#1A1A1A',
        lineHeight: 22,
    },
    partnerName: {
        fontWeight: '600',
        color: colors.primaryGreen,
    },
    video: {
        color: '#007AFF',
        fontWeight: '600',
    },
    inperson: {
        color: '#FF6B6B',
        fontWeight: '600',
    },
    time: {
        fontSize: 15,
        marginBottom: 8,
        color: '#666',
    },
    timeHighlight: {
        fontWeight: '600',
        color: '#1A1A1A',
    },
    activity: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    venue: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
}); 