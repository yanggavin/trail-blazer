import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useRunStore } from '../store/runStore';

export default function RunDetailsScreen() {
  const route = useRoute<any>();
  const { id } = route.params || {};
  const { history } = useRunStore();
  const run = history.find((r) => r.id === id);

  if (!run) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#999' }}>Run not found.</Text>
      </View>
    );
  }

  const fmtDistance = (m: number) => `${(m/1000).toFixed(2)} km`;
  const fmtTime = (s: number) => new Date(s * 1000).toISOString().substring(11,19);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <ImageBackground
        source={{ uri: run.photos[0]?.uri || 'https://picsum.photos/400' }}
        style={{ width: '100%', aspectRatio: 4/3 }}
      />
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }}>Statistics</Text>
        <View style={styles.grid}>
          <View style={styles.stat}><Text style={styles.label}>Distance</Text><Text style={styles.value}>{fmtDistance(run.distanceMeters)}</Text></View>
          <View style={styles.stat}><Text style={styles.label}>Duration</Text><Text style={styles.value}>{fmtTime(run.durationSec)}</Text></View>
          <View style={styles.stat}><Text style={styles.label}>Pace</Text><Text style={styles.value}>{run.durationSec>0? (Math.round((run.durationSec/(run.distanceMeters/1000))/60)).toString().padStart(2,'0')+':'+Math.round((run.durationSec/(run.distanceMeters/1000))%60).toString().padStart(2,'0')+' /km' : '–'}</Text></View>
          <View style={styles.stat}><Text style={styles.label}>Calories</Text><Text style={styles.value}>{Math.round(run.distanceMeters/1000*60)} kcal</Text></View>
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: 'white', marginTop: 4 }}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 12 }}>
          {run.photos.map((p, idx) => (
            <ImageBackground key={idx} source={{ uri: p.uri }} style={{ width: 192, aspectRatio: 1 }} imageStyle={{ borderRadius: 12 }} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#112111' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '48%', borderTopWidth: 1, borderTopColor: 'rgba(23,207,23,0.3)', paddingTop: 12 },
  label: { color: 'rgba(255,255,255,0.6)' },
  value: { color: 'white', fontSize: 18, fontWeight: '700' },
});
