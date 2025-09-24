import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const bg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqEFhtSsvAZWZRiMpKEEPNcJa7Pa_FCRXbEhc7Yxq6ZgjGO3T8_Aooy6SZqqDqGvlzmfjo5skluOQ2TecaOJRsY3ujZ5WDhbfdjyKulnViuS2k-sxWxfGbw_IYaTg9Xywi9ahbBWaiueaoAuHd0daFzl5oAkH4gwBBAtGc_nxB2HT2ARyrb3eWkjaFWzcOjUlhz1QIng28MlREpbyhcCa2oLpTlZTHedCDMA2IgL9rRMsElOKvV_maX_OMqoeAg4OeEKgdxXUm6JM';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: bg }} style={styles.hero}>
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <Text style={styles.title}>Trail. Track. Treasure.</Text>
          <Text style={styles.subtitle}>Your ultimate companion for trail running. Effortlessly track your runs and capture memories along the way.</Text>
        </View>
      </ImageBackground>
      <View style={styles.bottom}>
        <View style={{ height: 8 }} />
        <TouchableOpacity style={styles.cta} onPress={() => navigation.replace('Onboarding')}>
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
        <Text style={styles.signin}>Already have an account? <Text style={styles.link}>Sign In</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#112111' },
  hero: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17,33,17,0.6)' },
  heroContent: { padding: 24 },
  title: { color: 'white', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16 },
  bottom: { padding: 16, backgroundColor: '#112111' },
  cta: { backgroundColor: '#17cf17', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#112111', fontSize: 18, fontWeight: '800' },
  signin: { marginTop: 12, textAlign: 'center', color: '#aaa' },
  link: { color: '#17cf17', fontWeight: '700' },
});
