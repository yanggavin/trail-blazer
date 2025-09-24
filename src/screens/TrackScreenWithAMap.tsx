import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRunStore } from '../store/runStore';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import MockAMapView from '../components/MockAMapView';
import AMapService, { LocationPoint } from '../services/amapService';
import { getAMapConfig, validateAMapConfig, debugConfig } from '../config/amapConfig';

export default function TrackScreenWithAMap() {
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
  
  // Initialize AMap with secure configuration
  const amapConfig = getAMapConfig();
  const amapService = useRef(new AMapService(amapConfig));
  
  // Validate configuration in development
  useEffect(() => {
    if (__DEV__) {
      debugConfig(amapConfig);
      validateAMapConfig(amapConfig);
    }
  }, []);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    };
  }, [status]);

  const requestLocationPermission = async () => {
    try {
      const granted = await amapService.current.requestLocationPermission();
      setHasLocationPermission(granted);
      
      if (granted) {
        // Get initial location
        const location = await amapService.current.getCurrentPosition();
        setCurrentLocation(location);
      } else {
        Alert.alert(
          'Location Permission Required', 
          'Please enable location access to track your runs.'
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const startLocationTracking = () => {
    if (!hasLocationPermission) return;
    
    amapService.current.startTracking((location: LocationPoint) => {
      setCurrentLocation(location);
      setTrailPath(prev => [...prev, location]);
      
      // Update elevation from actual GPS data if available
      if (location.altitude) {
        // You can update the store with real elevation data here
        // For now, we'll use the existing simulation
      }
    });
  };

  const stopLocationTracking = () => {
    const path = amapService.current.stopTracking();
    console.log('Trail completed:', path);
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
        {/* AMap */}
        <View style={styles.mapContainer}>
          <MockAMapView
            style={styles.map}
            initialRegion={currentLocation ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            } : undefined}
            trailPath={trailPath}
            currentLocation={currentLocation || undefined}
            showUserLocation={true}
          />
          
          {/* Map Controls */}
          {status !== 'idle' && (
            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.mapControlButton}>
                <Ionicons name="add" size={24} color="#111" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapControlButton}>
                <Ionicons name="remove" size={24} color="#111" />
              </TouchableOpacity>
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
    backgroundColor: 'rgba(246, 248, 246, 0.8)',
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