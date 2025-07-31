export interface CreateRunData {
    date?: string;
    locationText: string;
    distanceKm: number;
    durationMinutes: number;
    photoUrl?: string;
    lat?: number;
    lon?: number;
}

export interface UpdateRunData {
    date?: string;
    locationText?: string;
    distanceKm?: number;
    durationMinutes?: number;
    photoUrl?: string;
    lat?: number;
    lon?: number;
}

export interface Run {
    id: string;
    userId: string;
    date: string;
    locationText: string;
    lat?: number;
    lon?: number;
    distanceKm: number;
    durationSec: number;
    paceSecPerKm: number;
    photoUrl?: string;
    aiTitle?: string;
    aiNote?: string;
}

export interface RunStats {
    totalRuns: number;
    totalDistance: number;
    averagePace: number;
    bestPace: number | null;
}
