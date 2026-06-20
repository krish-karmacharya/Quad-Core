import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminDetections from './admin/pages/AdminDetections';
import AdminDetectionDetail from './admin/pages/AdminDetectionDetail';
import AdminUsers from './admin/pages/AdminUsers';
import { getMe } from './admin/services/adminApi';
import './App.css';

// Layout wrapper for general public view
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Outlet />
    </div>
  );
};

// Route guard to verify admin session via cookie and server-side user check
const ProtectedRoute = () => {
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await getMe();
        if (response.success && response.user?.role === 'admin') {
          localStorage.setItem('user', JSON.stringify(response.user));
          setIsValid(true);
        } else {
          localStorage.removeItem('user');
          setIsValid(false);
        }
      } catch {
        localStorage.removeItem('user');
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isChecking) {
    return null;
  }

  return isValid ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin Auth Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="detections" element={<AdminDetections />} />
          <Route path="detections/:id" element={<AdminDetectionDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Redirect unmatched paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
