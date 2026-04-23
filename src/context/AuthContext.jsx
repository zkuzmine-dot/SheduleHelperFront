import { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Инициализация: проверяем, есть ли accessToken при загрузке
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);
        } catch (err) {
          console.error('Failed to load user:', err);
          // Пытаемся сделать refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await authAPI.refresh(refreshToken);
              const { access_token, refresh_token } = refreshResponse.data;
              localStorage.setItem('accessToken', access_token);
              localStorage.setItem('refreshToken', refresh_token);
              
              // Пытаемся загрузить пользователя с новым токеном
              const userResponse = await authAPI.getMe();
              setUser(userResponse.data);
            } catch (refreshErr) {
              console.error('Refresh failed:', refreshErr);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          } else {
            localStorage.removeItem('accessToken');
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (username, password, telegramId = null) => {
    try {
      setError(null);
      const response = await authAPI.login(username, password, telegramId);
      const { access_token, refresh_token } = response.data;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      const userResponse = await authAPI.getMe();
      setUser(userResponse.data);

      return userResponse.data;
    } catch (err) {
      const message =
        err.response?.status === 429
          ? 'Слишком много попыток входа. Попробуйте позже.'
          : err.response?.data?.detail || 'Неверное имя пользователя или пароль';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        // authAPI.logout handles Authorization header automatically via interceptor
        await authAPI.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setError(null);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setError(null);
      await authAPI.changePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      const message = err.response?.data?.detail || 'Ошибка при изменении пароля';
      setError(message);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    setUser,
    loading,
    error,
    login,
    logout,
    changePassword,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;