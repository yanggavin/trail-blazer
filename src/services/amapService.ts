import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface AMapConfig {
  androidApiKey: string;
  iosApiKey: string;
  webServiceApiKey: string;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
}

export interface TrailPath {
  coordinates: LocationPoint[];
  distance: number;
  duration: number;
}

class AMapService {
  private config: AMapConfig;
  private watchId: number | null = null;
  private currentPath: LocationPoint[] = [];
  
  constructor(config: AMapConfig) {
    this.config = config;
    this.setupGeolocation();
  }

  private setupGeolocation() {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    });
  }

  async requestLocationPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      Geolocation.requestAuthorization(
        () => resolve(true), // Success
        () => resolve(false) // Error
      );
    });
  }

  getCurrentPosition(): Promise<LocationPoint> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const point: LocationPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(point);
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  startTracking(onLocationUpdate: (location: LocationPoint) => void): void {
    this.currentPath = [];
    
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const point: LocationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        
        this.currentPath.push(point);
        onLocationUpdate(point);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
        distanceFilter: 1,
      }
    );
  }

  stopTracking(): TrailPath {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    const path: TrailPath = {
      coordinates: [...this.currentPath],
      distance: this.calculateDistance(this.currentPath),
      duration: this.calculateDuration(this.currentPath),
    };

    this.currentPath = [];
    return path;
  }

  private calculateDistance(coordinates: LocationPoint[]): number {
    if (coordinates.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      totalDistance += this.getDistanceBetweenPoints(
        coordinates[i - 1],
        coordinates[i]
      );
    }
    return totalDistance;
  }

  private calculateDuration(coordinates: LocationPoint[]): number {
    if (coordinates.length < 2) return 0;
    
    const startTime = coordinates[0].timestamp;
    const endTime = coordinates[coordinates.length - 1].timestamp;
    return Math.floor((endTime - startTime) / 1000); // Duration in seconds
  }

  private getDistanceBetweenPoints(point1: LocationPoint, point2: LocationPoint): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Convert GPS coordinates to AMap coordinates (if needed)
  convertGPSToAMap(latitude: number, longitude: number): Promise<{latitude: number, longitude: number}> {
    // AMap coordinate conversion API call would go here
    // For now, return the same coordinates (GPS84 to GCJ02 conversion)
    return Promise.resolve({ latitude, longitude });
  }

  // Reverse geocoding to get address from coordinates
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://restapi.amap.com/v3/geocode/regeo?` +
        `key=${this.config.webServiceApiKey}&` +
        `location=${longitude},${latitude}&` +
        `poitype=&radius=1000&extensions=all&batch=false&roadlevel=0`
      );
      
      const data = await response.json();
      if (data.status === '1' && data.regeocode) {
        return data.regeocode.formatted_address || 'Unknown location';
      }
      return 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Unknown location';
    }
  }

  // Get elevation data from AMap API
  async getElevation(latitude: number, longitude: number): Promise<number> {
    try {
      const response = await fetch(
        `https://restapi.amap.com/v3/assistant/coordinate/convert?` +
        `locations=${longitude},${latitude}&` +
        `coordsys=gps&` +
        `output=json&` +
        `key=${this.config.webServiceApiKey}`
      );
      
      const data = await response.json();
      // Note: AMap doesn't provide direct elevation API
      // You might need to use a third-party service or approximate
      return 100 + Math.random() * 200; // Placeholder
    } catch (error) {
      console.error('Elevation API error:', error);
      return 100; // Default elevation
    }
  }
}

export default AMapService;