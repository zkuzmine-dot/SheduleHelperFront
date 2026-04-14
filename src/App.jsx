import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import SchedulePage from './pages/SchedulePage';
import AuthContext from './context/AuthContext';
import Sidebar from './components/Sidebar';
import EventsPage from './pages/EventsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ProfilePage from './pages/ProfilePage';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('https://theschedulehelper.hps-2.ru/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((err) => {
          console.error('Failed to load user data:', err);
          localStorage.removeItem('token'); // Clear invalid token
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="flex min-h-screen bg-gray-100">
          {user && <Sidebar />}
          <div className="flex-1">
            <Routes>
              <Route
                path="/events"
                element={user ? <EventsPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/login"
                element={user ? <Navigate to="/" /> : <LoginPage />}
              />
              <Route
                path="/"
                element={user ? <SchedulePage /> : <Navigate to="/login" />}
              />
              <Route
                path="/admin/users"
                element={
                  user ? (
                    user.role === 'admin' ? (
                      <AdminUsersPage />
                    ) : (
                      <Navigate to="/" />
                    )
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/profile"
                element={user ? <ProfilePage /> : <Navigate to="/login" />}
              />
              {/* Catch-all route for 404 */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;