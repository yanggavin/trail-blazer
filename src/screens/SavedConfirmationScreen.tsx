import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const mapBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYeqQglf9S07f13XjzLI3MMtDIV79souznyXNry_4Gh5I0ccCsqhvgrqdhDbzZnuNmfuGJyyqT8OiPJ3KkicrDbxLGm28NIgue0M6ZKPQVZ7SL6KZ4RnMDSNk70UY9JAMHGEaF_h1ai3kznWyOydhjOhZ7Uxahl5IPY5PjbeoF5ZXYOoGJIN2cNxgkra0dHaiaHD9hFQUoNwRL3FRaknWlHXsnRbcqeJxU47-EOIWFiHnTQgzQQ3aQjhnIVnzJ8pNMMdrVshgzroQ';

export default function SavedConfirmationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { distance, durationSec } = route.params || {};

  const fmtTime = (s: number) => new Date((s||0) * 1000).toISOString().substring(11,19);

  return (
    <View style={styles.container}>
      <View style={{ padding: 24, alignItems: 'center' }}>
        <View style={styles.iconWrap}><Text style={{ fontSize: 28 }}>✅</Text></View>
        <Text style={styles.title}>Great job!</Text>
        <Text style={styles.subtitle}>Your run has been saved. You covered <Text style={{ fontWeight: '800' }}>{distance?.toFixed(2)} km</Text> in <Text style={{ fontWeight: '800' }}>{fmtTime(durationSec)}</Text>.</Text>
      </View>
      <ImageBackground source={{ uri: mapBg }} style={{ width: '100%', aspectRatio: 4/3 }} />
      <View style={{ padding: 24, gap: 12 }}>
        <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('History' as never)}>
          <Text style={styles.primaryText}>View Run History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Photos' as never)}>
          <Text style={styles.secondaryText}>Photo Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Track' as never)}>
          <Text style={styles.secondaryText}>Start New Run</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f6' },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(23,207,23,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#111' },
  subtitle: { color: '#444', textAlign: 'center', marginTop: 8 },
  primary: { height: 52, borderRadius: 26, backgroundColor: '#17cf17', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#112111', fontWeight: '800' },
  secondary: { height: 52, borderRadius: 26, backgroundColor: 'rgba(23,207,23,0.2)', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#17cf17', fontWeight: '800' },
});
