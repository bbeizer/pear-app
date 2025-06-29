import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function Pool() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Discovery Pool</Text>
            <View style={styles.cardPlaceholder}>
                <Text style={styles.placeholderText}>User Card Placeholder</Text>
            </View>
            <View style={styles.actions}>
                <Button title="No ❌" onPress={() => { }} />
                <Button title="Yes ✅" onPress={() => { }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    cardPlaceholder: {
        width: '90%',
        height: 400,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    placeholderText: {
        color: '#666',
        fontSize: 16,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
});
