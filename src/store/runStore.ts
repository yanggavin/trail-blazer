import { create } from 'zustand';

export type RunStatus = 'idle' | 'running' | 'paused' | 'finished';

interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
}

// Haversine formula to calculate distance between two GPS points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Calculate total distance from array of GPS points
function calculateTotalDistance(points: LocationPoint[]): number {
  if (points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const distance = calculateDistance(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude
    );
    totalDistance += distance;
  }
  
  return totalDistance;
}

// Calculate elevation gain from GPS points
function calculateElevationGain(points: LocationPoint[]): {
  gain: number;
  min: number;
  max: number;
  current: number;
} {
  if (points.length === 0) {
    return { gain: 0, min: 0, max: 0, current: 0 };
  }
  
  let gain = 0;
  let minElevation = points[0].altitude || 0;
  let maxElevation = points[0].altitude || 0;
  const currentElevation = points[points.length - 1].altitude || 0;
  
  for (let i = 1; i < points.length; i++) {
    const prevElevation = points[i - 1].altitude || 0;
    const currentElevation = points[i].altitude || 0;
    
    // Only count upward movement as elevation gain
    if (currentElevation > prevElevation) {
      gain += currentElevation - prevElevation;
    }
    
    minElevation = Math.min(minElevation, currentElevation);
    maxElevation = Math.max(maxElevation, currentElevation);
  }
  
  return {
    gain: Math.max(0, gain),
    min: minElevation,
    max: maxElevation,
    current: currentElevation
  };
}

interface RunState {
  status: RunStatus;
  distanceMeters: number;
  durationSec: number;
  paceStr: string; // mm:ss per km
  currentElevationM: number;
  totalElevationGainM: number;
  minElevationM: number;
  maxElevationM: number;
  elevationPoints: { timestamp: number; elevation: number; distance: number }[];
  gpsPoints: LocationPoint[]; // Store GPS points for real calculations
  startTime: number | null; // Track actual start time
  photos: { uri: string; timestamp: number }[];
  history: {
    id: string;
    date: number;
    distanceMeters: number;
    durationSec: number;
    elevationGainM: number;
    minElevationM: number;
    maxElevationM: number;
    elevationPoints: { timestamp: number; elevation: number; distance: number }[];
    photos: { uri: string; timestamp: number }[];
  }[];
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: (deltaSec: number, deltaMeters?: number) => void;
  addGPSPoint: (point: LocationPoint) => void; // Add GPS point and recalculate
  updateFromGPS: () => void; // Recalculate all metrics from GPS data
  addPhoto: (uri: string) => void;
  saveRunToHistory: () => { id: string } | null;
  reset: () => void;
  addDemoData: () => void;
}

