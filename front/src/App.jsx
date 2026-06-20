import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminDetections from './admin/pages/AdminDetections';
import AdminDetectionDetail from './admin/pages/AdminDetectionDetail';
import './App.css';

// Layout wrapper for general public view
const PublicLayout = () => {
  return (
    <div className="bg-slate-950 min-h-screen">
      <Navbar />
      <Outlet />
    </div>
  );
};

// Route guard to check for token availability
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Route>

        {/* Admin Auth Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="detections" element={<AdminDetections />} />
          <Route path="detections/:id" element={<AdminDetectionDetail />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Redirect unmatched paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
