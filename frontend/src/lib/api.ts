import axios from 'axios';

// Use VITE_API_URL if available (for Vercel or local dev with .env)
// Otherwise fallback to your live Vercel backend URL
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`  // Remove trailing slash if present
    : 'https://bims-best-c5mz.vercel.app/api';  // ← CHANGE THIS TO YOUR ACTUAL VERCEL BACKEND URL

////http://localhost:5000/api 

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
                console.error('Failed to parse user from localStorage', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;