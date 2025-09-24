import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
});
