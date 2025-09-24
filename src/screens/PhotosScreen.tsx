import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PhotosScreen() {
  return (
    <View style={styles.container}>
      <Text style={{ color: '#666' }}>Coming soon: photo gallery</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8f6' },
});
