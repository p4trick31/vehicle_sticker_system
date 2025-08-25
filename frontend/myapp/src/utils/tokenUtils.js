// refreshAccessToken.js
import axios from 'axios';

export async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) return null;

    const response = await axios.post('http://localhost:8000/api/token/refresh/', {
      refresh: refreshToken,
    });

    // ✅ Save the new access token under the same key used everywhere else
    localStorage.setItem('access', response.data.access);

    // Save rotated refresh token if your backend uses ROTATE_REFRESH_TOKENS=True
    if (response.data.refresh) {
      localStorage.setItem('refresh', response.data.refresh);
    }

    return response.data.access;
  } catch (error) {
    console.error("Failed to refresh token", error);

    // Clear tokens to avoid stale values
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAuthenticated');

    return null;
  }
}
