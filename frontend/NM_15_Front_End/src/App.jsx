import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Budget from './components/Budget';
import SmartSpending from './components/SmartSpending';
import Investment from './components/Investment';
import About from './components/About';
import BackupRestore from './components/BackupRestore';
import UserProfile from './components/UserProfile';
import Transactions from './components/Transactions';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check for user and token in localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('budgetBuddyUser');
    const storedToken = localStorage.getItem('budgetBuddyToken');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        // If there's an error parsing, also clear the token
        localStorage.removeItem('budgetBuddyToken');
      }
    }
    setLoading(false);
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('budgetBuddyUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('budgetBuddyUser');
      localStorage.removeItem('budgetBuddyToken'); // Clear token when user logs out
    }
  }, [user]);

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin'] }) => {
    if (loading) return <div className="app-loading">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
    return children;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // Unauthorized page component
  const Unauthorized = () => (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <h1>Unauthorized Access</h1>
        <p>You don't have permission to view this page.</p>
        <button
          onClick={() => window.history.back()}
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  // Role-based redirect - redirect unauthenticated users to login
  const UnauthRedirect = () => {
    return <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="App">
        <Navigation user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" replace />} />
          <Route
            path="/login"
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup setUser={setUser} /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/transaction-history"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <Transactions userRole={user?.role} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <Dashboard userRole={user?.role} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <Budget userRole={user?.role} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/smart-spending"
            element={user ? <SmartSpending /> : <Navigate to="/login" replace />}

          />
          <Route
            path="/investment"
            element={user ? <Investment /> : <Navigate to="/login"/>}
          />
          <Route
            path="/backup-restore"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <BackupRestore userRole={user?.role} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <About userRole={user?.role} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <UserProfile userRole={user?.role} />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;