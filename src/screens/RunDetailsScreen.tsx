import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useRunStore } from '../store/runStore';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RunDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { id } = route.params || {};
  const { history } = useRunStore();
  const run = history.find((r) => r.id === id);

  // Generate run title using the same logic as HistoryScreen
  const generateRunTitle = (timestamp: number, index: number) => {
    const runTitles = [
      'Forest Trail Run',
      'Sunrise Hill Climb', 
      'Lakeside Loop',
      'City Park Jaunt',
      'Morning Trail Run',
      'Evening Nature Walk',
      'Riverside Path',
      'Mountain View Run',
      'Neighborhood Loop',
      'Scenic Route Run'
    ];
    
    const titleIndex = (Math.floor(timestamp / 86400000) + index) % runTitles.length;
    return runTitles[titleIndex];
  };

  const runIndex = history.findIndex((r) => r.id === id);
  const runTitle = run ? generateRunTitle(run.date, runIndex) : 'Run Details';

  if (!run) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundDark} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Run Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#999' }}>Run not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fmtDistance = (m: number) => `${(m/1000).toFixed(2)} km`;
  const fmtTime = (s: number) => new Date(s * 1000).toISOString().substring(11,19);
  const fmtElevation = (m: number) => `${Math.round(m)} m`;
  const fmtElevationGain = (m: number) => `+${Math.round(m)} m`;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundDark} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{runTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero Image */}
        <ImageBackground
          source={{ uri: run.photos[0]?.uri || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcZ8Ju0uKKMlfYjW3MpG4eeN-l98uA0b6WQb05j6MPpdlEcRvrCH6i_AT2Dq_1rfTY8xjfx3TG8sFzcvF90rxZdLc3HwNRfRr2tGp1eicezHsw9nRiYGLKpc36Ajsv91B9sLNL-AtRfpdGt9KtnCdcbz11o-xZIfcpwLogVyYLv7CGT2w67QkJ0phGcD2gkiA0m97QBnqf-p1prFLjR0sNXYrXRzYfAxcfoc-n8hAUxpp4rWLKdcglUs1Maq7hWH4W4GGU4sw6k0E' }}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        />
        
        <View style={styles.detailsContainer}>
          {/* Run Info */}
          <View style={styles.infoSection}>
            <Text style={styles.runTitle}>{runTitle}</Text>
            <Text style={styles.runDate}>{formatDate(run.date)}</Text>
          </View>
          
          {/* Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{fmtDistance(run.distanceMeters)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{fmtTime(run.durationSec)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Pace</Text>
                <Text style={styles.statValue}>
                  {run.durationSec > 0 ? 
                    (Math.round((run.durationSec/(run.distanceMeters/1000))/60)).toString().padStart(2,'0') + ':' + 
                    Math.round((run.durationSec/(run.distanceMeters/1000))%60).toString().padStart(2,'0') + ' /km' 
                    : '–'
                  }
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Calories</Text>
                <Text style={styles.statValue}>{Math.round(run.distanceMeters/1000*60)} kcal</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Elevation Gain</Text>
                <Text style={styles.statValue}>{fmtElevationGain(run.elevationGainM || 0)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Max Elevation</Text>
                <Text style={styles.statValue}>{fmtElevation(run.maxElevationM || 0)}</Text>
              </View>
            </View>
          </View>
          
          {/* Photos */}
          {run.photos && run.photos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.photosContainer}
              >
                {run.photos.map((photo, idx) => (
                  <TouchableOpacity key={idx} style={styles.photoItem}>
                    <ImageBackground 
                      source={{ uri: photo.uri }} 
                      style={styles.photo} 
                      imageStyle={styles.photoImageStyle} 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
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
    backgroundColor: colors.backgroundDark,
  },
  backButton: {
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
    marginRight: 40, // Balance the back button
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  heroImageStyle: {
    // No border radius for hero image to fill edge to edge
  },
  detailsContainer: {
    padding: 16,
    gap: 24,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  runTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  runDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '31%',
    backgroundColor: `${colors.primary}33`, // 20% opacity
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  photosContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  photoItem: {
    width: 120,
    height: 120,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoImageStyle: {
    borderRadius: 12,
  },
});
