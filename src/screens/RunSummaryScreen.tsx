import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRunStore } from '../store/runStore';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const mapBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCI0Z0BwtDJ-aakse6EK6NYLjEFbSdhl9rik8D9Vmapr8S7SYujPKdHKgt9m-faSHZOwMb7VamAZGPD8zjXJUoEALO-wglem5bGDfwLYe2DIOTN0thBy-B4rYNUyUDs5lalNzBE0a3Jvovd5eqaFH2VGIkirhvQz3FEFK9NiDqnr_6j2S3H-wshqLRimltDbqUVWvRL2YlUURDEUQSwFarranU7WaEXZ4ydl0ebmhkbLFbE_cA_cjVzZZRMtEkUkN2rgpUP7TLtmDM';

export default function RunSummaryScreen() {
  const navigation = useNavigation();
  const { distanceMeters, durationSec, photos, saveRunToHistory, reset } = useRunStore();

  const fmtDistance = (m: number) => `${(m / 1000).toFixed(2)} km`;
  const fmtTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const fmtPace = () => {
    if (distanceMeters === 0 || durationSec === 0) return '–';
    const paceSecPerKm = durationSec / (distanceMeters / 1000);
    const mins = Math.floor(paceSecPerKm / 60);
    const secs = Math.floor(paceSecPerKm % 60);
    return `${mins.toString()}:${secs.toString().padStart(2, '0')} /km`;
  };

  const onSave = () => {
    const saved = saveRunToHistory();
    if (saved) {
      reset();
      // Navigate to SavedConfirmation with run data
      navigation.replace('SavedConfirmation' as never, { 
        distance: distanceMeters, 
        durationSec 
      } as never);
    }
  };

  const onDiscard = () => {
    reset();
    navigation.navigate('Track' as never);
  };

  // Sample photo data for demonstration (since photos might be empty)
  const photoData = photos.length > 0 ? photos : [
    {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBUBFCF20mHNEvp042xoLeqnpx1cv3_LByfEiUwBKDplZOYD0VDnwaqjX1_IPpyyE-ObYwnqoxUs_3PGeI2xWdq9ZibiBa0o4OOlA4rpbueR_IdaTGLHRpbM5ya8_3UlBufkUxevOhOwrHmFyD0mqTh-hSdUlfmgDWg64C3s4XUqBZXLnpBcyeoGp5T51TyC1sOLmovqmc605DCPe-t9cQL_QiX6wTb4q2_v6A44kqEgqZO16G_MmfSUwg3jJD4QJnS59B-vn-1eA',
      timestamp: Date.now(),
      title: 'Scenic View'
    },
    {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuz9NUxwoX3G5zSQumispwWH8bEDbX-1lm-3VyV3JgaAR0ghOW5gBbvCkZ5FmvAaEGaYjMWW9LwZRjmb1wNrG1UWiExnXeRry3a5VjQ1iGG6EYrrhotyICLPKuls3KX0ssy-PPKc7O4MK6C-TVLiFqjwPUVXo9D7IhKFF0ch0cXzdtdg86FR4gNAdXYLteQpHCBLTuW92e1pE1Rf4f4LnulflxWEZr07uvQqqJYtVJtgXsPro5nCF5L60fzCvrDl21KEx_pd6X7bE',
      timestamp: Date.now(),
      title: 'Trail Run'
    },
    {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8MXCF6AeraO66qG_2StJEXeFzHJfUol2qtYWtJ3YsmVjNp-Yu9HXcmy8eAW0HzysTH-xACXuYfkJX8vE7fVqGxCqaoGHz6Mo2QExx9HPUTzXQ_JTb0iLIeKq0St8ZztmJ1ghjJckr-TVKZdOuQm_1r_F-SH1_txYFVMilhNpD3cQDjr73P9s90JolH6nUv6GkZI8xATij0AbyyExRYP6SNsP8C227bv-x5s1Ps4oWYqK6ad2vrKfqqluajx3I1EDvXTTscfyC5aQ',
      timestamp: Date.now(),
      title: 'Forest Trail'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundDark} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onDiscard}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Run Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Map with Photos */}
          <View style={styles.mapContainer}>
            <ImageBackground 
              source={{ uri: mapBg }} 
              style={styles.mapImage}
              imageStyle={styles.mapImageStyle}
            >
              {/* Photo Overlays on Map */}
              <View style={styles.photoOverlay1}>
                <ImageBackground 
                  source={{ uri: photoData[0]?.uri }} 
                  style={styles.photoThumbnail}
                  imageStyle={styles.photoThumbnailImage}
                />
              </View>
              <View style={styles.photoOverlay2}>
                <ImageBackground 
                  source={{ uri: photoData[1]?.uri }} 
                  style={styles.photoThumbnail}
                  imageStyle={styles.photoThumbnailImage}
                />
              </View>
              <View style={styles.photoOverlay3}>
                <ImageBackground 
                  source={{ uri: photoData[2]?.uri }} 
                  style={styles.photoThumbnail}
                  imageStyle={styles.photoThumbnailImage}
                />
              </View>
            </ImageBackground>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>
                {(distanceMeters / 1000).toFixed(2)}
                <Text style={styles.statUnit}>km</Text>
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{fmtTime(durationSec)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Avg Pace</Text>
              <Text style={styles.statValue}>
                {fmtPace().split(' /')[0]}
                <Text style={styles.statUnit}>/km</Text>
              </Text>
            </View>
          </View>

          {/* Photos Section */}
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}
            >
              {photoData.map((photo, idx) => (
                <View key={idx} style={styles.photoCard}>
                  <ImageBackground 
                    source={{ uri: photo.uri }} 
                    style={styles.photoCardImage}
                    imageStyle={styles.photoCardImageStyle}
                  />
                  <Text style={styles.photoCardTitle}>
                    {photo.title || `Photo ${idx + 1}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.discardButton} onPress={onDiscard}>
            <Text style={styles.discardButtonText}>Discard Run</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveButtonText}>Save Run</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}33`, // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 40, // Balance the close button
  },
  headerSpacer: {
    width: 40,
  },
  main: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 24,
  },
  mapContainer: {
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  mapImageStyle: {
    borderRadius: 16,
  },
  photoOverlay1: {
    position: 'absolute',
    top: 40,
    left: '25%',
  },
  photoOverlay2: {
    position: 'absolute',
    bottom: 32,
    right: 48,
  },
  photoOverlay3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  photoThumbnail: {
    width: 48,
    height: 48,
  },
  photoThumbnailImage: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: `${colors.primary}33`, // 20% opacity
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  statUnit: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  photosSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  photosScroll: {
    gap: 12,
    paddingVertical: 8,
  },
  photoCard: {
    width: 160,
    gap: 8,
  },
  photoCardImage: {
    width: '100%',
    aspectRatio: 1,
  },
  photoCardImageStyle: {
    borderRadius: 16,
  },
  photoCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  footer: {
    backgroundColor: 'rgba(246, 248, 246, 0.1)',
    paddingTop: 16,
    paddingBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  discardButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}33`, // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.backgroundDark,
  },
});
