import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ShieldCheck, Plus, X, Users, Settings, Clock, AlertTriangle } from 'lucide-react';
import { isAmcExpired, getExpiryReason } from '../../utils/AmcUtils';

const AdminManageAMC = () => {
  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  };
  const [packages, setPackages] = useState([]);
  const [customerAmcs, setCustomerAmcs] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Approvals');
  const [selectedAmc, setSelectedAmc] = useState(null);
  
  // Package Form State
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [pkgName, setPkgName] = useState('');
  const [breakdownVisits, setBreakdownVisits] = useState(1);
  const [maintenanceVisits, setMaintenanceVisits] = useState(2);
  const [validityMonths, setValidityMonths] = useState(12);
  const [pricePerCamera, setPricePerCamera] = useState(1000);
  const [creatingPkg, setCreatingPkg] = useState(false);
  
  // Completion State
  const [completingBooking, setCompletingBooking] = useState(null);
  const [checklist, setChecklist] = useState({
    checkAllCamerasLive: false,
    checkPlaybackWorking: false,
    checkDateTimeCorrect: false,
    checkMobileViewWorking: false,
    checkAllLensCleaned: false,
    checkNoBlurView: false,
    checkRecordingStorage: false,
    checkMotionDetection: false,
    checkCableIntegrity: false,
    completionNotes: ''
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pkgsSnap = await getDocs(collection(db, 'amc_packages'));
      setPackages(pkgsSnap.docs.map(d => ({ ...d.data(), id: d.id })));

      const amcsQ = query(collection(db, 'purchased_amcs'), orderBy('purchaseDate', 'desc'));
      const amcsSnap = await getDocs(amcsQ);
      const amcsData = amcsSnap.docs.map(d => ({ ...d.data(), id: d.id }));

      const usersSnap = await getDocs(collection(db, 'users'));
      const usersMap = {};
      usersSnap.forEach(doc => {
        usersMap[doc.id] = doc.data();
      });

      const mappedAmcs = amcsData.map(amc => ({
        ...amc,
        userName: amc.userName || usersMap[amc.userId]?.name || 'Unknown User',
        userPhone: amc.userPhone || usersMap[amc.userId]?.phone || usersMap[amc.userId]?.phoneNumber || 'N/A'
      }));

      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const bookingsData = bookingsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
      setAllBookings(bookingsData);

      setCustomerAmcs(mappedAmcs);
    } catch (err) {
      console.error("Error fetching AMC data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setCreatingPkg(true);
    try {
      await addDoc(collection(db, 'amc_packages'), {
        name: pkgName,
        breakdownVisits: parseInt(breakdownVisits),
        maintenanceVisits: parseInt(maintenanceVisits),
        validityMonths: parseInt(validityMonths),
        pricePerCamera: parseInt(pricePerCamera),
        createdAt: new Date().toISOString()
      });
      setShowPackageForm(false);
      // Reset
      setPkgName(''); setBreakdownVisits(1); setMaintenanceVisits(2); setValidityMonths(12); setPricePerCamera(1000);
      fetchData();
    } catch (err) {
      console.error("Error creating package", err);
      alert("Failed to create package.");
    } finally {
      setCreatingPkg(false);
    }
  };

  const handleApproval = async (id, status) => {
    try {
      const amc = customerAmcs.find(a => a.id === id);
      const updateData = { status: status };
      
      if (status === 'Approved' && amc) {
        // Calculate validity: current time + validityMonths
        const months = amc.validityMonths || 12;
        updateData.validityUpto = Date.now() + (months * 30 * 24 * 60 * 60 * 1000);
      }
      
      await updateDoc(doc(db, 'purchased_amcs', id), updateData);
      fetchData();
    } catch (err) {
      console.error("Error updating AMC status", err);
    }
  };

  const handleCompleteVisit = async () => {
    if (!completingBooking) return;
    setIsCompleting(true);
    try {
      const bookingRef = doc(db, 'bookings', completingBooking.id);
      const updateData = {
        ...checklist,
        status: 'Completed',
        completedAt: new Date().toISOString(),
        completionDate: Date.now()
      };

      await updateDoc(bookingRef, updateData);

      // Also update counts in purchased_amcs
      const amcRef = doc(db, 'purchased_amcs', completingBooking.amcId);
      const isMaintenance = completingBooking.chargeType === 'AMC:Maintenance';
      
      const amcDoc = customerAmcs.find(a => a.id === completingBooking.amcId);
      if (amcDoc) {
        const updateAmc = {};
        if (isMaintenance) {
          updateAmc.maintenanceVisitsLeft = Math.max(0, (amcDoc.maintenanceVisitsLeft || 0) - 1);
        } else {
          updateAmc.breakdownVisitsLeft = Math.max(0, (amcDoc.breakdownVisitsLeft || 0) - 1);
        }
        await updateDoc(amcRef, updateAmc);
      }

      setCompletingBooking(null);
      // Reset checklist
      setChecklist({
        checkAllCamerasLive: false,
        checkPlaybackWorking: false,
        checkDateTimeCorrect: false,
        checkMobileViewWorking: false,
        checkAllLensCleaned: false,
        checkNoBlurView: false,
        checkRecordingStorage: false,
        checkMotionDetection: false,
        checkCableIntegrity: false,
        completionNotes: ''
      });
      fetchData();
    } catch (err) {
      console.error("Error completing visit", err);
      alert("Failed to complete visit.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="mb-2">Manage AMCs</h2>
          <p className="mb-0">Create AMC Packages and approve customer requests.</p>
        </div>
        {activeTab === 'Packages' && !showPackageForm && (
          <button onClick={() => setShowPackageForm(true)} className="btn btn-primary">
            <Plus size={18} /> Create Package
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-8" style={{ borderBottom: 'var(--glass-border)', paddingBottom: '16px', overflowX: 'auto' }}>
        {['Approvals', 'Active Subscriptions', 'Expired Subscriptions', 'Packages'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent', border: 'none', padding: '8px 16px',
              whiteSpace: 'nowrap',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary-light)' : '2px solid transparent',
              cursor: 'pointer', fontWeight: activeTab === tab ? 600 : 400, fontSize: '1rem', transition: 'var(--transition)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading AMC data...</p>
      ) : (
        <>
          {activeTab === 'Packages' && (
            <div>
              {showPackageForm && (
                <div className="glass-panel animate-fade-in mb-8" style={{ padding: '24px' }}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 style={{ margin: 0 }}>Create New AMC Package</h3>
                    <button onClick={() => setShowPackageForm(false)} className="btn btn-outline" style={{ padding: '8px' }}>
                      <X size={18} />
                    </button>
                  </div>
                  <form onSubmit={handleCreatePackage} className="grid-2x2">
                    <div className="flex flex-col gap-2">
                      <label>Package Name</label>
                      <input type="text" value={pkgName} onChange={e => setPkgName(e.target.value)} placeholder="e.g. Premium AMC" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Validity (Months)</label>
                      <input type="number" min="1" value={validityMonths} onChange={e => setValidityMonths(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Breakdown Visits Included</label>
                      <input type="number" min="0" value={breakdownVisits} onChange={e => setBreakdownVisits(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Maintenance Visits Included</label>
                      <input type="number" min="0" value={maintenanceVisits} onChange={e => setMaintenanceVisits(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2" style={{ gridColumn: '1 / -1' }}>
                      <label>Price Per Camera (₹)</label>
                      <input type="number" min="0" value={pricePerCamera} onChange={e => setPricePerCamera(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary mt-4" style={{ gridColumn: '1 / -1' }} disabled={creatingPkg}>
                      {creatingPkg ? 'Creating...' : 'Save Package'}
                    </button>
                  </form>
                </div>
              )}

              <div className="grid-2x2">
                {packages.map(pkg => (
                  <div key={pkg.id} className="glass-panel" style={{ padding: '24px' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 style={{ margin: 0, color: 'var(--color-primary-light)' }}>{pkg.name}</h3>
                      <Settings size={20} color="var(--text-muted)" />
                    </div>
                    <h2 className="mb-4">₹{pkg.pricePerCamera}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/camera</span></h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <li className="mb-2">• {pkg.breakdownVisits} Breakdown Visits</li>
                      <li className="mb-2">• {pkg.maintenanceVisits} Maintenance Visits</li>
                      <li>• Valid for {pkg.validityMonths} Months</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Approvals' && (
            <div className="flex-col gap-4">
              {customerAmcs.filter(a => a.status === 'Pending').map(amc => (
                <div key={amc.id} className="glass-panel" style={{ padding: '24px' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 style={{ margin: '0 0 4px 0' }}>{amc.packageName} Request</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Customer: <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{amc.userName}</span> ({amc.userPhone})
                      </p>
                    </div>
                    <span className="tag tag-warning">Pending</span>
                  </div>
                  
                  <div className="grid-2x2 gap-4 mb-6" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cameras</p>
                      <p style={{ margin: 0 }}>{amc.numberOfCameras || amc.cameraCount} units</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Payable</p>
                      <p style={{ margin: 0, color: 'var(--color-secondary)', fontWeight: 'bold' }}>₹{amc.totalAmount || amc.totalPrice}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Address</p>
                      <p style={{ margin: 0 }}>{amc.fullAddress || amc.addressDetails?.street}, {amc.pincode || amc.addressDetails?.city}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => handleApproval(amc.id, 'Rejected')} className="btn btn-danger" style={{ flex: 1 }}>Reject</button>
                    <button onClick={() => handleApproval(amc.id, 'Approved')} className="btn btn-primary" style={{ flex: 1 }}>Approve & Activate</button>
                  </div>
                </div>
              ))}
              {customerAmcs.filter(a => a.status === 'Pending').length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No pending AMC requests.</p>
              )}
            </div>
          )}

          {(activeTab === 'Active Subscriptions' || activeTab === 'Expired Subscriptions') && (
            <div className="flex-col gap-4">
              {!selectedAmc ? (
                <>
                  {/* Group AMCs by User to "List all customers" */}
                  {Object.entries(
                    customerAmcs
                      .filter(a => {
                        const expired = isAmcExpired(a);
                        if (activeTab === 'Active Subscriptions') {
                          return a.status === 'Approved' && !expired;
                        } else {
                          return (a.status === 'Approved' && expired) || a.status === 'Expired';
                        }
                      })
                      .reduce((acc, amc) => {
                        if (!acc[amc.userId]) acc[amc.userId] = { name: amc.userName, phone: amc.userPhone, amcs: [] };
                        acc[amc.userId].amcs.push(amc);
                        return acc;
                      }, {})
                  ).map(([userId, data]) => (
                    <div key={userId} className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar-placeholder" style={{ background: 'var(--color-primary-light)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {data.name.charAt(0)}
                          </div>
                          <div>
                            <h3 style={{ margin: 0 }}>{data.name}</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{data.phone}</p>
                          </div>
                        </div>
                        <span className="tag tag-primary">{data.amcs.length} AMC(s)</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {data.amcs.map(amc => (
                          <div 
                            key={amc.id} 
                            onClick={() => setSelectedAmc(amc)}
                            className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p style={{ margin: 0, fontWeight: 500 }}>{amc.packageName}</p>
                                {isAmcExpired(amc) && <span className="tag tag-danger" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Expired</span>}
                              </div>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{amc.addressName}</p>
                            </div>
                            <div className="text-right">
                              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-secondary)' }}>₹{amc.totalAmount || amc.totalPrice}</p>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                B.V: {amc.breakdownVisitsLeft}/{amc.maxBreakdownVisits} | M.V: {amc.maintenanceVisitsLeft}/{amc.maxMaintenanceVisits}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(
                    customerAmcs.filter(a => {
                      const expired = isAmcExpired(a);
                      if (activeTab === 'Active Subscriptions') {
                        return a.status === 'Approved' && !expired;
                      } else {
                        return (a.status === 'Approved' && expired) || a.status === 'Expired';
                      }
                    })
                  ).length === 0 && (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No {activeTab === 'Active Subscriptions' ? 'active' : 'expired'} subscriptions found.
                    </p>
                  )}
                </>
              ) : (
                <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
                  <button onClick={() => setSelectedAmc(null)} className="btn btn-outline mb-6 flex items-center gap-2">
                    <X size={18} /> Back to List
                  </button>
                  
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-4 mb-4">
                        <h2 style={{ margin: 0 }}>{selectedAmc.userName}</h2>
                        <span className={`tag ${isAmcExpired(selectedAmc) ? 'tag-danger' : 'tag-success'}`}>
                          {isAmcExpired(selectedAmc) ? 'Expired' : 'Active'}
                        </span>
                      </div>
                      <h3 style={{ color: 'var(--color-primary-light)', margin: '0 0 24px 0' }}>{selectedAmc.packageName}</h3>
                      
                      {isAmcExpired(selectedAmc) && (
                        <div className="p-4 rounded-xl mb-6 flex items-center gap-3" style={{ background: 'rgba(255, 118, 117, 0.1)', border: '1px solid rgba(255, 118, 117, 0.2)' }}>
                          <AlertTriangle color="#ff7675" size={20} />
                          <div>
                            <p style={{ margin: 0, color: '#ff7675', fontWeight: 700, fontSize: '0.9rem' }}>Subscription Expired</p>
                            <p style={{ margin: 0, color: 'rgba(255, 118, 117, 0.8)', fontSize: '0.8rem' }}>Reason: {getExpiryReason(selectedAmc)}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid-2x2 gap-6">
                        <div>
                          <p className="detail-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Phone</p>
                          <p style={{ fontWeight: 500 }}>{selectedAmc.userPhone}</p>
                        </div>
                        <div>
                          <p className="detail-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Cameras</p>
                          <p style={{ fontWeight: 500 }}>{selectedAmc.numberOfCameras || selectedAmc.cameraCount}</p>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p className="detail-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Address</p>
                          <p style={{ fontWeight: 500 }}>{selectedAmc.fullAddress || selectedAmc.addressDetails?.street}, {selectedAmc.pincode || selectedAmc.addressDetails?.city}</p>
                        </div>
                        <div>
                          <p className="detail-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Purchase Date</p>
                          <p style={{ fontWeight: 500 }}>{formatDate(selectedAmc.purchaseDate)}</p>
                        </div>
                        <div>
                          <p className="detail-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Valid Upto</p>
                          <p style={{ fontWeight: 500, color: isAmcExpired(selectedAmc) && selectedAmc.validityUpto < Date.now() ? '#ff7675' : 'inherit' }}>
                            {formatDate(selectedAmc.validityUpto)}
                          </p>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p className="detail-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Total Amount</p>
                          <p style={{ fontWeight: 700, color: 'var(--color-secondary)', fontSize: '1.2rem' }}>₹{selectedAmc.totalAmount || selectedAmc.totalPrice}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '32px' }}>
                      <h4 className="mb-4">Visit Status</h4>
                      <div className="flex gap-4 mb-8">
                        <div className="glass-panel" style={{ flex: 1, padding: '16px', textAlign: 'center', background: selectedAmc.breakdownVisitsLeft <= 0 ? 'rgba(255,255,255,0.05)' : 'rgba(229, 115, 115, 0.1)' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: selectedAmc.breakdownVisitsLeft <= 0 ? 'var(--text-muted)' : '#E57373' }}>Breakdown</p>
                          <h3 style={{ margin: '4px 0', color: selectedAmc.breakdownVisitsLeft <= 0 ? 'var(--text-muted)' : '#E57373' }}>{selectedAmc.breakdownVisitsLeft}/{selectedAmc.maxBreakdownVisits}</h3>
                        </div>
                        <div className="glass-panel" style={{ flex: 1, padding: '16px', textAlign: 'center', background: selectedAmc.maintenanceVisitsLeft <= 0 ? 'rgba(255,255,255,0.05)' : 'rgba(100, 181, 246, 0.1)' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: selectedAmc.maintenanceVisitsLeft <= 0 ? 'var(--text-muted)' : '#64B5F6' }}>Maintenance</p>
                          <h3 style={{ margin: '4px 0', color: selectedAmc.maintenanceVisitsLeft <= 0 ? 'var(--text-muted)' : '#64B5F6' }}>{selectedAmc.maintenanceVisitsLeft}/{selectedAmc.maxMaintenanceVisits}</h3>
                        </div>
                      </div>
                      
                      <h4 className="mb-4">Maintenance Visit Schedule</h4>
                      <div className="flex flex-col gap-2">
                        {allBookings
                          .filter(b => b.amcId === selectedAmc.id)
                          .sort((a, b) => (a.scheduledDate || a.bookingDate) - (b.scheduledDate || b.bookingDate))
                          .map((visit, idx) => (
                            <div 
                              key={visit.id} 
                              className="p-3 rounded-lg flex justify-between items-center"
                              style={{ 
                                background: visit.status === 'Completed' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(255,255,255,0.02)',
                                border: visit.status === 'Completed' ? '1px solid rgba(46, 125, 50, 0.2)' : '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              <div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                                  Visit {idx + 1}: {visit.chargeType === 'AMC:Maintenance' ? 'Maintenance' : 'Breakdown'}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {new Date(visit.scheduledDate || visit.bookingDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`tag ${visit.status === 'Completed' ? 'tag-success' : 'tag-warning'}`} style={{ fontSize: '0.7rem' }}>
                                  {visit.status}
                                </span>
                                {visit.status !== 'Completed' && (
                                  <button 
                                    onClick={() => setCompletingBooking(visit)}
                                    className="btn btn-primary" 
                                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        {allBookings.filter(b => b.amcId === selectedAmc.id).length === 0 && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                            No maintenance visits scheduled.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {completingBooking && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', padding: '40px', maxHeight: '95vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex justify-between items-center mb-8">
                  <h2 style={{ margin: 0, color: 'var(--color-primary-light)' }}>Complete {completingBooking.chargeType === 'AMC:Maintenance' ? 'Maintenance' : 'Breakdown'} Visit</h2>
                  <button onClick={() => setCompletingBooking(null)} className="btn btn-outline" style={{ padding: '8px' }}>
                    <X size={18} />
                  </button>
                </div>

                <div className="grid-2x2 gap-x-8 gap-y-2 mb-6">
                  {[
                    { key: 'checkAllCamerasLive', label: 'All Cameras are Live' },
                    { key: 'checkPlaybackWorking', label: 'Playback is Working' },
                    { key: 'checkDateTimeCorrect', label: 'Date & Time is Correct' },
                    { key: 'checkMobileViewWorking', label: 'Mobile View working Fine' },
                    { key: 'checkAllLensCleaned', label: 'All Lens are Cleaned' },
                    { key: 'checkNoBlurView', label: 'No Blur View' },
                    { key: 'checkRecordingStorage', label: 'Recording Storage Healthy' },
                    { key: 'checkMotionDetection', label: 'Motion Detection Tested' },
                    { key: 'checkCableIntegrity', label: 'Cable & Connectors Verified' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors" style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
                      <input 
                        type="checkbox" 
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary-light)' }}
                        checked={checklist[item.key]} 
                        onChange={e => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-col gap-2 mb-8">
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Completion Notes</label>
                  <textarea 
                    value={checklist.completionNotes}
                    onChange={e => setChecklist({ ...checklist, completionNotes: e.target.value })}
                    placeholder="Enter any work details or observations..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setCompletingBooking(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                  <button onClick={handleCompleteVisit} className="btn btn-primary" style={{ flex: 1 }} disabled={isCompleting}>
                    {isCompleting ? 'Updating...' : 'Submit Completion'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminManageAMC;
