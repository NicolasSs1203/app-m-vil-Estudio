import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatAIScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👾</Text>
      <Text style={styles.title}>Debug Helper</Text>
      <Text style={styles.subtitle}>Pégame tu código y buscamos el error</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f9ff' },
  emoji: { fontSize: 50, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0284c7' },
  subtitle: { fontSize: 16, color: '#475569' },
});