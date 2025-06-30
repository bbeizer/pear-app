import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ConfirmDate() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Your Date</Text>
      <Button title="Confirm" onPress={() => {}} />
      <Button title="Change Time" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
});
