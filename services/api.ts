import { authService } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const accessToken = authService.getAccessToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle Unauthorized (401)
    if (response.status === 401) {
        try {
            const newAccessToken = await authService.refreshToken();
            // Retry with new token
            return fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...headers,
                    'Authorization': `Bearer ${newAccessToken}`,
                },
            }).then(res => res.json());
        } catch (refreshError) {
            authService.logout();
            throw refreshError;
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
    }

    return response.json();
}

export const api = {
    get: (endpoint: string) => fetchWithAuth(endpoint, { method: 'GET' }),
    post: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

export const aggregatorApi = {
    getDashboard: () => api.get('/api/aggregator/dashboard/'),
    getTransactions: (params = '') => api.get(`/api/aggregator/transactions/${params}`),
    getTransactionDetails: (uid: string) => api.get(`/api/aggregator/transactions/${uid}/`),
    getNetworks: () => api.get('/api/aggregator/networks/'),
    createPayin: (data: any) => api.post('/api/aggregator/payin/', data),
    createPayout: (data: any) => api.post('/api/aggregator/payout/', data),
    updateWebhook: (url: string) => api.post('/api/aggregator/webhook-url/', { webhook_url: url }),
    getWebhook: () => api.get('/api/aggregator/webhook-url/'),
};
