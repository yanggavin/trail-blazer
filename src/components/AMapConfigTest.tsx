import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { getAMapConfig, validateAMapConfig, debugConfig } from '../config/amapConfig';

export default function AMapConfigTest() {
  useEffect(() => {
    try {
      console.log('🧪 Testing AMap Configuration...');
      
      // Get configuration
      const config = getAMapConfig();
      
      // Debug configuration
      debugConfig(config);
      
      // Validate configuration
      const isValid = validateAMapConfig(config);
      
      if (isValid) {
        console.log('✅ AMap configuration test passed!');
        Alert.alert('✅ Success', 'AMap configuration is valid!');
      } else {
        console.log('⚠️ AMap configuration test passed with warnings');
        Alert.alert('⚠️ Warning', 'AMap configuration has warnings (check console)');
      }
      
    } catch (error) {
      console.error('❌ AMap configuration test failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('❌ Error', `Configuration test failed: ${message}`);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AMap Configuration Test</Text>
      <Text style={styles.description}>
        Check the console and alert dialogs for test results.
        This component validates that environment variables are loaded correctly.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#666',
  },
});