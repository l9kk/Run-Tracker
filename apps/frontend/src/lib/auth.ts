import { CreateRunData, UpdateRunData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class AuthClient {
    private static async request(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }

        return response;
    }

    static async login(email: string, password: string) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        return response.json();
    }

    static async logout() {
        await this.request('/auth/logout', {
            method: 'POST',
        });
    }

    static async checkSession() {
        try {
            const response = await this.request('/auth/me');
            return response.ok;
        } catch (_error) {
            return false;
        }
    }

    static async getCurrentUser() {
        try {
            const response = await this.request('/auth/me');
            return await response.json();
        } catch (_error) {
            return null;
        }
    }

    static async createRun(runData: CreateRunData) {
        const backendData = {
            date: runData.date,
            locationText: runData.locationText,
            distanceKm: runData.distanceKm,
            durationMinutes: runData.durationMinutes,
            photoUrl: runData.photoUrl,
            lat: runData.lat,
            lon: runData.lon
        };

        const response = await this.request('/runs', {
            method: 'POST',
            body: JSON.stringify(backendData),
        });
        return response.json();
    }

    static async getRuns() {
        const response = await this.request('/runs');
        return response.json();
    }

    static async getRunStats() {
        const response = await this.request('/runs/stats');
        return response.json();
    }

    static async getRun(id: string) {
        const response = await this.request(`/runs/${id}`);
        return response.json();
    }

    static async updateRun(id: string, runData: UpdateRunData) {
        const backendData: Record<string, unknown> = {
            date: runData.date,
            locationText: runData.locationText,
            distanceKm: runData.distanceKm,
            photoUrl: runData.photoUrl,
            lat: runData.lat,
            lon: runData.lon
        };

        if (runData.durationMinutes !== undefined) {
            backendData.durationMinutes = runData.durationMinutes;
        }

        Object.keys(backendData).forEach(key => {
            if (backendData[key] === undefined) {
                delete backendData[key];
            }
        });

        const response = await this.request(`/runs/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(backendData),
        });
        return response.json();
    }

    static async deleteRun(id: string) {
        const response = await this.request(`/runs/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    }

    static async generatePresignedUrl(filename: string, contentType: string) {
        const response = await this.request('/upload/presigned-url', {
            method: 'POST',
            body: JSON.stringify({ filename, contentType }),
        });
        return response.json();
    }
}
