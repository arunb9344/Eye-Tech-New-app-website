import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import CompleteProfile from './pages/CompleteProfile';
import LandingPage from './pages/LandingPage';
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
import CustomerChat from './pages/customer/CustomerChat';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManageAddresses from './pages/admin/AdminManageAddresses';
import AdminAllBookings from './pages/admin/AdminAllBookings';
import AdminManageAMC from './pages/admin/AdminManageAMC';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminChats from './pages/admin/AdminChats';

// ProtectedRoute: checks auth + profile completion + role
const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser, userData, loading, profileIncomplete } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Not logged in → Login
  if (!currentUser) return <Navigate to="/login" replace />;

  // Profile incomplete → Complete Profile
  if (profileIncomplete) return <Navigate to="/complete-profile" replace />;

  // Wrong role → redirect to correct dashboard
  if (userData?.role !== allowedRole) {
    return <Navigate to={userData?.role === 'Admin' ? '/admin/dashboard' : '/customer/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactUs />} />

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
            <Route path="chat" element={<CustomerChat />} />
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
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="chats" element={<AdminChats />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
