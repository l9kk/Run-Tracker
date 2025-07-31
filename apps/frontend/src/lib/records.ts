import { Run } from './types';

export interface PersonalRecord {
    type: 'distance' | 'pace' | 'duration';
    value: number;
    runId: string;
    date: string;
    description: string;
}

export interface RecordAchievement {
    runId: string;
    achievements: PersonalRecord[];
}

export class PersonalRecords {
    static analyzeRecords(runs: Run[]): {
        records: PersonalRecord[];
        achievements: RecordAchievement[];
    } {
        if (!runs || runs.length === 0) {
            return { records: [], achievements: [] };
        }

        const sortedRuns = [...runs].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const records: PersonalRecord[] = [];
        const achievements: RecordAchievement[] = [];

        // Initialize with first run values to avoid giving badges for baseline comparisons
        const firstRun = sortedRuns[0];
        let bestDistance = Number(firstRun.distanceKm) || 0;
        let bestPace = Number(firstRun.paceSecPerKm) || Infinity;
        let bestDuration = Number(firstRun.durationSec) || 0;

        sortedRuns.forEach((run, index) => {
            const runAchievements: PersonalRecord[] = [];
            const distance = Number(run.distanceKm) || 0;
            const pace = Number(run.paceSecPerKm) || Infinity;
            const duration = Number(run.durationSec) || 0;

            // Skip badge logic for the first run to avoid baseline badges
            // Only give badges for genuine improvements from the second run onwards
            if (index > 0) {
                if (distance > bestDistance && distance > 0) {
                    const record: PersonalRecord = {
                        type: 'distance',
                        value: distance,
                        runId: run.id,
                        date: run.date,
                        description: `Longest run: ${distance.toFixed(2)} km`
                    };
                    records.push(record);
                    runAchievements.push(record);
                }

                if (pace < bestPace && pace > 0 && pace !== Infinity) {
                    const record: PersonalRecord = {
                        type: 'pace',
                        value: pace,
                        runId: run.id,
                        date: run.date,
                        description: `Best pace: ${this.formatPace(pace)}`
                    };
                    records.push(record);
                    runAchievements.push(record);
                }

                if (duration > bestDuration && duration > 0) {
                    const record: PersonalRecord = {
                        type: 'duration',
                        value: duration,
                        runId: run.id,
                        date: run.date,
                        description: `Longest duration: ${this.formatDuration(duration / 60)}`
                    };
                    records.push(record);
                    runAchievements.push(record);
                }
            }

            // Update bests for next iteration
            if (distance > bestDistance && distance > 0) bestDistance = distance;
            if (pace < bestPace && pace > 0 && pace !== Infinity) bestPace = pace;
            if (duration > bestDuration && duration > 0) bestDuration = duration;

            if (runAchievements.length > 0) {
                achievements.push({
                    runId: run.id,
                    achievements: runAchievements
                });
            }
        });

        return { records, achievements };
    }

    static getCurrentRecords(runs: Run[]): {
        bestDistance?: PersonalRecord;
        bestPace?: PersonalRecord;
        bestDuration?: PersonalRecord;
    } {
        if (!runs || runs.length === 0) {
            return {};
        }

        // Find actual current bests from ALL runs
        let bestDistance = 0;
        let bestPace = Infinity;
        let bestDuration = 0;
        let bestDistanceRun: Run | undefined;
        let bestPaceRun: Run | undefined;
        let bestDurationRun: Run | undefined;

        runs.forEach(run => {
            const distance = Number(run.distanceKm) || 0;
            const pace = Number(run.paceSecPerKm) || Infinity;
            const duration = Number(run.durationSec) || 0;

            // Best distance (highest)
            if (distance > 0 && distance > bestDistance) {
                bestDistance = distance;
                bestDistanceRun = run;
            }

            // Best pace (lowest, excluding invalid values)
            if (pace > 0 && pace !== Infinity && pace < bestPace) {
                bestPace = pace;
                bestPaceRun = run;
            }

            // Best duration (highest)
            if (duration > 0 && duration > bestDuration) {
                bestDuration = duration;
                bestDurationRun = run;
            }
        });

        const result: {
            bestDistance?: PersonalRecord;
            bestPace?: PersonalRecord;
            bestDuration?: PersonalRecord;
        } = {};

        if (bestDistanceRun) {
            result.bestDistance = {
                type: 'distance',
                value: bestDistance,
                runId: bestDistanceRun.id,
                date: bestDistanceRun.date,
                description: `Longest run: ${bestDistance.toFixed(2)} km`
            };
        }

        if (bestPaceRun) {
            result.bestPace = {
                type: 'pace',
                value: bestPace,
                runId: bestPaceRun.id,
                date: bestPaceRun.date,
                description: `Best pace: ${this.formatPace(bestPace)}`
            };
        }

        if (bestDurationRun) {
            result.bestDuration = {
                type: 'duration',
                value: bestDuration,
                runId: bestDurationRun.id,
                date: bestDurationRun.date,
                description: `Longest duration: ${this.formatDuration(bestDuration / 60)}`
            };
        }

        return result;
    }

    static getRunAchievements(runId: string, runs: Run[]): PersonalRecord[] {
        const currentRecords = this.getCurrentRecords(runs);
        const achievements: PersonalRecord[] = [];

        // Check if this run holds any current records
        if (currentRecords.bestDistance?.runId === runId) {
            achievements.push(currentRecords.bestDistance);
        }

        if (currentRecords.bestPace?.runId === runId) {
            achievements.push(currentRecords.bestPace);
        }

        if (currentRecords.bestDuration?.runId === runId) {
            achievements.push(currentRecords.bestDuration);
        }

        return achievements;
    }

    static isCurrentRecord(runId: string, runs: Run[]): boolean {
        const currentRecords = this.getCurrentRecords(runs);
        return (
            currentRecords.bestDistance?.runId === runId ||
            currentRecords.bestPace?.runId === runId ||
            currentRecords.bestDuration?.runId === runId
        );
    }

    private static formatPace(paceSecPerKm: number): string {
        const minutes = Math.floor(paceSecPerKm / 60);
        const seconds = Math.round(paceSecPerKm % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
    }

    private static formatDuration(durationMinutes: number): string {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = Math.round(durationMinutes % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}
