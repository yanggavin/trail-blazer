import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { useRunStore } from '../store/runStore';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

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

  const fmtDistance = (m: number) => `${(m/1000).toFixed(2)} km`;
  const fmtTime = (s: number) => new Date(s * 1000).toISOString().substring(11,19);

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: mapBg }} style={styles.map} />
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.label}>Distance</Text><Text style={styles.value}>{fmtDistance(distanceMeters)}</Text></View>
        <View style={styles.stat}><Text style={styles.label}>Duration</Text><Text style={styles.value}>{fmtTime(durationSec)}</Text></View>
        <View style={[styles.stat, { flex: 1 }]}><Text style={styles.label}>Pace</Text><Text style={styles.value}>{paceStr}</Text></View>
      </View>
      <View style={styles.actions}>
        {status === 'idle' && (
          <TouchableOpacity style={styles.primary} onPress={start}><Text style={styles.primaryText}>Start Run</Text></TouchableOpacity>
        )}
        {status === 'running' && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={onTakePhoto} style={[styles.circle, { backgroundColor: 'rgba(23,207,23,0.2)' }]}>
              <Text style={{ color: '#17cf17', fontWeight: '800' }}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => stop()} style={[styles.primary, { backgroundColor: '#e02424' }]}>
              <Text style={[styles.primaryText, { color: 'white' }]}>Stop Run</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pause()} style={[styles.circle, { backgroundColor: '#facc15' }]}>
              <Text style={{ color: '#112111', fontWeight: '800' }}>II</Text>
            </TouchableOpacity>
          </View>
        )}
        {status === 'paused' && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => resume()} style={styles.primary}>
              <Text style={styles.primaryText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => stop()} style={[styles.primary, { backgroundColor: '#e02424' }]}>
              <Text style={[styles.primaryText, { color: 'white' }]}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f6' },
  map: { width: '100%', aspectRatio: 16/10 },
  statsRow: { flexDirection: 'row', gap: 12, padding: 16 },
  stat: { backgroundColor: 'rgba(0,0,0,0.04)', padding: 12, borderRadius: 12 },
  label: { fontSize: 12, color: '#666' },
  value: { fontSize: 20, fontWeight: '800', color: '#111' },
  actions: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  primary: { flex: 1, height: 56, borderRadius: 28, backgroundColor: '#17cf17', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#112111', fontSize: 18, fontWeight: '800' },
  circle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
