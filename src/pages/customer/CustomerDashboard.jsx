import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, MapPin, Clock, ArrowRight, Hammer, MessageSquare } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CustomerDashboard = () => {
  const { userData, currentUser } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('userId', '==', currentUser.uid),
          orderBy('bookingDate', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const bookings = [];
        snapshot.forEach((doc) => {
          bookings.push({ id: doc.id, ...doc.data() });
        });
        setRecentBookings(bookings);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  return (
    <div className="animate-fade-in">
      <h2 className="mb-2">Welcome Back, {userData?.name || 'User'}!</h2>
      <p className="mb-8">Manage your Eye Tech Security systems effortlessly.</p>

      <div className="grid-3x3 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex justify-between items-center mb-4">
            <div style={{ background: 'rgba(108, 92, 231, 0.2)', padding: '12px', borderRadius: '12px', color: 'var(--color-primary-light)' }}>
              <Wrench size={24} />
            </div>
          </div>
          <h3>Book Service</h3>
          <p>Schedule a new repair or maintenance visit.</p>
          <Link to="/customer/book-service" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            Book Now <ArrowRight size={16} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex justify-between items-center mb-4">
            <div style={{ background: 'rgba(255, 118, 117, 0.2)', padding: '12px', borderRadius: '12px', color: '#ff7675' }}>
              <Hammer size={24} />
            </div>
          </div>
          <h3>Book Installation</h3>
          <p>Request a professional CCTV installation.</p>
          <Link to="/customer/book-installation" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', background: 'var(--gradient-primary)' }}>
            Book Now <ArrowRight size={16} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex justify-between items-center mb-4">
            <div style={{ background: 'rgba(0, 206, 201, 0.2)', padding: '12px', borderRadius: '12px', color: 'var(--color-secondary)' }}>
              <MapPin size={24} />
            </div>
          </div>
          <h3>My Addresses</h3>
          <p>Manage your installed locations and devices.</p>
          <Link to="/customer/addresses" className="btn btn-outline" style={{ width: '100%', marginTop: '16px' }}>
            View Addresses <ArrowRight size={16} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex justify-between items-center mb-4">
            <div style={{ background: 'rgba(253, 203, 110, 0.2)', padding: '12px', borderRadius: '12px', color: '#fdcb6e' }}>
              <MessageSquare size={24} />
            </div>
          </div>
          <h3>Support Chat</h3>
          <p>Chat with our experts for immediate assistance.</p>
          <Link to="/customer/chat" className="btn btn-outline" style={{ width: '100%', marginTop: '16px' }}>
            Chat Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 style={{ margin: 0 }}>Recent Activity</h3>
          <Link to="/customer/history" style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            View All
          </Link>
        </div>

        {loading ? (
          <p>Loading your activity...</p>
        ) : recentBookings.length > 0 ? (
          <div className="flex-col gap-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '50%' }}>
                    <Clock size={20} color="var(--color-secondary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{booking.type || 'Service Visit'}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className={`tag ${booking.status === 'Completed' ? 'tag-success' : 'tag-warning'}`}>
                  {booking.status || 'Pending'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            You don't have any recent bookings.
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
