import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getAMapConfig, validateAMapConfig, debugConfig } from '../config/amapConfig';
import AMapService from '../services/amapService';
import MockAMapView from '../components/MockAMapView';

export default function AMapTestScreen() {
  const [testResults, setTestResults] = useState<{
    configLoaded: boolean;
    configValid: boolean;
    serviceInitialized: boolean;
    locationPermission: boolean;
    currentLocation: any;
    error?: string;
  }>({
    configLoaded: false,
    configValid: false,
    serviceInitialized: false,
    locationPermission: false,
    currentLocation: null,
  });

  const [amapService, setAmapService] = useState<AMapService | null>(null);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    let results = { ...testResults };
    
    try {
      // Test 1: Configuration Loading
      console.log('🧪 Testing configuration loading...');
      const config = getAMapConfig();
      results.configLoaded = true;
      
      // Test 2: Configuration Validation
      console.log('🧪 Testing configuration validation...');
      results.configValid = validateAMapConfig(config);
      
      // Test 3: Service Initialization
      console.log('🧪 Testing service initialization...');
      const service = new AMapService(config);
      setAmapService(service);
      results.serviceInitialized = true;
      
      // Test 4: Location Permission
      console.log('🧪 Testing location permission...');
      const hasPermission = await service.requestLocationPermission();
      results.locationPermission = hasPermission;
      
      // Test 5: Get Current Location (if permission granted)
      if (hasPermission) {
        console.log('🧪 Testing location retrieval...');
        try {
          const location = await service.getCurrentPosition();
          results.currentLocation = location;
          console.log('📍 Location retrieved:', location);
        } catch (error) {
          console.log('⚠️ Location retrieval failed:', error);
        }
      }
      
      // Debug output
      debugConfig(config);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      results.error = error instanceof Error ? error.message : String(error);
    }
    
    setTestResults(results);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  const getStatusColor = (status: boolean) => {
    return status ? '#4CAF50' : '#f44336';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AMap Integration Test</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Test Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Test Results</Text>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Configuration Loaded</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.configLoaded) }]}>
              {getStatusIcon(testResults.configLoaded)}
            </Text>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Configuration Valid</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.configValid) }]}>
              {getStatusIcon(testResults.configValid)}
            </Text>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Service Initialized</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.serviceInitialized) }]}>
              {getStatusIcon(testResults.serviceInitialized)}
            </Text>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Location Permission</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.locationPermission) }]}>
              {getStatusIcon(testResults.locationPermission)}
            </Text>
          </View>
          
          {testResults.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>❌ Error:</Text>
              <Text style={styles.errorText}>{testResults.error}</Text>
            </View>
          )}
        </View>

        {/* Location Info */}
        {testResults.currentLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Current Location</Text>
            <Text style={styles.locationText}>
              Lat: {testResults.currentLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {testResults.currentLocation.longitude.toFixed(6)}
            </Text>
            {testResults.currentLocation.altitude && (
              <Text style={styles.locationText}>
                Alt: {testResults.currentLocation.altitude.toFixed(2)}m
              </Text>
            )}
            <Text style={styles.locationText}>
              Accuracy: {testResults.currentLocation.accuracy?.toFixed(2)}m
            </Text>
          </View>
        )}

        {/* Mock Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Mock Map View</Text>
          <View style={styles.mapContainer}>
            <MockAMapView
              style={styles.map}
              currentLocation={testResults.currentLocation}
              showUserLocation={true}
              trailPath={[]}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={runTests}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.buttonText}>Run Tests Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => console.log('Current test results:', testResults)}
          >
            <Ionicons name="bug" size={20} color={colors.primary} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Log Results</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Check the console for detailed logs and debug information.
          This screen validates that your AMap configuration and security setup is working correctly.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  testStatus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  locationText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 12,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 20,
  },
});