import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRunStore } from '../store/runStore';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function HistoryScreen() {
  const { history, addDemoData } = useRunStore();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const fmtDistance = (m: number) => `${(m/1000).toFixed(1)} mi`; // Changed to miles for consistency with design
  const fmtTime = (s: number) => {
    const mins = Math.floor(s / 60);
    return `${mins} min`;
  };
  const fmtElevationGain = (m: number) => `+${Math.round(m)} m`;

  const fmtDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const generateRunTitle = (timestamp: number, index: number) => {
    const date = new Date(timestamp);
    const hour = date.getHours();
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
    
    // Use a combination of timestamp and index to get consistent titles
    const titleIndex = (Math.floor(timestamp / 86400000) + index) % runTitles.length;
    return runTitles[titleIndex];
  };

  const getDefaultThumbnail = (index: number) => {
    const thumbnails = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBcZ8Ju0uKKMlfYjW3MpG4eeN-l98uA0b6WQb05j6MPpdlEcRvrCH6i_AT2Dq_1rfTY8xjfx3TG8sFzcvF90rxZdLc3HwNRfRr2tGp1eicezHsw9nRiYGLKpc36Ajsv91B9sLNL-AtRfpdGt9KtnCdcbz11o-xZIfcpwLogVyYLv7CGT2w67QkJ0phGcD2gkiA0m97QBnqf-p1prFLjR0sNXYrXRzYfAxcfoc-n8hAUxpp4rWLKdcglUs1Maq7hWH4W4GGU4sw6k0E',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5aNv11khUahlD74IOzirJPJ6rGrchwE8pL2oRiPs32ZNT-ClT93SdU2yIT41b0znlGQCrEwO14R6Z4GFGlpgC65MCRRGM2oFTX1n0x7tX_WH97LXOc76pimWH-cMDppprX7yzF1pfkNWYbJ2wW_mMdwVHrziAQcrahzvN3hchLf0rVFPmRGwEBvVAnvm3vi4sHLcNOg8um7To5Ge41NA4FGbonWwnfu0Eo2YxvY5ZTkxIK2Ni6C13ljV3Oj8AbaOnuHjgwoaqTvc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1NJWwCWR7Y30ca7Tc1ar361YsQWqjaern0pfgSWL0Wuwi2GsR2IKONy7P2DnlCHJn-MRkrI_J8L5E_N4WUSZtxwJ2R3QbX0bOFsxCyPTO99GzUFGMmcxtFtnBOvjQWl3udaiMdjuM_20E2dQlVX3Qxr1WY7cb6IStTseGd0UxleUtUgKexwM3sVyFWoyex5CouHGKSxJ-YUKFJnk7yVcWkruliId9AXlVr9j5RfBsXMnb62eKIsbkHdI-Fo6sV4ctjTLt38PWTeg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBj8VyB0d8WkuJ9saaoDU3JOtuVqdIrN9Xv9xeAONyjmT-auN-gkC2ZG60fQYub4pf7m4rcf7-_nNeEkBaWb020aeLu120k0S_7L7eqtrxb0WG3-_K01R5fZx6f5mPLe3OAv2Su2U9Mf3CorRZPiLMvx5GWw1YFh2h6RKaYQ4IdRuywqhC3vk3vHHnJn__-EPlb9y9iH7kbwsnlb8OYJVB9i5uO_MUg5TVCh8nq5WcJLWSqxOUybUVuAkUBUE8LT8-w7Kyvv1DZJ_E'
    ];
    return thumbnails[index % thumbnails.length];
  };

  const filteredHistory = history.filter(run => {
    const title = generateRunTitle(run.date, history.indexOf(run));
    const date = fmtDate(run.date);
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           date.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Run History</Text>
          <View style={styles.headerButtons}>
            {history.length === 0 && (
              <TouchableOpacity 
                style={styles.demoButton} 
                onPress={addDemoData}
              >
                <Text style={styles.demoButtonText}>Add Demo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search runs..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Run List */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.runCard} 
            onPress={() => navigation.navigate('RunDetails', { id: item.id })}
          >
            <View style={styles.thumbnailContainer}>
              <Image 
                source={{ uri: item.photos[0]?.uri || getDefaultThumbnail(index) }} 
                style={styles.thumbnail} 
              />
            </View>
            
            <View style={styles.runInfo}>
              <Text style={styles.runTitle}>{generateRunTitle(item.date, index)}</Text>
              <Text style={styles.runDate}>{fmtDate(item.date)}</Text>
              <View style={styles.statsContainer}>
                <Text style={styles.statText}>
                  <Text style={styles.statValue}>{fmtDistance(item.distanceMeters).split(' ')[0]}</Text>
                  {' ' + fmtDistance(item.distanceMeters).split(' ')[1]}
                </Text>
                <Text style={styles.statText}>
                  <Text style={styles.statValue}>{fmtTime(item.durationSec).split(' ')[0]}</Text>
                  {' ' + fmtTime(item.durationSec).split(' ')[1]}
                </Text>
                <Text style={styles.statText}>
                  <Text style={styles.statValue}>{fmtElevationGain(item.elevationGainM || 0)}</Text>
                </Text>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#ccc" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No runs yet</Text>
            <Text style={styles.emptySubtitle}>Start tracking your first run from the Track tab</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.backgroundLight,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  demoButtonText: {
    color: colors.backgroundDark,
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 16,
  },
  runCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnailContainer: {
    marginRight: 16,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  runInfo: {
    flex: 1,
    marginRight: 8,
  },
  runTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 2,
  },
  runDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 14,
    color: '#333',
  },
  statValue: {
    fontWeight: '600',
    color: '#111',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
