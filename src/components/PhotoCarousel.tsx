import React from 'react';
import { ScrollView, View, Image, Text, StyleSheet } from 'react-native';

export default function PhotoCarousel({ photos }: { photos: { uri: string; label?: string }[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {photos.map((p, idx) => (
        <View key={idx} style={styles.item}>
          <Image source={{ uri: p.uri }} style={styles.image} />
          {!!p.label && <Text numberOfLines={1} style={styles.caption}>{p.label}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, paddingHorizontal: 12 },
  item: { width: 160 },
  image: { width: '100%', aspectRatio: 1, borderRadius: 12 },
  caption: { marginTop: 6, fontSize: 12, fontWeight: '600' },
});