function secToPaceStr(sec: number, meters: number): string {
  if (meters <= 0 || sec <= 0) return '–';
  const paceSecPerKm = (sec / (meters / 1000));
  const m = Math.floor(paceSecPerKm / 60);
  const s = Math.floor(paceSecPerKm % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} /km`;
}

export const useRunStore = create<RunState>((set, get) => ({
  status: 'idle',
  distanceMeters: 0,
  durationSec: 0,
  paceStr: '–',
  currentElevationM: 0,
  totalElevationGainM: 0,
  minElevationM: 0,
  maxElevationM: 0,
  elevationPoints: [],
  gpsPoints: [],
  startTime: null,
  photos: [],
  history: [],
  start: () => {
    const now = Date.now();
    set({ 
      status: 'running', 
      distanceMeters: 0, 
      durationSec: 0, 
      paceStr: '–', 
      photos: [],
      currentElevationM: 0,
      totalElevationGainM: 0,
      minElevationM: 0,
      maxElevationM: 0,
      elevationPoints: [],
      gpsPoints: [], // Will be populated by GPS tracking
      startTime: now
    });
  },
  pause: () => set({ status: 'paused' }),
  resume: () => set({ status: 'running' }),
  stop: () => set({ status: 'finished' }),
  // Update duration based on real time (called by timer)
  tick: (deltaSec, deltaMeters = 0) => {
    const { status, startTime } = get();
    if (status !== 'running' || !startTime) return;
    
    // Calculate actual duration from start time
    const actualDuration = Math.floor((Date.now() - startTime) / 1000);
    
    // Update GPS-based metrics
    get().updateFromGPS();
    
    set({ durationSec: actualDuration });
  },
  
  // Add a GPS point and recalculate all metrics
  addGPSPoint: (point: LocationPoint) => {
    const { gpsPoints, status } = get();
    if (status !== 'running') return;
    
    const newGpsPoints = [...gpsPoints, point];
    set({ gpsPoints: newGpsPoints });
    
    // Recalculate all metrics from GPS data
    get().updateFromGPS();
  },
  
  // Recalculate all running metrics from GPS points
  updateFromGPS: () => {
    const { gpsPoints, startTime } = get();
    
    if (gpsPoints.length === 0) {
      return;
    }
    
    // Calculate distance from GPS points
    const totalDistance = calculateTotalDistance(gpsPoints);
    
    // Calculate elevation data
    const elevationData = calculateElevationGain(gpsPoints);
    
    // Calculate duration from start time
    const actualDuration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    // Calculate pace
    const paceStr = secToPaceStr(actualDuration, totalDistance);
    
    // Update elevation points for the chart (sample every ~100 meters or significant elevation change)
    const elevationPoints: { timestamp: number; elevation: number; distance: number }[] = [];
    let lastElevationPoint = 0;
    let cumulativeDistance = 0;
    
    for (let i = 0; i < gpsPoints.length; i++) {
      if (i > 0) {
        cumulativeDistance += calculateDistance(
          gpsPoints[i - 1].latitude,
          gpsPoints[i - 1].longitude,
          gpsPoints[i].latitude,
          gpsPoints[i].longitude
        );
      }
      
      // Add point if it's the first, every ~100m, or if there's significant elevation change
      const elevationChange = Math.abs((gpsPoints[i].altitude || 0) - lastElevationPoint);
      if (
        i === 0 || 
        i === gpsPoints.length - 1 || 
        cumulativeDistance - (elevationPoints[elevationPoints.length - 1]?.distance || 0) >= 100 ||
        elevationChange >= 10
      ) {
        elevationPoints.push({
          timestamp: gpsPoints[i].timestamp,
          elevation: gpsPoints[i].altitude || 0,
          distance: cumulativeDistance
        });
        lastElevationPoint = gpsPoints[i].altitude || 0;
      }
    }
    
    set({
      distanceMeters: totalDistance,
      paceStr,
      currentElevationM: elevationData.current,
      totalElevationGainM: elevationData.gain,
      minElevationM: elevationData.min,
      maxElevationM: elevationData.max,
      elevationPoints
    });
  },
  addPhoto: (uri) => set((state) => ({ photos: [...state.photos, { uri, timestamp: Date.now() }] })),
  saveRunToHistory: () => {
    const { 
      status, 
      distanceMeters, 
      durationSec, 
      photos, 
      totalElevationGainM, 
      minElevationM, 
      maxElevationM, 
      elevationPoints 
    } = get();
    if (status !== 'finished') return null;
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ 
      history: [{ 
        id, 
        date: Date.now(), 
        distanceMeters, 
        durationSec, 
        elevationGainM: totalElevationGainM,
        minElevationM,
        maxElevationM,
        elevationPoints,
        photos 
      }, ...state.history] 
    }));
    return { id };
  },
  reset: () => set({ 
    status: 'idle', 
    distanceMeters: 0, 
    durationSec: 0, 
    paceStr: '–', 
    photos: [],
    currentElevationM: 0,
    totalElevationGainM: 0,
    minElevationM: 0,
    maxElevationM: 0,
    elevationPoints: [],
    gpsPoints: [],
    startTime: null
  }),
  // Demo method for testing - can be removed later
  addDemoData: () => {
    const demoRuns = [
      {
        id: 'demo1',
        date: Date.now() - 86400000 * 2, // 2 days ago
        distanceMeters: 5200,
        durationSec: 2700, // 45 min
        elevationGainM: 187, // Forest trail with moderate climb
        minElevationM: 142,
        maxElevationM: 329,
        elevationPoints: [
          { timestamp: Date.now() - 86400000 * 2, elevation: 142, distance: 0 },
          { timestamp: Date.now() - 86400000 * 2 + 900000, elevation: 210, distance: 1300 },
          { timestamp: Date.now() - 86400000 * 2 + 1800000, elevation: 295, distance: 2600 },
          { timestamp: Date.now() - 86400000 * 2 + 2700000, elevation: 329, distance: 3900 },
          { timestamp: Date.now() - 86400000 * 2 + 3600000, elevation: 276, distance: 5200 }
        ],
        photos: [
          {
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcZ8Ju0uKKMlfYjW3MpG4eeN-l98uA0b6WQb05j6MPpdlEcRvrCH6i_AT2Dq_1rfTY8xjfx3TG8sFzcvF90rxZdLc3HwNRfRr2tGp1eicezHsw9nRiYGLKpc36Ajsv91B9sLNL-AtRfpdGt9KtnCdcbz11o-xZIfcpwLogVyYLv7CGT2w67QkJ0phGcD2gkiA0m97QBnqf-p1prFLjR0sNXYrXRzYfAxcfoc-n8hAUxpp4rWLKdcglUs1Maq7hWH4W4GGU4sw6k0E',
            timestamp: Date.now() - 86400000 * 2 + 1800000
          },
          {
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5aNv11khUahlD74IOzirJPJ6rGrchwE8pL2oRiPs32ZNT-ClT93SdU2yIT41b0znlGQCrEwO14R6Z4GFGlpgC65MCRRGM2oFTX1n0x7tX_WH97LXOc76pimWH-cMDppprX7yzF1pfkNWYbJ2wW_mMdwVHrziAQcrahzvN3hchLf0rVFPmRGwEBvVAnvm3vi4sHLcNOg8um7To5Ge41NA4FGbonWwnfu0Eo2YxvY5ZTkxIK2Ni6C13ljV3Oj8AbaOnuHjgwoaqTvc',
            timestamp: Date.now() - 86400000 * 2 + 2400000
          }
        ]
      },
      {
        id: 'demo2', 
        date: Date.now() - 86400000, // 1 day ago
        distanceMeters: 3100,
        durationSec: 1680, // 28 min
        elevationGainM: 94, // Hill climb with steep section
        minElevationM: 89,
        maxElevationM: 183,
        elevationPoints: [
          { timestamp: Date.now() - 86400000, elevation: 89, distance: 0 },
          { timestamp: Date.now() - 86400000 + 420000, elevation: 125, distance: 775 },
          { timestamp: Date.now() - 86400000 + 840000, elevation: 168, distance: 1550 },
          { timestamp: Date.now() - 86400000 + 1260000, elevation: 183, distance: 2325 },
          { timestamp: Date.now() - 86400000 + 1680000, elevation: 156, distance: 3100 }
        ],
        photos: [
          {
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1NJWwCWR7Y30ca7Tc1ar361YsQWqjaern0pfgSWL0Wuwi2GsR2IKONy7P2DnlCHJn-MRkrI_J8L5E_N4WUSZtxwJ2R3QbX0bOFsxCyPTO99GzUFGMmcxtFtnBOvjQWl3udaiMdjuM_20E2dQlVX3Qxr1WY7cb6IStTseGd0UxleUtUgKexwM3sVyFWoyex5CouHGKSxJ-YUKFJnk7yVcWkruliId9AXlVr9j5RfBsXMnb62eKIsbkHdI-Fo6sV4ctjTLt38PWTeg',
            timestamp: Date.now() - 86400000 + 900000
          },
          {
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj8VyB0d8WkuJ9saaoDU3JOtuVqdIrN9Xv9xeAONyjmT-auN-gkC2ZG60fQYub4pf7m4rcf7-_nNeEkBaWb020aeLu120k0S_7L7eqtrxb0WG3-_K01R5fZx6f5mPLe3OAv2Su2U9Mf3CorRZPiLMvx5GWw1YFh2h6RKaYQ4IdRuywqhC3vk3vHHnJn__-EPlb9y9iH7kbwsnlb8OYJVB9i5uO_MUg5TVCh8nq5WcJLWSqxOUybUVuAkUBUE8LT8-w7Kyvv1DZJ_E',
            timestamp: Date.now() - 86400000 + 1200000
          },
          {
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBUBFCF20mHNEvp042xoLeqnpx1cv3_LByfEiUwBKDplZOYD0VDnwaqjX1_IPpyyE-ObYwnqoxUs_3PGeI2xWdq9ZibiBa0o4OOlA4rpbueR_IdaTGLHRpbM5ya8_3UlBufkUxevOhOwrHmFyD0mqTh-hSdUlfmgDWg64C3s4XUqBZXLnpBcyeoGp5T51TyC1sOLmovqmc605DCPe-t9cQL_QiX6wTb4q2_v6A44kqEgqZO16G_MmfSUwg3jJD4QJnS59B-vn-1eA',
            timestamp: Date.now() - 86400000 + 1500000
          }
        ]
      }
    ];
    
    set((state) => ({ history: [...demoRuns, ...state.history] }));
  },
}));
