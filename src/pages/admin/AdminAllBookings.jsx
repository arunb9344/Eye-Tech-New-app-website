import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Clock, Wrench, Hammer, Search, CheckCircle, Plus } from 'lucide-react';
import AdminCreateBookingModal from '../../components/AdminCreateBookingModal';

const DetailItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div style={{ padding: '4px 0' }}>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700 }}>{label}</p>
      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{value}</p>
    </div>
  );
};

const AdminAllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Action state
  const [actingOn, setActingOn] = useState(null);
  const [workDescription, setWorkDescription] = useState('');
  const [amountCharged, setAmountCharged] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [freeServicePeriod, setFreeServicePeriod] = useState('1 Year');
  const [freeServiceVisits, setFreeServiceVisits] = useState('2');
  const [generateGstInvoice, setGenerateGstInvoice] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  
  // Cancellation state
  const [cancellingOn, setCancellingOn] = useState(null);
  const [cancelReason, setCancelReason] = useState('Now working perfectly');
  const [customCancelReason, setCustomCancelReason] = useState('');

  // Scheduling state
  const [schedulingOn, setSchedulingOn] = useState(null);
  const [scheduledDateStr, setScheduledDateStr] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'bookings'), orderBy('bookingDate', 'desc'));
      const snapshot = await getDocs(q);
      const bookingsData = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));

      // Fetch users to get name and phone
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersMap = {};
      usersSnap.forEach(doc => {
        usersMap[doc.id] = doc.data();
      });

      const mappedBookings = bookingsData.map(b => ({
        ...b,
        userName: b.userName || usersMap[b.userId]?.name || 'Unknown User',
        userPhone: b.userPhone || usersMap[b.userId]?.phoneNumber || usersMap[b.userId]?.phone || 'N/A',
        addressName: b.addressName || b.addressDetails?.name || '',
        fullAddress: b.fullAddress || (b.addressDetails ? `${b.addressDetails.street || ''}, ${b.addressDetails.city || ''}` : ''),
        pincode: b.pincode || b.addressDetails?.pincode || '',
        isEyeTechInstalled: b.isEyeTechInstalled !== undefined ? b.isEyeTechInstalled : (b.addressDetails?.isEyeTechInstalled || false),
        chargeType: b.chargeType || (b.isFreeService ? 'Free Service' : b.isAmc ? (b.amcType ? `AMC: ${b.amcType}` : 'AMC') : b.type === 'Installation' ? 'New Installation' : 'Chargeable')
      }));

      setBookings(mappedBookings);
    } catch (err) {
      console.error("Error fetching bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleComplete = async (booking) => {
    try {
      const updateData = {
        status: 'Completed',
        completionDescription: workDescription,
        amountCharged: parseFloat(amountCharged) || 0,
        adminNotes: adminNotes,
        completedAt: new Date().toISOString(),
        completionDate: Date.now()
      };

      if (booking.type === 'Installation') {
        updateData.freeServicePeriod = freeServicePeriod;
        updateData.freeServiceVisits = parseInt(freeServiceVisits) || 0;
      }
      
      updateData.isGstInvoice = generateGstInvoice;
      if (generateGstInvoice) {
        updateData.gstNumber = gstNumber;
      }
      
      if (invoiceNumber.trim()) {
        updateData.invoiceNumber = invoiceNumber.trim();
      }
      if (invoiceDate) {
        // Convert yyyy-MM-dd string back to timestamp Long
        const [year, month, day] = invoiceDate.split('-');
        const dateObj = new Date(year, month - 1, day);
        updateData.invoiceDate = dateObj.getTime();
      }

      // Complete booking
      await updateDoc(doc(db, 'bookings', booking.id), updateData);

      // Create notification signal for customer
      await addDoc(collection(db, 'notification_signals'), {
        title: 'Booking Completed',
        body: `Your ${booking.type} request at ${booking.addressName} has been completed.`,
        recipientId: booking.userId,
        status: 'pending',
        type: 'booking_completed',
        createdAt: Date.now()
      });

      // If Installation booking, automatically mark address as Eye Tech Installed
      if (!booking.addressDetails?.isEyeTechInstalled && booking.type === 'Installation') {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1); // Default 1 year free service on new install
        await updateDoc(doc(db, 'addresses', booking.addressId), {
          isEyeTechInstalled: true,
          freeServiceExpiry: date.toISOString()
        });
      }

      setActingOn(null);
      setWorkDescription('');
      setAmountCharged('');
      setAdminNotes('');
      setGenerateGstInvoice(false);
      setGstNumber('');
      setInvoiceNumber('');
      setInvoiceDate('');
      fetchBookings();
      
    } catch (err) {
      console.error("Error completing booking", err);
      alert("Failed to complete booking.");
    }
  };
  
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
        cancelledBy: 'Admin',
        cancelledAt: new Date().toISOString(),
        cancelledDate: Date.now()
      };

      await updateDoc(doc(db, 'bookings', booking.id), updateData);

      // Create notification signal for customer
      await addDoc(collection(db, 'notification_signals'), {
        title: 'Booking Cancelled',
        body: `Your ${booking.type} request at ${booking.addressName} has been cancelled. Reason: ${finalReason}`,
        recipientId: booking.userId,
        status: 'pending',
        type: 'booking_cancelled',
        createdAt: Date.now()
      });

      setCancellingOn(null);
      setCancelReason('Now working perfectly');
      setCustomCancelReason('');
      fetchBookings();
    } catch (err) {
      console.error("Error cancelling booking", err);
      alert("Failed to cancel booking.");
    }
  };

  const handleSchedule = async (booking) => {
    try {
      if (!scheduledDateStr) {
        alert("Please select a date");
        return;
      }
      const [year, month, day] = scheduledDateStr.split('-');
      const dateObj = new Date(year, month - 1, day);
      const scheduledTimestamp = dateObj.getTime();

      const updateData = {
        scheduledDate: scheduledTimestamp
      };

      await updateDoc(doc(db, 'bookings', booking.id), updateData);

      // Create notification signal for customer
      const today = new Date();
      const isToday = today.getFullYear() === dateObj.getFullYear() && 
                      today.getMonth() === dateObj.getMonth() && 
                      today.getDate() === dateObj.getDate();

      const dateString = dateObj.toLocaleDateString('en-GB');

      await addDoc(collection(db, 'notification_signals'), {
        title: 'Booking Scheduled',
        body: isToday 
          ? `Your ${booking.type} request has been scheduled for today.`
          : `Your ${booking.type} request has been scheduled for ${dateString}.`,
        recipientId: booking.userId,
        status: 'pending',
        type: 'booking_scheduled_immediate',
        createdAt: Date.now()
      });

      setSchedulingOn(null);
      setScheduledDateStr('');
      fetchBookings();
    } catch (err) {
      console.error("Error scheduling booking", err);
      alert("Failed to schedule booking.");
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Pending') return b.status === 'Pending' || b.status === 'Active' || b.status === 'In Progress';
    if (activeTab === 'Completed') return b.status === 'Completed';
    if (activeTab === 'Cancelled') return b.status === 'Cancelled';
    return true; // All
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="mb-2">Manage Bookings</h2>
          <p className="mb-8">View and process customer service and installation requests.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Create Booking
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8" style={{ borderBottom: 'var(--glass-border)', paddingBottom: '16px', overflowX: 'auto' }}>
        {['Pending', 'Completed', 'Cancelled', 'All'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px 16px',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary-light)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
              fontSize: '1rem',
              transition: 'var(--transition)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <CheckCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
          <h3>All Caught Up!</h3>
          <p>No {activeTab.toLowerCase()} bookings found.</p>
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
                <DetailItem label="Customer Notes" value={booking.description || 'No notes provided'} />
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {/* Charge Type */}
                <span className="tag" style={{ 
                  background: booking.chargeType.includes('Free') ? 'rgba(76, 175, 80, 0.2)' : booking.chargeType.includes('AMC') ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 152, 0, 0.2)', 
                  color: booking.chargeType.includes('Free') ? '#4CAF50' : booking.chargeType.includes('AMC') ? '#2196F3' : '#FF9800', 
                  border: `1px solid ${booking.chargeType.includes('Free') ? 'rgba(76, 175, 80, 0.4)' : booking.chargeType.includes('AMC') ? 'rgba(33, 150, 243, 0.4)' : 'rgba(255, 152, 0, 0.4)'}` 
                }}>
                  {booking.chargeType}
                </span>

                {/* Eye Tech Installed */}
                {booking.isEyeTechInstalled ? (
                  <span className="tag" style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.4)' }}>Eye Tech Installed</span>
                ) : (
                  <span className="tag" style={{ background: 'rgba(117, 117, 117, 0.2)', color: '#9e9e9e', border: '1px solid rgba(117, 117, 117, 0.4)' }}>Non-Eye Tech Installed</span>
                )}
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0 0 12px 0' }} />
              
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Booked on: {new Date(booking.bookingDate || booking.createdAt).toLocaleString()}
              </p>
              {booking.scheduledDate && (
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-primary-light)', fontWeight: 700 }}>
                  Scheduled Date: {new Date(booking.scheduledDate).toLocaleDateString('en-GB')}
                </p>
              )}

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
                    Work Description: {booking.completionDescription || booking.adminComments}
                  </p>
                  
                  {(booking.amountCharged !== undefined && booking.amountCharged !== null) && (
                    <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-primary-light)', fontWeight: 700 }}>
                      Amount Charged: ₹{booking.amountCharged}
                    </p>
                  )}
                  
                  {(booking.type === 'Installation' || booking.freeServiceVisits > 0) && booking.freeServicePeriod && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#4CAF50', fontWeight: 700 }}>
                      Free Service: {booking.freeServicePeriod} ({booking.freeServiceVisits} Visits)
                    </p>
                  )}
                  
                  {booking.invoiceNumber && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', fontWeight: 600 }}>
                      Invoice Number: {booking.invoiceNumber}
                    </p>
                  )}
                  {booking.invoiceDate && (
                    <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Invoice Date: {new Date(booking.invoiceDate).toLocaleDateString('en-GB')}
                    </p>
                  )}

                  {booking.adminNotes && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#ff4d4d' }}>
                      Admin Private Notes: {booking.adminNotes}
                    </p>
                  )}
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
                  {actingOn === booking.id ? (
                    <div className="flex-col gap-3" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: 'var(--glass-border)' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700 }}>Complete {booking.type} Booking</h4>
                      
                      <div className="flex flex-col gap-3">
                        <div>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{booking.type === 'Installation' ? 'Work Description' : 'Solution Provided'}</label>
                          <textarea 
                            className="input-field"
                            rows="2"
                            value={workDescription}
                            onChange={(e) => setWorkDescription(e.target.value)}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount Charged (₹)</label>
                          <input 
                            type="number"
                            className="input-field"
                            value={amountCharged}
                            onChange={(e) => setAmountCharged(e.target.value)}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </div>

                        {booking.type === 'Installation' && (
                          <>
                            <div>
                              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Free Service Period</label>
                              <select 
                                className="input-field"
                                value={freeServicePeriod}
                                onChange={(e) => setFreeServicePeriod(e.target.value)}
                                style={{ width: '100%', marginTop: '4px' }}
                              >
                                <option value="3 Months">3 Months</option>
                                <option value="6 Months">6 Months</option>
                                <option value="1 Year">1 Year</option>
                                <option value="1.5 Years">1.5 Years</option>
                                <option value="2 Years">2 Years</option>
                                <option value="No-Free Service">No-Free Service</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Number of Free Visits</label>
                              <input 
                                type="number"
                                className="input-field"
                                value={freeServiceVisits}
                                onChange={(e) => setFreeServiceVisits(e.target.value)}
                                style={{ width: '100%', marginTop: '4px' }}
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Admin Notes (Private)</label>
                          <textarea 
                            className="input-field"
                            rows="2"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </div>

                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />

                        <div>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Custom Invoice Number (Optional)</label>
                          <input 
                            type="text"
                            className="input-field"
                            placeholder="e.g. Eye/26-27/250"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Custom Invoice Date (Optional)</label>
                          <input 
                            type="date"
                            className="input-field"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </div>

                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />

                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={generateGstInvoice}
                            onChange={(e) => setGenerateGstInvoice(e.target.checked)}
                            id="generateGst"
                            style={{ width: 'auto' }}
                          />
                          <label htmlFor="generateGst" style={{ fontSize: '0.9rem' }}>Generate GST Invoice</label>
                        </div>

                        {generateGstInvoice && (
                          <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>GST Number</label>
                            <input 
                              type="text"
                              className="input-field"
                              placeholder="Enter GST Number"
                              value={gstNumber}
                              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                              style={{ width: '100%', marginTop: '4px' }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button onClick={() => setActingOn(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button 
                          onClick={() => handleComplete(booking)} 
                          className="btn btn-primary" 
                          style={{ flex: 1 }}
                          disabled={!workDescription.trim()}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ) : cancellingOn === booking.id ? (
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
                  ) : schedulingOn === booking.id ? (
                    <div className="flex-col gap-3" style={{ background: 'rgba(52, 152, 219, 0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: '#3498db' }}>Schedule Booking</h4>
                      
                      <div className="flex flex-col gap-3">
                        <div>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Date</label>
                          <input 
                            type="date"
                            className="input-field"
                            value={scheduledDateStr}
                            onChange={(e) => setScheduledDateStr(e.target.value)}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button onClick={() => setSchedulingOn(null)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                        <button 
                          onClick={() => handleSchedule(booking)} 
                          className="btn" 
                          style={{ flex: 1, background: '#3498db', color: 'white' }}
                        >
                          Confirm Schedule
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setCancellingOn(booking.id)}
                          className="btn btn-outline"
                          style={{ flex: 1, borderColor: '#ff4d4d', color: '#ff4d4d', padding: '12px', borderRadius: '16px' }}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            setSchedulingOn(booking.id);
                            if (booking.scheduledDate) {
                              const d = new Date(booking.scheduledDate);
                              const yyyy = d.getFullYear();
                              const mm = String(d.getMonth() + 1).padStart(2, '0');
                              const dd = String(d.getDate()).padStart(2, '0');
                              setScheduledDateStr(`${yyyy}-${mm}-${dd}`);
                            } else {
                              setScheduledDateStr('');
                            }
                          }}
                          className="btn btn-outline"
                          style={{ flex: 1, borderColor: '#3498db', color: '#3498db', padding: '12px', borderRadius: '16px' }}
                        >
                          {booking.scheduledDate ? "Reschedule" : "Schedule"}
                        </button>
                      </div>
                      <button onClick={() => {
                        setActingOn(booking.id);
                        setGenerateGstInvoice(!!booking.gstNumber);
                        setGstNumber(booking.gstNumber || '');
                        setInvoiceNumber(booking.invoiceNumber || '');
                        if (booking.invoiceDate) {
                          const d = new Date(booking.invoiceDate);
                          const yyyy = d.getFullYear();
                          const mm = String(d.getMonth() + 1).padStart(2, '0');
                          const dd = String(d.getDate()).padStart(2, '0');
                          setInvoiceDate(`${yyyy}-${mm}-${dd}`);
                        } else {
                          setInvoiceDate('');
                        }
                      }} className="btn btn-primary flex justify-center items-center gap-2" style={{ flex: 2, borderRadius: '16px', padding: '12px' }}>
                        <CheckCircle size={20} />
                        <span style={{ fontSize: '1rem', fontWeight: 600 }}>Complete Work</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AdminCreateBookingModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onBookingCreated={() => {
          setShowCreateModal(false);
          fetchBookings();
        }}
      />
    </div>
  );
};

export default AdminAllBookings;
