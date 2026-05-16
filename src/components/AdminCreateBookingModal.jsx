import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { X, Search, Plus, MapPin, Wrench, Hammer, Zap, ShieldCheck, AlertTriangle, Info, ArrowRight } from 'lucide-react';

const AdminCreateBookingModal = ({ isOpen, onClose, onBookingCreated }) => {
  const [customers, setCustomers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [purchasedAmcs, setPurchasedAmcs] = useState([]);
  const [pricing, setPricing] = useState({ eyeTechServicePrice: 300, nonEyeTechServicePrice: 500 });
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  // Selection States
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [bookingType, setBookingType] = useState('Service'); // 'Service' or 'Installation'
  
  // Form fields
  const [product, setProduct] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [numCameras, setNumCameras] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data (Customers and Pricing)
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchInitialData = async () => {
      setLoadingInitial(true);
      try {
        const usersQ = query(collection(db, 'users'), where('role', '==', 'Customer'));
        const usersSnap = await getDocs(usersQ);
        setCustomers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        const priceSnap = await getDoc(doc(db, 'app_config', 'pricing'));
        if (priceSnap.exists()) {
          setPricing(priceSnap.data());
        }
      } catch (err) {
        console.error("Error fetching initial data", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    
    fetchInitialData();
  }, [isOpen]);

  // Fetch Addresses and AMCs when Customer changes
  useEffect(() => {
    if (!selectedCustomerId) {
      setAddresses([]);
      setPurchasedAmcs([]);
      setSelectedAddressId('');
      return;
    }

    const fetchCustomerData = async () => {
      try {
        const addrQ = query(collection(db, 'addresses'), where('userId', '==', selectedCustomerId));
        const addrSnap = await getDocs(addrQ);
        const fetchedAddrs = addrSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAddresses(fetchedAddrs);
        if (fetchedAddrs.length > 0) {
          setSelectedAddressId(fetchedAddrs[0].id);
        } else {
          setSelectedAddressId('');
        }

        const amcQ = query(collection(db, 'purchased_amcs'), where('userId', '==', selectedCustomerId));
        const amcSnap = await getDocs(amcQ);
        setPurchasedAmcs(amcSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching customer data", err);
      }
    };

    fetchCustomerData();
  }, [selectedCustomerId]);

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  
  // Logic for Service Charge Type
  const isFreeServiceValid = selectedAddress && 
    selectedAddress.freeServiceValidUntil && 
    selectedAddress.freeServiceValidUntil > Date.now() &&
    selectedAddress.freeServiceVisitsRemaining > 0;

  const applicableAmc = selectedAddress ? purchasedAmcs.find(amc => 
    amc.addressId === selectedAddress.id && 
    amc.status === "Approved" && 
    amc.breakdownVisitsLeft > 0 &&
    (!amc.validityUpto || amc.validityUpto > Date.now())
  ) : null;

  const chargeTypeService = !selectedAddress ? 'Chargeable'
    : isFreeServiceValid ? 'Free Service'
    : applicableAmc ? 'AMC:Breakdown'
    : 'Chargeable';

  const price = selectedAddress?.isEyeTechInstalled ? pricing.eyeTechServicePrice : pricing.nonEyeTechServicePrice;

  const issueOptions = product === 'CCTV Camera' 
    ? ['Beep Sound', 'No PlayBack', 'No Video', 'Flickering', 'No Mobile View(Offline)', 'Others']
    : ['Others'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedAddressId || !selectedAddress || !selectedCustomer) {
      alert("Please select customer and address.");
      return;
    }

    if (bookingType === 'Service' && (!product || !issue)) {
      alert("Please select product and issue.");
      return;
    }

    if (bookingType === 'Installation' && !numCameras) {
      alert("Please enter number of cameras.");
      return;
    }

    setSubmitting(true);
    try {
      const isInstallation = bookingType === 'Installation';

      const bookingData = {
        type: bookingType,
        userId: selectedCustomerId,
        userName: selectedCustomer.name || 'Customer',
        userPhone: selectedAddress.phone || selectedCustomer.phoneNumber || selectedCustomer.phone || '',
        addressId: selectedAddressId,
        addressName: selectedAddress.label || selectedAddress.name || 'Address',
        fullAddress: `${selectedAddress.addressLine1 || selectedAddress.street || ''}, ${selectedAddress.addressLine2 || ''}, ${selectedAddress.city || ''}, ${selectedAddress.state || ''} - ${selectedAddress.pincode || ''}`.replace(/, ,/g, ','),
        pincode: selectedAddress.pincode || '',
        status: 'Pending',
        isEyeTechInstalled: !!selectedAddress.isEyeTechInstalled,
        bookingDate: Date.now(),
        // Add defaults for completion fields
        completionDescription: '',
        amountCharged: 0,
        freeServicePeriod: 'No-Free Service',
        freeServiceVisits: 0,
        adminNotes: '',
        completionNotes: '',
        gstNumber: '',
        invoiceNumber: ''
      };

      if (isInstallation) {
        bookingData.numberOfCameras = parseInt(numCameras) || 0;
        bookingData.description = description || '';
        bookingData.chargeType = 'Chargeable';
      } else {
        bookingData.product = product;
        bookingData.issue = issue;
        bookingData.description = description ? `Product: ${product}\nIssue: ${issue}\nNotes: ${description}` : `Product: ${product}\nIssue: ${issue}`;
        bookingData.chargeType = chargeTypeService || 'Chargeable';
        bookingData.amcId = applicableAmc?.id || null;
      }
      
      await addDoc(collection(db, 'bookings'), bookingData);
      
      // Create notification signal for the customer
      await addDoc(collection(db, 'notification_signals'), {
        title: `New ${bookingType} Booking Created`,
        body: `Admin has created a ${bookingType.toLowerCase()} booking for you at ${bookingData.addressName}.`,
        recipientId: selectedCustomerId,
        status: 'pending',
        type: 'admin_created_booking',
        createdAt: Date.now()
      });

      onBookingCreated(); // This should close modal and refresh list
      resetForm();
    } catch (err) {
      console.error("Error creating booking:", err);
      alert("Failed to book: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setSelectedAddressId('');
    setProduct('');
    setIssue('');
    setDescription('');
    setNumCameras('');
    setBookingType('Service');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px', overflowY: 'auto'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
        padding: '32px', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '24px', right: '24px',
          background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        <h2 style={{ margin: '0 0 8px 0' }}>Create Booking</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>Book a service or installation on behalf of a customer.</p>

        {loadingInitial ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
            <p>Loading customers...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>1. Select Customer</label>
              <select 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="" disabled>-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone || c.email})</option>
                ))}
              </select>
            </div>

            {selectedCustomerId && (
              <div className="flex flex-col gap-2">
                <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>2. Select Address</label>
                <select 
                  value={selectedAddressId} 
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  required
                  className="input-field"
                  style={{ width: '100%' }}
                >
                  {addresses.length === 0 ? (
                    <option value="" disabled>No addresses found for this customer</option>
                  ) : (
                    addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label || 'Address'} - {addr.addressLine1 || addr.street}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {selectedAddressId && (
              <div className="flex flex-col gap-2 mt-2">
                <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>3. Booking Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="bookingType" 
                      value="Service" 
                      checked={bookingType === 'Service'} 
                      onChange={() => setBookingType('Service')} 
                    />
                    <Wrench size={18} /> Service
                  </label>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="bookingType" 
                      value="Installation" 
                      checked={bookingType === 'Installation'} 
                      onChange={() => setBookingType('Installation')} 
                    />
                    <Hammer size={18} /> Installation
                  </label>
                </div>
              </div>
            )}

            {selectedAddressId && bookingType === 'Service' && (
              <div className="flex flex-col gap-4 mt-2 p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: 'var(--glass-border)' }}>
                <h4 style={{ margin: 0, color: 'var(--color-primary-light)' }}>Service Details</h4>
                
                {/* Chargeability Info Box */}
                <div style={{
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontSize: '0.9rem',
                  display: 'flex', gap: '8px', alignItems: 'center',
                  background: isFreeServiceValid ? 'rgba(46, 204, 113, 0.1)' : applicableAmc ? 'rgba(52, 152, 219, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                  color: isFreeServiceValid ? '#2ecc71' : applicableAmc ? '#3498db' : '#e74c3c',
                  border: `1px solid ${isFreeServiceValid ? 'rgba(46, 204, 113, 0.3)' : applicableAmc ? 'rgba(52, 152, 219, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`
                }}>
                  {isFreeServiceValid ? <Zap size={18} /> : applicableAmc ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                  <span>
                    {isFreeServiceValid ? `Free Service (${selectedAddress.freeServiceVisitsRemaining} visits left)` 
                      : applicableAmc ? `AMC: ${applicableAmc.packageName} (${applicableAmc.breakdownVisitsLeft} left)` 
                      : `Chargeable (₹${price})`}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Product</label>
                  <select 
                    value={product}
                    onChange={(e) => {
                      setProduct(e.target.value);
                      setIssue('');
                    }}
                    required
                    className="input-field"
                  >
                    <option value="" disabled>-- Select Product --</option>
                    <option value="CCTV Camera">CCTV Camera</option>
                    <option value="Video Door Phone">Video Door Phone</option>
                    <option value="Intrusion Alarm">Intrusion Alarm</option>
                    <option value="Biometric & Access Control">Biometric & Access Control</option>
                  </select>
                </div>

                {product && (
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Issue</label>
                    <select 
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      required
                      className="input-field"
                    >
                      <option value="" disabled>-- Select Issue --</option>
                      {issueOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Additional Notes (Optional)</label>
                  <textarea 
                    rows="2" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    placeholder="E.g. customer requested urgent visit"
                  ></textarea>
                </div>
              </div>
            )}

            {selectedAddressId && bookingType === 'Installation' && (
              <div className="flex flex-col gap-4 mt-2 p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: 'var(--glass-border)' }}>
                <h4 style={{ margin: 0, color: 'var(--color-primary-light)' }}>Installation Details</h4>
                
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Number of Cameras</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={numCameras}
                    onChange={(e) => setNumCameras(e.target.value)}
                    required
                    className="input-field"
                    placeholder="e.g. 4"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Installation Notes (Optional)</label>
                  <textarea 
                    rows="3" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    placeholder="Provide any details about the installation site..."
                  ></textarea>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>Cancel</button>
              <button 
                type="submit" 
                className="btn btn-primary flex items-center gap-2" 
                disabled={submitting || !selectedAddressId}
              >
                {submitting ? 'Creating...' : 'Create Booking'}
                {!submitting && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminCreateBookingModal;
