import { create } from 'zustand';

export type RunStatus = 'idle' | 'running' | 'paused' | 'finished';

interface RunState {
  status: RunStatus;
  distanceMeters: number;
  durationSec: number;
  paceStr: string; // mm:ss per km
  photos: { uri: string; timestamp: number }[];
  history: {
    id: string;
    date: number;
    distanceMeters: number;
    durationSec: number;
    photos: { uri: string; timestamp: number }[];
  }[];
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: (deltaSec: number, deltaMeters?: number) => void;
  addPhoto: (uri: string) => void;
  saveRunToHistory: () => { id: string } | null;
  reset: () => void;
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
  photos: [],
  history: [],
  start: () => set({ status: 'running', distanceMeters: 0, durationSec: 0, paceStr: '–', photos: [] }),
  pause: () => set({ status: 'paused' }),
  resume: () => set({ status: 'running' }),
  stop: () => set({ status: 'finished' }),
  tick: (deltaSec, deltaMeters = 0) => {
    const { status, durationSec, distanceMeters } = get();
    if (status !== 'running') return;
    const newDuration = durationSec + deltaSec;
    const newDistance = distanceMeters + deltaMeters;
    set({ durationSec: newDuration, distanceMeters: newDistance, paceStr: secToPaceStr(newDuration, newDistance) });
  },
  addPhoto: (uri) => set((state) => ({ photos: [...state.photos, { uri, timestamp: Date.now() }] })),
  saveRunToHistory: () => {
    const { status, distanceMeters, durationSec, photos } = get();
    if (status !== 'finished') return null;
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ history: [{ id, date: Date.now(), distanceMeters, durationSec, photos }, ...state.history] }));
    return { id };
  },
  reset: () => set({ status: 'idle', distanceMeters: 0, durationSec: 0, paceStr: '–', photos: [] }),
}));
