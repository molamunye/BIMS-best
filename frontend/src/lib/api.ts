import axios from 'axios';

// Use VITE_API_URL if available (e.g., local dev with .env.local)
// Otherwise default to your live Render backend
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
    : 'https://bims-bplus.onrender.com/api';  // ✅ Live Render backend

// Debug: Log the API URL being used (helpful for troubleshooting)
console.log('🔗 API Base URL:', API_URL);

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const { token } = JSON.parse(user);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Failed to parse user token', error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;