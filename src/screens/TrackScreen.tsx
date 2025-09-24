import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path } from 'react-native-svg';
import { useRunStore } from '../store/runStore';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

const mapBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp4iiXh2tvmRtnR8xGsniRkD6TpOd1S2qpvRZcq1hrNUPH1LHkqM5qRzcpo8HcTb76FMhfWA1_4xluRgRT4uEecS12e_1sWZHQJ52iVq-8aMoqrkiwtyQUt-n2_egxM9ZgcWM3b_P5Dh1nl_MYHLPt2YpzBw_rboqK-rP9hYRmTYVuA8epglJQWLbtfPx8-prvc-7WBKbe0M398XHgjPwnAxNIxZpTU3eOhnLA3KMk8Fw_JkdFlBjoC80lpUOHRRyycFZytnBbXJo';

export default function TrackScreen() {
  const navigation = useNavigation();
  const { status, distanceMeters, durationSec, paceStr, start, pause, resume, stop, addPhoto, tick } = useRunStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => tick(1, 1.6), 1000); // simulate ~1.6 m/s
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

  useEffect(() => {
    if (status === 'finished') {
      navigation.navigate('RunSummary' as never);
    }
  }, [status]);

  const onTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Camera permission required'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) addPhoto(result.assets[0].uri);
  };

  // Convert meters to kilometers for display
  const fmtDistance = (m: number) => `${(m / 1000).toFixed(1)} km`;
  const fmtTime = (s: number) => {
    const hours = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format pace in minutes per kilometer
  const fmtPace = () => {
    if (distanceMeters === 0) return '00:00 /km';
    const kmPerHour = (distanceMeters / 1000) / (durationSec / 3600);
    if (kmPerHour === 0) return '00:00 /km';
    const minutesPerKm = 60 / kmPerHour;
    const mins = Math.floor(minutesPerKm);
    const secs = Math.floor((minutesPerKm - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} /km`;
  };

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
        {/* Map */}
        <View style={styles.mapContainer}>
          <ImageBackground source={{ uri: mapBg }} style={styles.map} imageStyle={styles.mapImage}>
            {/* Trail Path Overlay */}
            {status !== 'idle' && (
              <Svg style={styles.trailOverlay} viewBox="0 0 375 234">
                <Path
                  d="M 50 150 Q 80 180, 120 160 T 200 120 Q 250 100, 280 140 T 320 180"
                  fill="none"
                  stroke="rgba(23, 207, 23, 0.8)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="5"
                />
              </Svg>
            )}
            
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
          </ImageBackground>
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
          <View style={[styles.statCard, styles.statCardFullWidth]}>
            <Text style={styles.statLabel}>Pace</Text>
            <Text style={styles.statValue}>{fmtPace()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {status === 'idle' && (
            <>
              <TouchableOpacity style={styles.startButton} onPress={start}>
                <Text style={styles.startButtonText}>Start Run</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onTakePhoto} style={styles.cameraButton}>
                <Ionicons name="camera" size={28} color={colors.primary} />
              </TouchableOpacity>
            </>
          )}
          {(status === 'running' || status === 'paused') && (
            <View style={styles.runningActions}>
              {/* Take Photo Button - Full Width */}
              <TouchableOpacity onPress={onTakePhoto} style={styles.takePhotoButton}>
                <Ionicons name="camera" size={28} color={colors.primary} />
                <Text style={styles.takePhotoText}>Take Photo</Text>
              </TouchableOpacity>
              
              {/* Control Buttons Row */}
              <View style={styles.controlButtonsRow}>
                <TouchableOpacity style={styles.stopButton} onPress={() => stop()}>
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
    paddingBottom: 24,
  },
  mapContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  map: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  mapImage: {
    borderRadius: 16,
  },
  trailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'rgba(17, 33, 17, 0.05)',
    padding: 16,
    borderRadius: 16,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  startButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}33`, // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  runningActions: {
    flex: 1,
    gap: 16,
  },
  takePhotoButton: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: `${colors.primary}33`, // 20% opacity
    gap: 8,
  },
  takePhotoText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlButtonsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stopButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626', // red-600
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eab308', // yellow-500
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
