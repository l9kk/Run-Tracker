interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    importance: number;
    boundingbox: [string, string, string, string];
}

interface LocationSuggestion {
    id: number;
    displayName: string;
    shortName: string;
    lat: number;
    lon: number;
    type: string;
}

export class GeocodingService {
    private static readonly NOMINATIM_BASE_URL = process.env.NEXT_PUBLIC_NOMINATIM_BASE_URL;
    private static readonly USER_AGENT = process.env.NEXT_PUBLIC_GEOCODE_USER_AGENT;

    static async searchLocations(query: string): Promise<LocationSuggestion[]> {
        if (!query || query.length < 3) {
            return [];
        }

        try {
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                limit: '8',
                addressdetails: '1',
                extratags: '1',
                namedetails: '1'
            });

            const response = await fetch(
                `${this.NOMINATIM_BASE_URL}/search?${params}`,
                {
                    headers: {
                        'User-Agent': this.USER_AGENT || 'run-tracker/1.0',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.status}`);
            }

            const results: NominatimResult[] = await response.json();

            return results.map(result => ({
                id: result.place_id,
                displayName: result.display_name,
                shortName: this.generateShortName(result.display_name),
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                type: result.type,
            })).filter(location => this.isValidLocation(location));

        } catch (error) {
            console.error('Geocoding search failed:', error);
            return [];
        }
    }

    static async reverseGeocode(lat: number, lon: number): Promise<string | null> {
        try {
            const params = new URLSearchParams({
                lat: lat.toString(),
                lon: lon.toString(),
                format: 'json',
                zoom: '14',
            });

            const response = await fetch(
                `${this.NOMINATIM_BASE_URL}/reverse?${params}`,
                {
                    headers: {
                        'User-Agent': this.USER_AGENT || 'run-tracker/1.0',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Reverse geocoding API error: ${response.status}`);
            }

            const result: NominatimResult = await response.json();
            return result.display_name || null;

        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return null;
        }
    }

    private static generateShortName(displayName: string): string {
        // Extract meaningful parts for a shorter display
        const parts = displayName.split(', ');

        if (parts.length >= 3) {
            // Show first part and last 2 parts (e.g., "Central Park, New York, USA")
            return `${parts[0]}, ${parts.slice(-2).join(', ')}`;
        } else if (parts.length >= 2) {
            // Show first and last part
            return `${parts[0]}, ${parts[parts.length - 1]}`;
        }

        return parts[0] || displayName;
    }

    private static isValidLocation(location: LocationSuggestion): boolean {
        // Filter out very low importance results and ensure coordinates are valid
        return (
            location.lat >= -90 && location.lat <= 90 &&
            location.lon >= -180 && location.lon <= 180 &&
            location.displayName.length > 0
        );
    }

    static getCurrentLocation(): Promise<{ lat: number; lon: number }> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(new Error(`Geolocation error: ${error.message}`));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000, // 5 minutes
                }
            );
        });
    }
}
