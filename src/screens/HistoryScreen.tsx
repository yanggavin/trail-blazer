import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRunStore } from '../store/runStore';

export default function HistoryScreen() {
  const { history } = useRunStore();
  const navigation = useNavigation<any>();

  const fmtDistance = (m: number) => `${(m/1000).toFixed(2)} km`;
  const fmtTime = (s: number) => new Date(s * 1000).toISOString().substring(11,19);

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RunDetails', { id: item.id })}>
            <Image source={{ uri: item.photos[0]?.uri || 'https://picsum.photos/200' }} style={styles.thumbnail} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{new Date(item.date).toDateString()}</Text>
              <Text style={styles.meta}>{fmtDistance(item.distanceMeters)} • {fmtTime(item.durationSec)}</Text>
            </View>
            <Text style={{ color: '#999' }}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 24 }}>
            <Text style={{ textAlign: 'center', color: '#666' }}>No runs yet. Start one from the Track tab.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f6' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'white', padding: 12, borderRadius: 12 },
  thumbnail: { width: 64, height: 64, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '800', color: '#111' },
  meta: { color: '#444' },
});
