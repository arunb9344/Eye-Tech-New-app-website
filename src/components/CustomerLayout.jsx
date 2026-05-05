import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, ShieldCheck, MapPin, Wrench, LogOut, Hammer } from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: <Home size={20} /> },
    { name: 'Book Service', path: '/customer/book-service', icon: <Wrench size={20} /> },
    { name: 'Book Installation', path: '/customer/book-installation', icon: <Hammer size={20} /> },
    { name: 'My History', path: '/customer/history', icon: <Clock size={20} /> },
    { name: 'Manage AMC', path: '/customer/amc', icon: <ShieldCheck size={20} /> },
    { name: 'Addresses', path: '/customer/addresses', icon: <MapPin size={20} /> },
  ];

  return (
    <div className="app-container">
      <div className="glass-panel animate-fade-in" style={{ width: '250px', margin: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: 'var(--glass-border)' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary-light)' }}>Eye Tech</h3>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Customer Portal</p>
        </div>
        
        <div style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                color: location.pathname.includes(item.path) ? 'white' : 'var(--text-secondary)',
                background: location.pathname.includes(item.path) ? 'var(--color-primary)' : 'transparent',
                transition: 'var(--transition)'
              }}
            >
              {item.icon}
              <span style={{ fontWeight: 500 }}>{item.name}</span>
            </Link>
          ))}
        </div>

        <div style={{ padding: '20px', borderTop: 'var(--glass-border)' }}>
          <button 
            onClick={handleLogout}
            className="btn btn-outline" 
            style={{ width: '100%', borderColor: 'transparent' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default CustomerLayout;
