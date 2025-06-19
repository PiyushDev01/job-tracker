import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import { useNotifications } from './contexts/NotificationContext.jsx';
import { useEffect, useState } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import JobForm from './pages/JobForm.jsx';
import JobDetails from './pages/JobDetails.jsx';
import Layout from './components/Layout.jsx';

function App() {
  const { user, loading } = useAuth();
  const { connectionError, addNotification } = useNotifications();
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // Show a warning if socket connection has issues (e.g., blocked by adblocker)
  useEffect(() => {
    if (connectionError && !hasShownWarning && user) {
      addNotification(
        'Some features may be limited. Real-time notifications might be blocked by your browser or extensions.',
        'warning'
      );
      setHasShownWarning(true);
      console.warn('Socket connection issues detected - likely blocked by client');
    }
  }, [connectionError, hasShownWarning, addNotification, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }
  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs/new" element={<JobForm />} />
          <Route path="jobs/:id/edit" element={<JobForm />} />
          <Route path="jobs/:id" element={<JobDetails />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
