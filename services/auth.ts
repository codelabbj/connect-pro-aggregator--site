'use client';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const authService = {
    getAccessToken: () => typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null,
    getRefreshToken: () => typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null,
    getUser: () => {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem(USER_KEY);
        try {
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },

    setTokens: (access: string, refresh: string, user: any) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, access);
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Set cookie for SSR (accessToken only)
        document.cookie = `${ACCESS_TOKEN_KEY}=${access}; path=/; max-age=86400; SameSite=Lax`;
    },

    clearAllAuth: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    },

    async login(credentials: { identifier: string; password: string }) {
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';

        const response = await fetch(`${BASE_URL}/api/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            let errorMessage = 'Login failed';

            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (typeof errorData === 'object' && errorData !== null) {
                const messages = Object.entries(errorData).map(([field, msgs]) => {
                    const msgStr = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
                    return field === 'non_field_errors' || field === 'detail' ? msgStr : `${field}: ${msgStr}`;
                });
                if (messages.length > 0) errorMessage = messages.join('; ');
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        const { access, refresh, user } = data;

        // Permission check: strictly is_aggregator
        if (!user.is_aggregator) {
            throw new Error('Access denied. Aggregator privileges required.');
        }

        this.setTokens(access, refresh, user);
        return data;
    },

    async logout() {
        this.clearAllAuth();
        window.location.href = '/login';
    },

    async refreshToken() {
        const refresh = this.getRefreshToken();
        if (!refresh) throw new Error('No refresh token available');

        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';

        const response = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
        });

        if (!response.ok) {
            this.clearAllAuth();
            throw new Error('Refresh token expired');
        }

        const data = await response.json();
        const access = data.access;

        localStorage.setItem(ACCESS_TOKEN_KEY, access);
        document.cookie = `${ACCESS_TOKEN_KEY}=${access}; path=/; max-age=86400; SameSite=Lax`;

        return access;
    },

    async resetPassword(identifier: string) {
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';
        const response = await fetch(`${BASE_URL}/api/auth/password-reset/initiate/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to request password reset');
        }
        return response.json();
    },

    async confirmReset(data: { identifier: string; code: string; new_password: string }) {
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';
        const response = await fetch(`${BASE_URL}/api/auth/password-reset/confirm/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to confirm password reset');
        }
        return response.json();
    },

    async resetPasswordConfirm(uid: string, token: string, password: string) {
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';
        const response = await fetch(`${BASE_URL}/api/auth/password-reset/confirm/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, token, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to confirm password reset');
        }
        return response.json();
    }
};
