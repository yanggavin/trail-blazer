import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRunStore } from '../store/runStore';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import MapView, { Polyline, Marker, Region } from 'react-native-maps';
import { getAMapConfig, validateAMapConfig, debugConfig } from '../config/amapConfig';

interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
}

export default function TrackScreenEnhanced() {
  const navigation = useNavigation();
  const { 
    status, 
    distanceMeters, 
    durationSec, 
    currentElevationM, 
    totalElevationGainM, 
    start, 
    pause, 
    resume, 
    stop, 
    addPhoto, 
    tick 
  } = useRunStore();
  
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [trailPath, setTrailPath] = useState<LocationPoint[]>([]);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const mapRef = useRef<MapView>(null);

  // Initialize AMap configuration and validate
  useEffect(() => {
    if (__DEV__) {
      try {
        const amapConfig = getAMapConfig();
        debugConfig(amapConfig);
        validateAMapConfig(amapConfig);
        console.log('✅ AMap configuration loaded for enhanced tracking');
      } catch (error) {
        console.warn('⚠️ AMap configuration not available, using Expo Location only');
      }
    }
    
    // Set default region for simulator (San Francisco)
    if (!mapRegion && __DEV__) {
      console.log('🗺️ Setting default map region for simulator');
      setMapRegion({
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (status === 'running') {
      startLocationTracking();
      intervalRef.current = setInterval(() => tick(1, 1.6), 1000);
    } else if (status === 'paused') {
      stopLocationTracking();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (status === 'finished') {
      stopLocationTracking();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      navigation.navigate('RunSummary' as never);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [status]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      setHasLocationPermission(hasPermission);
      
      if (hasPermission) {
        // Get initial location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        
        const locationPoint: LocationPoint = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude || undefined,
          accuracy: location.coords.accuracy || undefined,
          timestamp: location.timestamp,
        };
        
        setCurrentLocation(locationPoint);
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert(
          'Location Permission Required', 
          'Please enable location access to track your runs.'
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert('Error', 'Failed to get location permission');
    }
  };

  const startLocationTracking = async () => {
    if (!hasLocationPermission) return;
    
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (location) => {
          const locationPoint: LocationPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || undefined,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          };

          setCurrentLocation(locationPoint);
          setTrailPath(prev => [...prev, locationPoint]);
          
          // Update map region to follow user
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005, // Tighter zoom for running
            longitudeDelta: 0.005,
          };
          setMapRegion(newRegion);
          
          // Animate map to follow user
          if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        }
      );
    } catch (error) {
      console.error('Location tracking error:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const onTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { 
      Alert.alert('Camera permission required'); 
      return; 
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) addPhoto(result.assets[0].uri);
  };

  const handleStart = async () => {
    if (!hasLocationPermission) {
      await requestLocationPermission();
      if (!hasLocationPermission) return;
    }
    
    setTrailPath([]);
    start();
  };

  const handleStop = () => {
    stop();
  };

  // Format functions
  const fmtDistance = (m: number) => `${(m / 1000).toFixed(1)} km`;
  const fmtTime = (s: number) => {
    const hours = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const fmtPace = () => {
    if (distanceMeters === 0) return '00:00 /km';
    const kmPerHour = (distanceMeters / 1000) / (durationSec / 3600);
    if (kmPerHour === 0) return '00:00 /km';
    const minutesPerKm = 60 / kmPerHour;
    const mins = Math.floor(minutesPerKm);
    const secs = Math.floor((minutesPerKm - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} /km`;
  };
  
  const fmtElevation = (m: number) => `${Math.round(m)} m`;
  const fmtElevationGain = (m: number) => `+${Math.round(m)} m`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Trail Tracker</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Enhanced Map */}
        <View style={styles.mapContainer}>
          {mapRegion ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={mapRegion}
              showsUserLocation={true}
              showsMyLocationButton={false}
              showsCompass={false}
              showsScale={false}
              mapType="standard"
              followsUserLocation={status === 'running'}
              showsBuildings={false}
              showsTraffic={false}
            >
              {/* Trail path polyline */}
              {trailPath.length > 1 && (
                <Polyline
                  coordinates={trailPath.map(point => ({
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }))}
                  strokeColor={colors.primary}
                  strokeWidth={4}
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {/* Start point marker */}
              {trailPath.length > 0 && (
                <Marker
                  coordinate={{
                    latitude: trailPath[0].latitude,
                    longitude: trailPath[0].longitude,
                  }}
                  title="Start"
                  description="Trail start point"
                  pinColor="#4CAF50"
                />
              )}

              {/* End point marker (if not actively tracking) */}
              {trailPath.length > 1 && status !== 'running' && (
                <Marker
                  coordinate={{
                    latitude: trailPath[trailPath.length - 1].latitude,
                    longitude: trailPath[trailPath.length - 1].longitude,
                  }}
                  title="Finish"
                  description="Trail end point"
                  pinColor="#F44336"
                />
              )}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Ionicons name="location" size={48} color="#ccc" />
              <Text style={styles.mapPlaceholderText}>
                {hasLocationPermission ? 'Loading map...' : 'Location permission required'}
              </Text>
              <Text style={styles.mapPlaceholderSubText}>
                {__DEV__ ? 'Use a physical device for full GPS functionality' : ''}
              </Text>
            </View>
          )}
          
          {/* Map Controls */}
          {(status !== 'idle' || __DEV__) && (
            <View style={styles.mapControls}>
              <TouchableOpacity 
                style={styles.mapControlButton}
                onPress={() => {
                  if (mapRef.current && currentLocation) {
                    mapRef.current.animateToRegion({
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }, 1000);
                  } else if (__DEV__ && mapRef.current) {
                    // Simulator: animate to default location
                    mapRef.current.animateToRegion({
                      latitude: 37.7749,
                      longitude: -122.4194,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }, 1000);
                  }
                }}
              >
                <Ionicons name="locate" size={20} color="#111" />
              </TouchableOpacity>
              {__DEV__ && !currentLocation && (
                <TouchableOpacity 
                  style={styles.mapControlButton}
                  onPress={() => {
                    // Simulate location for testing
                    const simulatedLocation = {
                      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
                      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
                      altitude: 100 + Math.random() * 50,
                      accuracy: 5,
                      timestamp: Date.now(),
                    };
                    setCurrentLocation(simulatedLocation);
                    console.log('🧪 Simulated location:', simulatedLocation);
                  }}
                >
                  <Ionicons name="location" size={20} color="#111" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{fmtDistance(distanceMeters)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{fmtTime(durationSec)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Elevation</Text>
            <Text style={styles.statValue}>{fmtElevation(currentElevationM)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Elev Gain</Text>
            <Text style={styles.statValue}>{fmtElevationGain(totalElevationGainM)}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardFullWidth]}>
            <Text style={styles.statLabel}>Pace</Text>
            <Text style={styles.statValue}>{fmtPace()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {status === 'idle' && (
            <>
              <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <Text style={styles.startButtonText}>Start Run</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onTakePhoto} style={styles.cameraButton}>
                <Ionicons name="camera" size={28} color={colors.primary} />
              </TouchableOpacity>
            </>
          )}
          {(status === 'running' || status === 'paused') && (
            <View style={styles.runningActions}>
              {/* Take Photo Button */}
              <TouchableOpacity onPress={onTakePhoto} style={styles.takePhotoButton}>
                <Ionicons name="camera" size={28} color={colors.primary} />
                <Text style={styles.takePhotoText}>Take Photo</Text>
              </TouchableOpacity>
              
              {/* Control Buttons Row */}
              <View style={styles.controlButtonsRow}>
                <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                  <Text style={styles.stopButtonText}>Stop Run</Text>
                </TouchableOpacity>
                
                {status === 'running' ? (
                  <TouchableOpacity onPress={() => pause()} style={styles.pauseButton}>
                    <Ionicons name="pause" size={24} color={colors.backgroundDark} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.resumeButton} onPress={() => resume()}>
                    <Ionicons name="play" size={24} color={colors.backgroundDark} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundLight,
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  },
  settingsButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mapContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    aspectRatio: 2 / 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    width: '100%',
    aspectRatio: 2 / 1,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  mapPlaceholderSubText: {
    marginTop: 4,
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  mapControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(246, 248, 246, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'rgba(17, 33, 17, 0.05)',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
  },
  statCardFullWidth: {
    flexBasis: '100%',
    minWidth: '100%',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: colors.backgroundDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runningActions: {
    flex: 1,
    gap: 12,
  },
  takePhotoButton: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: `${colors.primary}33`,
    gap: 8,
  },
  takePhotoText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stopButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eab308',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});