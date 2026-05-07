import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Clock, CheckCircle, FileText, XCircle } from 'lucide-react';
import InvoiceGenerator from '../../utils/InvoiceGenerator';

const DetailItem = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '8px' }}>
    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{value}</span>
  </div>
);

const BookingsHistory = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // Cancellation state
  const [cancellingOn, setCancellingOn] = useState(null);
  const [cancelReason, setCancelReason] = useState('Now working perfectly');
  const [customCancelReason, setCustomCancelReason] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedBookings = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        
        fetchedBookings.sort((a, b) => {
          const dateA = a.bookingDate || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const dateB = b.bookingDate || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return dateB - dateA;
        });
        
        setBookings(fetchedBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchBookings();
  }, [currentUser]);

  const handleCancel = async (booking) => {
    try {
      const finalReason = cancelReason === 'Others' ? customCancelReason : cancelReason;
      if (!finalReason.trim()) {
        alert("Please provide a reason for cancellation");
        return;
      }

      const updateData = {
        status: 'Cancelled',
        cancellationReason: finalReason,
        cancelledBy: 'Customer',
        cancelledAt: new Date().toISOString(),
        cancelledDate: Date.now()
      };

      await updateDoc(doc(db, 'bookings', booking.id), updateData);

      // Create notification signal for admin
      await addDoc(collection(db, 'notification_signals'), {
        title: 'Booking Cancelled by Customer',
        body: `Customer ${currentUser.displayName || 'User'} has cancelled their ${booking.type} request at ${booking.addressName}. Reason: ${finalReason}`,
        recipientId: 'admin',
        status: 'pending',
        type: 'booking_cancelled_customer',
        createdAt: Date.now()
      });

      setCancellingOn(null);
      setCancelReason('Now working perfectly');
      setCustomCancelReason('');
      
      // Refresh bookings
      const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const fetchedBookings = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      fetchedBookings.sort((a, b) => {
        const dateA = a.bookingDate || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const dateB = b.bookingDate || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return dateB - dateA;
      });
      setBookings(fetchedBookings);

    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking.");
    }
  };

  const filteredBookings = bookings.filter(b => activeTab === 'All' || b.type === activeTab);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '950px' }}>
      <div className="mb-8">
        <h2 className="mb-2">Booking History</h2>
        <p style={{ color: 'var(--text-secondary)' }}>View and track all your service and installation requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2px' }}>
        {['All', 'Service', 'Installation'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '12px 24px',
              color: activeTab === tab ? 'var(--color-primary-light)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '3px solid var(--color-primary-light)' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem',
              transition: 'all 0.3s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p>Loading history...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <Clock size={48} color="var(--text-muted)" style={{ opacity: 0.3, margin: '0 auto 24px auto' }} />
          <h3 style={{ color: 'var(--text-muted)' }}>No Bookings Found</h3>
          <p>You haven't made any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings yet.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="glass-panel" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
              {/* Header Row */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{booking.userName}</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-primary-light)', fontWeight: 500 }}>{booking.userPhone}</p>
                </div>
                <div style={{ 
                  background: booking.type === 'Installation' ? 'rgba(108, 92, 231, 0.2)' : 'rgba(0, 210, 211, 0.2)', 
                  color: booking.type === 'Installation' ? 'var(--color-primary-light)' : 'var(--color-secondary)',
                  padding: '6px 16px', 
                  borderRadius: '12px', 
                  fontWeight: 800, 
                  fontSize: '0.9rem' 
                }}>
                  {booking.type}
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-3">
                <DetailItem label="Full Address" value={`${booking.addressName}\n${booking.fullAddress}`} />
                <DetailItem label="Pincode" value={booking.pincode} />
                {booking.type === 'Installation' && <DetailItem label="Cameras to Install" value={booking.noOfCameras || booking.numberOfCameras} />}
                <DetailItem label="Your Notes" value={booking.description || 'No notes provided'} />
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {/* Charge Type */}
                <span className="tag" style={{ 
                  background: booking.chargeType?.includes('Free') ? 'rgba(76, 175, 80, 0.2)' : booking.chargeType?.includes('AMC') ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 152, 0, 0.2)', 
                  color: booking.chargeType?.includes('Free') ? '#4CAF50' : booking.chargeType?.includes('AMC') ? '#2196F3' : '#FF9800', 
                  border: `1px solid ${booking.chargeType?.includes('Free') ? 'rgba(76, 175, 80, 0.4)' : booking.chargeType?.includes('AMC') ? 'rgba(33, 150, 243, 0.4)' : 'rgba(255, 152, 0, 0.4)'}` 
                }}>
                  {booking.chargeType || 'Service'}
                </span>

                {/* Eye Tech Installed */}
                {booking.isEyeTechInstalled ? (
                  <span className="tag" style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.4)' }}>Eye Tech Installed</span>
                ) : (
                  <span className="tag" style={{ background: 'rgba(117, 117, 117, 0.2)', color: '#9e9e9e', border: '1px solid rgba(117, 117, 117, 0.4)' }}>Non-Eye Tech Installed</span>
                )}
                
                {/* Status Badge (Customer view specific) */}
                <span className="tag" style={{
                  background: booking.status === 'Completed' ? 'rgba(46, 204, 113, 0.2)' : booking.status === 'Cancelled' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)',
                  color: booking.status === 'Completed' ? '#2ecc71' : booking.status === 'Cancelled' ? '#e74c3c' : '#3498db',
                  border: `1px solid ${booking.status === 'Completed' ? 'rgba(46, 204, 113, 0.4)' : booking.status === 'Cancelled' ? 'rgba(231, 76, 60, 0.4)' : 'rgba(52, 152, 219, 0.4)'}`
                }}>
                  {booking.status || 'Pending'}
                </span>
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0 0 12px 0' }} />
              
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Booked on: {new Date(booking.bookingDate || booking.createdAt).toLocaleString()}
              </p>

              {booking.status === 'Completed' && (
                <div style={{ 
                  marginTop: '12px', 
                  background: 'rgba(108, 92, 231, 0.05)', 
                  padding: '16px', 
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <h4 style={{ margin: 0, color: 'var(--color-primary-light)', fontSize: '0.95rem', fontWeight: 700 }}>Completion Details</h4>
                  
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Completed on: {new Date(booking.completionDate || booking.completedAt).toLocaleString()}
                  </p>
                  
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
                    Work Done: {booking.completionDescription || booking.adminComments}
                  </p>
                  
                  {(booking.amountCharged !== undefined && booking.amountCharged !== null) && (
                    <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-primary-light)', fontWeight: 700 }}>
                      Amount Charged: ₹{booking.amountCharged}
                    </p>
                  )}
                  
                  {(booking.type === 'Installation' || booking.freeServiceVisits > 0) && booking.freeServicePeriod && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#4CAF50', fontWeight: 700 }}>
                      Free Service Given: {booking.freeServicePeriod} ({booking.freeServiceVisits} Visits)
                    </p>
                  )}
                  
                  {booking.invoiceNumber && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', fontWeight: 600 }}>
                      Invoice Number: {booking.invoiceNumber}
                    </p>
                  )}
                  
                  <div className="mt-4 flex">
                    <button 
                      className="btn btn-outline btn-sm flex items-center justify-center gap-2" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        InvoiceGenerator.generateInvoice(booking);
                      }}
                    >
                      <FileText size={16} /> View Invoice PDF
                    </button>
                  </div>
                </div>
              )}

              {booking.status === 'Cancelled' && (
                <div style={{ 
                  marginTop: '12px', 
                  background: 'rgba(255, 77, 77, 0.05)', 
                  padding: '16px', 
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid rgba(255, 77, 77, 0.1)'
                }}>
                  <h4 style={{ margin: 0, color: '#ff4d4d', fontSize: '0.95rem', fontWeight: 700 }}>Cancellation Details</h4>
                  
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Cancelled on: {new Date(booking.cancelledDate || booking.cancelledAt).toLocaleString()}
                  </p>
                  
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
                    Reason: {booking.cancellationReason || 'No reason provided'}
                  </p>
                  
                  {booking.cancelledBy && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Cancelled by: {booking.cancelledBy}
                    </p>
                  )}
                </div>
              )}

              {(booking.status === 'Pending' || booking.status === 'Active' || booking.status === 'In Progress') && (
                <div style={{ marginTop: '16px' }}>
                  {cancellingOn === booking.id ? (
                    <div className="flex-col gap-3" style={{ background: 'rgba(255, 77, 77, 0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: '#ff4d4d' }}>Cancel Booking</h4>
                      
                      <div className="flex flex-col gap-3">
                        <div>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reason for cancellation</label>
                          <select 
                            className="input-field"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            style={{ width: '100%', marginTop: '4px' }}
                          >
                            <option value="Now working perfectly">Now working perfectly</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>

                        {cancelReason === 'Others' && (
                          <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Describe reason</label>
                            <textarea 
                              className="input-field"
                              rows="2"
                              value={customCancelReason}
                              onChange={(e) => setCustomCancelReason(e.target.value)}
                              style={{ width: '100%', marginTop: '4px' }}
                              placeholder="Enter cancellation reason..."
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button onClick={() => setCancellingOn(null)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                        <button 
                          onClick={() => handleCancel(booking)} 
                          className="btn" 
                          style={{ flex: 1, background: '#ff4d4d', color: 'white' }}
                        >
                          Confirm Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setCancellingOn(booking.id)}
                      className="btn btn-outline flex items-center justify-center gap-2"
                      style={{ width: '100%', borderColor: '#ff4d4d', color: '#ff4d4d', padding: '12px', borderRadius: '16px' }}
                    >
                      <XCircle size={18} /> Cancel Booking
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsHistory;
