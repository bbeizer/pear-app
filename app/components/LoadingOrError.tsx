import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export function LoadingOrError({ loading, error }: { loading: boolean; error?: string | null }) {
    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;
    if (error) return <Text style={{ color: 'red', marginTop: 50 }}>{error}</Text>;
    return null;
}
