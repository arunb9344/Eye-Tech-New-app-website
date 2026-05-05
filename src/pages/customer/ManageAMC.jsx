import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Shield, ShieldAlert, CheckCircle, Clock, Info, Hammer, Wrench, Calendar, FileText, ChevronRight, AlertCircle, X, MapPin, ShieldCheck } from 'lucide-react';
import InvoiceGenerator from '../../utils/InvoiceGenerator';

const ManageAMC = () => {
  const { currentUser, userData } = useAuth();
  const [packages, setPackages] = useState([]);
  const [myAmcs, setMyAmcs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingPackage, setBuyingPackage] = useState(null);
  const [cameraCount, setCameraCount] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Admin created AMC Packages
        const pkgsSnap = await getDocs(collection(db, 'amc_packages'));
        setPackages(pkgsSnap.docs.map(d => ({ ...d.data(), id: d.id })));

        // Fetch User's AMCs
        const amcsQ = query(collection(db, 'purchased_amcs'), where('userId', '==', currentUser.uid));
        const amcsSnap = await getDocs(amcsQ);
        setMyAmcs(amcsSnap.docs.map(d => ({ ...d.data(), id: d.id })));

        // Fetch Bookings to show visits schedule
        const bookingsQ = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
        const bookingsSnap = await getDocs(bookingsQ);
        const fetchedBookings = bookingsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        fetchedBookings.sort((a, b) => (b.bookingDate || 0) - (a.bookingDate || 0));
        setBookings(fetchedBookings);

        // Fetch Addresses for AMC purchase
        const addrQ = query(collection(db, 'addresses'), where('userId', '==', currentUser.uid));
        const addrSnap = await getDocs(addrQ);
        const fetchedAddrs = addrSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        setAddresses(fetchedAddrs);
        if (fetchedAddrs.length > 0) {
          setSelectedAddressId(fetchedAddrs[0].id);
          setUserName(fetchedAddrs[0].name || userData?.name || '');
          setUserPhone(fetchedAddrs[0].phone || userData?.phone || '');
        }

      } catch (err) {
        console.error("Error fetching AMC data", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser, userData]);

  const handlePurchase = async () => {
    if (!selectedAddressId || !buyingPackage) return;
    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      
      const isFirstTimeBuyer = myAmcs.length === 0;
      const unitPrice = (isFirstTimeBuyer && buyingPackage.firstTimeOfferPrice) ? buyingPackage.firstTimeOfferPrice : buyingPackage.pricePerCamera;

      const amcData = {
        userId: currentUser.uid,
        userName: userName,
        userPhone: userPhone,
        packageId: buyingPackage.id,
        packageName: buyingPackage.name,
        addressId: selectedAddressId,
        addressName: `${selectedAddress.name}(${selectedAddress.label})`,
        fullAddress: `${selectedAddress.addressLine1 || selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}`,
        pincode: selectedAddress.pincode || '',
        numberOfCameras: parseInt(cameraCount),
        totalAmount: unitPrice * parseInt(cameraCount),
        status: 'Pending',
        breakdownVisitsLeft: buyingPackage.breakdownVisits,
        maxBreakdownVisits: buyingPackage.breakdownVisits,
        maintenanceVisitsLeft: buyingPackage.maintenanceVisits,
        maxMaintenanceVisits: buyingPackage.maintenanceVisits,
        validityMonths: buyingPackage.validityMonths,
        validityUpto: null,
        purchaseDate: Date.now(),
        isGstInvoice: !!selectedAddress.gstNumber,
        gstNumber: selectedAddress.gstNumber || ""
      };
      await addDoc(collection(db, 'purchased_amcs'), amcData);
      alert("AMC Request submitted successfully! Awaiting Admin Approval.");
      setBuyingPackage(null);
      // Refresh AMCs
      const amcsQ = query(collection(db, 'purchased_amcs'), where('userId', '==', currentUser.uid));
      const amcsSnap = await getDocs(amcsQ);
      setMyAmcs(amcsSnap.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch (err) {
      console.error("Error purchasing AMC", err);
    }
  };

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

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px' }}>
      <div className="mb-8">
        <h2 className="mb-2">Annual Maintenance Contracts</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Protect your security systems with our comprehensive AMC packages.</p>
      </div>

      {/* Available Packages */}
      <div className="mb-12">
        <h3 className="mb-6 flex items-center gap-2"><Shield color="var(--color-primary-light)" /> Available AMC Packages</h3>
        {loading ? (
          <div className="spinner"></div>
        ) : packages.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <p>No AMC packages currently available. Please contact support.</p>
          </div>
        ) : (
          <div className="grid-3x3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {packages.map(pkg => {
              const isFirstTimeBuyer = myAmcs.length === 0;
              const hasOffer = isFirstTimeBuyer && pkg.firstTimeOfferPrice;
              
              return (
                <div key={pkg.id} className="glass-panel hover-scale" style={{ 
                  padding: '32px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: 'var(--gradient-primary)',
                  border: 'none',
                  color: 'white'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 className="mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{pkg.name}</h3>
                    <div className="mb-4">
                      <span style={{ fontSize: '2rem', fontWeight: 900 }}>₹{hasOffer ? pkg.firstTimeOfferPrice : pkg.pricePerCamera}</span>
                      <span style={{ fontSize: '0.9rem', opacity: 0.8 }}> / camera</span>
                      {hasOffer && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f1c40f', background: 'rgba(0,0,0,0.2)', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>
                          FIRST TIME OFFER
                        </div>
                      )}
                    </div>
                    
                    <ul style={{ listStyle: 'none', margin: '0 0 32px 0', padding: 0 }}>
                      <li className="flex items-center gap-3 mb-3 text-sm font-medium">
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '50%' }}><Wrench size={14} /></div>
                        <span>{pkg.breakdownVisits} Breakdown Visits</span>
                      </li>
                      <li className="flex items-center gap-3 mb-3 text-sm font-medium">
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '50%' }}><Calendar size={14} /></div>
                        <span>{pkg.maintenanceVisits} Maintenance Visits</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm font-medium">
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '50%' }}><Clock size={14} /></div>
                        <span>Valid for {pkg.validityMonths} Months</span>
                      </li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setBuyingPackage(pkg)} 
                    className="btn btn-primary" 
                    style={{ width: '100%', background: 'white', color: 'var(--color-primary)', fontWeight: 800 }}
                  >
                    Select Package
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Purchased AMCs */}
      <div className="mb-8">
        <h3 className="mb-6 flex items-center gap-2"><ShieldCheck color="var(--color-secondary)" /> My Subscriptions</h3>
        {myAmcs.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', opacity: 0.6 }}>
            <p>You haven't purchased any AMC packages yet.</p>
          </div>
        ) : (
          <div className="flex-col gap-6">
            {myAmcs.map(amc => {
              const amcBookings = bookings.filter(b => b.amcId === amc.id);
              const isApproved = amc.status === 'Approved';
              const isExpired = amc.status === 'Expired';
              
              return (
                <div key={amc.id} className="glass-panel" style={{ 
                  padding: 0, 
                  overflow: 'hidden',
                  background: isApproved ? 'rgba(0, 206, 201, 0.05)' : 'rgba(255,255,255,0.02)',
                  border: isApproved ? '1px solid rgba(0, 206, 201, 0.1)' : 'var(--glass-border)'
                }}>
                  <div style={{ padding: '24px' }}>
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                      <div className="flex gap-4">
                        <div style={{ background: isApproved ? 'rgba(0, 206, 201, 0.1)' : 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px' }}>
                          <Shield size={24} color={isApproved ? 'var(--color-secondary)' : 'var(--text-muted)'} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 style={{ margin: 0 }}>{amc.packageName}</h3>
                            <span className={`tag ${isApproved ? 'tag-success' : 'tag-warning'}`} style={{ fontSize: '0.7rem' }}>
                              {amc.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-secondary">
                            <MapPin size={14} />
                            <span>{amc.addressName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end justify-center">
                        <span className="text-xs text-muted mb-1 uppercase tracking-widest">Total Amount Paid</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary-light)' }}>₹{amc.totalAmount}</span>
                      </div>
                    </div>

                    {isApproved && (
                      <div className="grid-2x2 gap-6 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <div className="flex flex-col items-center justify-center p-4">
                          <span className="text-xs text-muted mb-2 uppercase font-bold">Breakdown Visits</span>
                          <div className="flex items-baseline gap-1">
                            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-secondary)' }}>{amc.breakdownVisitsLeft}</span>
                            <span className="text-muted">/ {amc.maxBreakdownVisits}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border-l border-white-5">
                          <span className="text-xs text-muted mb-2 uppercase font-bold">Maintenance Visits</span>
                          <div className="flex items-baseline gap-1">
                            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary-light)' }}>{amc.maintenanceVisitsLeft}</span>
                            <span className="text-muted">/ {amc.maxMaintenanceVisits}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex gap-6">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted">Validity Upto</span>
                          <span className="text-sm font-bold">{formatDate(amc.validityUpto)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted">Cameras</span>
                          <span className="text-sm font-bold">{amc.numberOfCameras} Units</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          className="btn btn-outline btn-sm flex items-center gap-2"
                          onClick={() => InvoiceGenerator.generateAmcInvoice(amc)}
                        >
                          <FileText size={16} /> Invoice
                        </button>
                        {isExpired && (
                          <button onClick={() => setBuyingPackage(packages.find(p => p.id === amc.packageId))} className="btn btn-primary btn-sm">
                            Renew Now
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Visits & Schedule section */}
                    {amcBookings.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">Visits & Service Schedule</h4>
                        <div className="flex flex-col gap-3">
                          {amcBookings.map(visit => (
                            <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg border border-white-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <div className="flex items-center gap-4">
                                <div style={{ 
                                  background: visit.chargeType === 'AMC:Maintenance' ? 'rgba(0, 206, 201, 0.1)' : 'rgba(255, 118, 117, 0.1)', 
                                  padding: '8px', 
                                  borderRadius: '8px' 
                                }}>
                                  {visit.chargeType === 'AMC:Maintenance' ? <Calendar size={16} color="var(--color-secondary)" /> : <AlertCircle size={16} color="#ff7675" />}
                                </div>
                                <div>
                                  <p className="text-sm font-bold mb-0">{visit.chargeType === 'AMC:Maintenance' ? 'Maintenance Visit' : 'Breakdown Visit'}</p>
                                  <p className="text-xs text-muted mb-0">{formatDate(visit.scheduledDate || visit.bookingDate)}</p>
                                </div>
                              </div>
                              <span className={`tag ${visit.status === 'Completed' ? 'tag-success' : 'tag-warning'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                {visit.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {buyingPackage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: 'var(--gradient-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Purchase {buyingPackage.name}</h3>
              <button onClick={() => setBuyingPackage(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '32px' }}>
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted uppercase">Select Installation Location</label>
                  <select 
                    className="premium-select"
                    value={selectedAddressId} 
                    onChange={e => {
                      const addr = addresses.find(a => a.id === e.target.value);
                      setSelectedAddressId(e.target.value);
                      if (addr) {
                        setUserName(addr.name || userData?.name || '');
                        setUserPhone(addr.phone || userData?.phone || '');
                      }
                    }} 
                    required
                  >
                    {addresses.map(a => (
                      <option key={a.id} value={a.id}>{a.name}({a.label}) - {a.addressLine1 || a.street}</option>
                    ))}
                  </select>
                </div>

                <div className="grid-2x2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted uppercase">Contact Name</label>
                    <input type="text" value={userName} onChange={e => setUserName(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted uppercase">Phone Number</label>
                    <input type="text" value={userPhone} onChange={e => setUserPhone(e.target.value)} required />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted uppercase">Number of Cameras</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="1" max="50" 
                      value={cameraCount} 
                      onChange={e => setCameraCount(e.target.value)} 
                      style={{ flex: 1, accentColor: 'var(--color-primary-light)' }} 
                    />
                    <div style={{ background: 'var(--bg-surface)', padding: '10px 20px', borderRadius: '12px', fontWeight: 900, border: '1px solid var(--glass-border)' }}>
                      {cameraCount}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid var(--glass-border)' }}>
                <div className="flex justify-between mb-3 text-secondary">
                  <span>Price per camera:</span>
                  <span className="font-bold">₹{(myAmcs.length === 0 && buyingPackage.firstTimeOfferPrice) ? buyingPackage.firstTimeOfferPrice : buyingPackage.pricePerCamera}</span>
                </div>
                <div className="flex justify-between mb-3 text-secondary">
                  <span>Total cameras:</span>
                  <span className="font-bold">{cameraCount}</span>
                </div>
                <div className="flex justify-between mt-4 pt-4" style={{ borderTop: 'var(--glass-border)' }}>
                  <span className="font-bold text-white">Estimated Total:</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--color-secondary)', fontSize: '1.8rem', fontWeight: 900 }}>
                      ₹{((myAmcs.length === 0 && buyingPackage.firstTimeOfferPrice) ? buyingPackage.firstTimeOfferPrice : buyingPackage.pricePerCamera) * cameraCount}
                    </div>
                    <span className="text-xs text-muted">(Exclusive of taxes)</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePurchase} 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: 800, background: 'var(--gradient-primary)' }}
              >
                Confirm & Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAMC;
