export type PaceUnit = 'metric' | 'imperial';

export interface PaceDisplayOptions {
    unit: PaceUnit;
    showUnit?: boolean;
}

export class UnitConverter {
    private static readonly KM_TO_MILE = 0.621371;
    private static readonly MILE_TO_KM = 1.60934;

    static convertPace(paceSecPerKm: number, targetUnit: PaceUnit): number {
        const numericPace = Number(paceSecPerKm);
        if (isNaN(numericPace)) {
            return 0;
        }

        if (targetUnit === 'imperial') {
            return numericPace * this.MILE_TO_KM;
        } else {
            return numericPace / this.MILE_TO_KM;
        }
    }

    static convertDistance(distanceKm: number, targetUnit: PaceUnit): number {
        const numericDistance = Number(distanceKm);
        if (isNaN(numericDistance)) {
            return 0;
        }

        if (targetUnit === 'imperial') {
            return numericDistance * this.KM_TO_MILE;
        } else {
            return numericDistance / this.KM_TO_MILE;
        }
    }

    static formatPace(paceSecPerKm: number, unit: PaceUnit = 'metric', showUnit: boolean = true): string {
        const numericPace = Number(paceSecPerKm);
        if (isNaN(numericPace) || numericPace <= 0) {
            return showUnit ? `0 min/${unit === 'metric' ? 'km' : 'mile'}` : '0 min';
        }

        let paceSeconds: number;

        if (unit === 'imperial') {
            paceSeconds = this.convertPace(numericPace, 'imperial');
        } else {
            paceSeconds = numericPace;
        }

        const minutes = Math.round(paceSeconds / 60 * 10) / 10; // Round to 1 decimal place
        const formattedTime = `${minutes} min`;

        if (showUnit) {
            return `${formattedTime}/${unit === 'metric' ? 'km' : 'mile'}`;
        } else {
            return formattedTime;
        }
    }

    static formatDistance(distanceKm: number, unit: PaceUnit = 'metric', showUnit: boolean = true): string {
        const numericDistance = Number(distanceKm);
        if (isNaN(numericDistance) || numericDistance < 0) {
            return showUnit ? `0 ${unit === 'metric' ? 'km' : 'miles'}` : '0';
        }

        let distance: number;
        let unitLabel: string;

        if (unit === 'imperial') {
            distance = this.convertDistance(numericDistance, 'imperial');
            unitLabel = 'miles';
        } else {
            distance = numericDistance;
            unitLabel = 'km';
        }

        const formattedDistance = distance.toFixed(distance < 10 ? 1 : 0);

        if (showUnit) {
            return `${formattedDistance} ${unitLabel}`;
        } else {
            return formattedDistance;
        }
    }

    static getUnitLabels(unit: PaceUnit) {
        return {
            distance: unit === 'metric' ? 'km' : 'miles',
            pace: unit === 'metric' ? 'min/km' : 'min/mile',
            speed: unit === 'metric' ? 'km/h' : 'mph'
        };
    }
}

export class UnitPreferences {
    private static readonly STORAGE_KEY = 'runtracker_pace_unit';

    static getPreferredUnit(): PaceUnit {
        if (typeof window === 'undefined') {
            return 'metric';
        }

        const stored = localStorage.getItem(this.STORAGE_KEY);
        return (stored === 'imperial' || stored === 'metric') ? stored : 'metric';
    }

    static setPreferredUnit(unit: PaceUnit): void {
        if (typeof window === 'undefined') {
            return;
        }

        localStorage.setItem(this.STORAGE_KEY, unit);
    }

    static toggleUnit(): PaceUnit {
        const current = this.getPreferredUnit();
        const newUnit: PaceUnit = current === 'metric' ? 'imperial' : 'metric';
        this.setPreferredUnit(newUnit);
        return newUnit;
    }
}
