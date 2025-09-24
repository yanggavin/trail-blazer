import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LocationPoint } from '../services/amapService';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MockAMapViewProps {
  style?: ViewStyle;
  initialRegion?: Region;
  trailPath?: LocationPoint[];
  currentLocation?: LocationPoint;
  showUserLocation?: boolean;
  onRegionChange?: (region: Region) => void;
  onPress?: (event: any) => void;
}

export default function MockAMapView({
  style,
  initialRegion,
  trailPath = [],
  currentLocation,
  showUserLocation = true,
}: MockAMapViewProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.title}>🗺️ AMap View (Mock)</Text>
        
        {currentLocation && (
          <Text style={styles.info}>
            📍 Current: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        )}
        
        {initialRegion && (
          <Text style={styles.info}>
            🎯 Region: {initialRegion.latitude.toFixed(4)}, {initialRegion.longitude.toFixed(4)}
          </Text>
        )}
        
        <Text style={styles.info}>
          🛤️ Trail Points: {trailPath.length}
        </Text>
        
        <Text style={styles.info}>
          👤 Show User: {showUserLocation ? 'Yes' : 'No'}
        </Text>
        
        <Text style={styles.note}>
          This is a mock view for testing.{'\n'}
          Replace with actual AMapView when ready.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8f5e8',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32',
  },
  info: {
    fontSize: 14,
    color: '#388e3c',
    marginBottom: 4,
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});