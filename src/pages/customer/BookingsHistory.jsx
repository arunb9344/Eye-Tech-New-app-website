import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Clock, Wrench, Hammer, CheckCircle, FileText, Info, Phone, MapPin, User, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import InvoiceGenerator from '../../utils/InvoiceGenerator';

const BookingsHistory = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Remove orderBy from query to avoid index issues and handle mixed date fields
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedBookings = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        
        // Sort in memory to ensure new and old bookings are correctly ordered
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

  const filteredBookings = bookings.filter(b => activeTab === 'All' || b.type === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#2ecc71';
      case 'Active': return '#3498db';
      default: return '#f1c40f'; // Pending
    }
  };

  const formatDate = (timestamp, isoString) => {
    if (!timestamp && !isoString) return 'N/A';
    const date = timestamp ? new Date(timestamp) : new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-GB');
  };

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
        <div className="flex-col gap-6">
          {filteredBookings.map((booking) => {
            const isExpanded = expandedId === booking.id;
            const statusColor = getStatusColor(booking.status);
            
            return (
              <div key={booking.id} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header Section */}
                  <div className="flex flex-col md:flex-row justify-between gap-4 booking-header" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : booking.id)}>
                    <div className="flex gap-4" style={{ minWidth: 0, width: '100%' }}>
                      <div className="booking-icon-box" style={{ 
                        background: booking.type === 'Service' ? 'rgba(0, 206, 201, 0.1)' : 'rgba(255, 118, 117, 0.1)', 
                        padding: '16px', 
                        borderRadius: '16px',
                        height: 'fit-content',
                        flexShrink: 0
                      }}>
                        {booking.type === 'Service' ? <Wrench size={24} color="var(--color-secondary)" /> : <Hammer size={24} color="#ff7675" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1">
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, whiteSpace: 'normal' }}>{booking.type} Booking</h3>
                          <span className="tag tag-outline" style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'rgba(255,255,255,0.08)' }}>
                            ID: {booking.id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                          Booked on: {formatDate(booking.bookingDate, booking.createdAt)}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-3 flex-wrap" style={{ width: '100%' }}>
                          <span className="tag" style={{ 
                            background: `${statusColor}15`, 
                            color: statusColor, 
                            border: `1px solid ${statusColor}33`,
                            fontSize: '0.7rem'
                          }}>
                            {booking.status || 'Pending'}
                          </span>
                          {booking.chargeType && (
                            <span className="tag tag-outline" style={{ fontSize: '0.7rem' }}>{booking.chargeType}</span>
                          )}
                          <span className={`tag ${booking.isEyeTechInstalled ? 'tag-success' : 'tag-outline'}`} style={{ 
                            fontSize: '0.7rem', 
                            background: booking.isEyeTechInstalled ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255,255,255,0.05)',
                            color: booking.isEyeTechInstalled ? '#2ecc71' : 'var(--text-muted)'
                          }}>
                            {booking.isEyeTechInstalled ? 'Eye Tech' : 'Non-Eye Tech'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 mt-2 md:mt-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '4px' }} className="md:border-none md:pt-0 md:mt-0">
                      <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin size={16} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{booking.addressName}</span>
                      </div>
                      <div style={{ color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.9rem' }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        {isExpanded ? 'Hide' : 'Details'}
                      </div>
                    </div>
                  </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                    <div className="grid-2x2 gap-8 mt-6">
                      {/* Customer & Address Info */}
                      <div>
                        <h4 className="mb-4 text-sm uppercase tracking-wider text-muted flex items-center gap-2">
                          <User size={16} /> Customer Information
                        </h4>
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between border-b border-white-5 pb-2">
                            <span className="text-secondary text-sm">Contact Person</span>
                            <span className="font-semibold">{booking.userName}</span>
                          </div>
                          <div className="flex justify-between border-b border-white-5 pb-2">
                            <span className="text-secondary text-sm">Phone Number</span>
                            <span className="font-semibold">{booking.userPhone}</span>
                          </div>
                          <div className="flex flex-col mt-2">
                            <span className="text-secondary text-sm mb-1">Service Address</span>
                            <span className="font-medium text-sm leading-relaxed">{booking.fullAddress}</span>
                          </div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div>
                        <h4 className="mb-4 text-sm uppercase tracking-wider text-muted flex items-center gap-2">
                          <FileText size={16} /> Request Details
                        </h4>
                        <div className="flex flex-col gap-3">
                          {booking.type === 'Installation' && (
                            <div className="flex justify-between border-b border-white-5 pb-2">
                              <span className="text-secondary text-sm">No. of Cameras</span>
                              <span className="font-semibold">{booking.numberOfCameras}</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-secondary text-sm mb-1">Issue / Description</span>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              {booking.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Completion Details */}
                    {booking.status === 'Completed' && (
                      <div className="mt-8 p-6" style={{ background: 'rgba(46, 204, 113, 0.05)', borderRadius: '16px', border: '1px solid rgba(46, 204, 113, 0.1)' }}>
                        <h4 className="mb-4 text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: '#2ecc71' }}>
                          <CheckCircle size={18} /> Admin Completion Details
                        </h4>
                        
                        <div className="grid-2x2 gap-8">
                          <div className="flex flex-col gap-4">
                            {booking.chargeType === 'AMC:Maintenance' && (
                              <div className="flex flex-col gap-2">
                                <span className="text-xs text-muted">Maintenance Checklist</span>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                  <div className="flex items-center gap-1.5 text-xs">
                                    {booking.checkAllCamerasLive ? <CheckCircle size={12} color="#2ecc71" /> : <XCircle size={12} color="#e74c3c" />}
                                    <span>Cameras Live</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    {booking.checkPlaybackWorking ? <CheckCircle size={12} color="#2ecc71" /> : <XCircle size={12} color="#e74c3c" />}
                                    <span>Playback</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    {booking.checkCableIntegrity ? <CheckCircle size={12} color="#2ecc71" /> : <XCircle size={12} color="#e74c3c" />}
                                    <span>Cables</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    {booking.checkMobileViewWorking ? <CheckCircle size={12} color="#2ecc71" /> : <XCircle size={12} color="#e74c3c" />}
                                    <span>Mobile View</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div>
                              <span className="text-xs text-muted block mb-1">Work Done</span>
                              <p className="text-sm font-medium">{booking.completionDescription || 'Work completed as requested.'}</p>
                            </div>

                            {booking.completionNotes && (
                              <div>
                                <span className="text-xs text-muted block mb-1">Admin Completion Notes</span>
                                <p className="text-sm font-medium">{booking.completionNotes}</p>
                              </div>
                            )}
                            
                            {booking.adminNotes && (
                              <div>
                                <span className="text-xs text-muted block mb-1">Important Notes</span>
                                <p className="text-sm font-medium" style={{ color: '#ff7675' }}>{booking.adminNotes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center bg-black-20 p-3 rounded-lg border border-white-5">
                              <span className="text-sm font-bold">Amount Paid</span>
                              {booking.amountCharged > 0 ? (
                                <span className="text-lg font-black" style={{ color: '#2ecc71' }}>₹{booking.amountCharged}</span>
                              ) : (
                                <span className="text-sm font-bold" style={{ color: '#2ecc71' }}>Free / Included</span>
                              )}
                            </div>
                            
                            {booking.invoiceNumber && (
                              <div className="flex justify-between text-xs">
                                <span className="text-muted">Invoice No.</span>
                                <span className="font-bold">{booking.invoiceNumber}</span>
                              </div>
                            )}

                            {booking.invoiceDate && (
                              <div className="flex justify-between text-xs">
                                <span className="text-muted">Invoice Date</span>
                                <span className="font-bold">{formatShortDate(booking.invoiceDate)}</span>
                              </div>
                            )}

                            <div className="flex justify-between text-xs text-muted mt-auto pt-2">
                              <span>Completed on</span>
                              <span className="font-bold text-white">{formatDate(booking.completionDate, booking.completedAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <button 
                            className="btn btn-outline btn-sm flex items-center gap-2" 
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingsHistory;
