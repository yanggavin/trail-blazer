import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, SafeAreaView, StatusBar, Modal, Dimensions } from 'react-native';
import { useRunStore } from '../store/runStore';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface PhotoWithMetadata {
  uri: string;
  timestamp: number;
  runId: string;
  runDate: number;
  runTitle: string;
}

const { width: screenWidth } = Dimensions.get('window');
const photoSize = (screenWidth - 48) / 3; // 3 photos per row with margins

export default function PhotosScreen() {
  const { history, photos: currentPhotos } = useRunStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithMetadata | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  // Aggregate all photos from history and current session
  const allPhotos = useMemo(() => {
    const photoList: PhotoWithMetadata[] = [];
    
    // Add photos from completed runs
    history.forEach((run, runIndex) => {
      run.photos.forEach(photo => {
        photoList.push({
          uri: photo.uri,
          timestamp: photo.timestamp,
          runId: run.id,
          runDate: run.date,
          runTitle: generateRunTitle(run.date, runIndex)
        });
      });
    });
    
    // Add photos from current session (if any)
    currentPhotos.forEach(photo => {
      photoList.push({
        uri: photo.uri,
        timestamp: photo.timestamp,
        runId: 'current',
        runDate: Date.now(),
        runTitle: 'Current Run'
      });
    });
    
    // Sort by timestamp (newest first)
    return photoList.sort((a, b) => b.timestamp - a.timestamp);
  }, [history, currentPhotos]);

  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return allPhotos;
    
    const query = searchQuery.toLowerCase();
    return allPhotos.filter(photo => {
      const date = new Date(photo.timestamp).toLocaleDateString();
      return photo.runTitle.toLowerCase().includes(query) ||
             date.includes(query);
    });
  }, [allPhotos, searchQuery]);

  const openPhotoModal = (photo: PhotoWithMetadata, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, selectedIndex - 1)
      : Math.min(filteredPhotos.length - 1, selectedIndex + 1);
    
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
      setSelectedPhoto(filteredPhotos[newIndex]);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPhoto = ({ item, index }: { item: PhotoWithMetadata; index: number }) => (
    <TouchableOpacity 
      style={styles.photoItem}
      onPress={() => openPhotoModal(item, index)}
    >
      <Image source={{ uri: item.uri }} style={styles.photo} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Photo Gallery</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search photos..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Photos Grid */}
      <FlatList
        data={filteredPhotos}
        numColumns={3}
        keyExtractor={(item, index) => `${item.runId}-${index}`}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={renderPhoto}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="camera-outline" size={64} color="#ccc" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No photos yet</Text>
            <Text style={styles.emptySubtitle}>
              Take photos during your runs to create beautiful memories of your trails
            </Text>
          </View>
        )}
      />

      {/* Photo Modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedPhoto(null)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.photoCounter}>
              <Text style={styles.counterText}>
                {selectedIndex + 1} of {filteredPhotos.length}
              </Text>
            </View>
          </View>
          
          {selectedPhoto && (
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedPhoto.uri }} style={styles.modalPhoto} />
              
              <View style={styles.photoInfo}>
                <Text style={styles.photoTitle}>{selectedPhoto.runTitle}</Text>
                <Text style={styles.photoDate}>{formatDate(selectedPhoto.timestamp)}</Text>
              </View>
              
              <View style={styles.navigationButtons}>
                <TouchableOpacity 
                  style={[styles.navButton, selectedIndex === 0 && styles.navButtonDisabled]}
                  onPress={() => navigatePhoto('prev')}
                  disabled={selectedIndex === 0}
                >
                  <Ionicons name="chevron-back" size={24} color={selectedIndex === 0 ? '#666' : 'white'} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.navButton, selectedIndex === filteredPhotos.length - 1 && styles.navButtonDisabled]}
                  onPress={() => navigatePhoto('next')}
                  disabled={selectedIndex === filteredPhotos.length - 1}
                >
                  <Ionicons name="chevron-forward" size={24} color={selectedIndex === filteredPhotos.length - 1 ? '#666' : 'white'} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
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
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  photoItem: {
    width: photoSize,
    height: photoSize,
    marginBottom: 4,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
    marginTop: 50,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalPhoto: {
    width: screenWidth - 32,
    height: screenWidth - 32,
    borderRadius: 12,
    marginBottom: 20,
  },
  photoInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  photoDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    position: 'absolute',
    bottom: 50,
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
