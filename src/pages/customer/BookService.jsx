import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MapPin, Info, ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, Plus, Zap, X } from 'lucide-react';
import AddressFormModal from '../../components/AddressFormModal';

const BookService = () => {
  const { currentUser, userData } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [purchasedAmcs, setPurchasedAmcs] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [product, setProduct] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [pricing, setPricing] = useState({ eyeTechServicePrice: 300, nonEyeTechServicePrice: 500 });

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'addresses'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const fetchedAddrs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAddresses(fetchedAddrs);
      
      if (fetchedAddrs.length > 0 && !selectedAddressId) {
        setSelectedAddressId(fetchedAddrs[0].id);
      } else if (selectedAddressId && !fetchedAddrs.find(a => a.id === selectedAddressId)) {
        setSelectedAddressId(fetchedAddrs.length > 0 ? fetchedAddrs[0].id : '');
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

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const handleAddressSaved = (newId) => {
    setSelectedAddressId(newId);
    fetchData();
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  
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

  const chargeType = !selectedAddress ? 'Chargeable'
    : isFreeServiceValid ? 'Free Service'
    : applicableAmc ? 'AMC:Breakdown'
    : 'Chargeable';

  const price = selectedAddress?.isEyeTechInstalled ? pricing.eyeTechServicePrice : pricing.nonEyeTechServicePrice;

  const getInfoDisplay = () => {
    if (!selectedAddress) return { 
      message: "Select an address to check service eligibility.", 
      icon: <Info size={20} />, 
      gradient: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      border: 'rgba(255,255,255,0.1)',
      text: 'var(--text-muted)'
    };
    
    if (isFreeServiceValid) {
      const dateStr = new Date(selectedAddress.freeServiceValidUntil).toLocaleDateString();
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
        message: `Covered under AMC: ${applicableAmc.packageName} (${applicableAmc.breakdownVisitsLeft} visits left).`,
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
      message: `Chargeable (Minimum Visiting Charges: ₹${price}).`,
      icon: <AlertTriangle size={20} />,
      gradient: 'linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(192, 57, 43, 0.05) 100%)',
      border: 'rgba(231, 76, 60, 0.2)',
      text: '#e74c3c'
    };
  };

  const info = getInfoDisplay();

  const getPossibleSolution = () => {
    if (!issue || product !== 'CCTV Camera') return null;
    switch (issue) {
      case 'Beep Sound': return 'Restart Once & Check';
      case 'No PlayBack': return 'Check Live View Date & Time. If wrong kindly try changing.\nTry changing any other Adaptor for DVR & check';
      case 'No Video': return 'Check whether all switches are ON and power cables are connected to Socket';
      case 'No Mobile View(Offline)': return 'Check whether Internet is working Correctly\nCheck whether all switches are ON and power cables are connected to Socket';
      default: return null;
    }
  };

  const possibleSolution = getPossibleSolution();

  // Dynamic issue options
  const issueOptions = product === 'CCTV Camera' 
    ? ['Beep Sound', 'No PlayBack', 'No Video', 'Flickering', 'No Mobile View(Offline)', 'Others']
    : ['Others'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddressId || !product || !issue || !selectedAddress) return;
    
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
        product: product,
        issue: issue,
        description: description ? `Product: ${product}\nIssue: ${issue}\nNotes: ${description}` : `Product: ${product}\nIssue: ${issue}`,
        status: 'Pending',
        chargeType: chargeType || 'Chargeable',
        isEyeTechInstalled: !!selectedAddress.isEyeTechInstalled,
        servicePrice: price || 0,
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
      
      // Create notification signal for admin
      await addDoc(collection(db, 'notification_signals'), {
        title: 'New Service Booking',
        body: `${bookingData.userName} requested service at ${bookingData.addressName}`,
        recipientRole: 'Admin',
        status: 'pending',
        type: 'new_booking',
        createdAt: Date.now()
      });

      setSuccess(true);
    } catch (err) {
      console.error("Error creating booking:", err);
      alert(`Failed to book service: ${err.message || 'Please try again'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Booking success modal popup is rendered at the bottom of the component

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
                  style={{ background: 'none', border: 'none', fontSize: '0.85rem', color: 'var(--color-primary-light)', fontWeight: 500, cursor: 'pointer' }}
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
                  <option disabled>No addresses found</option>
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
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select Product</label>
              <select 
                value={product}
                onChange={(e) => {
                  setProduct(e.target.value);
                  setIssue(''); // reset issue when product changes
                }}
                required
                className="premium-select"
                style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
              >
                <option value="" disabled>-- Select Product --</option>
                <option value="CCTV Camera">CCTV Camera</option>
                <option value="Video Door Phone">Video Door Phone</option>
                <option value="Intrusion Alarm">Intrusion Alarm</option>
                <option value="Biometric & Access Control">Biometric & Access Control</option>
              </select>
            </div>

            {product && (
              <div className="flex flex-col gap-3">
                <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select Issue</label>
                <select 
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  required
                  className="premium-select"
                  style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                >
                  <option value="" disabled>-- Select your issue --</option>
                  {issueOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}

            {possibleSolution && (
              <div style={{
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                padding: '16px',
                borderRadius: '12px',
                color: '#ff9800'
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <Info size={18} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Possible Solution (Try this first)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                  {possibleSolution}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Additional Notes (Optional)</label>
              <textarea 
                rows="3" 
                placeholder="Any other details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ padding: '16px', fontSize: '1rem' }}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || !selectedAddressId || !product || !issue}
              style={{ 
                padding: '16px', 
                fontSize: '1.1rem', 
                fontWeight: 700,
                marginTop: '8px',
                background: (product && issue) ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)'
              }}
            >
              {submitting ? 'Processing...' : 'Submit Service Request'}
              {!submitting && <ArrowRight size={20} className="ml-2" />}
            </button>
          </form>
        )}
      </div>

      <AddressFormModal 
        isOpen={showAddressModal} 
        onClose={() => setShowAddressModal(false)}
        onAddressSaved={handleAddressSaved}
      />

      {success && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ 
            width: '100%', maxWidth: '550px',
            padding: '40px', position: 'relative',
            background: 'rgba(30, 30, 50, 0.95)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            {/* Close button at top right */}
            <button 
              onClick={() => window.location.href = '/customer/dashboard'} 
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '8px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X size={20} />
            </button>

            <div className="mb-6 flex justify-center">
              <div style={{ background: 'rgba(0, 206, 201, 0.1)', padding: '20px', borderRadius: '50%' }}>
                <CheckCircle size={56} color="var(--color-secondary)" />
              </div>
            </div>

            <h3 className="mb-4 text-center" style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700 }}>
              Booking Confirmed! 🎉
            </h3>
            
            <div className="flex flex-col gap-4 text-left mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: 'var(--color-secondary)', fontWeight: 'bold', minWidth: '15px' }}>✓</div>
                <p style={{ margin: 0 }}>
                  Your Service Request is booked successfully.
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: 'var(--color-secondary)', fontWeight: 'bold', minWidth: '15px' }}>✓</div>
                <p style={{ margin: 0 }}>
                  Technician will attend in <strong>2-7 days</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: 'var(--color-secondary)', fontWeight: 'bold', minWidth: '15px' }}>✓</div>
                <p style={{ margin: 0 }}>
                  Minimum Visiting Charge is <strong>{chargeType === 'Free Service' || chargeType === 'AMC:Breakdown' ? '₹0 (Free / Covered under Warranty/AMC)' : `₹${price}`}</strong>. Any other Material replacement which is not under warranty, will be chargeable Extra. And Service Charges also may vary based on Work.
                </p>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = '/customer/dashboard'} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', fontWeight: 600, fontSize: '1.05rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookService;
