import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const mapBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYeqQglf9S07f13XjzLI3MMtDIV79souznyXNry_4Gh5I0ccCsqhvgrqdhDbzZnuNmfuGJyyqT8OiPJ3KkicrDbxLGm28NIgue0M6ZKPQVZ7SL6KZ4RnMDSNk70UY9JAMHGEaF_h1ai3kznWyOydhjOhZ7Uxahl5IPY5PjbeoF5ZXYOoGJIN2cNxgkra0dHaiaHD9hFQUoNwRL3FRaknWlHXsnRbcqeJxU47-EOIWFiHnTQgzQQ3aQjhnIVnzJ8pNMMdrVshgzroQ';

export default function SavedConfirmationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { distance, durationSec } = route.params || {};

  const fmtTime = (s: number) => {
    const totalSec = s || 0;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  const fmtDistance = (meters: number) => {
    const km = (meters || 0) / 1000;
    return `${km.toFixed(1)} km`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.navigate('MainTabs' as never)}
        >
          <Ionicons name="close" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Success Message */}
        <View style={styles.successSection}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Great job, Amelia!</Text>
          <Text style={styles.subtitle}>
            Your run has been successfully saved. You covered{' '}
            <Text style={styles.highlightText}>{fmtDistance(distance)}</Text>
            {' '}in{' '}
            <Text style={styles.highlightText}>{fmtTime(durationSec)}</Text>.
          </Text>
        </View>

        {/* Map Image */}
        <View style={styles.mapContainer}>
          <ImageBackground 
            source={{ uri: mapBg }} 
            style={styles.mapImage} 
            imageStyle={styles.mapImageStyle}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.navigate('History' as never)}
          >
            <Text style={styles.primaryButtonText}>View Run History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('Photos' as never)}
          >
            <Text style={styles.secondaryButtonText}>Photo Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('Track' as never)}
          >
            <Text style={styles.secondaryButtonText}>Start New Run</Text>
          </TouchableOpacity>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  successSection: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}33`, // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  highlightText: {
    fontWeight: '600',
    color: '#111',
  },
  mapContainer: {
    marginBottom: 32,
  },
  mapImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  mapImageStyle: {
    borderRadius: 16,
  },
  actionButtons: {
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.backgroundDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}33`, // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
