// ─── API Service ──────────────────────────────────────────────────────────────
// Centralized HTTP client for all backend interactions.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Handle 204 No Content (delete responses)
    if (response.status === 204) {
        return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (body) =>
        request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

    login: (body) =>
        request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    getMe: () =>
        request('/api/auth/me'),
};

// ─── URL API ──────────────────────────────────────────────────────────────────
export const urlAPI = {
    create: (body) =>
        request('/api/urls', { method: 'POST', body: JSON.stringify(body) }),

    getAll: () =>
        request('/api/urls'),

    getById: (id) =>
        request(`/api/urls/${id}`),

    update: (id, body) =>
        request(`/api/urls/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    delete: (id) =>
        request(`/api/urls/${id}`, { method: 'DELETE' }),
};

// ─── Analytics API ────────────────────────────────────────────────────────────
export const analyticsAPI = {
    getDashboard: () =>
        request('/api/analytics/dashboard'),

    getUrlStats: (urlId) =>
        request(`/api/analytics/${urlId}`),

    getTimeseries: (urlId, days = 30) =>
        request(`/api/analytics/${urlId}/timeseries?days=${days}`),
};
