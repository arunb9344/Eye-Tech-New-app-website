import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactUs from './pages/ContactUs';

// Layouts
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookingsHistory from './pages/customer/BookingsHistory';
import ManageAMC from './pages/customer/ManageAMC';
import ManageAddresses from './pages/customer/ManageAddresses';
import BookService from './pages/customer/BookService';
import BookInstallation from './pages/customer/BookInstallation';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManageAddresses from './pages/admin/AdminManageAddresses';
import AdminAllBookings from './pages/admin/AdminAllBookings';
import AdminManageAMC from './pages/admin/AdminManageAMC';
import AdminSettings from './pages/admin/AdminSettings';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (userData?.role !== allowedRole) {
    return <Navigate to={userData?.role === 'Admin' ? '/admin/dashboard' : '/customer/dashboard'} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Customer Routes */}
          <Route path="/customer/*" element={
            <ProtectedRoute allowedRole="Customer">
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="history" element={<BookingsHistory />} />
            <Route path="amc" element={<ManageAMC />} />
            <Route path="addresses" element={<ManageAddresses />} />
            <Route path="book-service" element={<BookService />} />
            <Route path="book-installation" element={<BookInstallation />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="Admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="addresses" element={<AdminManageAddresses />} />
            <Route path="bookings" element={<AdminAllBookings />} />
            <Route path="amc" element={<AdminManageAMC />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
