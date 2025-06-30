import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ChooseMeetType() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>How do you want to meet?</Text>
      <Button title="Video Call" onPress={() => { }} />
      <Button title="In Person" onPress={() => { }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
});
