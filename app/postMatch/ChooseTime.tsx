import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ChooseTime() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pick a time that works for you</Text>
      <Button title="Show Times" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
});
