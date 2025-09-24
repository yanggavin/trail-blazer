import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MapView, Polyline, Marker } from 'react-native-amap3d';
import { LocationPoint } from '../services/amapService';
import { colors } from '../theme/colors';

interface AMapViewProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  trailPath?: LocationPoint[];
  currentLocation?: LocationPoint;
  showUserLocation?: boolean;
  onRegionChange?: (region: any) => void;
  onPress?: (event: { nativeEvent: { latitude: number; longitude: number } }) => void;
}

const AMapView: React.FC<AMapViewProps> = ({
  style,
  initialRegion,
  trailPath = [],
  currentLocation,
  showUserLocation = true,
  onRegionChange,
  onPress,
}) => {
  const mapRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Default to Beijing if no initial region provided
  const defaultRegion = {
    latitude: 39.9042,
    longitude: 116.4074,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const region = initialRegion || defaultRegion;
  
  // Convert to AMap CameraPosition format
  const cameraPosition = {
    target: {
      latitude: region.latitude,
      longitude: region.longitude,
    },
    zoom: 15,
  };

  useEffect(() => {
    if (mapReady && currentLocation && mapRef.current) {
      // Center map on current location
      mapRef.current.setCenter({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    }
  }, [currentLocation, mapReady]);

  const handleMapReady = () => {
    setMapReady(true);
  };

  // Convert trail path to polyline coordinates
  const polylineCoordinates = trailPath.map(point => ({
    latitude: point.latitude,
    longitude: point.longitude,
  }));

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialCameraPosition={cameraPosition}
        myLocationEnabled={showUserLocation}
        compassEnabled={true}
        scaleControlsEnabled={true}
        zoomControlsEnabled={false}
        onLoad={handleMapReady}
        onCameraIdle={onRegionChange}
        onPress={onPress}
      >
        {/* Trail path polyline */}
        {polylineCoordinates.length > 1 && (
          <Polyline
            points={polylineCoordinates}
            color={colors.primary}
            width={4}
          />
        )}

        {/* Current location marker */}
        {currentLocation && (
          <Marker
            position={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
          />
        )}

        {/* Start point marker */}
        {trailPath.length > 0 && (
          <Marker
            position={{
              latitude: trailPath[0].latitude,
              longitude: trailPath[0].longitude,
            }}
          />
        )}

        {/* End point marker */}
        {trailPath.length > 1 && (
          <Marker
            position={{
              latitude: trailPath[trailPath.length - 1].latitude,
              longitude: trailPath[trailPath.length - 1].longitude,
            }}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  map: {
    flex: 1,
  },
});

export default AMapView;