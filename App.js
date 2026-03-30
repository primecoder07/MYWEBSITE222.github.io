import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ClubDashboard from './pages/ClubDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from './components/ui/sonner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={
              user ? (
                user.role === 'student' ? (
                  <StudentDashboard user={user} onLogout={handleLogout} />
                ) : user.role === 'club' ? (
                  <ClubDashboard user={user} onLogout={handleLogout} />
                ) : (
                  <AdminDashboard user={user} onLogout={handleLogout} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;









