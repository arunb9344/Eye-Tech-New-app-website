import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, TrendingUp, ShieldCheck, Activity } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeBookings: 0,
    activeAMCs: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingData, setBookingData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'Customer')));
        const bookingsSnap = await getDocs(collection(db, 'bookings'));
        const amcsSnap = await getDocs(query(collection(db, 'purchased_amcs'), where('status', '==', 'Approved')));
        
        // Calculate revenue from active AMCs
        const totalRevenue = amcsSnap.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);

        // Calculate Weekly Bookings
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const newBookingData = [
          { name: 'Mon', Service: 0, Installation: 0 },
          { name: 'Tue', Service: 0, Installation: 0 },
          { name: 'Wed', Service: 0, Installation: 0 },
          { name: 'Thu', Service: 0, Installation: 0 },
          { name: 'Fri', Service: 0, Installation: 0 },
          { name: 'Sat', Service: 0, Installation: 0 },
          { name: 'Sun', Service: 0, Installation: 0 },
        ];

        bookingsSnap.forEach(doc => {
          const data = doc.data();
          const date = new Date(data.bookingDate || data.createdAt);
          const dayName = days[date.getDay()];
          const dayObj = newBookingData.find(d => d.name === dayName);
          if (dayObj) {
            if (data.type === 'Service') dayObj.Service++;
            else if (data.type === 'Installation') dayObj.Installation++;
          }
        });
        setBookingData(newBookingData);

        // Calculate Monthly Revenue Trend (Last 6 Months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const idx = (currentMonthIdx - i + 12) % 12;
          last6Months.push({ name: months[idx], value: 0 });
        }

        amcsSnap.forEach(doc => {
          const data = doc.data();
          const date = new Date(data.purchaseDate || data.createdAt);
          const monthName = months[date.getMonth()];
          const monthObj = last6Months.find(m => m.name === monthName);
          if (monthObj) {
            monthObj.value += (data.totalAmount || 0);
          }
        });
        setRevenueData(last6Months);

        setStats({
          totalCustomers: usersSnap.size,
          activeBookings: bookingsSnap.docs.filter(d => ['Pending', 'Active', 'In Progress'].includes(d.data().status)).length,
          activeAMCs: amcsSnap.size,
          revenue: totalRevenue
        });
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, trend, colorClass }) => (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div className="flex justify-between items-center mb-4">
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }} className={colorClass}>
          {icon}
        </div>
        {trend && <span className="tag tag-success">{trend}</span>}
      </div>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>{title}</p>
      <h2 style={{ margin: '8px 0 0 0', fontSize: '2rem' }}>{value}</h2>
    </div>
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Insights...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="mb-2">CEO Insights Dashboard</h2>
          <p className="mb-0">Overview of your business performance.</p>
        </div>
      </div>

      <div className="grid-2x2 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={<Users size={24} />} 
          colorClass="text-primary-light"
        />
        <StatCard 
          title="Active Bookings" 
          value={stats.activeBookings} 
          icon={<Activity size={24} color="var(--color-secondary)" />} 
        />
        <StatCard 
          title="Active AMCs" 
          value={stats.activeAMCs} 
          icon={<ShieldCheck size={24} color="#FDCB6E" />} 
        />
        <StatCard 
          title="Total AMC Revenue" 
          value={`₹${stats.revenue.toLocaleString()}`} 
          icon={<TrendingUp size={24} color="var(--color-accent)" />} 
        />
      </div>

      <div className="grid-2x2">
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="mb-6">Revenue Trend (Active AMCs)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-light)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-primary-light)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-gradient)', border: 'var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'white' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary-light)" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="mb-6">Weekly Bookings</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-gradient)', border: 'var(--glass-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="Service" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Installation" fill="var(--color-primary-light)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
