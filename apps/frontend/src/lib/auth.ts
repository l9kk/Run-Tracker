const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class AuthClient {
    private static async request(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            credentials: 'include', // Include HTTP-only cookies
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
            const response = await this.request('/health');
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    static async getCurrentUser() {
        try {
            const response = await this.request('/auth/me');
            return await response.json();
        } catch (error) {
            return null;
        }
    }
}
