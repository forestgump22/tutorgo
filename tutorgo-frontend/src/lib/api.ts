// src/lib/api.ts
import axios from 'axios';
import { getCookie } from 'cookies-next'; // Necesitarás instalar cookies-next

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(api.defaults.baseURL)

// Interceptor para añadir el token de autorización
api.interceptors.request.use(
  (config) => {
    // En Next.js, es mejor manejar el token desde cookies
    // para que funcione tanto en cliente como en servidor.
    const token = getCookie('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;