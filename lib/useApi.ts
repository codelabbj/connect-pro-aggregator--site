'use client';
import { useMemo } from 'react';

import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';

export function useApi() {
    const router = useRouter();

    return useMemo(() => {
        const request = async (endpoint: string, options: RequestInit = {}) => {
            let accessToken = authService.getAccessToken();

            const isFormData = options.body instanceof FormData;

            const headers: any = {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
                ...options.headers,
            };

            if (accessToken) {
                console.log(`Request to ${endpoint} with token: ${accessToken.substring(0, 10)}...`);
            } else {
                console.warn(`No access token found for request to ${endpoint}`);
            }

            const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
            let response;
            try {
                response = await fetch(url, {
                    ...options,
                    headers,
                });
            } catch (networkError) {
                console.error('Network Error:', networkError);
                throw new Error('Network error: Unable to reach the server.');
            }

            // Silent Refresh Logic (Try on 401 or 403)
            if (response.status === 401 || response.status === 403) {
                console.log(`${response.status} detected, attempting silent refresh...`);
                try {
                    const newAccessToken = await authService.refreshToken();

                    // Retry original request with sanitized url
                    response = await fetch(url, {
                        ...options,
                        headers: {
                            ...headers,
                            'Authorization': `Bearer ${newAccessToken}`,
                        },
                    });
                } catch (err) {
                    console.error('Refresh token failed:', err);
                    authService.clearAllAuth();
                    router.push('/login');
                    throw new Error('Session expired');
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`API Error [${response.status}] ${url}:`, errorData);

                let errorMessage = 'API request failed';
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (typeof errorData === 'object' && errorData !== null) {
                    // Handle validation errors like {"password": ["Invalid format"]}
                    const messages = Object.entries(errorData).map(([field, msgs]) => {
                        const msgStr = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
                        return field === 'non_field_errors' || field === 'detail' ? msgStr : `${field}: ${msgStr}`;
                    });
                    if (messages.length > 0) errorMessage = messages.join('; ');
                }

                throw new Error(errorMessage);
            }

            // Handle Success Toasts for non-GET requests
            if (options.method && options.method !== 'GET') {
                console.log(`API Success ${url}`);
            }

            return response.json();
        };

        return {
            get: (endpoint: string) => request(endpoint, { method: 'GET' }),
            post: (endpoint: string, data?: any) => request(endpoint, {
                method: 'POST',
                body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
            }),
            patch: (endpoint: string, data?: any) => request(endpoint, {
                method: 'PATCH',
                body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
            }),
            delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
        };
    }, [router]);
}
