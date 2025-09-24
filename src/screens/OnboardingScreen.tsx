import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const bg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfgZrSZAZwj5Qi1S2Cm8AlK9dYlyd5WmeAOel_J0nYgNEGQCB8USfvbVauiPOL7KB-twIfbeaLRLa3naoedD6lxis-1L0OlrIAJ5swWKtdCDymp3uWHA77VqxNNNV5SujmpC6VgtmFa1e1xOMmd-ZKP7lw6CpNwMR4HMWh2dE_AWzADBf8JkQGVh1KpFnxhFxV1XA1ntd1H0NPQgu0Oo7hk0Fh2EtGqNp3sZcGntLKfxcm6Zv0Gx4sqYpDUDdDSIJtY7BZUun08l8';

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: bg }} style={styles.hero}>
        <View style={styles.overlay} />
      </ImageBackground>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Trailblazer</Text>
        <Text style={styles.subtitle}>Discover, track, and share your trail running adventures with a vibrant community.</Text>
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.primary} onPress={() => navigation.replace('MainTabs')}>
          <Text style={styles.primaryText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => navigation.replace('MainTabs')}>
          <Text style={styles.secondaryText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#112111' },
  hero: { height: 320 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17,33,17,0.5)' },
  content: { padding: 24, alignItems: 'center' },
  title: { color: 'white', fontSize: 24, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8 },
  primary: { marginTop: 16, backgroundColor: '#17cf17', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  primaryText: { color: '#112111', fontSize: 18, fontWeight: '800' },
  secondary: { marginTop: 10, backgroundColor: 'rgba(23,207,23,0.2)', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  secondaryText: { color: 'white', fontSize: 18, fontWeight: '800' },
});
