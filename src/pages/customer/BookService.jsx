import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MapPin, Info, ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, Plus, Zap } from 'lucide-react';
import AddressModal from '../../components/AddressModal';

const BookService = () => {
  const { currentUser, userData } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [purchasedAmcs, setPurchasedAmcs] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pricing, setPricing] = useState({ eyeTechServicePrice: 300, nonEyeTechServicePrice: 500 });
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'addresses'), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const fetchedAddrs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(fetchedAddrs);
        
        // Only set default if not already set
        if (fetchedAddrs.length > 0) {
          setSelectedAddressId(prev => prev || fetchedAddrs[0].id);
        }

        const amcQ = query(collection(db, 'purchased_amcs'), where('userId', '==', currentUser.uid));
        const amcSnap = await getDocs(amcQ);
        setPurchasedAmcs(amcSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const priceSnap = await getDoc(doc(db, 'app_config', 'pricing'));
        if (priceSnap.exists()) {
          setPricing(priceSnap.data());
        }
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  const handleAddressAdded = (newAddr) => {
    setAddresses(prev => [...prev, newAddr]);
    setSelectedAddressId(newAddr.id);
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null;
  
  const isFreeServiceValid = !!(selectedAddress && 
    selectedAddress.freeServiceValidUntil && 
    selectedAddress.freeServiceValidUntil > Date.now() &&
    selectedAddress.freeServiceVisitsRemaining > 0);

  const applicableAmc = selectedAddress ? purchasedAmcs.find(amc => 
    amc.addressId === selectedAddress.id && 
    amc.status === "Approved" && 
    amc.breakdownVisitsLeft > 0 &&
    (!amc.validityUpto || amc.validityUpto > Date.now())
  ) : null;

  const chargeType = !selectedAddress ? 'Chargeable'
    : isFreeServiceValid ? 'Free Service'
    : applicableAmc ? 'AMC:Breakdown'
    : 'Chargeable';

  const price = (selectedAddress?.isEyeTechInstalled) 
    ? (pricing?.eyeTechServicePrice || 300) 
    : (pricing?.nonEyeTechServicePrice || 500);

  const getInfoDisplay = () => {
    if (!selectedAddress) return { 
      message: "Select an address to check service eligibility.", 
      icon: <Info size={20} />, 
      gradient: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      border: 'rgba(255,255,255,0.1)',
      text: 'var(--text-muted)'
    };
    
    if (isFreeServiceValid) {
      const dateStr = selectedAddress.freeServiceValidUntil ? new Date(selectedAddress.freeServiceValidUntil).toLocaleDateString() : 'N/A';
      return { 
        message: `Eligible for Free Service: ${selectedAddress.freeServiceVisitsRemaining} visits left until ${dateStr}.`,
        icon: <Zap size={20} />,
        gradient: 'linear-gradient(135deg, rgba(46, 204, 113, 0.2) 0%, rgba(39, 174, 96, 0.1) 100%)',
        border: 'rgba(46, 204, 113, 0.3)',
        text: '#2ecc71'
      };
    }
    
    if (applicableAmc) {
      return {
        message: `Covered under AMC: ${applicableAmc.packageName || 'Active Package'} (${applicableAmc.breakdownVisitsLeft} visits left).`,
        icon: <ShieldCheck size={20} />,
        gradient: 'linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(41, 128, 185, 0.1) 100%)',
        border: 'rgba(52, 152, 219, 0.3)',
        text: '#3498db'
      };
    }

    if (selectedAddress.isEyeTechInstalled) {
      return {
        message: `Chargeable (Eye Tech Installed pricing applies: ₹${price}).`,
        icon: <Info size={20} />,
        gradient: 'linear-gradient(135deg, rgba(241, 196, 15, 0.15) 0%, rgba(243, 156, 18, 0.05) 100%)',
        border: 'rgba(241, 196, 15, 0.2)',
        text: '#f1c40f'
      };
    }

    return {
      message: `Chargeable (Standard pricing applies: ₹${price}).`,
      icon: <AlertTriangle size={20} />,
      gradient: 'linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(192, 57, 43, 0.05) 100%)',
      border: 'rgba(231, 76, 60, 0.2)',
      text: '#e74c3c'
    };
  };

  const info = getInfoDisplay();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddressId || !description || !selectedAddress) return;
    
    setSubmitting(true);
    try {
      const bookingData = {
        type: 'Service',
        userId: currentUser.uid || '',
        userName: userData?.name || currentUser.displayName || 'Customer',
        userPhone: selectedAddress.phone || currentUser.phoneNumber || '',
        addressId: selectedAddressId,
        addressName: selectedAddress.label || selectedAddress.name || 'Address',
        fullAddress: `${selectedAddress.addressLine1 || selectedAddress.street || ''}, ${selectedAddress.addressLine2 || ''}, ${selectedAddress.city || ''}, ${selectedAddress.state || ''} - ${selectedAddress.pincode || ''}`.replace(/, ,/g, ','),
        pincode: selectedAddress.pincode || '',
        description: description || '',
        status: 'Pending',
        chargeType: chargeType || 'Chargeable',
        isEyeTechInstalled: !!selectedAddress.isEyeTechInstalled,
        amcId: applicableAmc?.id || null,
        bookingDate: Date.now(),
        // Add defaults for other model fields
        completionDescription: '',
        amountCharged: 0,
        freeServicePeriod: 'No-Free Service',
        freeServiceVisits: 0,
        adminNotes: '',
        completionNotes: '',
        gstNumber: '',
        invoiceNumber: ''
      };
      
      await addDoc(collection(db, 'bookings'), bookingData);
      setSuccess(true);
    } catch (err) {
      console.error("Error creating booking:", err);
      alert(`Failed to book service: ${err.message || 'Please try again'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', maxWidth: '500px', borderTop: '4px solid var(--color-secondary)' }}>
          <div className="mb-6 flex justify-center">
            <div style={{ background: 'rgba(0, 206, 201, 0.1)', padding: '20px', borderRadius: '50%' }}>
              <CheckCircle size={64} color="var(--color-secondary)" />
            </div>
          </div>
          <h2 className="mb-4">Service Booked!</h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your request for <strong>{selectedAddress?.label || selectedAddress?.name}</strong> has been submitted. 
            Our admin team will review it and assign a technician shortly.
          </p>
          <div style={{ 
            padding: '16px 24px', 
            background: info.gradient, 
            border: `1px solid ${info.border}`,
            color: info.text, 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '32px', 
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            {chargeType}
          </div>
          <button onClick={() => window.location.href = '/customer/dashboard'} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="mb-8">
        <h2 className="mb-2">Request Service</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Select an address and describe your issue. We'll handle the rest.</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
            <p>Verifying eligibility and addresses...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Service Address</label>
                <button 
                  type="button"
                  onClick={() => setShowAddressModal(true)} 
                  className="flex items-center gap-1" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-primary-light)', fontWeight: 500 }}
                >
                  <Plus size={14} /> Add New Address
                </button>
              </div>
              <select 
                value={selectedAddressId} 
                onChange={(e) => setSelectedAddressId(e.target.value)}
                required
                className="premium-select"
                style={{ width: '100%' }}
              >
                {addresses.length === 0 ? (
                  <option disabled value="">No addresses found</option>
                ) : (
                  addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label || 'Address'} - {addr.name} ({addr.addressLine1 || addr.street})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={{ 
              background: info.gradient, 
              border: `1px solid ${info.border}`, 
              padding: '24px', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '10px', 
                borderRadius: '12px',
                color: info.text
              }}>
                {info.icon}
              </div>
              <p style={{ margin: 0, fontWeight: 600, color: info.text, fontSize: '1rem', lineHeight: 1.4 }}>
                {info.message}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Service Description / Issue</label>
              <textarea 
                rows="5" 
                placeholder="Please describe the problem you're experiencing with your system..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ padding: '16px', fontSize: '1rem' }}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || !selectedAddressId || !description}
              style={{ 
                padding: '16px', 
                fontSize: '1.1rem', 
                fontWeight: 700,
                marginTop: '8px',
                background: description ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)'
              }}
            >
              {submitting ? 'Processing...' : 'Submit Service Request'}
              {!submitting && <ArrowRight size={20} className="ml-2" />}
            </button>
          </form>
        )}
      </div>
      <AddressModal 
        isOpen={showAddressModal} 
        onClose={() => setShowAddressModal(false)} 
        onAddressSaved={handleAddressAdded} 
      />
    </div>
  );
};

export default BookService;
