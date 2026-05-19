// ═══════════════════════════════════════════════════════════
// Aerocode V3 — Axios API Client
// Instância centralizada para chamadas ao backend
// ═══════════════════════════════════════════════════════════

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor — Injeta token JWT ───────────────
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('aerocode_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — Tratamento de 401 ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido — limpa sessão
      sessionStorage.removeItem('aerocode_token');
      sessionStorage.removeItem('aerocode_usuario');
      
      // Redireciona para login apenas se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
