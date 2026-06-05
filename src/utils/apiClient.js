import axios from 'axios';
import { clearAuthSession, getAccessToken, getRefreshToken, saveAuthSession } from './authStorage';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthSession();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post('http://localhost:8080/api/auth/refresh', { refreshToken });
        const authData = refreshResponse.data?.data || {};
        const currentSession = {
          user: authData.usuario,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
        };
        saveAuthSession(currentSession);
        originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
