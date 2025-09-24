import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRunStore } from '../store/runStore';

const mapBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCI0Z0BwtDJ-aakse6EK6NYLjEFbSdhl9rik8D9Vmapr8S7SYujPKdHKgt9m-faSHZOwMb7VamAZGPD8zjXJUoEALO-wglem5bGDfwLYe2DIOTN0thBy-B4rYNUyUDs5lalNzBE0a3Jvovd5eqaFH2VGIkirhvQz3FEFK9NiDqnr_6j2S3H-wshqLRimltDbqUVWvRL2YlUURDEUQSwFarranU7WaEXZ4ydl0ebmhkbLFbE_cA_cjVzZZRMtEkUkN2rgpUP7TLtmDM';

export default function RunSummaryScreen() {
  const navigation = useNavigation();
  const { distanceMeters, durationSec, photos, saveRunToHistory, reset } = useRunStore();

  const fmtDistance = (m: number) => `${(m/1000).toFixed(2)} km`;
  const fmtTime = (s: number) => new Date(s * 1000).toISOString().substring(11,19);

  const onSave = () => {
    const saved = saveRunToHistory();
    if (saved) {
      reset();
      // @ts-ignore
      navigation.replace('SavedConfirmation', { distance: distanceMeters/1000, durationSec });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={styles.mapWrap}>
          <ImageBackground source={{ uri: mapBg }} style={styles.map} />
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statLabel}>Distance</Text><Text style={styles.statValue}>{fmtDistance(distanceMeters)}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Duration</Text><Text style={styles.statValue}>{fmtTime(durationSec)}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Avg Pace</Text><Text style={styles.statValue}>{durationSec>0? (Math.round((durationSec/(distanceMeters/1000))/60)).toString().padStart(2,'0')+':'+Math.round((durationSec/(distanceMeters/1000))%60).toString().padStart(2,'0')+' /km' : '–'}</Text></View>
        </View>
        <View>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 12 }}>
            {photos.map((p, idx) => (
              <ImageBackground key={idx} source={{ uri: p.uri }} style={{ width: 160, aspectRatio: 1 }} imageStyle={{ borderRadius: 12 }} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'rgba(23,207,23,0.2)' }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>Discard Run</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#17cf17' }]} onPress={onSave}>
          <Text style={[styles.buttonText, { color: '#112111' }]}>Save Run</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#112111' },
  mapWrap: { borderRadius: 12, overflow: 'hidden' },
  map: { width: '100%', aspectRatio: 16/9 },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: 'rgba(23,207,23,0.2)', borderRadius: 12, padding: 12, alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.8)' },
  statValue: { color: 'white', fontSize: 22, fontWeight: '800' },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(23,207,23,0.2)' },
  button: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontWeight: '800' },
});
